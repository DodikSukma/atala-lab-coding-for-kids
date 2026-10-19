export type BlockKind =
  | "start"
  | "key"
  | "move"
  | "left"
  | "right"
  | "say"
  | "wait"
  | "repeat"
  | "ifStar"
  | "score";

export type Block = { id: string; kind: BlockKind; value?: number | string };

export type ChallengeLevel = {
  level: "Mudah" | "Hebat" | "Bintang";
  description: string;
};

export type SuccessCheckKind =
  | "has_start"
  | "has_key"
  | "min_blocks_3"
  | "min_blocks_4"
  | "min_blocks_5"
  | "reach_star"
  | "has_turn"
  | "has_say"
  | "has_wait"
  | "has_repeat"
  | "has_if_star"
  | "has_score"
  | "saved_project";

export type SuccessCriterion = {
  id: string;
  label: string;
  check: SuccessCheckKind;
};

export type CommonMistake = {
  mistake: string;
  hint: string;
};

export type VocabularyItem = {
  term: string;
  definition: string;
};

export type LessonConcept = {
  title: string;
  summary: string;
  visualExample: BlockKind[];
  visualCaption: string;
};

export type Lesson = {
  id: string;
  month: number;
  number: number;
  title: string;
  eyebrow: string;
  intro: string;
  goal: string;
  learn: string[];
  challenge: string;
  reflection: string;
  starter: BlockKind[];
  project?: boolean;
  color: string;
  // Enriched Fase C fields
  story: string;
  guideCharacter: "bot" | "cat";
  concept: LessonConcept;
  missionSteps: string[];
  experiment: string;
  challengeLevels: [ChallengeLevel, ChallengeLevel, ChallengeLevel];
  successCriteria: SuccessCriterion[];
  commonMistakes: CommonMistake[];
  vocabulary: VocabularyItem[];
  teacherNote: string;
  estimatedMinutes: number;
  starterProjectId?: string;
};

export const months = [
  {
    number: 1,
    title: "Petualangan Blok",
    description:
      "Jelajahi Planet Atala bersama Kiko dan Kiki lewat urutan perintah, gerak, arah, dan cerita animasi.",
    color: "blue",
    icon: "rocket",
  },
  {
    number: 2,
    title: "Pembuat Game",
    description:
      "Bangun Festival Game Bintang dengan tombol aksi, pengulangan, kondisi, dan papan skor.",
    color: "purple",
    icon: "game",
  },
  {
    number: 3,
    title: "Dari Blok ke Kode",
    description: "Mulai menulis perintah teks sederhana dari logika blok.",
    color: "teal",
    icon: "code",
  },
  {
    number: 4,
    title: "Jago Dokumen",
    description: "Berkarya membuat cerita dan laporan rapi dengan Word.",
    color: "orange",
    icon: "file",
  },
  {
    number: 5,
    title: "Data & Presentasi",
    description: "Mengolah tabel seru di Excel dan bercerita di PowerPoint.",
    color: "pink",
    icon: "chart",
  },
  {
    number: 6,
    title: "AI yang Bijak",
    description: "Bertanya cerdas, memeriksa fakta, dan membuat karya akhir.",
    color: "yellow",
    icon: "spark",
  },
] as const;

