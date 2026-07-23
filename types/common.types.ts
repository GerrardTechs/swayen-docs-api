// ============================================================
// Common API envelope types — dipakai di SEMUA response Swayen API
// ============================================================

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  /** Muncul kalau error berasal dari validasi Zod (400) — bentuknya field -> array pesan error */
  details?: Record<string, string[]>;
  /** Hanya muncul di NODE_ENV=development untuk error non-operational (500) */
  stack?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper type guard, opsional dipakai di frontend
export function isApiSuccess<T>(res: ApiResponse<T>): res is ApiSuccessResponse<T> {
  return res.success === true;
}
