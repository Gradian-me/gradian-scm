// Authentication Domain Types

export interface User {
  id: string;
  email: string;
  name: string;
  lastname?: string; // Last name field
  role?: string;
  department?: string;
  avatar?: string;
  password?: string; // Only for internal use, never sent to client
  hashType?: "none" | "argon2"; // Password hashing type: "none" for clear text, "argon2" for Argon2 hashing
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    lastname?: string;
    role?: string;
    department?: string;
    avatar?: string;
  };
  tokens?: AuthTokens;
  message?: string;
  error?: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