export const lessons: Lesson[] = [
  {
    id: "1-1",
    month: 1,
    number: 1,
    title: "Halo, Kapten Kode!",
    eyebrow: "Urutan perintah",
    intro:
      "Komputer mengikuti perintah dari atas ke bawah. Ayo beri Kiko langkah pertamanya menuju bintang!",
    goal: "Kamu bisa menyusun perintah Ketika mulai dan Maju secara berurutan hingga tokoh mencapai bintang.",
    learn: [
      "Blok adalah perintah kecil untuk tokoh di panggung.",
      "Komputer membaca blok berurutan dari atas ke bawah.",
      "Tekan Jalankan untuk melihat Kiko melangkah ke bintang.",
    ],
    challenge:
      "Bawa Kiko dari petak awal (2 : 4) ke bintang di petak (5 : 4) dengan tiga blok Maju.",
    reflection:
      "Apa yang terjadi jika blok Maju ditaruh di atas blok Ketika mulai?",
    starter: ["start", "move", "move"],
    color: "blue",
    story:
      "Pesawat Kiko baru saja mendarat di Planet Atala! Di kejauhan ada Bintang Energi yang berkilau. Kiko butuh bantuanmu sebagai Kapten Kode untuk memberi urutan langkah yang tepat.",
    guideCharacter: "bot",
    concept: {
      title: "Urutan Perintah (Sekuens)",
      summary:
        "Robot tidak bisa menebak pikiran kita. Ia menjalankan blok satu per satu dari nomor 01 di paling atas sampai selesai di bawah.",
      visualExample: ["start", "move", "move", "move"],
      visualCaption:
        "Mulai dulu dengan Ketika mulai, lalu tambahkan 3 langkah Maju agar Kiko tiba tepat di bintang.",
    },
    missionSteps: [
      "Perhatikan posisi Kiko di petak (2 : 4) dan bintang di petak (5 : 4).",
      "Tambahkan satu blok Maju 1 langkah lagi dari kategori Gerak ke jalur program.",
      "Tekan tombol Jalankan dan amati Kiko melangkah tiga petak ke kanan.",
      "Simpan karyamu dengan nama misi pertamamu!",
    ],
    experiment:
      "Coba tambahkan blok Ucap “Halo!” setelah Kiko sampai di bintang, lalu jalankan lagi!",
    challengeLevels: [
      {
        level: "Mudah",
        description: "Jalankan blok awal dan lihat Kiko maju 2 langkah.",
      },
      {
        level: "Hebat",
        description:
          "Tambahkan blok Maju ketiga supaya Kiko tepat menyentuh bintang di petak (5 : 4).",
      },
      {
        level: "Bintang",
        description:
          "Setelah menyentuh bintang, buat Kiko mengucapkan pesan kemenanganmu!",
      },
    ],
    successCriteria: [
      {
        id: "1-1-start",
        label: "Memakai blok pemicu Ketika mulai di urutan pertama",
        check: "has_start",
      },
      {
        id: "1-1-blocks",
        label: "Menyusun minimal 4 blok di jalur program",
        check: "min_blocks_4",
      },
      {
        id: "1-1-star",
        label: "Menjalankan program hingga Kiko menyentuh bintang",
        check: "reach_star",
      },
    ],
    commonMistakes: [
      {
        mistake: "Kiko berhenti satu petak sebelum bintang.",
        hint: "Hitung jarak petaknya: dari kolom 2 ke kolom 5 butuh 3 kali blok Maju 1 langkah.",
      },
      {
        mistake: "Tombol Jalankan tidak bisa ditekan.",
        hint: "Pastikan blok merah muda Ketika mulai masih ada di jalur programmu.",
      },
    ],
    vocabulary: [
      {
        term: "Program",
        definition: "Susunan blok perintah yang dijalankan oleh komputer.",
      },
      {
        term: "Urutan (Sekuens)",
        definition: "Langkah-langkah yang dijalankan berurutan dari atas ke bawah.",
      },
      {
        term: "Pemicu",
        definition: "Blok pembuka yang memberi tahu kapan program harus mulai.",
      },
    ],
    teacherNote:
      "Ajak siswa menunjuk petak di layar dengan jari sebelum menambah blok. Tanyakan berapa langkah dari kolom 2 ke kolom 5 agar mereka merasakan hubungan angka dan gerak.",
    estimatedMinutes: 20,
    starterProjectId: "tpl-kiko-bintang",
  },
  {
    id: "1-2",
    month: 1,
    number: 2,
    title: "Jalan ke Bintang",
    eyebrow: "Arah dan langkah",
    intro:
      "Kiki suka berbelok mengelilingi taman kristal. Ayo gunakan blok Putar dan Maju untuk memilih rute!",
    goal: "Kamu bisa mengubah arah hadap tokoh memakai Putar kiri atau Putar kanan sebelum melangkah maju.",
    learn: [
      "Blok Maju selalu mengikuti arah hadap tokoh saat itu.",
      "Putar kanan dan Putar kiri mengubah arah hadap 90 derajat tanpa berpindah petak.",
      "Berputar lalu maju membuat tokoh berbelok ke jalur baru.",
    ],
    challenge:
      "Buat tokoh berbelok melewati jalur memutar atau kembali menghadap bintang lalu mencapainya.",
    reflection:
      "Mengapa blok Putar harus diletakkan sebelum blok Maju saat ingin berbelok?",
    starter: ["start", "move", "right", "move"],
    color: "purple",
    story:
      "Kiki menemukan batu kristal di tengah jalan! Supaya bisa lewat dan tetap memantau arah, Kiki harus belajar berputar ke kiri dan ke kanan sebelum melangkah maju.",
    guideCharacter: "cat",
    concept: {
      title: "Arah Hadap dan Putaran",
      summary:
        "Putar kiri atau Putar kanan hanya memutar badan tokoh di tempat. Untuk berpindah ke petak baru setelah berputar, tambahkan blok Maju.",
      visualExample: ["start", "move", "right", "move", "left", "move"],
      visualCaption:
        "Maju dulu, putar arah hadapnya, lalu maju lagi mengikuti arah baru.",
    },
    missionSteps: [
      "Jalankan susunan awal untuk melihat ke mana tokoh menghadap setelah Putar kanan.",
      "Perhatikan penunjuk HADAP di bawah panggung (Kanan, Bawah, Kiri, atau Atas).",
      "Tambahkan kombinasi Putar kiri dan Maju agar tokoh kembali ke baris bintang.",
      "Teruskan langkahnya sampai menyentuh target di petak (5 : 4).",
    ],
    experiment:
      "Ganti blok Putar kanan menjadi Putar kiri. Ke arah mana tokoh melangkah sekarang?",
    challengeLevels: [
      {
        level: "Mudah",
        description: "Buat tokoh maju, berputar sekali, lalu maju ke petak baru.",
      },
      {
        level: "Hebat",
        description:
          "Buat rute zig-zag (berputar kanan lalu kiri) hingga akhirnya menyentuh bintang!",
      },
      {
        level: "Bintang",
        description:
          "Capai bintang lewat rute berbelok, lalu akhiri dengan ucapan seru dari Kiki!",
      },
    ],
    successCriteria: [
      {
        id: "1-2-turn",
        label: "Menggunakan blok Putar kiri atau Putar kanan",
        check: "has_turn",
      },
      {
        id: "1-2-blocks",
        label: "Menyusun minimal 4 blok perintah",
        check: "min_blocks_4",
      },
      {
        id: "1-2-star",
        label: "Berhasil membawa tokoh menyentuh target",
        check: "reach_star",
      },
    ],
    commonMistakes: [
      {
        mistake: "Tokoh hanya berputar di tempat tanpa berpindah petak.",
        hint: "Blok Putar hanya mengubah arah hadap. Tambahkan blok Maju 1 langkah setelah blok Putar.",
      },
      {
        mistake: "Tokoh malah berjalan menjauhi bintang ke bawah.",
        hint: "Saat menghadap Kanan, Putar kanan membuat tokoh menghadap Bawah. Gunakan Putar kiri untuk kembali menghadap Kanan!",
      },
    ],
    vocabulary: [
      {
        term: "Arah Hadap",
        definition: "Arah pandangan tokoh (Kanan, Bawah, Kiri, atau Atas).",
      },
      {
        term: "Rotasi (Putar)",
        definition: "Mengubah arah hadap sebesar 90 derajat ke kiri atau kanan.",
      },
      {
        term: "Koordinat Petak",
        definition: "Nomor kolom dan baris posisi tokoh di panggung.",
      },
    ],
    teacherNote:
      "Minta siswa berdiri sebentar dan mempraktikkan 'Putar kanan' (berputar di tempat) vs 'Maju 1 langkah'. Ini sangat membantu siswa membedakan rotasi dan translasi.",
    estimatedMinutes: 25,
    starterProjectId: "tpl-kiko-bintang",
  },
  {
    id: "1-3",
    month: 1,
    number: 3,
    title: "Cerita Bergerak",
    eyebrow: "Animasi dan pesan",
    intro:
      "Cerita animasi jadi hidup saat tokoh bisa menyapa dan memberi jeda. Ayo kirim pesan dari Planet Atala!",
    goal: "Kamu bisa menggabungkan blok Ucap, Tunggu sebentar, dan Maju menjadi adegan cerita yang mudah diikuti.",
    learn: [
      "Blok Ucap menampilkan balon kata di atas tokoh.",
      "Blok Tunggu sebentar memberi jeda agar penonton sempat membaca pesan.",
      "Menggabungkan gerak dan ucapan menciptakan cerita animasi.",
    ],
    challenge:
      "Buat tokoh menyapa penonton, menunggu sebentar, melangkah maju, lalu mengucapkan pesan kedua!",
    reflection:
      "Mengapa jeda (Tunggu sebentar) membuat cerita lebih enak ditonton?",
    starter: ["start", "say", "wait", "move"],
    color: "teal",
    story:
      "Dari puncak bukit Atala, Kiko ingin mengirim pesan persahabatan ke Bumi. Supaya teman-teman di Bumi bisa membaca pesannya dengan jelas, Kiko perlu mengatur kapan harus bicara, menunggu, dan bergerak.",
    guideCharacter: "bot",
    concept: {
      title: "Dialog dan Waktu Jeda (Timing)",
      summary:
        "Dalam animasi, jika semua aksi terjadi sekaligus, penonton akan bingung. Blok Ucap menampilkan teks, sedangkan Tunggu memberi waktu bernapas.",
      visualExample: ["start", "say", "wait", "move", "say"],
      visualCaption:
        "Sapa penonton → beri jeda → bergerak maju → sampaikan pesan berikutnya.",
    },
    missionSteps: [
      "Klik kotak teks di dalam blok Ucap lalu ketik sapaanmu sendiri.",
      "Pastikan ada blok Tunggu sebentar dari kategori Tampilan setelah ucapan pertama.",
      "Tambahkan blok Maju dan blok Ucap kedua di bagian akhir.",
      "Jalankan program dan baca balon ucapan yang muncul di panggung!",
    ],
    experiment:
      "Ubah isi teks pada blok Ucap menjadi nama panggilanmu atau salam khas kapten angkasa!",
    challengeLevels: [
      {
        level: "Mudah",
        description: "Ubah teks pada blok Ucap dan jalankan animasimu.",
      },
      {
        level: "Hebat",
        description:
          "Rangkai minimal 5 blok yang memuat Ucap, Tunggu, dan Maju.",
      },
      {
        level: "Bintang",
        description:
          "Buat cerita perjalanan sampai Kiko tiba di bintang sambil mengucapkan 2 kalimat berbeda!",
      },
    ],
    successCriteria: [
      {
        id: "1-3-say",
        label: "Menggunakan blok Ucap dengan pesan cerita",
        check: "has_say",
      },
      {
        id: "1-3-wait",
        label: "Memberi jeda dengan blok Tunggu sebentar",
        check: "has_wait",
      },
      {
        id: "1-3-blocks",
        label: "Menyusun minimal 4 blok dalam cerita",
        check: "min_blocks_4",
      },
    ],
    commonMistakes: [
      {
        mistake: "Pesan pertama langsung terganti terlalu cepat.",
        hint: "Sisipkan blok Tunggu sebentar di antara dua blok Ucap agar pesan pertama tampil lebih lama.",
      },
      {
        mistake: "Lupa mengetik pesan baru di dalam blok Ucap.",
        hint: "Klik kotak putih kecil di dalam blok ungu Ucap untuk mengganti tulisannya.",
      },
    ],
    vocabulary: [
      {
        term: "Animasi",
        definition: "Rangkaian gambar dan aksi berurutan yang tampak hidup.",
      },
      {
        term: "Dialog",
        definition: "Kata-kata atau kalimat yang diucapkan tokoh dalam cerita.",
      },
      {
        term: "Jeda (Wait)",
        definition: "Waktu tunggu sejenak sebelum program menjalankan blok berikutnya.",
      },
    ],
    teacherNote:
      "Dorong siswa menulis kalimat pendek yang sopan dan kreatif di blok Ucap. Ingatkan bahwa panjang pesan dibatasi 40 karakter agar balon kata tetap rapi.",
    estimatedMinutes: 25,
    starterProjectId: "tpl-pesan-atala",
  },
  {
    id: "1-4",
    month: 1,
    number: 4,
    title: "Koreografi Kecil",
    eyebrow: "Rangkaian aksi",
    intro:
      "Saatnya berpesta! Gabungkan langkah maju, putaran, dan ucapan menjadi tarian panggung yang seru.",
    goal: "Kamu bisa merangkai minimal empat aksi gerak, putar, dan ucapan menjadi satu pertunjukan koreografi.",
    learn: [
      "Tarian coding terdiri dari pola gerak dan putaran yang teratur.",
      "Kamu bisa mengurutkan ulang blok dengan menyeret pegangan titik-titik.",
      "Mengakhiri tarian dengan balon ucapan membuat pertunjukan makin meriah.",
    ],
    challenge:
      "Susun pertunjukan tarian Kiki dengan minimal 5 blok yang menggabungkan Maju, Putar, dan Ucap!",
    reflection:
      "Gerakan mana yang paling kamu suka dari koreografi buatanmu?",
    starter: ["start", "move", "left", "move", "say"],
    color: "orange",
    story:
      "Malam bulan purnama tiba di Taman Atala! Kiki ingin menampilkan tarian spesial untuk menyambut bintang jatuh. Ayo bantu Kiki menyusun gerakan tari yang kompak!",
    guideCharacter: "cat",
    concept: {
      title: "Merangkai Pola Aksi",
      summary:
        "Saat kamu menggabungkan beberapa blok gerak, putar, dan tampilan, kamu sedang merancang algoritma pertunjukan dari awal hingga penutup.",
      visualExample: ["start", "move", "left", "move", "right", "say"],
      visualCaption:
        "Kombinasi langkah dan putaran menciptakan koreografi yang dinamis di panggung.",
    },
    missionSteps: [
      "Pilih tokoh Kiki dan latar Taman (atau Angkasa sesuai kesukaanmu).",
      "Jalankan koreografi awal untuk melihat gerakan Kiki.",
      "Tambahkan blok Putar kanan, Maju, atau Tunggu agar tariannya lebih panjang.",
      "Tulis kalimat penutup di blok Ucap paling bawah, lalu jalankan pertunjukanmu!",
    ],
    experiment:
      "Tukar urutan blok ke-2 dan ke-3 dengan menyeretnya, lalu lihat bagaimana tarian Kiki berubah!",
    challengeLevels: [
      {
        level: "Mudah",
        description: "Jalankan tarian dengan minimal 5 blok perintah.",
      },
      {
        level: "Hebat",
        description:
          "Gunakan baik Putar kiri maupun Putar kanan beserta ucapan penutup.",
      },
      {
        level: "Bintang",
        description:
          "Buat Kiki menari memutar lalu mendarat tepat di bunga/bintang pada akhir lagu!",
      },
    ],
    successCriteria: [
      {
        id: "1-4-turn",
        label: "Memakai blok putaran dalam koreografi",
        check: "has_turn",
      },
      {
        id: "1-4-say",
        label: "Menampilkan ucapan panggung dengan blok Ucap",
        check: "has_say",
      },
      {
        id: "1-4-blocks",
        label: "Menyusun minimal 5 blok dalam jalur program",
        check: "min_blocks_5",
      },
    ],
    commonMistakes: [
      {
        mistake: "Tokoh menabrak tepi panggung saat menari.",
        hint: "Jika sudah di tepi atas atau kanan, tambahkan Putar kiri/kanan agar tokoh berbalik ke tengah panggung.",
      },
    ],
    vocabulary: [
      {
        term: "Koreografi",
        definition: "Susunan gerakan tari yang dirancang berurutan.",
      },
      {
        term: "Algoritma",
        definition: "Urutan langkah logis untuk menyelesaikan suatu tugas atau pertunjukan.",
      },
    ],
    teacherNote:
      "Pertemuan ini melatih keluwesan menyusun ulang (reorder) blok. Tunjukkan cara menyeret blok di jalur kanan atau memakai tombol panah naik/turun.",
    estimatedMinutes: 25,
    starterProjectId: "tpl-tarian-kiki",
  },
  {
    id: "1-p",
    month: 1,
    number: 5,
    title: "Proyek: Cerita Gerak",
    eyebrow: "Karya akhir bulan 1",
    intro:
      "Saatnya membuat karya kebanggaanmu! Rancang cerita pendek dengan pembuka, perjalanan menuju bintang/bunga, dan penutup.",
    goal: "Kamu bisa merancang, menjalankan, menyimpan, dan mengunduh karya cerita gerak mandiri buatanmu sendiri.",
    learn: [
      "Cerita yang baik punya pembuka (sapaan), isi (perjalanan), dan penutup.",
      "Pilih latar Angkasa atau Taman serta tokoh Kiko atau Kiki sesuai ceritamu.",
      "Simpan proyek dan unduh Karya HTML agar bisa dimainkan di mana saja tanpa internet.",
    ],
    challenge:
      "Buat cerita lengkap yang membawa tokoh ke target, beri judul karyamu, lalu tekan Simpan proyek!",
    reflection:
      "Jika temanmu menonton cerita ini, bagian mana yang paling ingin kamu tunjukkan?",
    starter: ["start", "say", "move", "right", "move", "say"],
    project: true,
    color: "blue",
    story:
      "Selamat! Kamu sudah menguasai urutan, arah, dan animasi di Bulan 1. Kini Kiko dan Kiki mengundangmu menjadi Sutradara Atala: buat cerita petualanganmu sendiri dan bagikan ke teman atau keluarga!",
    guideCharacter: "bot",
    concept: {
      title: "Struktur Cerita Interaktif: Awal → Aksi → Akhir",
      summary:
        "Proyek bulan ini menggabungkan semua yang sudah kamu pelajari: pemicu awal, dialog pembuka, perjalanan melintasi panggung, dan perayaan di akhir cerita.",
      visualExample: ["start", "say", "wait", "move", "move", "move", "say"],
      visualCaption:
        "Beri salam pembuka, gerakkan tokoh menuju target, lalu tutup dengan pesan gembira!",
    },
    missionSteps: [
      "Pilih latar (Angkasa/Taman) dan tokoh utama (Kiko/Kiki) di atas panggung.",
      "Susun blok pembuka dengan Ucap dan Tunggu sebentar.",
      "Rangkai langkah Maju dan Putar agar tokoh menjelajah hingga menyentuh target.",
      "Ketik judul karyamu di kotak Nama proyekmu, lalu tekan Simpan proyek dan Unduh karya HTML!",
    ],
    experiment:
      "Buka Galeri Proyek untuk melihat contoh 'Taman Bunga Kiki' atau 'Pesan dari Planet Atala' dan lakukan Remix!",
    challengeLevels: [
      {
        level: "Mudah",
        description:
          "Buat cerita minimal 5 blok dengan ucapan pembuka dan gerakan maju.",
      },
      {
        level: "Hebat",
        description:
          "Bawa tokoh sampai menyentuh target bintang/bunga dan simpan proyekmu dengan judul unik.",
      },
      {
        level: "Bintang",
        description:
          "Gunakan jeda Tunggu, putaran, capai target, simpan proyek, dan unduh file HTML mandirimu!",
      },
    ],
    successCriteria: [
      {
        id: "1-p-say",
        label: "Memiliki dialog cerita menggunakan blok Ucap",
        check: "has_say",
      },
      {
        id: "1-p-star",
        label: "Tokoh berhasil mencapai target di panggung",
        check: "reach_star",
      },
      {
        id: "1-p-save",
        label: "Menyimpan proyek dengan judul karya sendiri",
        check: "saved_project",
      },
    ],
    commonMistakes: [
      {
        mistake: "Lupa menekan Simpan proyek setelah selesai menyusun.",
        hint: "Ketik judul di bagian bawah Studio lalu klik tombol biru Simpan proyek agar karyamu masuk ke Proyek Saya.",
      },
    ],
    vocabulary: [
      {
        term: "Adegan (Scene)",
        definition: "Pengaturan latar tempat dan tokoh dalam panggung cerita.",
      },
      {
        term: "Ekspor HTML",
        definition: "Mengunduh karya menjadi satu file web mandiri yang bisa dibuka tanpa internet.",
      },
    ],
    teacherNote:
      "Berikan waktu 5 menit di akhir kelas bagi 2–3 siswa untuk memutar file HTML karya mereka di depan kelas dan menceritakan idenya.",
    estimatedMinutes: 35,
    starterProjectId: "tpl-taman-bunga-kiki",
  },
  {
    id: "2-1",
    month: 2,
    number: 1,
    title: "Tombol Ajaib",
    eyebrow: "Peristiwa (Events)",
    intro:
      "Dalam game, tokoh bergerak saat pemain menekan tombol! Ayo pasang pemicu Saat tombol aksi ditekan.",
    goal: "Kamu bisa memulai aksi gerakan dan pesan menggunakan peristiwa Saat tombol aksi ditekan.",
    learn: [
      "Blok Saat tombol aksi ditekan adalah pemicu interaktif untuk game.",
      "Program bertombol menunggu pemain menekan Tombol aksi di bawah panggung.",
      "Semua blok di bawah pemicu akan dijalankan saat tombol ditekan.",
    ],
    challenge:
      "Susun blok di bawah Saat tombol aksi ditekan, lalu tekan Tombol aksi di bawah panggung untuk menggerakkan tokoh!",
    reflection:
      "Apa bedanya program yang memakai Ketika mulai dengan yang memakai Saat tombol aksi ditekan?",
    starter: ["key", "move", "say"],
    color: "purple",
    story:
      "Festival Game Bintang dimulai! Kiko sedang merakit mesin arcade pertamanya. Agar pemain bisa mengendalikan Kiko, kita perlu menghubungkan program dengan Tombol Ajaib!",
    guideCharacter: "bot",
    concept: {
      title: "Peristiwa (Event) dalam Game",
      summary:
        "Jika animasi berjalan sendiri saat dimulai, maka game menunggu aksi dari pemain. Ketukan pada Tombol aksi adalah peristiwa yang membangunkan program.",
      visualExample: ["key", "move", "move", "say"],
      visualCaption:
        "Saat tombol aksi ditekan → Kiko langsung meluncur maju dan menyapa pemain!",
    },
    missionSteps: [
      "Lihat blok pertama di jalur program: Saat tombol aksi ditekan.",
      "Tambahkan dua blok Maju lagi agar tokoh bisa meluncur sampai ke bintang.",
      "Perhatikan bahwa tombol di bawah panggung menampilkan Tombol aksi berwarna merah muda.",
      "Tekan Tombol aksi dan lihat Kiko bergerak merespons perintahmu!",
    ],
    experiment:
      "Apa yang terjadi jika kamu menekan Tombol aksi berulang kali setelah program selesai berjalan?",
    challengeLevels: [
      {
        level: "Mudah",
        description:
          "Tekan Tombol aksi untuk menjalankan program dan lihat Kiko bergerak.",
      },
      {
        level: "Hebat",
        description:
          "Tambahkan langkah Maju pada pemicu tombol aksi hingga Kiko menyentuh bintang!",
      },
      {
        level: "Bintang",
        description:
          "Buat Kiko mencapai bintang dan meneriakkan pesan semangat saat Tombol aksi ditekan!",
      },
    ],
    successCriteria: [
      {
        id: "2-1-key",
        label: "Menggunakan pemicu Saat tombol aksi ditekan",
        check: "has_key",
      },
      {
        id: "2-1-blocks",
        label: "Menyusun minimal 3 blok di jalur program",
        check: "min_blocks_3",
      },
      {
        id: "2-1-star",
        label: "Mencapai target bintang dengan menekan Tombol aksi",
        check: "reach_star",
      },
    ],
    commonMistakes: [
      {
        mistake: "Menekan tombol Jalankan padahal program memakai pemicu tombol aksi.",
        hint: "Untuk blok Saat tombol aksi ditekan, gunakan tombol merah muda 'Tombol aksi' di bawah panggung!",
      },
    ],
    vocabulary: [
      {
        term: "Peristiwa (Event)",
        definition: "Kejadian seperti klik tombol yang memicu jalannya kode.",
      },
      {
        term: "Interaktif",
        definition: "Program yang merespons tindakan langsung dari pemain.",
      },
    ],
    teacherNote:
      "Jelaskan contoh event di dunia nyata: saat bel sekolah berbunyi (peristiwa), siswa masuk kelas (aksi); saat saklar ditekan (peristiwa), lampu menyala (aksi).",
    estimatedMinutes: 20,
    starterProjectId: "tpl-tangkap-bintang",
  },
  {
    id: "2-2",
    month: 2,
    number: 2,
    title: "Ulangi Lagi!",
    eyebrow: "Pengulangan (Loop)",
    intro:
      "Programmer cerdas tidak menaruh blok yang sama berulang-ulang. Pakai satu blok Ulangi untuk meluncur cepat!",
    goal: "Kamu bisa memakai blok Ulangi untuk menjalankan gerakan berulang kali dengan jumlah blok yang lebih hemat.",
    learn: [
      "Blok Ulangi menjalankan satu blok tepat di bawahnya berkali-kali.",
      "Kamu bisa mengatur angka pengulangan antara 2 sampai 12 kali.",
      "Dengan Ulangi 3× dan satu blok Maju, tokoh sudah melangkah 3 petak!",
    ],
    challenge:
      "Gunakan satu blok Ulangi (3×) dan satu blok Maju untuk membawa tokoh langsung ke bintang!",
    reflection:
      "Mengapa memakai 1 blok Ulangi + 1 blok Maju lebih rapi daripada memasang 3 blok Maju satu per satu?",
    starter: ["start", "repeat", "move"],
    color: "teal",
    story:
      "Kiko ingin menyalakan pendorong roketnya agar hemat energi! Daripada menulis perintah Maju berkali-kali, Kiko menemukan modul Pengulangan yang bisa menggandakan langkah secara otomatis.",
    guideCharacter: "bot",
    concept: {
      title: "Pengulangan (Loop)",
      summary:
        "Blok Ulangi menggandakan blok tepat di bawahnya sesuai angka yang kamu isi. Hasil gerakannya sama, tetapi programmu jauh lebih ringkas!",
      visualExample: ["start", "repeat", "move", "say"],
      visualCaption:
        "Ulangi 3× pada blok Maju akan membuat tokoh melangkah 3 kali berturut-turut.",
    },
    missionSteps: [
      "Perhatikan susunan blok: Ketika mulai → Ulangi 3× → Maju 1 langkah.",
      "Tekan Jalankan dan hitung berapa kali Kiko melangkah ke kanan.",
      "Coba ubah angka di dalam blok Ulangi menjadi 2 atau 4, lalu lihat perbedaannya.",
      "Kembalikan ke angka 3 agar Kiko berhenti tepat di bintang!",
    ],
    experiment:
      "Bagaimana kalau di bawah blok Ulangi kamu letakkan blok Putar kanan? Seperti apa gerakan Kiko?",
    challengeLevels: [
      {
        level: "Mudah",
        description:
          "Jalankan blok Ulangi 3× dengan Maju hingga Kiko mencapai bintang.",
      },
      {
        level: "Hebat",
        description:
          "Setelah Ulangi selesai dan mencapai bintang, tambahkan blok Ucap di bawahnya.",
      },
      {
        level: "Bintang",
        description:
          "Gunakan dua blok Ulangi dalam satu program untuk membuat gerak maju dan berputar!",
      },
    ],
    successCriteria: [
      {
        id: "2-2-repeat",
        label: "Menggunakan blok Ulangi di jalur program",
        check: "has_repeat",
      },
      {
        id: "2-2-star",
        label: "Mencapai target bintang menggunakan pengulangan",
        check: "reach_star",
      },
    ],
    commonMistakes: [
      {
        mistake: "Menaruh blok Ulangi di paling bawah tanpa blok aksi setelahnya.",
        hint: "Blok Ulangi selalu mengulang satu blok tepat di bawahnya. Pastikan ada blok Maju atau Putar tepat di bawah Ulangi!",
      },
    ],
    vocabulary: [
      {
        term: "Pengulangan (Loop)",
        definition: "Menjalankan perintah yang sama beberapa kali secara otomatis.",
      },
      {
        term: "Efisiensi Kode",
        definition: "Membuat program bekerja optimal dengan jumlah blok yang hemat dan rapi.",
      },
    ],
    teacherNote:
      "Tekankan aturan editor Atala Lab: blok Ulangi mengulang tepat satu blok yang berada langsung di bawahnya. Ini membuat konsep loop sangat konkret bagi siswa kelas 4.",
    estimatedMinutes: 25,
    starterProjectId: "tpl-roket-berulang",
  },
  {
    id: "2-3",
    month: 2,
    number: 3,
    title: "Pilih Jalan",
    eyebrow: "Kondisi (If)",
    intro:
      "Game pintar bisa memeriksa keadaan! Dengan blok Jika sentuh bintang, aksi hanya terjadi kalau syaratnya terpenuhi.",
    goal: "Kamu bisa memakai blok kondisi Jika sentuh bintang agar tokoh hanya bereaksi saat benar-benar berada di petak bintang.",
    learn: [
      "Blok Jika sentuh bintang mengecek apakah posisi tokoh sudah sama dengan posisi bintang.",
      "Jika sudah menyentuh bintang, satu blok tepat di bawahnya akan dijalankan.",
      "Jika belum menyentuh bintang, blok di bawahnya akan dilewati.",
    ],
    challenge:
      "Gerakkan tokoh sampai ke bintang dulu, baru periksa dengan Jika sentuh bintang untuk menampilkan ucapan selamat!",
    reflection:
      "Mengapa ucapan pada susunan awal tidak muncul ketika tokoh baru maju 1 langkah?",
    starter: ["start", "move", "ifStar", "say"],
    color: "orange",
    story:
      "Di Festival Game Bintang, Kiki menjaga gerbang hadiah! Sensor gerbang hanya boleh membunyikan pesan kemenangan JIKA pemain benar-benar sudah menyentuh bintang.",
    guideCharacter: "cat",
    concept: {
      title: "Kondisi Percabangan (Jika / If)",
      summary:
        "Komputer memeriksa syarat pada saat blok Jika dijalankan. Kalau syaratnya BENAR (tokoh di bintang), aksi di bawahnya aktif. Kalau SALAH, aksi itu dilewati.",
      visualExample: ["start", "repeat", "move", "ifStar", "say"],
      visualCaption:
        "Maju 3 kali dulu sampai bintang, baru blok Jika sentuh bintang mengaktifkan blok Ucap!",
    },
    missionSteps: [
      "Jalankan susunan awal dan baca pesan umpan balik: mengapa blok Jika belum aktif?",
      "Tambahkan dua blok Maju (atau gunakan blok Ulangi 3× sebelum Maju) supaya tokoh sampai di petak (5 : 4).",
      "Pastikan blok Jika sentuh bintang berada sebelum blok Ucap.",
      "Jalankan lagi dan lihat balon kata muncul saat bintang tersentuh!",
    ],
    experiment:
      "Coba pindahkan blok Jika sentuh bintang ke paling atas sebelum blok Maju. Apakah pesannya muncul?",
    challengeLevels: [
      {
        level: "Mudah",
        description:
          "Tambahkan blok Maju sehingga tokoh sampai ke bintang dan blok Jika mengaktifkan Ucap.",
      },
      {
        level: "Hebat",
        description:
          "Gabungkan Ulangi 3× + Maju dengan Jika sentuh bintang + Ucap agar blokmu lebih ringkas!",
      },
      {
        level: "Bintang",
        description:
          "Tambahkan juga penambahan skor ketika kondisi bintang terpenuhi!",
      },
    ],
    successCriteria: [
      {
        id: "2-3-if",
        label: "Memasang blok kondisi Jika sentuh bintang",
        check: "has_if_star",
      },
      {
        id: "2-3-star",
        label: "Tokoh mencapai bintang sehingga kondisi bernilai benar",
        check: "reach_star",
      },
      {
        id: "2-3-say",
        label: "Menjalankan aksi reaksi di bawah blok kondisi",
        check: "has_say",
      },
    ],
    commonMistakes: [
      {
        mistake: "Blok Jika diletakkan sebelum tokoh sampai di petak bintang.",
        hint: "Kondisi dicek saat gilirannya tiba. Pastikan tokoh sudah melangkah 3 petak ke kanan sebelum blok Jika dijalankan.",
      },
    ],
    vocabulary: [
      {
        term: "Kondisi (If)",
        definition: "Pengecekan syarat untuk menentukan apakah suatu aksi dijalankan atau dilewati.",
      },
      {
        term: "Sensor Target",
        definition: "Pengecekan apakah posisi tokoh berada tepat di petak bintang/bunga.",
      },
    ],
    teacherNote:
      "Biarkan siswa menjalankan starter code terlebih dahulu (yang sengaja hanya maju 1 langkah). Umpan balik spesifik di Studio akan menjelaskan bahwa blok Jika belum aktif karena tokoh belum sampai di target.",
    estimatedMinutes: 25,
    starterProjectId: "tpl-roket-berulang",
  },
  {
    id: "2-4",
    month: 2,
    number: 4,
    title: "Skor Seru",
    eyebrow: "Angka dalam game",
    intro:
      "Apa jadinya game tanpa papan skor? Ayo gunakan blok Tambah skor +1 setiap kali bintang berhasil diraih!",
    goal: "Kamu bisa menggabungkan gerak, kondisi Jika sentuh bintang, dan Tambah skor +1 untuk membuat aturan poin game.",
    learn: [
      "Skor permainan dimulai dari angka 0.",
      "Blok Tambah skor +1 menaikkan nilai skor sebanyak 1 poin.",
      "Meletakkan Tambah skor setelah Jika sentuh bintang membuat poin hanya bertambah saat menang.",
    ],
    challenge:
      "Buat tokoh mencapai bintang, lalu naikkan skor menjadi 1 menggunakan Jika sentuh bintang dan Tambah skor +1!",
    reflection:
      "Mengapa dalam game yang adil, blok Tambah skor sebaiknya dijaga oleh kondisi Jika sentuh bintang?",
    starter: ["start", "move", "ifStar", "score"],
    color: "pink",
    story:
      "Papan skor raksasa di Festival Game Bintang sudah menyala! Kiko ingin memastikan poin pemain hanya bertambah kalau mereka benar-benar berhasil menangkap bintang.",
    guideCharacter: "bot",
    concept: {
      title: "Variabel Skor dan Aturan Poin",
      summary:
        "Skor adalah tempat menyimpan angka yang bisa berubah saat game berjalan. Dengan menggabungkan Jika sentuh bintang + Tambah skor +1, kamu menciptakan aturan game yang adil.",
      visualExample: ["start", "repeat", "move", "ifStar", "score"],
      visualCaption:
        "Melangkah ke bintang → cek kondisi → tambahkan 1 poin ke papan skor!",
    },
    missionSteps: [
      "Jalankan susunan awal dan perhatikan angka SKOR di bawah panggung masih 0.",
      "Tambahkan langkah Maju (atau Ulangi 3× + Maju) agar tokoh tiba di bintang.",
      "Pastikan urutan akhirnya adalah Jika sentuh bintang diikuti langsung oleh Tambah skor +1.",
      "Jalankan program dan pastikan angka SKOR berubah menjadi 1!",
    ],
    experiment:
      "Tambahkan blok Ucap “Skor bertambah!” setelah blok Tambah skor +1 untuk merayakan poinmu!",
    challengeLevels: [
      {
        level: "Mudah",
        description:
          "Buat tokoh mencapai bintang dan menambah skor menjadi 1.",
      },
      {
        level: "Hebat",
        description:
          "Gunakan pemicu Saat tombol aksi ditekan dan Ulangi 3× untuk meraih skor.",
      },
      {
        level: "Bintang",
        description:
          "Rangkai game lengkap: tombol aksi, pengulangan gerak, kondisi bintang, tambah skor, dan pesan kemenangan!",
      },
    ],
    successCriteria: [
      {
        id: "2-4-if",
        label: "Memakai kondisi Jika sentuh bintang",
        check: "has_if_star",
      },
      {
        id: "2-4-score",
        label: "Memakai blok hijau Tambah skor +1",
        check: "has_score",
      },
      {
        id: "2-4-star",
        label: "Menjalankan program hingga bintang tertangkap dan skor naik",
        check: "reach_star",
      },
    ],
    commonMistakes: [
      {
        mistake: "Skor bertambah padahal tokoh belum menyentuh bintang.",
        hint: "Jika blok Tambah skor tidak ditaruh tepat di bawah Jika sentuh bintang, skor akan langsung bertambah tanpa syarat.",
      },
    ],
    vocabulary: [
      {
        term: "Skor (Variabel)",
        definition: "Nilai angka yang disimpan dan dapat bertambah selama permainan.",
      },
      {
        term: "Aturan Game",
        definition: "Gabungan kondisi dan aksi yang menentukan cara menang atau mendapat poin.",
      },
    ],
    teacherNote:
      "Diskusikan dengan siswa tentang kejujuran aturan dalam game: apa jadinya kalau baru mulai jalan skornya langsung 100 tanpa menyentuh bintang?",
    estimatedMinutes: 25,
    starterProjectId: "tpl-tangkap-bintang",
  },
  {
    id: "2-p",
    month: 2,
    number: 5,
    title: "Proyek: Tangkap Bintang",
    eyebrow: "Karya akhir bulan 2",
    intro:
      "Saatnya meluncurkan game buatanmu di Festival Game Bintang! Gabungkan tombol aksi, pengulangan, kondisi, dan skor.",
    goal: "Kamu bisa merakit, memainkan, menyimpan, dan membagikan game Tangkap Bintang yang utuh.",
    learn: [
      "Mulai game dengan pemicu Saat tombol aksi ditekan.",
      "Gunakan Ulangi dan gerakan untuk membawa tokoh menuju target.",
      "Pasang Jika sentuh bintang + Tambah skor +1 lalu simpan dan unduh file HTML game-mu.",
    ],
    challenge:
      "Rakit game Tangkap Bintang yang lengkap, uji dengan menekan Tombol aksi, lalu simpan proyekmu!",
    reflection:
      "Jika kamu membuat versi ke-2 dari game ini, tantangan apa yang ingin kamu tambahkan?",
    starter: ["key", "repeat", "move", "ifStar", "score", "say"],
    project: true,
    color: "purple",
    story:
      "Puncak Festival Game Bintang telah tiba! Seluruh penghuni Planet Atala berkumpul untuk mencoba game buatanmu. Ayo rakit game Tangkap Bintang terbaikmu bersama Kiko dan Kiki, lalu unduh sebagai karya HTML mandiri!",
    guideCharacter: "cat",
    concept: {
      title: "Arsitektur Game Sederhana",
      summary:
        "Sebuah game utuh menggabungkan 4 pilar yang sudah kamu kuasai: Peristiwa (Input Pemain) → Pengulangan Gerak → Pengecekan Kondisi → Skor & Umpan Balik.",
      visualExample: ["key", "repeat", "move", "ifStar", "score", "say"],
      visualCaption:
        "Tekan Tombol aksi → meluncur 3× → sentuh bintang → tambah skor +1 → tampilkan pesan menang!",
    },
    missionSteps: [
      "Pilih latar panggung (Angkasa/Taman) dan tokoh jagoanmu (Kiko/Kiki).",
      "Periksa rangkaian blok: pemicu tombol aksi, pengulangan gerak, kondisi bintang, skor, dan ucapan.",
      "Tekan Tombol aksi di bawah panggung untuk menguji apakah game-mu memberi skor saat bintang disentuh.",
      "Beri judul game yang keren, klik Simpan proyek, lalu klik Unduh karya HTML untuk dimainkan bersama teman!",
    ],
    experiment:
      "Coba tambahkan tarian selebrasi (Putar kiri → Putar kanan) setelah skor bertambah!",
    challengeLevels: [
      {
        level: "Mudah",
        description:
          "Jalankan game Tangkap Bintang dengan Tombol aksi hingga mendapat skor 1.",
      },
      {
        level: "Hebat",
        description:
          "Kustomisasi pesan kemenangan dan adegan, lalu simpan ke Proyek Saya.",
      },
      {
        level: "Bintang",
        description:
          "Tambahkan koreografi selebrasi setelah menangkap bintang, simpan, dan unduh file HTML mandiri!",
      },
    ],
    successCriteria: [
      {
        id: "2-p-key",
        label: "Memakai pemicu interaktif Saat tombol aksi ditekan",
        check: "has_key",
      },
      {
        id: "2-p-score",
        label: "Memakai kondisi Jika sentuh bintang dan Tambah skor +1",
        check: "has_score",
      },
      {
        id: "2-p-star",
        label: "Menguji game hingga bintang tertangkap",
        check: "reach_star",
      },
      {
        id: "2-p-save",
        label: "Menyimpan game ke Proyek Saya",
        check: "saved_project",
      },
    ],
    commonMistakes: [
      {
        mistake: "Lupa menguji game dengan Tombol aksi sebelum menyimpan.",
        hint: "Selalu tekan Tombol aksi minimal satu kali untuk memastikan tokoh sampai di target dan skor bertambah.",
      },
    ],
    vocabulary: [
      {
        term: "Game Loop & Event",
        definition: "Alur permainan dari pemain menekan tombol hingga skor diperbarui di layar.",
      },
      {
        term: "Playtesting (Uji Main)",
        definition: "Mencoba memainkan game buatan sendiri untuk memastikan semua aturan berjalan benar.",
      },
    ],
    teacherNote:
      "Ajak siswa saling bertukar pengalaman menguji game temannya. Tanyakan bagaimana perasaan mereka setelah berhasil merakit game yang berjalan mandiri tanpa internet.",
    estimatedMinutes: 35,
    starterProjectId: "tpl-tangkap-bintang",
  },
];

