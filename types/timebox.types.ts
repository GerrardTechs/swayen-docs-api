// ============================================================
// TimeBox & Wuxiu Nap (Langkah 2 & 3) — /api/v1/timebox/*  (semua butuh auth)
// ============================================================

export type TimeBoxStatus = "COMPLETED" | "INTERRUPTED";

export interface TimeBoxSession {
  id: string;
  userId: string;
  durationMinutes: number;
  status: TimeBoxStatus;
  isWuxiuNap: boolean;
  startedAt: string;
  endedAt: string | null; // null selama sesi masih berjalan
}

// --- POST /timebox/start ---
export interface StartTimeBoxRequest {
  durationMinutes?: number; // 5-180, default 45
}
export type StartTimeBoxResponse = TimeBoxSession;

// --- POST /timebox/wuxiu --- (body kosong, durasi tetap 20 menit)
export type StartWuxiuResponse = TimeBoxSession;

// --- POST /timebox/finish ---
export interface FinishTimeBoxRequest {
  sessionId: string; // uuid
  status?: TimeBoxStatus; // default "COMPLETED"
}
export interface FinishTimeBoxResponse {
  session: TimeBoxSession;
  coinsRewarded: number; // 1 jika COMPLETED & bukan Wuxiu Nap, selain itu 0
}
