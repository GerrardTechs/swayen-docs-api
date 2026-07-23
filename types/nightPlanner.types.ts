// ============================================================
// Night Planner (Langkah 1 & 5 - Night Sentinel) — /api/v1/night-planner/*  (semua butuh auth)
// ============================================================

export interface NightPlanner {
  id: string;
  userId: string;
  date: string; // ISO date (YYYY-MM-DD di dalam ISO string)
  tasks: string[]; // maks 5 baris
  isCompleted: boolean;
  missedCount: number;
  createdAt: string;
}

// --- POST /night-planner ---
export interface CreateNightPlanRequest {
  tasks: string[]; // 1-5 item, tiap item 1-200 karakter
}
export type CreateNightPlanResponse = NightPlanner;

// --- GET /night-planner/today ---
export interface TodayNightPlanResponse {
  plan: NightPlanner | null; // null kalau user belum isi rencana hari ini
  missedNightCount: number;
  streak: number; // jumlah hari berturut-turut isCompleted = true
}

// --- PATCH /night-planner/:id/complete ---
// params: { id: string }
export type CompleteNightPlanResponse = NightPlanner;
