// Password Utility
// Handles password hashing and verification using Argon2 with pepper
// SERVER-ONLY: This module uses native Node.js modules and can only be used in server-side code

import "server-only";
import { loadArgon2 } from "./argon2-loader";

export type HashType = "none" | "argon2";

/**
 * Hash a password with Argon2 and pepper
 * @param password - Plain text password
 * @param hashType - "none" returns clear text, "argon2" uses Argon2 hashing
 * @returns Hashed password or clear text based on hashType
 */
export async function hashPassword(
  password: string,
  hashType: HashType = "argon2"
): Promise<string> {
  if (hashType === "none") {
    // Return clear text (for development/testing only)
    return password;
  }

  // Get pepper from environment
  const pepper = process.env.PEPPER;
  if (!pepper) {
    throw new Error(
      "PEPPER environment variable is required for password hashing"
    );
  }

  // Combine password with pepper before hashing
  const passwordWithPepper = `${password}${pepper}`;

  // Lazy load argon2
  const argon2 = loadArgon2();

  // Hash with Argon2 using secure configuration
  // memoryCost: 2^15 = 32768 (minimum recommended for production)
  // timeCost: 3 (iterations)
  // parallelism: 4 (parallel threads)
  // type: argon2id (most secure variant, resistant to both GPU and side-channel attacks)
  const hashedPassword = await argon2.hash(passwordWithPepper, {
    type: argon2.argon2id,
    memoryCost: 2 ** 15, // 32768 - minimum for production
    timeCost: 3,
    parallelism: 4,
    saltLength: 16, // Argon2 handles salt automatically
    hashLength: 32, // 256 bits
  });

  return hashedPassword;
}

/**
 * Verify a password against a stored hash
 * @param password - Plain text password to verify
 * @param storedHash - Stored hash or clear text password
 * @param hashType - "none" for clear text comparison, "argon2" for Argon2 verification
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  hashType: HashType = "argon2"
): Promise<boolean> {
  if (hashType === "none") {
    // Simple comparison for clear text
    return password === storedHash;
  }

  // Get pepper from environment
  const pepper = process.env.PEPPER;
  if (!pepper) {
    throw new Error(
      "PEPPER environment variable is required for password verification"
    );
  }

  // Combine password with pepper before verification
  const passwordWithPepper = `${password}${pepper}`;

  try {
    // Lazy load argon2
    const argon2 = loadArgon2();
    
    // Verify using Argon2
    // Argon2 automatically extracts salt and parameters from the stored hash
    const isValid = await argon2.verify(storedHash, passwordWithPepper);
    return isValid;
  } catch (error) {
    // If verification fails (e.g., invalid hash format), return false
    console.error("[PASSWORD] Password verification error:", error);
    return false;
  }
}

/**
 * Detect hash type from stored password
 * Argon2 hashes start with "$argon2id$" or "$argon2i$" or "$argon2d$"
 * @param storedHash - Stored password hash
 * @returns Detected hash type
 */
export function detectHashType(storedHash: string): HashType {
  if (
    storedHash.startsWith("$argon2id$") ||
    storedHash.startsWith("$argon2i$") ||
    storedHash.startsWith("$argon2d$")
  ) {
    return "argon2";
  }
  return "none";
}

