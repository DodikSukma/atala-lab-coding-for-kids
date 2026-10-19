# MASTER TASK — Atala Lab UI, Content, Character, Project Gallery, dan Whiteboard Upgrade

## 0. Instruksi utama untuk Gemini Argon

Kerjakan task ini langsung pada repository **Atala Lab — Coding for Kids** yang menyertai dokumen ini. Jangan hanya membuat analisis, mockup, atau rencana. Lakukan implementasi, pengujian, dan dokumentasi sampai Definition of Done terpenuhi.

Urutan kerja wajib:

1. Baca seluruh `README.md`, `PRD.md`, `DESIGN.md`, `AGENTS.md` yang berlaku, folder `tasks/`, serta kode terkait sebelum mengubah file.
2. Jalankan baseline `npm test` dan `npm run build`. Catat hasil awal.
3. Audit UI pada viewport 375 px, 768 px, 1024 px, dan 1440 px.
4. Kerjakan per fase dalam urutan dokumen ini. Jangan mengerjakan semuanya dalam satu komponen besar.
5. Setelah tiap fase, jalankan tes yang relevan dan periksa visual di browser.
6. Pada akhir pekerjaan, jalankan seluruh test/build, perbarui dokumentasi, dan tulis ringkasan file yang berubah serta hal yang belum selesai.

Pertahankan fitur yang sudah ada:

- 8 pertemuan dan 2 proyek Bulan 1–2.
- Drag-and-drop blok serta alternatif tombol untuk keyboard/touch.
- Runtime dengan batas 80 blok dan 500 langkah.
- Simpan lokal, impor/ekspor JSON, dan karya HTML mandiri tanpa internet.
- Tema Angkasa/Taman.
- Papan Guru multi-halaman A4, simpan lokal, gambar clipboard, dan ekspor PDF.
- Static export Next.js, `basePath`, dan target hosting cPanel yang sudah dikonfigurasi.
- Nest API, kontrak proyek, dan kompatibilitas data lama.

Jangan menyalin logo, karakter, sprite, nama, atau aset berhak cipta milik Scratch. Inspirasi yang boleh diambil adalah prinsip UX: playful, visual, langsung terlihat hasilnya, blok mudah dibedakan, dan ramah anak. Identitas harus tetap **Atala Lab**, dengan karakter orisinal Kiko dan Kiki.

---

## 1. Sasaran produk

Ubah Atala Lab dari MVP yang fungsional menjadi pengalaman belajar yang terasa matang, hidup, dan menyenangkan untuk siswa kelas 4 SD, sekaligus membuat Papan Guru mendekati kenyamanan whiteboard modern seperti Excalidraw.

Target hasil akhir:

- Anak langsung memahami siapa karakternya, apa misinya, blok mana yang harus dipakai, dan apa hasil dari programnya.
- UI terasa playful dan premium tanpa terlalu ramai atau kekanak-kanakan.
- Materi tidak lagi terasa seperti daftar teks; setiap pertemuan menjadi sebuah misi singkat dengan konteks cerita, langkah, eksperimen, tantangan, dan refleksi.
- Tersedia galeri proyek contoh yang menarik dan dapat di-remix.
- Papan Guru nyaman untuk menggambar diagram, menjelaskan algoritma, menyusun materi, dan mengekspor hasil.
- Semua fitur tetap responsif, aksesibel, cepat, dan bekerja tanpa akun.

---

## 2. Batas scope

### Termasuk dalam pekerjaan ini

- Redesign visual beranda, halaman bulan, halaman belajar, Studio Blok, Proyek Saya, dan Papan Guru.
- Design system kecil yang konsisten.
- Karakter Kiko/Kiki orisinal dengan state visual yang jelas.
- Peningkatan stage dan feedback animasi.
- Restrukturisasi dan pengayaan konten Bulan 1–2.
- Galeri proyek contoh/template dan alur remix.
- Refactor Papan Guru menjadi whiteboard Excalidraw-inspired.
- Refactor komponen/CSS yang diperlukan agar maintainable.
- Unit test, integration test, dan pengujian browser untuk fitur baru.

### Tidak termasuk

