# Swayen API — Paket Referensi Frontend

Isi paket ini:

```
swayen-api-docs/
├── API_REFERENCE.md                          # Dokumentasi lengkap tiap endpoint (request/response, error, auth)
├── postman/
│   └── swayen-api.postman_collection.json     # Import ke Postman/Insomnia, siap dipakai untuk testing manual
└── types/                                      # TypeScript types — copy langsung ke project frontend
    ├── common.types.ts                         # Envelope ApiResponse<T> / ApiErrorResponse
    ├── auth.types.ts
    ├── users.types.ts
    ├── nightPlanner.types.ts
    ├── timebox.types.ts
    ├── swayen.types.ts
    ├── system.types.ts
    └── index.ts                                # Barrel export — import semua dari 1 pintu
```

## Cara Pakai

**1. Dokumentasi endpoint** → buka `API_REFERENCE.md`, ada contoh request/response JSON persis untuk tiap endpoint, termasuk endpoint mana yang butuh `Authorization: Bearer <token>` dan mana yang publik.

**2. Testing manual** → import `postman/swayen-api.postman_collection.json` ke Postman. Set variable `baseUrl` (default `http://localhost:4000/api/v1`), lalu jalankan `Register` atau `Login` dulu — token otomatis tersimpan ke collection variable dan dipakai otomatis di request-request berikutnya (Bearer auth sudah di-set di level collection).

**3. Integrasi kode di frontend** → copy folder `types/` ke project frontend (mis. `src/types/api/`), lalu:

```ts
import type { LoginRequest, LoginResponse, ApiResponse } from "@/types/api";

async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<LoginResponse> = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}
```

Semua field tanggal (`createdAt`, `lastActiveAt`, dst.) datang sebagai **ISO string** dari API (JSON tidak punya tipe `Date`), jadi di types sengaja pakai `string`, bukan `Date` — parse sendiri di frontend kalau butuh (`new Date(value)`).

## Catatan Penting

- Access token expired **15 menit** → tangani `401` dengan auto-refresh pakai `refreshToken` (lihat `POST /auth/refresh` di dokumentasi), lalu ulangi request.
- Refresh token **rotation**: setiap kali `/auth/refresh` dipanggil, token lama langsung invalid — selalu simpan pasangan token yang paling baru.
- Endpoint publik (tidak butuh token): `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /system/quotes/today`. Sisanya semua butuh Bearer token.
"# swayen-docs-api" 
