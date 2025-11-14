import { base64ToArrayBuffer, arrayBufferToBase64 } from './base64';

const AES_ALGO = 'AES-GCM';
const IV_LENGTH = 12;

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
const textDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;

let cryptoKeyPromise: Promise<CryptoKey | null> | null = null;

function hasWebCrypto(): boolean {
  return typeof window !== 'undefined' && typeof window.crypto !== 'undefined' && typeof window.crypto.subtle !== 'undefined';
}

function getRawKeyMaterial(): ArrayBuffer {
  const keySource = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '';

  if (!keySource) {
    throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY is not defined');
  }

  const sanitized = keySource.trim();
  const isHexString = /^[0-9a-fA-F]+$/.test(sanitized) && sanitized.length % 2 === 0;

  if (isHexString) {
    const bytes = new Uint8Array(sanitized.length / 2);
    for (let i = 0; i < sanitized.length; i += 2) {
      bytes[i / 2] = parseInt(sanitized.slice(i, i + 2), 16);
    }
    return bytes.buffer;
  }

  if (!textEncoder) {
    throw new Error('TextEncoder is not available');
  }

  return textEncoder.encode(sanitized).buffer;
}

async function importCryptoKey(): Promise<CryptoKey | null> {
  if (!hasWebCrypto()) {
    return null;
  }

  const subtle = window.crypto.subtle;
  const rawMaterial = getRawKeyMaterial();
  const hashedMaterial = await subtle.digest('SHA-256', rawMaterial);

  return subtle.importKey('raw', hashedMaterial, AES_ALGO, false, ['encrypt', 'decrypt']);
}

async function getCryptoKey(): Promise<CryptoKey | null> {
  if (!cryptoKeyPromise) {
    cryptoKeyPromise = importCryptoKey().catch((error) => {
      console.warn('[schema-cache] Failed to import crypto key:', error);
      return null;
    });
  }

  return cryptoKeyPromise;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
}

export async function encryptPayload<T>(payload: T): Promise<EncryptedPayload | null> {
  if (!hasWebCrypto() || !textEncoder) {
    return null;
  }

  const key = await getCryptoKey();
  if (!key) {
    return null;
  }

  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = textEncoder.encode(JSON.stringify(payload));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: AES_ALGO,
      iv,
    },
    key,
    encoded
  );

  return {
    ciphertext: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

export async function decryptPayload<T>(encrypted: EncryptedPayload): Promise<T | null> {
  if (!hasWebCrypto() || !textDecoder) {
    return null;
  }

  const key = await getCryptoKey();
  if (!key) {
    return null;
  }

  const ivBuffer = base64ToArrayBuffer(encrypted.iv);
  const cipherBuffer = base64ToArrayBuffer(encrypted.ciphertext);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: AES_ALGO,
      iv: new Uint8Array(ivBuffer),
    },
    key,
    cipherBuffer
  );

  return JSON.parse(textDecoder.decode(decrypted)) as T;
}

export function isEncryptionAvailable(): boolean {
  return hasWebCrypto();
}