- Akun guru/siswa, kelas online, pembayaran, atau multi-tenant sekolah.
- Chatbot AI.
- Penyelesaian materi Bulan 3–6.
- Perubahan besar API/Supabase kecuali benar-benar dibutuhkan untuk kompatibilitas fitur yang sudah ada.
- Mengganti runtime menjadi bahasa pemrograman baru.
- Mengambil aset dari CDN atau situs eksternal pada runtime.

Jika menemukan masalah di luar scope, catat di bagian `Future Work` dan jangan memperlebar pekerjaan tanpa kebutuhan.

---

## 3. Prinsip desain wajib

1. **Atala-first:** gunakan biru Atala sebagai fondasi, dengan aksen ungu, kuning, hijau, dan coral untuk kategori serta feedback.
2. **Playful but focused:** bentuk ramah, ilustrasi hidup, tetapi satu tindakan utama harus selalu jelas.
3. **Character-led learning:** Kiko/Kiki menjadi pemandu visual dan bereaksi terhadap program.
4. **Show, then explain:** tampilkan contoh visual sebelum paragraf penjelasan.
5. **Child-readable:** kalimat pendek, ukuran teks nyaman, istilah konsisten, tidak penuh jargon.
6. **Accessible:** target sentuh minimal 44×44 px, fokus keyboard jelas, kontras memadai, status tidak hanya bergantung pada warna, dan `prefers-reduced-motion` dihormati.
7. **Offline-friendly:** aset penting disimpan lokal; karya HTML mandiri tetap tidak boleh memiliki ketergantungan jaringan.
8. **Responsive by design:** bukan sekadar mengecilkan desktop; urutan panel harus tetap logis pada tablet dan ponsel.

---

## 4. Fase A — Design system dan fondasi UI

### A1. Audit dan konsolidasi CSS

- Audit `globals.css`, `redesign.css`, `studio.css`, dan `whiteboard.css` untuk aturan duplikat, konflik breakpoint, dan selector yang sudah mati.
- Jangan melakukan rewrite buta. Pertahankan perilaku yang benar dan pindahkan token global ke satu tempat.
- Buat token untuk:
  - warna brand dan semantic states;
  - surface/background/border;
  - radius;
  - shadow;
  - spacing;
  - typography scale;
  - transition/duration;
  - z-index layer.
- Pecah CSS berdasarkan area bila file terus membesar. Hindari menambah blok override baru di bagian paling bawah tanpa membersihkan aturan lama.

### A2. Komponen UI reusable

Buat komponen kecil bila memang dipakai di beberapa tempat, misalnya:

- `Button`/varian action yang konsisten;
- `Badge` dan status pill;
- `ProgressSteps`;
- `EmptyState`;
- `ConfirmDialog` yang ramah anak menggantikan `window.confirm` untuk aksi penting;
- `Toast` atau inline notice dengan `aria-live`;
- `CharacterAvatar`/`CharacterGuide`.

Jangan membangun UI framework besar. Utamakan komponen sederhana dan TypeScript ketat.

### A3. Navigation dan layout

- Perjelas active navigation.
- Tambahkan mobile navigation yang tidak memotong link.
- Header tidak boleh menutupi konten ketika layar pendek.
- Tambahkan skip link ke konten utama.
- Pastikan setiap halaman memiliki heading hierarchy yang benar.

### Acceptance criteria Fase A

- Tidak ada horizontal page scroll pada viewport 375 px.
- Semua tombol utama minimal 44 px pada touch viewport.
- Fokus keyboard terlihat di semua kontrol.
- Tidak ada regresi tema Angkasa/Taman.
- Jumlah aturan duplikat/override CSS berkurang dan struktur stylesheet dijelaskan singkat dalam dokumentasi.

---

## 5. Fase B — Karakter Kiko/Kiki dan stage yang lebih hidup

### B1. Aset karakter orisinal

Buat aset vektor lokal yang orisinal untuk:

- Kiko, robot penjelajah Atala;
- Kiki, kucing penjelajah Atala.

Minimal masing-masing memiliki state:

- `idle`;
- `walk/move`;
- `turn`;
- `talk`;
- `success`;
- `thinking/error`.

Aset dapat berupa SVG components atau sprite SVG lokal. Pastikan tajam pada retina display, ukuran file wajar, dan tidak memakai gambar luar. Tambahkan `aria-label` hanya jika karakter menyampaikan informasi; dekorasi murni harus `aria-hidden`.

### B2. Character rendering

