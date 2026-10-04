# PRD — Atala Lab: Coding for Kids

## Ringkasan
Atala Lab adalah ruang belajar coding berbahasa Indonesia untuk siswa SD kelas 4, berkembang sampai kelas 6. Rilis pertama memuat bulan 1–2 (8 pertemuan dan 2 proyek akhir bulan). Siswa menyusun blok dengan seret atau klik, melihat tokoh bergerak, lalu menyimpan dan mengunduh proyek. Bulan 3–6 terlihat sebagai rencana tetapi belum dapat dibuka.

## Pengguna dan kebutuhan
- **Siswa kelas 4 (utama):** instruksi pendek, tombol besar, hasil langsung, kebebasan mencoba tanpa takut salah.
- **Guru/pendamping:** alur pertemuan yang terstruktur dan contoh hasil yang dapat diperiksa.
- **Pengelola kurikulum (kelak):** materi dan data terpisah sehingga kelas 5–6 dapat ditambahkan tanpa mengganti editor.

## Tujuan dan ukuran keberhasilan
Siswa dapat membuka pertemuan tanpa akun, memahami tujuan, menyusun sedikitnya satu urutan blok, menjalankannya, menyimpan proyek dan mengunduh JSON yang dapat diimpor lagi. Ukur keberhasilan uji coba dengan: ≥80% siswa menyelesaikan latihan pertama dengan bantuan minimal, ≥70% menyelesaikan proyek bulan 1, tanpa error yang menghilangkan proyek tersimpan. Angka ini target uji, bukan hasil yang sudah tercapai.

## Lingkup kurikulum enam bulan
| Bulan | Tema | Hasil |
|---|---|---|
| 1 | Kenalan coding visual | Urutan perintah, gerak, arah, animasi; proyek cerita gerak |
| 2 | Membuat permainan | Peristiwa, pengulangan, kondisi, skor; proyek game tangkap bintang |
| 3 | Jembatan ke teks | Mengenal kata perintah, mengetik kode sederhana; Segera hadir |
| 4 | Dokumen digital | Word: mengetik, format, dokumen sederhana; Segera hadir |
| 5 | Data dan presentasi | Excel: tabel/grafik dasar; PowerPoint: cerita visual; Segera hadir |
| 6 | AI yang bijak dan karya akhir | Prompt, cek fakta, privasi, proyek terpadu; Segera hadir |

Materi kelas 5–6 kelak menambah tingkat kesulitan pada konsep yang sama, bukan membuka data siswa kelas lain secara otomatis.

## Pertemuan rinci
Setiap pertemuan memiliki tahap **Kenali → Coba → Tantangan → Refleksi**. Contoh blok disediakan; siswa bebas mengganti dan menjalankan.

| ID | Judul | Konsep dan latihan | Bukti selesai |
|---|---|---|---|
| 1-1 | Halo, Kapten Kode! | Urutan: mulai, maju, putar | Tokoh mencapai tujuan |
| 1-2 | Jalan ke Bintang | Langkah dan arah | Tokoh bergerak ke bintang |
| 1-3 | Cerita Bergerak | Ucap dan tunggu sebagai animasi | Tokoh mengucap pesan |
| 1-4 | Koreografi Kecil | Gabungkan urutan gerak dan pesan | Rangkaian ≥4 blok |
| 1-P | Proyek Cerita Gerak | Rancang cerita dengan awal, aksi, akhir | Simpan dan unduh karya |
| 2-1 | Tombol Ajaib | Event ketika mulai / tombol ditekan | Event memicu aksi |
| 2-2 | Ulangi Lagi! | Loop dengan jumlah kecil | Gerak berulang |
| 2-3 | Pilih Jalan | Kondisi jika menyentuh bintang | Cabang berjalan |
| 2-4 | Skor Seru | Tambah skor dan gabung event/loop | Skor berubah |
| 2-P | Proyek Tangkap Bintang | Susun game sederhana | Skor bertambah saat bintang disentuh |

## Alur pengguna
Beranda → pilih bulan 1/2 → pilih pertemuan → baca tujuan/tahap → tambahkan blok lewat seret atau tombol → jalankan/reset → baca umpan balik → simpan proyek (nama panggilan opsional tanpa identitas penuh) → lihat Proyek Saya → unduh atau impor JSON. Bulan 3–6 hanya menampilkan penjelasan singkat “Segera hadir”.

