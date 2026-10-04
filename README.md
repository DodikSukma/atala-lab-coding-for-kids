# Atala Lab — Coding for Kids

Aplikasi belajar coding visual berbahasa Indonesia untuk kelas 4 SD. Bulan 1–2 memiliki 8 pertemuan, 2 proyek, editor blok, kanvas animasi, dan simpan/unduh/impor proyek. Bulan 3–6 ditandai Segera hadir. [PRD](PRD.md) · [Desain](DESIGN.md) · [Tugas](tasks/01-foundation.md) · [Panduan HTML](panduan/panduan-pengguna.html).

## Jalankan lokal

Node 20.9+ dan `make` diperlukan. Di Visual Studio Code, pilih **File → Open Folder** dan buka folder akar `atala-lab-coding-for-kids`. Buka **Terminal → New Terminal**, jalankan `make setup` sekali untuk memasang dependensi, lalu `make dev`. Perintah ini menjalankan web dan API di latar belakang serta mengembalikan terminal. Buka http://localhost:3000 untuk aplikasi dan http://localhost:4000/health untuk status API. Gunakan `make status` untuk melihat keduanya dan lokasi log, `make stop` untuk menghentikan keduanya, atau `make restart` untuk menjalankan ulang mode yang sedang dipakai. `make start` membangun dan menjalankan keduanya dalam mode produksi lokal di latar belakang; jalankan `make stop` dahulu saat beralih mode.

Aplikasi langsung dapat dipakai tanpa akun atau kredensial Supabase; proyek tersimpan di browser perangkat yang sama. Bila port 3000 atau 4000 sudah dipakai proses lain, perintah akan menampilkan kesalahan dan tidak menghentikan proses tersebut. Log berada di `.local-dev/web.log` dan `.local-dev/api.log`.

## Supabase

1. Buat proyek Supabase dan jalankan `apps/api/supabase/001_projects.sql` pada SQL editor.
2. Aktifkan **Anonymous Sign-ins** di Authentication. Ini membuat sesi anonim per browser; RLS membatasi setiap proyek ke pemiliknya.
3. Isi `apps/web/.env.local` sesuai `apps/web/.env.example` dan `apps/api/.env` sesuai `apps/api/.env.example`. Gunakan URL dan **publishable key** proyek yang sama. Tidak ada secret/service-role key di browser.
4. Jalankan kedua aplikasi dan simpan proyek. UI akan menampilkan status tersinkron setelah API menerima simpan. Jika jaringan gagal, salinan lokal tetap ada.

Sinkronisasi MVP bersifat satu arah saat menyimpan. Daftar Proyek Saya membaca browser lokal; unduh JSON sebelum pindah perangkat atau membersihkan data browser. Penyatuan lintas perangkat dan akun guru adalah fase berikutnya.

## Build dan deploy

`npm run build` membangun web dan API. Vercel dapat menjalankan `apps/web` sebagai root proyek frontend. Set env `NEXT_PUBLIC_*` untuk URL API dan Supabase. Nest API memerlukan host Node yang dapat menjalankan `npm run start -w @atala/api` dengan env server. Jangan mengaktifkan URL API publik sebelum migrasi, auth anonim, CORS, dan kebijakan RLS diperiksa. Tidak ada data siswa bernama lengkap yang dikumpulkan.

## Struktur

`apps/web`: Next.js App Router. `apps/api`: Nest.js dan migrasi Supabase. `tasks/`: urutan kerja dan kriteria penerimaan.

## Studio blok dan papan catatan

Seret blok dari palet ke susunan program atau seret blok yang sudah ada untuk mengubah urutan. Di layar sentuh gunakan pegangan blok; tombol tambah dan pindah urutan juga tersedia. Latar panggung dan tokoh dapat dipilih per proyek.

Buka **Papan Guru** untuk menggambar, menaruh teks langsung di posisi klik, dan menambah lembar A4 ke bawah. Klik dua kali teks untuk mengubahnya. Tekan **Simpan** untuk menyimpan semua halaman di browser ini, lalu **Unduh PDF** untuk mengekspor seluruh halaman. Catatan belum memiliki sinkronisasi lintas perangkat. Petunjuk penggunaan rinci ada di [Panduan HTML](panduan/panduan-pengguna.html).

Acuan utama desain adalah [Atala Content Management](https://github.com/DodikSukma/atala-content-management), ditinjau di browser. Pengerjaan ini tidak mengunduh repository acuan. Tidak ada deployment dalam tahap ini.

## Karya siswa yang dapat dimainkan tanpa internet

Di Studio, tekan **Unduh karya HTML** untuk mendapatkan satu berkas `.html` dengan CSS, JavaScript, dan proyek siswa di dalamnya. Berkas itu dapat dibuka di browser tanpa Atala Lab, API, atau internet. Animasi `Ketika mulai` bermain otomatis; game berbasis tombol memakai **Tombol aksi**. **Cadangan JSON** dipakai untuk mengimpor dan mengedit kembali di Atala Lab. Tidak ada mode kalkulator dalam kurikulum Bulan 1–2.

Untuk memeriksa hasil di komputer sendiri, klik ganda berkas HTML dari folder Unduhan. Pastikan alamat browser berupa file lokal, lihat tokoh bergerak atau tekan **Tombol aksi**, lalu coba **Ulang dari awal**. Uji dengan internet dimatikan bila perlu. Browser otomatis pengembangan ini tidak mengizinkan alamat `file://`; berkas unduhan telah diperiksa tanpa rujukan eksternal dan dijalankan sebagai berkas utuh melalui server lokal, tetapi uji klik ganda pada perangkat pengguna masih diperlukan.

Papan Guru sekarang mendukung panah arah bebas serta screenshot dari clipboard melalui **Tempel gambar** atau Cmd/Ctrl+V. Pilih gambar lalu seret untuk memindahkannya; tarik pegangan di sudut kanan bawah untuk mengubah ukuran. Gambar dan panah ikut dalam simpan lokal dan PDF seluruh halaman.