- Pisahkan rendering karakter dari `Stage.tsx` menjadi komponen khusus.
- State karakter harus ditentukan oleh frame/runtime, bukan animasi acak.
- Saat `move`, karakter memiliki bounce/step halus.
- Saat `left/right`, arah dan state turn terlihat jelas.
- Saat `say`, tampilkan speech bubble yang tidak menutupi karakter atau target.
- Saat mencapai bintang/target, tampilkan feedback success ringan seperti glow, particles, atau confetti lokal.
- Saat program gagal dijalankan, tampilkan ekspresi berpikir dan pesan yang membantu.
- Semua animasi harus memiliki fallback reduced-motion.

### B3. Stage dan lingkungan

Percantik Angkasa dan Taman dengan elemen lokal ringan:

- foreground/background berlapis;
- grid yang tetap terbaca;
- target bintang/bunga lebih jelas;
- jejak langkah atau path opsional;
- indikator arah hadap;
- state aktif blok dan state stage tersinkron secara visual.

Jangan membuat stage terlalu ramai. Blok, karakter, target, dan feedback harus tetap menjadi fokus.

### B4. Feedback belajar

Tambahkan feedback yang spesifik, bukan hanya “Bagus”:

- “Kiko bergerak 3 langkah ke kanan.”
- “Target belum tercapai. Coba tambahkan satu blok Maju.”
- “Blok Jika belum aktif karena Kiki belum menyentuh target.”
- “Hebat! Kamu memakai pengulangan untuk menghemat blok.”

Feedback harus dihitung dari program dan hasil runtime secara deterministik. Jangan memakai AI/API.

### Acceptance criteria Fase B

- Kiko dan Kiki jelas terlihat sebagai dua karakter berbeda pada desktop dan mobile.
- State idle, move, talk, success, dan error dapat diuji.
- Stage tidak bergantung pada aset eksternal.
- Runtime dan hasil posisi/skor lama tetap identik.
- Export HTML mandiri juga memakai representasi karakter yang lebih baik atau fallback lokal yang konsisten.

---

## 6. Fase C — Pengayaan content dan pengalaman belajar

### C1. Perluas model lesson tanpa merusak data lama

Refactor konten kurikulum menjadi struktur data yang mudah dikembangkan. Tambahkan field bila relevan:

- `story` — konteks cerita singkat;
- `concept` — satu konsep inti;
- `missionSteps` — 3–5 langkah praktik;
- `experiment` — hal kecil yang bisa diubah anak;
- `challengeLevels` — Mudah, Hebat, Bintang;
- `successCriteria` — indikator keberhasilan yang bisa diperiksa;
- `commonMistakes` — kesalahan umum dan petunjuk;
- `vocabulary` — maksimal 3 istilah;
- `teacherNote` — catatan ringkas untuk pendamping;
- `estimatedMinutes`;
- `starterProjectId` bila memakai template.

Gunakan TypeScript untuk memastikan semua lesson aktif memenuhi schema.

### C2. Struktur halaman belajar

Setiap lesson harus menyajikan urutan berikut:

1. Pembuka misi dengan Kiko/Kiki.
2. “Hari ini kamu akan bisa…” dalam satu kalimat.
3. Contoh visual konsep.
4. Langkah praktik singkat.
5. Studio Blok.
6. Tiga tingkat tantangan.
7. Checklist keberhasilan.
8. Refleksi satu pertanyaan.
9. Catatan guru dalam panel yang bisa dibuka/tutup.

Hindari paragraf panjang. Gunakan bahasa Indonesia alami untuk anak kelas 4.

### C3. Isi minimum Bulan 1–2

Perkaya seluruh 10 modul yang sudah ada. Tema naratif yang disarankan:

- Bulan 1: Kiko/Kiki menjelajahi Planet Atala dan belajar memberi instruksi.
- Bulan 2: mereka membangun Festival Game Bintang.

Konten harus saling berlanjut, tetapi setiap lesson tetap dapat dibuka mandiri.

### C4. Progress lokal

Tambahkan progress lokal sederhana tanpa akun:

- belum mulai;
- sedang dikerjakan;
- pernah dijalankan;
- tersimpan/selesai.

Tampilkan progres pada kartu bulan dan daftar lesson. Jangan mengunci lesson secara keras; anak tetap boleh melompat.

### Acceptance criteria Fase C

