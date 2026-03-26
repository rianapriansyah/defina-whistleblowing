# Defina Whistleblowing

Aplikasi web untuk pengajuan pengaduan whistleblowing, pelacakan status oleh pelapor, dan penanganan oleh petugas yang terautentikasi. Antarmuka dalam Bahasa Indonesia; backend data di [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage).

## Ringkasan spesifikasi teknis

- **Frontend:** React 19, TypeScript, Vite, React Router, MUI (Material UI) termasuk Data Grid dan date pickers.
- **Backend / data:** Supabase client (`@supabase/supabase-js`) untuk query tabel pengaduan, status, audit log, lampiran, undangan stakeholder; autentikasi email/password untuk petugas.
- **Peran:** Pembedaan admin (mis. `app_metadata.role === 'admin'`) untuk fitur undangan stakeholder; route terlindungi untuk dashboard dan investigasi.
- **Berkas lampiran:** Unggahan ke bucket Storage (konfigurasi lewat env, default `complaint-attachments`), dengan metadata di tabel `complaint_attachments`.
- **Fungsi terkelola:** Edge Function `invite-stakeholder` untuk alur undangan stakeholder (secrets dan URL redirect dikonfigurasi di proyek Supabase).
- **Pengujian:** Vitest; build: `tsc` + `vite build`.

## Ringkasan spesifikasi fungsional

- **Pelapor (tanpa login):** Mengisi dan mengirim pengaduan (anonim atau identitas lengkap), kategori, tanggal/lokasi kejadian, lampiran (gambar/PDF), dan pernyayaan; menerima **nomor pengaduan** dan **password** sekali pakai untuk pelacakan.
- **Lacak pengaduan:** Pelapor memasukkan nomor + password untuk melihat status, penugasan, ringkasan penyelesaian, dan detail pengaduan.
- **Petugas (login):** **Dashboard** ringkas jumlah pengaduan dan distribusi tingkat keparahan; **Investigasi & Analisis** untuk pencarian/filter, melihat daftar, dan membuka modal tindakan (status, keparahan, penugasan, resolusi, dll.).
- **Administrator:** Halaman undang stakeholder (email, jabatan, catatan), daftar undangan dan ringkasan stakeholder; penerima menyelesaikan undangan lewat tautan khusus (`/auth/complete-invite`).

## Dokumen panduan pengguna (PDF)

**Dokumen Panduan Penggunaan Aplikasi** (Bahasa Indonesia) disediakan sebagai PDF unduhan publik:

- **[Unduh panduan pengguna (PDF)](https://ssuzkohtxfpmqlayeais.supabase.co/storage/v1/object/public/documentation/panduan-penggunaan-defina-whistleblowing.pdf)**

Sumber PDF dan cara membuat ulang ada di repositori: jalankan `python scripts/generate_panduan_pdf.py` (perlu paket `fpdf2`). Salinan lokal: [`docs/panduan-penggunaan-defina-whistleblowing.pdf`](docs/panduan-penggunaan-defina-whistleblowing.pdf).

**Menyegarkan berkas di Storage:** jalankan (setelah migration bucket dan kebijakan Storage diterapkan):

```bash
node --env-file=.env.local scripts/upload-documentation.mjs
```

Skrip memakai `SUPABASE_SERVICE_ROLE_KEY` bila ada; jika tidak, skrip akan memakai `VITE_SUPABASE_ANON_KEY` sesuai kebijakan Storage yang **hanya** mengizinkan unggah/upsert berkas bernama `panduan-penggunaan-defina-whistleblowing.pdf` pada bucket `documentation`. Untuk unggah berkas lain ke bucket tersebut, gunakan kunci service role. Lihat [`.env.example`](.env.example).

## Pengembangan lokal

Salin `.env.example` ke `.env.local` dan isi URL serta kunci Supabase. Lihat komentar di `.env.example` untuk Edge Function undangan dan konfigurasi admin.

```bash
npm install
npm run dev
```

Perintah lain: `npm run build`, `npm run lint`, `npm run test`.
