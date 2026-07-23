// ============================================================
// Swayen Wallet & Quick-Start Hobbies (Langkah 4) — /api/v1/swayen/*  (semua butuh auth)
// ============================================================

export type CoinTransactionType = "EARNED" | "SPENT";

export interface CoinTransaction {
  id: string;
  userId: string;
  type: CoinTransactionType;
  amount: number;
  activityName: string;
  createdAt: string;
}

export interface SwayenWallet {
  id: string;
  userId: string;
  balance: number;
  updatedAt: string;
}

export interface HobbyShortcut {
  id: string;
  userId: string;
  title: string;
  durationMinutes: number;
  deepLinkUrl: string | null;
  createdAt: string;
}

// --- GET /swayen/balance ---
export interface BalanceResponse {
  balance: number;
  transactions: CoinTransaction[]; // 20 transaksi terakhir
}

// --- GET /swayen/hobbies ---
export type ListHobbiesResponse = HobbyShortcut[];

// --- POST /swayen/hobbies ---
export interface CreateHobbyRequest {
  title: string;
  durationMinutes: number; // 1-60
  deepLinkUrl?: string;
}
export type CreateHobbyResponse = HobbyShortcut;

// --- POST /swayen/spend ---
export interface SpendCoinRequest {
  hobbyId?: string; // uuid, opsional — kalau diisi divalidasi milik user yg sama
  activityName: string;
  amount: number; // positive int, harus <= saldo user saat ini
}
export type SpendCoinResponse = SwayenWallet;