- Semua 10 modul memiliki konten baru yang lengkap dan konsisten.
- Tidak ada placeholder/lorem ipsum.
- Progress bertahan setelah reload.
- Status selesai tidak diklaim hanya karena halaman dibuka.
- Tampilan materi tetap ringkas pada ponsel.

---

## 7. Fase D — Galeri proyek yang lebih menarik

### D1. Project template model

Buat sumber data template terpisah dari proyek milik pengguna. Setiap template minimal memiliki:

- ID stabil;
- judul;
- deskripsi pendek;
- tingkat kesulitan;
- konsep/blok utama;
- lesson yang relevan;
- karakter dan latar;
- daftar blok awal;
- thumbnail/preview lokal;
- tujuan remix.

### D2. Template minimum

Buat minimal enam proyek contoh yang benar-benar dapat dimainkan dengan kemampuan runtime saat ini:

1. **Kiko Menuju Bintang** — urutan dan gerak.
2. **Tarian Kiki** — putar, gerak, ucapan, dan jeda.
3. **Pesan dari Planet Atala** — animasi cerita.
4. **Roket Berulang** — repeat.
5. **Tangkap Bintang** — event, kondisi, dan skor.
6. **Taman Bunga Kiki** — tema Taman dan tantangan remix.

Jangan membuat template yang berpura-pura memiliki mekanik yang belum didukung runtime.

### D3. Halaman Jelajahi Proyek

Tambahkan halaman/section galeri:

- filter konsep dan tingkat kesulitan;
- kartu dengan preview yang kuat;
- tombol `Lihat`, `Mainkan`, dan `Remix`;
- preview tidak langsung mengubah proyek pengguna;
- `Remix` membuat ID proyek baru dan membuka Studio;
- label yang jelas antara “Contoh Atala” dan “Proyek Saya”.

### D4. Proyek Saya

Perbaiki halaman proyek pengguna:

- thumbnail berdasarkan scene/proyek;
- pencarian lokal;
- urutkan terakhir diubah/judul;
- duplicate/remix;
- rename;
- empty state yang mengarah ke galeri;
- dialog hapus yang jelas;
- tetap menyediakan HTML dan JSON.

### Acceptance criteria Fase D

- Enam template dapat dibuka, dimainkan, dan di-remix.
- Remix tidak pernah menimpa template atau proyek lama.
- Proyek hasil remix dapat disimpan, diekspor HTML, diekspor JSON, dan diimpor kembali.
- Galeri responsif dan tidak memuat aset jaringan.

---

## 8. Fase E — Papan Guru ala Excalidraw, tetap mendukung A4

### E1. Keputusan arsitektur

Pertahankan format catatan lama melalui migrasi/normalisasi. Jangan membuat catatan yang sudah tersimpan hilang.

Pilih salah satu setelah spike singkat:

- Integrasikan `@excalidraw/excalidraw` secara lazy/dynamic jika kompatibel dengan React 19, Next.js static export, base path, touch, penyimpanan lokal, dan PDF yang dibutuhkan; atau
- lanjutkan engine SVG internal dengan refactor modular.

Jangan memilih library hanya karena fiturnya lengkap. Tolak integrasi jika memperbesar bundle secara berlebihan, merusak static export, memerlukan jaringan, atau sulit mempertahankan ekspor A4. Dokumentasikan keputusan dan trade-off singkat.

### E2. Workspace dan navigasi

Target interaksi:

- zoom in/out dan reset zoom;
- pan menggunakan space+drag/middle pointer serta gesture touch yang wajar;
- indikator zoom;
- fit-to-page;
- grid/dot background opsional;
- mini toolbar yang tetap terlihat tetapi tidak menutup kanvas;
- mode layar penuh jika aman.

Model yang diinginkan adalah **hybrid**: pengalaman edit bebas seperti Excalidraw, dengan frame/page A4 yang jelas untuk hasil PDF. Jangan menghapus konsep multi-halaman A4.

### E3. Selection dan transform

Implementasikan:

- click select;
- drag marquee selection;
- multi-select dengan Shift;
- bounding box;
- move semua tipe objek;
- resize shape, image, dan text;
- rotasi minimal untuk shape/image bila feasible;
- duplicate;
- delete/backspace;
- copy, cut, dan paste;
- select all;
- bring forward/send backward;
- alignment sederhana untuk multi-selection.

