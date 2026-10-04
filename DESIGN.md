# Desain Atala Lab

## Acuan utama

[Atala Content Management](https://github.com/DodikSukma/atala-content-management) dilihat langsung di browser pada 1 Oktober 2026, terutama `docs/DESIGN.md` dan struktur Studio yang dijelaskan di sana. Bahasa visualnya menjadi acuan utama: bidang kerja terang, struktur biru, kartu putih dengan garis tipis dan bayangan halus, radius 12–16 px, tipografi tegas, ikon Lucide, dan satu tindakan utama yang jelas. Identitas Atala tetap digunakan tanpa logo Triton. Tidak ada source repository acuan yang diunduh atau dibaca dari salinan lokal dalam pembaruan ini.

Pola Triton login/tryout melengkapi acuan: hero dua panel dengan bidang biru bergradasi, kartu materi dengan aksen warna di atas, pill kategori/status, metadata ringkas, dan tombol utama jelas. Poster Generator melengkapi alur Studio: alat di sisi kiri, ruang kerja luas di tengah, pratinjau hasil langsung, dan ekspor. Halaman Atala Lab menerapkan pola ini untuk anak dan guru, bukan menyalin fitur manajemen konten atau CBT.

## Token dan tata letak

Latar `#F8FAFC`; permukaan `#FFFFFF`; teks `#0F172A`; teks sekunder `#475569`; garis `#E2E8F0`; biru utama `#2563EB`; ungu pendamping `#7C3AED`. Font antarmuka Plus Jakarta Sans dan fallback sans. Panel dan kartu memakai radius sekitar 12–16 px. Desktop memakai header 72 px dan isi maksimal 1200 px. Mobile menumpuk panel tanpa scroll horizontal halaman. Satu set ikon vektor Lucide dipakai di navigasi dan alat.

Hero beranda memakai gradien biru dan dua kolom: ajakan belajar di kiri dan pratinjau studio putih di kanan. Kartu bulan memakai strip aksen atas dan informasi singkat. Studio blok memakai palet, susunan program, dan panggung; blok bisa diseret dengan mouse atau sentuh serta tetap punya tombol untuk keyboard. Perubahan program dan panggung memberi umpan balik langsung.

## Papan catatan guru

Papan berupa rangkaian lembar A4 potret, bukan kanvas tetap satu layar. Guru dapat menambah halaman tanpa batas jumlah tetap dan menggulir vertikal. Koordinat objek disimpan secara global agar posisi pada setiap halaman tetap sama setelah disimpan dan dibuka ulang. Alat: pilih, pena, kotak, elips, teks, dan hapus. Teks ditulis langsung pada titik yang diklik; klik dua kali pada teks membuka penyuntingan. Undo/redo berlaku untuk perubahan objek. PDF memasukkan setiap lembar A4 dalam urutan yang terlihat di papan. Status simpan dan unduh ditampilkan jelas.

## Tema dan aksesibilitas

Pilihan Angkasa dan Taman di header tersimpan di browser. Struktur, kontras, label, dan susunan fungsi sama; warna panggung dan aksen berubah. Kontrol punya nama aksesibel, fokus keyboard terlihat, status tidak bergantung pada warna saja, dan animasi dibatasi serta menghormati `prefers-reduced-motion`.

## Karya yang dapat dibagikan

Tombol **Unduh karya HTML** dipisahkan dari **Cadangan JSON** agar anak dan guru memahami perbedaannya. HTML memakai panggung yang mengenali pilihan Angkasa/Taman dan Kiko/Kiki; file memuat seluruh gaya dan logika tanpa aset luar. Judul, status permainan, skor, posisi, daftar blok, dan tombol aksi tampil jelas. Program `Ketika mulai` bermain otomatis; game berbasis tombol menunggu tindakan anak. Teks buatan siswa di-escape sebelum dimasukkan ke HTML dan hanya dipasang sebagai `textContent` saat runtime.

Panduan singkat di Studio memperlihatkan tiga langkah kemajuan, tantangan per pertemuan, dan petunjuk yang dapat dibuka. Papan Guru menambah Panah serta Tempel gambar pada kelompok alat. Gambar terpilih menampilkan bingkai dan pegangan ukuran; objek tetap di halaman A4 yang aktif.
