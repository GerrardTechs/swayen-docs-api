# Swayen Backend API — Reference

Base URL: `{{baseUrl}}/api/v1` (contoh dev: `http://localhost:4000/api/v1`)

Semua response mengikuti format standar:
```json
// Sukses
{ "success": true, "message": "string", "data": { ... } }

// Gagal
{ "success": false, "message": "string", "details": { "field": ["pesan error"] } }
```

**Auth header** (untuk endpoint yang butuh login):
```
Authorization: Bearer <accessToken>
```
Access token berlaku **15 menit**. Kalau dapat `401`, panggil `POST /auth/refresh` pakai `refreshToken`, lalu ulangi request dengan `accessToken` baru.

**Rate limit:**
- Endpoint `/auth/*` → maks **5 request/menit**
- Endpoint lain → maks **100 request/menit**

---

## A. Auth & User Management

### `POST /auth/register`
🔓 Publik
```json
// Request
{ "email": "budi@example.com", "password": "minimal8karakter", "name": "Budi" }

// Response 201
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": { "id": "uuid", "email": "budi@example.com", "name": "Budi", "lastActiveAt": "...", "createdAt": "...", "updatedAt": "..." },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```
Error: `409` email sudah terdaftar.

### `POST /auth/login`
🔓 Publik
```json
// Request
{ "email": "budi@example.com", "password": "minimal8karakter" }
// Response 200 — sama persis bentuk data dengan /register
```
Error: `401` email/password salah.

### `POST /auth/refresh`
🔓 Publik (tapi butuh refresh token valid)
```json
// Request
{ "refreshToken": "eyJ..." }
// Response 200
{ "success": true, "message": "Token berhasil diperbarui", "data": { "accessToken": "eyJ...", "refreshToken": "eyJ..." } }
```
Catatan: **token rotation** — refresh token lama langsung di-revoke begitu dipakai, simpan refresh token baru dan buang yang lama.
Error: `401` token invalid/expired/sudah revoked.

### `POST /auth/logout`
🔓 Publik
```json
// Request
{ "refreshToken": "eyJ..." }
// Response 200
{ "success": true, "message": "Logout berhasil", "data": null }
```

### `GET /users/me`
🔒 Perlu auth
```json
// Response 200
{
  "success": true,
  "message": "Profil berhasil diambil",
  "data": { "id": "uuid", "email": "budi@example.com", "name": "Budi", "lastActiveAt": "...", "createdAt": "...", "updatedAt": "..." }
}
```
Catatan: memanggil endpoint ber-auth manapun otomatis meng-update `lastActiveAt` user (dipakai untuk logic engagement).

---

## B. Night Planner & Recovery (Langkah 1 & 5)

### `POST /night-planner`
🔒 Perlu auth — simpan/update rencana malam **hari ini** (upsert per tanggal).
```json
// Request
{ "tasks": ["Baca 10 halaman buku", "Rapikan meja kerja", "Journaling 5 menit"] }
// max 5 item, min 1 item, tiap item 1-200 karakter

// Response 201
{
  "success": true,
  "message": "Rencana malam berhasil disimpan",
  "data": { "id": "uuid", "userId": "uuid", "date": "2026-07-22T00:00:00.000Z", "tasks": [...], "isCompleted": false, "missedCount": 0, "createdAt": "..." }
}
```

### `GET /night-planner/today`
🔒 Perlu auth
```json
// Response 200
{
  "success": true,
  "message": "Rencana malam hari ini berhasil diambil",
  "data": {
    "plan": { "id": "uuid", "tasks": [...], "isCompleted": false, "missedCount": 1, ... } ,
    "missedNightCount": 1,
    "streak": 4
  }
}
```
`plan` bisa `null` kalau user belum isi rencana untuk hari ini. `missedNightCount` dihitung dari perbandingan dengan record kemarin (kalau kemarin tidak completed / tidak ada record → +1). `streak` = jumlah hari berturut-turut `isCompleted = true`.

### `PATCH /night-planner/:id/complete`
🔒 Perlu auth
```
Params: id (uuid) — id record NightPlanner
```
```json
// Response 200
{ "success": true, "message": "Rencana malam ditandai selesai", "data": { "id": "uuid", "isCompleted": true, ... } }
```
Error: `404` tidak ditemukan, `403` bukan milik user, `409` sudah completed sebelumnya.

---

## C. TimeBox & Wuxiu (Low Battery)

### `POST /timebox/start`
🔒 Perlu auth — mulai sesi fokus.
```json
// Request (opsional, default 45)
{ "durationMinutes": 45 }  // 5-180

// Response 201
{ "success": true, "message": "Sesi TimeBox dimulai", "data": { "id": "uuid", "durationMinutes": 45, "status": "INTERRUPTED", "isWuxiuNap": false, "startedAt": "...", "endedAt": null } }
```
Error: `409` kalau masih ada sesi aktif (TimeBox/Wuxiu) yang belum di-`finish`.
> `status` di response awal masih placeholder (`INTERRUPTED`) — abaikan sampai sesi di-`finish`; yang menandakan sesi masih berjalan adalah `endedAt: null`.

### `POST /timebox/wuxiu`
🔒 Perlu auth — mulai sesi nap 20 menit (body kosong).
```json
// Response 201 — bentuk sama seperti /start, tapi durationMinutes: 20, isWuxiuNap: true
```
Error: `409` kalau masih ada sesi aktif.