Transform tidak boleh terbatas pada gambar saja.

### E4. Alat gambar

Minimal tersedia:

- select;
- hand/pan;
- freehand pen dengan smoothing;
- eraser;
- rectangle;
- ellipse;
- line;
- arrow dengan arrowhead yang benar;
- text multiline;
- image paste/upload;
- highlighter;
- sticky note atau callout.

Properti kontekstual:

- stroke color;
- background/fill color;
- stroke width;
- opacity;
- dashed/solid;
- font size;
- font weight bila relevan.

### E5. Keyboard dan history

Tambahkan shortcut umum, tanpa mengambil alih saat pengguna sedang mengetik:

- `V/1` select;
- `H` hand;
- `P` pen;
- `R` rectangle;
- `O` ellipse;
- `A` arrow;
- `T` text;
- `Cmd/Ctrl+Z` undo;
- `Cmd/Ctrl+Shift+Z` atau `Ctrl+Y` redo;
- `Cmd/Ctrl+C/X/V`;
- `Cmd/Ctrl+D` duplicate;
- `Delete/Backspace` delete selection;
- `Cmd/Ctrl+A` select all;
- `Escape` cancel/deselect;
- `+`, `-`, dan `0` untuk zoom.

History harus mencakup create, move, resize, style, paste, delete, page changes, dan multi-object operations. Batasi history agar penggunaan memori tetap wajar.

### E6. Penyimpanan dan ekspor

- Autosave lokal dengan debounce dan indikator `Tersimpan/Belum tersimpan`.
- Simpan versi schema dan migrasikan format lama.
- Tetap sediakan simpan manual.
- Ekspor seluruh halaman ke PDF A4.
- Tambahkan ekspor PNG per halaman atau halaman aktif.
- Tambahkan ekspor/impor JSON catatan agar guru dapat membuat cadangan.
- Gambar lokal harus tetap muncul setelah reload dan pada hasil PDF/PNG.
- Beri peringatan ramah bila quota browser hampir/penuh.

### E7. Refactor wajib

`Whiteboard.tsx` saat ini terlalu besar. Pecah sekurangnya menjadi:

- model/schema dan migration;
- reducer/history;
- coordinate/transform utilities;
- canvas renderer;
- toolbar/properties panel;
- library/sidebar;
- persistence/export adapters;
- keyboard shortcut hook.

Gunakan reducer atau state model yang konsisten. Hindari banyak state yang saling bergantung tanpa satu sumber kebenaran.

### Acceptance criteria Fase E

- Catatan versi lama tetap dapat dibuka.
- Semua tipe objek dapat dipilih, dipindah, dan dihapus.
- Multi-select, copy/paste, duplicate, undo/redo, zoom, dan pan bekerja.
- Teks multiline dapat diedit kembali.
- Gambar dapat dipaste, dipindah, di-resize, disimpan, dan diekspor.
- PDF dua halaman tetap dua halaman dan posisi objek benar.
- PNG halaman aktif sesuai tampilan kanvas.
- Shortcut tidak aktif saat pengguna mengetik pada input/textarea.
- Touch interaction tidak menyebabkan page scroll saat sedang menggambar.

---

## 9. Testing dan quality gates

### Unit test wajib

Tambahkan/perbarui test untuk:

- lesson schema dan kelengkapan 10 modul;
- progress lokal;
- project template validation;
- remix membuat ID baru;
- runtime tetap kompatibel;
- character state derivation;
- whiteboard reducer/history;
- multi-selection transform;
- zoom/pan coordinate conversion;
- schema migration catatan lama;
- PDF/PNG page bounds;
- export/import JSON catatan;
- keamanan teks siswa dalam standalone HTML.

### Browser/E2E minimum

Gunakan Playwright bila dependency dan lingkungan memungkinkan. Uji alur:

1. Buka beranda → Bulan 1 → lesson pertama.
2. Tambah/reorder blok → jalankan → lihat feedback → simpan.
3. Buka galeri → preview → remix → simpan → buka dari Proyek Saya.
4. Unduh/generate HTML dan pastikan tidak memiliki URL aset eksternal.
5. Papan Guru: gambar, shape, text, image, multi-select, move, undo, save, reload.
6. Papan dua halaman → PDF dua halaman.
7. Keyboard-only untuk navigasi utama dan Studio.
8. Audit viewport 375, 768, dan 1440 px.

