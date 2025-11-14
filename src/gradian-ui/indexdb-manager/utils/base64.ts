export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (typeof window === 'undefined') {
    return new ArrayBuffer(0);
  }

  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}


