// ============================================================
// Auth & User Management — POST /api/v1/auth/*
// ============================================================

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  lastActiveAt: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string; // JWT, expired 15 menit
  refreshToken: string; // JWT, expired 7 hari, disimpan di secure storage
}

// --- POST /auth/register ---
export interface RegisterRequest {
  email: string;
  password: string; // min 8 karakter
  name: string;
}
export interface RegisterResponse extends AuthTokens {
  user: PublicUser;
}

// --- POST /auth/login ---
export interface LoginRequest {
  email: string;
  password: string;
}
export type LoginResponse = RegisterResponse;

// --- POST /auth/refresh ---
export interface RefreshRequest {
  refreshToken: string;
}
export type RefreshResponse = AuthTokens;

// --- POST /auth/logout ---
export interface LogoutRequest {
  refreshToken: string;
}
export type LogoutResponse = null;
