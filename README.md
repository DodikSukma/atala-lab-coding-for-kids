# Atala Lab — Coding for Kids

Aplikasi belajar coding visual berbahasa Indonesia untuk kelas 4 SD bersama tokoh orisinal **Kiko** (robot penjelajah) dan **Kiki** (kucing penemu). Bulan 1–2 memiliki 8 pertemuan dan 2 proyek berbasis misi, Studio blok interaktif dengan feedback belajar deterministik, Galeri Proyek contoh yang bisa dimainkan & di-remix, serta Papan Guru bergaya Excalidraw dengan dukungan multi-halaman A4. Bulan 3–6 ditandai Segera hadir. [PRD](PRD.md) · [Desain](DESIGN.md) · [Task Master](task.md) · [Laporan Implementasi](IMPLEMENTATION_REPORT.md) · [Panduan HTML](panduan/panduan-pengguna.html).

## Fitur Utama

- **Identitas Visual & Desain Ramah Anak (Fase A):**
  - Sistem desain terstruktur (`tokens.css`, `globals.css`, `redesign.css`, `studio.css`, `whiteboard.css`) tanpa ketergantungan font CDN eksternal (100% offline-friendly).
  - Komponen UI aksesibel: `Button`, `Badge`, `ProgressSteps`, `EmptyState`, `ConfirmDialog`, `Toast`, dan `CharacterGuide` dengan target sentuh minimal 44×44 px, skip-link `#main-content`, dan dukungan `prefers-reduced-motion`.
- **Karakter Vektor Orisinal Kiko & Kiki + Stage Interaktif (Fase B):**
  - Sprite SVG lokal untuk **Kiko** dan **Kiki** dengan 6 state deterministik (`idle`, `move`, `turn`, `talk`, `success`, `error`).
  - Stage berlapis untuk tema **Angkasa** dan **Taman** lengkap dengan jejak langkah (*step trail*), indikator arah kompas, *speech bubble*, dan lencana blok aktif.
  - Umpan balik pembelajaran spesifik (`learningFeedback.ts`) saat misi berhasil, belum ada blok `Ketika mulai`, salah urutan `Jika sentuh bintang`, atau belum mencapai bintang.
- **Kurikulum Berbasis Misi & Progress Lokal (Fase C):**
  - Seluruh 10 modul Bulan 1–2 diperkaya dengan: *storyContext*, *keyConcept*, *goals*, *steps*, *miniExperiment*, 3 tingkat tantangan (*Bronze*, *Silver*, *Gold*), *successChecklist*, *commonMistakes*, *vocabulary*, *reflectionPrompt*, *teacherNotes*, dan *estimatedMinutes*.
  - Pelacakan kemajuan lokal (`atala_learning_progress_v1`) untuk status *Sudah dibuka*, *Sudah dicoba*, *Tantangan selesai*, dan *Proyek disimpan*.
- **Galeri Proyek Contoh & Remix Aman (Fase D):**
  - 6 template proyek siap pakai: **Kiko Menuju Bintang**, **Tarian Kiki**, **Pesan dari Planet Atala**, **Roket Berulang**, **Tangkap Bintang**, dan **Taman Bunga Kiki**.
  - Modal **Preview & Mainkan** langsung di galeri serta fitur **Remix ke Studio** yang selalu menghasilkan ID proyek baru tanpa menimpa template atau proyek lama.
  - **Proyek Saya** dilengkapi pencarian, pengurutan, ubah judul langsung (*inline rename*), duplikasi, ekspor HTML mandiri, cadangan/impor JSON, dan dialog konfirmasi hapus.