export const getLesson = (id: string) => lessons.find((l) => l.id === id);

export const blockLabels: Record<BlockKind, string> = {
  start: "Ketika mulai",
  key: "Saat tombol aksi ditekan",
  move: "Maju 1 langkah",
  left: "Putar kiri",
  right: "Putar kanan",
  say: "Ucap “Halo!”",
  wait: "Tunggu sebentar",
  repeat: "Ulangi 3× blok berikut",
  ifStar: "Jika sentuh bintang",
  score: "Tambah skor +1",
};

export function isValidLessonSchema(lesson: unknown): lesson is Lesson {
  if (!lesson || typeof lesson !== "object") return false;
  const l = lesson as Record<string, unknown>;
  return (
    typeof l.id === "string" &&
    typeof l.month === "number" &&
    typeof l.number === "number" &&
    typeof l.title === "string" &&
    l.title.length > 0 &&
    typeof l.eyebrow === "string" &&
    typeof l.intro === "string" &&
    typeof l.goal === "string" &&
    Array.isArray(l.learn) &&
    l.learn.length >= 3 &&
    typeof l.challenge === "string" &&
    typeof l.reflection === "string" &&
    Array.isArray(l.starter) &&
    l.starter.length >= 2 &&
    typeof l.story === "string" &&
    l.story.length >= 20 &&
    (l.guideCharacter === "bot" || l.guideCharacter === "cat") &&
    typeof l.concept === "object" &&
    l.concept !== null &&
    Array.isArray(l.missionSteps) &&
    l.missionSteps.length >= 3 &&
    typeof l.experiment === "string" &&
    Array.isArray(l.challengeLevels) &&
    l.challengeLevels.length === 3 &&
    Array.isArray(l.successCriteria) &&
    l.successCriteria.length >= 2 &&
    Array.isArray(l.commonMistakes) &&
    l.commonMistakes.length >= 1 &&
    Array.isArray(l.vocabulary) &&
    l.vocabulary.length >= 1 &&
    l.vocabulary.length <= 3 &&
    typeof l.teacherNote === "string" &&
    l.teacherNote.length >= 20 &&
    typeof l.estimatedMinutes === "number" &&
    l.estimatedMinutes > 0
  );
}

export function evaluateCriterion(
  check: SuccessCheckKind,
  context: {
    blocks: Block[];
    hasRun: boolean;
    starCaught: boolean;
    saved: boolean;
  },
): boolean {
  const { blocks, hasRun, starCaught, saved } = context;
  switch (check) {
    case "has_start":
      return blocks.some((b) => b.kind === "start");
    case "has_key":
      return blocks.some((b) => b.kind === "key");
    case "min_blocks_3":
      return blocks.length >= 3;
    case "min_blocks_4":
      return blocks.length >= 4;
    case "min_blocks_5":
      return blocks.length >= 5;
    case "reach_star":
      return hasRun && starCaught;
    case "has_turn":
      return blocks.some((b) => b.kind === "left" || b.kind === "right");
    case "has_say":
      return blocks.some((b) => b.kind === "say");
    case "has_wait":
      return blocks.some((b) => b.kind === "wait");
    case "has_repeat":
      return blocks.some((b) => b.kind === "repeat");
    case "has_if_star":
      return blocks.some((b) => b.kind === "ifStar");
    case "has_score":
      return blocks.some((b) => b.kind === "score");
    case "saved_project":
      return saved;
    default:
      return false;
  }
}