Jika Playwright tidak dapat dipasang, jangan menghapus quality gate. Lakukan browser verification yang tersedia dan dokumentasikan keterbatasannya.

### Perintah akhir wajib

```bash
npm test
npm run build
```

Keduanya harus berhasil tanpa menonaktifkan tes atau mengabaikan TypeScript error.

---

## 10. Performance, keamanan, dan aksesibilitas

- Lazy-load fitur whiteboard berat jika memakai library besar.
- Jangan menambahkan tracking/analytics pihak ketiga.
- Jangan mengirim gambar clipboard, nama proyek, atau catatan guru ke jaringan.
- Escape/sanitize seluruh teks yang masuk ke HTML/SVG/export.
- Validasi import JSON dengan schema dan batas ukuran.
- Pertahankan CSP aman pada standalone HTML.
- Jangan gunakan `dangerouslySetInnerHTML` untuk konten pengguna.
- Hindari animasi layout yang berat dan interval yang tidak dibersihkan.
- Semua status async/feedback memakai `aria-live` yang tepat.
- Ikon harus memiliki label atau didampingi teks.
- Informasi tidak boleh dibedakan hanya dengan warna.

---

## 11. Definition of Done

Pekerjaan baru dianggap selesai jika:

- Seluruh Fase A–E dan acceptance criteria terpenuhi, atau bagian yang benar-benar terblokir dijelaskan dengan bukti teknis.
- Tidak ada fitur lama yang hilang.
- Kiko/Kiki memiliki visual dan state yang jelas.
- Seluruh 10 lesson memiliki content yang diperkaya.
- Enam proyek contoh dapat dimainkan dan di-remix.
- Whiteboard memiliki pengalaman selection/transform/zoom/pan/history yang matang dan tetap mengekspor A4.
- Mobile, tablet, dan desktop telah diperiksa.
- `npm test` dan `npm run build` lulus.
- Tidak ada aset runtime eksternal.
- README/panduan pengguna diperbarui.
- Buat laporan akhir `IMPLEMENTATION_REPORT.md` berisi:
  - ringkasan hasil;
  - keputusan arsitektur;
  - daftar file utama yang berubah;
  - hasil test/build;
  - screenshot halaman utama, Studio, galeri, dan Papan Guru pada desktop/mobile bila alat mendukung;
  - keterbatasan dan future work.

---

## 12. Prioritas jika waktu/konteks terbatas

Jika task tidak dapat diselesaikan dalam satu run, jangan meninggalkan repository dalam kondisi setengah rusak. Selesaikan dan verifikasi satu fase sebelum lanjut.

Urutan prioritas:

1. Fase A — fondasi UI dan CSS.
2. Fase B — karakter serta stage.
3. Fase C — content dan progress.
4. Fase D — galeri proyek/remix.
5. Fase E — whiteboard upgrade.

Pada akhir run yang belum lengkap, perbarui checklist di dokumen ini menggunakan status `[x]`, `[~]`, atau `[ ]`, tulis checkpoint pada `IMPLEMENTATION_REPORT.md`, dan pastikan build/test tetap hijau agar agent berikutnya bisa melanjutkan.

---

## 13. Checklist eksekusi

- [x] Baseline test/build dicatat.
- [x] UI/CSS audit selesai.
- [x] Design tokens dan komponen reusable selesai.
- [x] Responsive navigation dan accessibility dasar selesai.
- [x] Kiko/Kiki SVG dan character states selesai.
- [x] Stage dan feedback belajar selesai.
- [x] Model dan isi 10 lesson diperbarui.
- [x] Progress lokal selesai.
- [x] Enam project templates selesai.
- [x] Galeri preview/play/remix selesai.
- [x] Proyek Saya ditingkatkan.
- [x] Keputusan engine whiteboard didokumentasikan.
- [x] Whiteboard refactor selesai.
- [x] Selection/transform/multi-select selesai.
- [x] Zoom/pan/shortcut/history selesai.
- [x] Autosave dan ekspor/impor selesai.
- [x] Unit/integration/E2E tests selesai.
- [x] Audit desktop/tablet/mobile selesai.
- [x] Final test/build lulus.
- [x] README/panduan dan `IMPLEMENTATION_REPORT.md` selesai.