## Kebutuhan fungsional
1. Beranda menampilkan enam kartu bulan dan pilihan tema Angkasa/Taman; bulan aktif membuka daftar modul.
2. Delapan pertemuan dan dua tugas proyek memiliki teks, tujuan, contoh blok, tantangan dan refleksi.
3. Editor blok dengan seret dan tombol dapat menambah, mengurutkan, menghapus, menjalankan, menghentikan, dan mereset blok. Blok yang didukung: mulai, tombol aksi, maju, putar kiri/kanan, ucap, tunggu, ulangi, jika sentuh bintang, tambah skor.
4. Kanvas memperlihatkan posisi, arah, pesan, bintang, dan skor. Runtime membatasi langkah agar loop tidak membeku.
5. Proyek dapat disimpan secara lokal tanpa akun; unduh/impor JSON berformat versi. Jika backend Supabase terkonfigurasi, proyek dapat disinkronkan melalui API dengan identitas anonim acak di perangkat. UI membedakan status lokal dan tersinkron.
6. API menyediakan health, katalog, daftar proyek, baca proyek, simpan, hapus. Payload divalidasi dan batas ukuran diterapkan.
7. Bulan 3–6 tidak memuat tombol latihan aktif atau materi yang berpura-pura selesai.

## Kebutuhan nonfungsional
- Responsif dari ponsel sampai desktop; tombol sentuh ≥44 px, fokus keyboard jelas, label teks selain warna, dan `prefers-reduced-motion` dihormati.
- Bahasa Indonesia sederhana, tidak meminta nama lengkap, email, foto, atau lokasi anak.
- Project JSON maksimal 64 KB; maksimal 80 blok; loop maksimal 12 kali; eksekusi maksimal 500 langkah.
- Rahasia Supabase hanya di server Nest. RLS pada tabel; tidak ada kunci rahasia pada browser. Tanpa kredensial, aplikasi tetap berfungsi lokal dan menampilkan statusnya secara jujur.
- Target Vercel untuk frontend. Backend Nest perlu target hosting Node terpisah atau adaptasi serverless teruji sebelum produksi; Vercel untuk frontend saja tidak otomatis menjalankan proses Nest yang persisten.

## Arsitektur dan data
Satu frontend **Next.js App Router** melayani semua bulan. Satu **Nest.js API** memakai modul Curriculum (katalog statis berversi) dan Projects (CRUD), bukan satu layanan per pertemuan; pembagian per pertemuan hanya menambah operasi dan biaya tanpa kebutuhan skala. **Supabase Postgres** menyimpan `projects(id uuid, owner_id uuid, title text, lesson_id text, blocks jsonb, scene jsonb, created_at, updated_at)` dengan indeks owner dan RLS. `owner_id` berasal dari `auth.uid()` pada sesi Supabase Anonymous Sign-ins dan diverifikasi oleh Nest. RLS membatasi baca/tulis pada pemilik. Identitas anonim per browser belum memberi pemulihan akun atau akses lintas perangkat; akun guru/keluarga adalah fase berikutnya. Endpoint persisten menolak operasi ketika konfigurasi server belum ada.

API: `GET /health`, `GET /curriculum`, `GET /projects`, `GET /projects/:id`, `POST /projects`, `DELETE /projects/:id` dengan bearer token Supabase. Nest memvalidasi UUID, panjang judul, ID pertemuan, jenis/blok, dan ukuran. Respons error tidak mengekspos rahasia. Frontend menyimpan data lokal lebih dahulu dan dapat mencoba sinkronisasi bila API tersedia.

## Kriteria penerimaan
- Semua kartu bulan 1–2 dan sepuluh modul membuka layar yang benar; bulan 3–6 bertanda Segera hadir.
- Editor memungkinkan siswa menyusun program, menjalankan demonstrasi, menghentikan, reset, dan memperoleh umpan balik yang tepat; urutan dan loop menghasilkan gerak terlihat.
- Proyek tersimpan bertahan sesudah reload pada browser yang sama; file yang diunduh dapat diimpor dan dijalankan kembali.
- Build frontend/backend dan uji runtime/validasi lolos. Status basis data nyata tidak diklaim berhasil tanpa URL, kunci, migrasi, dan uji integrasi.