### `POST /timebox/finish`
🔒 Perlu auth — akhiri sesi (TimeBox biasa maupun Wuxiu).
```json
// Request
{ "sessionId": "uuid", "status": "COMPLETED" }  // status opsional, default "COMPLETED"; alternatif "INTERRUPTED"

// Response 200
{
  "success": true,
  "message": "Sesi berhasil diakhiri",
  "data": {
    "session": { "id": "uuid", "status": "COMPLETED", "endedAt": "...", ... },
    "coinsRewarded": 1
  }
}
```
`coinsRewarded` = **1** hanya jika `status: "COMPLETED"` **dan** sesi bukan Wuxiu Nap. Selain itu `0`.
Error: `404` sesi tidak ditemukan, `403` bukan milik user, `409` sesi sudah pernah diakhiri.

---

## D. Swayen Wallet & Hobbies

### `GET /swayen/balance`
🔒 Perlu auth
```json
// Response 200
{
  "success": true,
  "message": "Saldo & riwayat Swayen Coin berhasil diambil",
  "data": {
    "balance": 12,
    "transactions": [
      { "id": "uuid", "type": "EARNED", "amount": 1, "activityName": "TimeBox Selesai", "createdAt": "..." },
      { "id": "uuid", "type": "SPENT", "amount": 5, "activityName": "Main gitar 15 menit", "createdAt": "..." }
    ]
  }
}
```
(`transactions` = 20 terbaru, diurutkan terbaru dulu)

### `GET /swayen/hobbies`
🔒 Perlu auth
```json
// Response 200
{ "success": true, "message": "...", "data": [ { "id": "uuid", "title": "Main gitar", "durationMinutes": 15, "deepLinkUrl": null, "createdAt": "..." } ] }
```

### `POST /swayen/hobbies`
🔒 Perlu auth
```json
// Request
{ "title": "Main gitar", "durationMinutes": 15, "deepLinkUrl": "https://open.spotify.com/..." } // deepLinkUrl opsional

// Response 201 — 1 object HobbyShortcut
```

### `POST /swayen/spend`
🔒 Perlu auth
```json
// Request
{ "hobbyId": "uuid", "activityName": "Main gitar 15 menit", "amount": 5 } // hobbyId opsional

// Response 200 — wallet terbaru
{ "success": true, "message": "Koin berhasil digunakan", "data": { "id": "uuid", "balance": 7, "updatedAt": "..." } }
```
Error: `400` saldo tidak cukup, `404` `hobbyId` diisi tapi tidak ditemukan/bukan milik user.

---

## E. System & Engagement

### `GET /system/quotes/today`
🔓 Publik
```json
// Response 200
{ "success": true, "message": "...", "data": { "id": "uuid", "quote": "...", "author": "...", "source": "...", "showDate": "..." } }
```
Kalau tidak ada quote yang di-assign eksplisit ke hari ini, backend fallback ke rotasi deterministik dari semua quote yang ada (bukan error).
Error: `404` kalau tabel `DailyQuote` benar-benar kosong (belum pernah di-seed).

### `GET /system/engagement-status`
🔒 Perlu auth — dipanggil Android WorkManager/Cron dengan access token user yang sedang login.
```json
// Response 200
{
  "success": true,
  "message": "Status engagement berhasil diambil",
  "data": {
    "isInactive": true,
    "inactiveDays": 4,
    "reengagementTier": "H3",       // "NONE" | "H3" (>=3 hari) | "H7" (>=7 hari)
    "missedNightCount": 2,
    "shouldReduceNightPlanLoad": true,  // true kalau missedNightCount >= 2
    "suggestedNightPlanSlots": 3        // 5 normal, turun ke 3 kalau shouldReduceNightPlanLoad
  }
}
```

---

## Ringkasan Status Code

| Code | Arti |
|---|---|
| 200 | Sukses (GET/PATCH/POST tanpa create resource baru) |
| 201 | Resource baru berhasil dibuat |
| 400 | Validasi input gagal / saldo tidak cukup |
| 401 | Tidak terautentikasi / token invalid-expired |
| 403 | Terautentikasi tapi tidak berhak atas resource ini |
| 404 | Resource tidak ditemukan |
| 409 | Konflik (email sudah ada, sesi masih aktif, dll) |
| 429 | Rate limit terlampaui |
| 500 | Error server |

## Peta Endpoint Ringkas

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | Daftar user baru |
| POST | `/auth/login` | 🔓 | Login |
| POST | `/auth/refresh` | 🔓 | Perbarui access token |
| POST | `/auth/logout` | 🔓 | Revoke refresh token |
| GET | `/users/me` | 🔒 | Profil user |
| POST | `/night-planner` | 🔒 | Simpan rencana malam hari ini |
| GET | `/night-planner/today` | 🔒 | Ambil rencana + missed count + streak |
| PATCH | `/night-planner/:id/complete` | 🔒 | Tandai rencana selesai |
| POST | `/timebox/start` | 🔒 | Mulai sesi fokus |
| POST | `/timebox/finish` | 🔒 | Akhiri sesi + reward koin |
| POST | `/timebox/wuxiu` | 🔒 | Mulai sesi nap 20 menit |
| GET | `/swayen/balance` | 🔒 | Saldo + riwayat transaksi |
| GET | `/swayen/hobbies` | 🔒 | Daftar quick-start hobbies |
| POST | `/swayen/hobbies` | 🔒 | Tambah hobi baru |
| POST | `/swayen/spend` | 🔒 | Belanjakan koin |
| GET | `/system/quotes/today` | 🔓 | Quote motivasi harian |
| GET | `/system/engagement-status` | 🔒 | Status re-engagement user |
