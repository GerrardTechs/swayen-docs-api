// ============================================================
// System & Engagement — /api/v1/system/*
// ============================================================

export interface DailyQuote {
  id: string;
  quote: string;
  author: string | null;
  source: string | null;
  showDate: string;
}

// --- GET /system/quotes/today --- (publik, TIDAK butuh auth)
export type TodayQuoteResponse = DailyQuote;

export type ReengagementTier = "NONE" | "H3" | "H7";

// --- GET /system/engagement-status --- (butuh auth — dipanggil WorkManager/Cron per-user)
export interface EngagementStatusResponse {
  isInactive: boolean;
  inactiveDays: number;
  reengagementTier: ReengagementTier; // NONE | H3 (>=3 hari) | H7 (>=7 hari)
  missedNightCount: number;
  shouldReduceNightPlanLoad: boolean; // true kalau missedNightCount >= 2
  suggestedNightPlanSlots: number; // 5 normal, turun ke 3 kalau shouldReduceNightPlanLoad
}