## Rencana tiga hari
**Hari 1:** PRD/desain, konten 8 pertemuan, navigasi, fondasi UI. **Hari 2:** editor/runtime, proyek lokal, impor/unduh. **Hari 3:** API Nest, migrasi Supabase, pengujian, aksesibilitas, perbaikan, panduan setup dan deploy. Ini target kerja; aktivasi DB dan deploy tergantung kredensial serta hosting.

## Penyempurnaan studio dan ruang guru

- Palet blok dapat diseret dengan mouse atau sentuh ke posisi tertentu dalam program. Blok di program dapat diurutkan ulang dengan seret. Tombol tambah dan naik/turun tetap tersedia untuk pengguna keyboard.
- Panggung mendukung pilihan suasana/tokoh yang tersimpan bersama proyek lokal dan masuk payload sinkronisasi jika API terkonfigurasi.
- Guru memiliki papan catatan A4 potret yang dapat ditambah ke bawah dan digulir. Pena, bentuk, teks di titik klik, pilih, hapus, undo/redo, bersihkan, simpan, buka ulang, dan ekspor PDF semua halaman tersedia tanpa akun.
- Catatan disimpan di browser perangkat yang sama. PDF dapat dibagikan oleh guru. Sinkronisasi Supabase hanya berlaku untuk proyek siswa; catatan guru belum tersinkron lintas perangkat.
- Tampilan mengikuti [Atala Content Management](https://github.com/DodikSukma/atala-content-management) sebagai acuan utama yang ditinjau di browser, dengan pola hero Triton dan pengaturan Studio Poster Generator.

### Kriteria penerimaan tambahan

1. Seret dari palet menambah blok di posisi tujuan; seret blok yang sudah ada mengubah urutan tanpa kehilangan isinya.
2. Halaman catatan baru muncul di bawah halaman sebelumnya, dapat digulir dan diberi teks tepat di titik klik.
3. Teks lama dapat diedit kembali, catatan dua halaman bertahan setelah simpan/buka ulang, dan PDF hasil ekspor berukuran A4 dengan jumlah halaman yang sesuai.
4. Beranda, Studio, dan papan catatan dapat dipakai pada lebar desktop dan ponsel tanpa panel yang terpotong.

## Karya HTML mandiri dan dukungan guru

Siswa Bulan 1–2 dapat mengunduh **satu file `.html`** berisi seluruh CSS, JavaScript, dan data program. Berkas itu membuka animasi atau game yang sesuai dengan blok, latar, tokoh, judul, pesan, gerak, kondisi, pengulangan, dan skor proyek. Program dengan blok `Ketika mulai` berjalan saat file dibuka; program bertombol menunggu anak menekan **Tombol aksi**. Tersedia Jalankan dan Ulang dari awal. Tidak ada CDN, gambar luar, API, atau langkah build setelah unduhan. HTML adalah karya untuk dimainkan dan dibagikan; JSON tetap cadangan untuk pengeditan ulang. Rilis ini tidak menawarkan jenis proyek kalkulator.

Studio pertemuan menampilkan tiga langkah kemajuan (susun, jalankan, simpan), tantangan dari modul, dan petunjuk singkat yang dapat dibuka bila perlu. Umpan balik ditampilkan setelah program berjalan. Pengalaman ini terfokus pada delapan pertemuan dan dua proyek Bulan 1–2.

Papan Guru menerima gambar dari clipboard, termasuk screenshot OS, setelah dikonversi menjadi data gambar lokal berukuran wajar. Gambar dapat dipilih, dipindah, diubah ukuran, disimpan, dibuka ulang, dibatalkan/diulangi, dan diekspor ke PDF A4. Alat panah menerima seretan titik awal ke akhir dalam arah bebas dan mengikuti riwayat serta ekspor yang sama. Jika clipboard tidak mengizinkan pembacaan atau tidak berisi gambar, tampilkan pesan yang jelas dan sarankan Cmd/Ctrl+V.

Kriteria penerimaan: HTML berdiri sendiri secara statis dan runtime tertanam menghasilkan gerak/skor sesuai runtime editor; gambar dan panah bertahan setelah simpan/buka; PDF dua halaman mencakup objek; tombol dan petunjuk dapat digunakan pada desktop dan ponsel. Pengujian langsung `file://` dilakukan bila alat browser mengizinkan akses protokol lokal.