- **Papan Guru Bergaya Excalidraw dengan Lembar A4 (Fase E):**
  - Arsitektur modular (`schema.ts`, `transform.ts`, `reducer.ts`, `persistence.ts`, `shortcuts.ts`, serta komponen `WhiteboardToolbar`, `WhiteboardInspector`, `WhiteboardSidebar`, `WhiteboardCanvas`).
  - Alat lengkap: Pilih & *marquee multi-select*, Geser Kanvas (*Pan*), Pena (*smoothing*), Stabilo (*Highlighter*), Penghapus, Kotak, Lingkaran, Garis, Panah, Teks *multiline*, Catatan Tempel (*Sticky Note*), dan Gambar (unggah file / tempel clipboard).
  - Transformasi & susunan: *resize handles* 8 titik, *copy/cut/paste*, duplikasi, *undo/redo* 60 langkah, *bring forward / send backward*, perataan (*align left/center/right/top/middle/bottom*), *zoom* (50%–200%), dan *fit-to-page*.
  - Penyimpanan otomatis (*autosave*) dengan migrasi aman dari format catatan lama, ekspor **PDF A4 multi-halaman**, ekspor **PNG**, serta ekspor/impor **JSON catatan**.

## Jalankan lokal

Node 20.9+ dan `make` diperlukan. Di Visual Studio Code, pilih **File → Open Folder** dan buka folder akar `atala-lab-coding-for-kids`. Buka **Terminal → New Terminal**, jalankan `make setup` sekali untuk memasang dependensi, lalu `make dev`. Perintah ini menjalankan web dan API di latar belakang serta mengembalikan terminal. Buka http://localhost:3000 untuk aplikasi dan http://localhost:4000/health untuk status API. Gunakan `make status` untuk melihat keduanya dan lokasi log, `make stop` untuk menghentikan keduanya, atau `make restart` untuk menjalankan ulang mode yang sedang dipakai. `make start` membangun dan menjalankan keduanya dalam mode produksi lokal di latar belakang; jalankan `make stop` dahulu saat beralih mode. Development dan build biasa menggunakan root URL; sub-path `/coding-for-kids` hanya diaktifkan saat ekspor cPanel.

Untuk instalasi dan verifikasi langsung melalui npm:

```bash
npm install
npm test
npm run build
```

Aplikasi langsung dapat dipakai tanpa akun atau kredensial Supabase; proyek dan catatan tersimpan di browser perangkat yang sama.

## Supabase

1. Buat proyek Supabase dan jalankan `apps/api/supabase/001_projects.sql` pada SQL editor.
2. Aktifkan **Anonymous Sign-ins** di Authentication. Ini membuat sesi anonim per browser; RLS membatasi setiap proyek ke pemiliknya.
3. Isi `apps/web/.env.local` sesuai `apps/web/.env.example` dan `apps/api/.env` sesuai `apps/api/.env.example`. Gunakan URL dan **publishable key** proyek yang sama. Tidak ada secret/service-role key di browser.
4. Jalankan kedua aplikasi dan simpan proyek. UI akan menampilkan status tersinkron setelah API menerima simpan. Jika jaringan gagal, salinan lokal tetap ada.

## Build dan deploy

`npm run build` membangun web dan API pada root path. `npm run export:cpanel` membangun frontend dengan `NEXT_PUBLIC_BASE_PATH=/coding-for-kids`, lalu membuat `atala-web-cpanel.zip`. Untuk sub-path lain, jalankan build dengan nilai `NEXT_PUBLIC_BASE_PATH` yang sesuai. Nest API memerlukan host Node yang dapat menjalankan `npm run start -w @atala/api` dengan env server.

## Struktur

- `apps/web`: Next.js App Router, komponen UI, Studio blok, karakter SVG Kiko/Kiki, kurikulum Bulan 1–2, Galeri Proyek, dan Papan Guru.
- `apps/api`: Nest.js API dan migrasi Supabase.
- `tasks/`: dokumen rencana awal.
- `task.md`: spesifikasi master peningkatan Fase A–E.
- `IMPLEMENTATION_REPORT.md`: laporan implementasi, arsitektur, pengujian, dan audit browser.
