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
};
export const months = [
  {
    number: 1,
    title: "Petualangan Blok",
    description: "Mulai dari gerak, arah, dan cerita animasi.",
    color: "blue",
    icon: "rocket",
  },
  {
    number: 2,
    title: "Pembuat Game",
    description: "Kenali tombol, pengulangan, kondisi, dan skor.",
    color: "purple",
    icon: "game",
  },
  {
    number: 3,
    title: "Dari Blok ke Kode",
    description: "Mulai menulis perintah sendiri.",
    color: "teal",
    icon: "code",
  },
  {
    number: 4,
    title: "Jago Dokumen",
    description: "Berkarya dengan Word.",
    color: "orange",
    icon: "file",
  },
  {
    number: 5,
    title: "Data & Presentasi",
    description: "Coba Excel dan PowerPoint.",
    color: "pink",
    icon: "chart",
  },
  {
    number: 6,
    title: "AI yang Bijak",
    description: "Bertanya, memeriksa, dan berkarya.",
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
      "Komputer mengikuti perintah dari atas ke bawah. Ayo beri tokoh langkah pertama!",
    goal: "Menyusun perintah mulai dan maju secara berurutan.",
    learn: [
      "Blok adalah perintah kecil.",
      "Urutan blok menentukan apa yang terjadi.",
      "Tekan Jalankan untuk melihat hasilnya.",
    ],
    challenge:
      "Bawa si penjelajah ke arah bintang dengan setidaknya dua blok gerak.",
    reflection: "Apa yang berubah saat urutan dua blok ditukar?",
    starter: ["start", "move", "move"],
    color: "blue",
  },
  {
    id: "1-2",
    month: 1,
    number: 2,
    title: "Jalan ke Bintang",
    eyebrow: "Arah dan langkah",
    intro: "Tokoh kita bisa maju dan berputar. Pilih jalan menuju bintang!",
    goal: "Menggunakan maju dan putar untuk mengubah arah.",
    learn: [
      "Maju mengikuti arah hadap tokoh.",
      "Putar kanan dan kiri mengubah arah.",
      "Coba jalankan beberapa susunan.",
    ],
    challenge: "Buat tokoh bergerak ke kanan lalu ke atas.",
    reflection: "Mengapa putar perlu diletakkan sebelum maju?",
    starter: ["start", "move", "right", "move"],
    color: "purple",
  },
  {
    id: "1-3",
    month: 1,
    number: 3,
    title: "Cerita Bergerak",
    eyebrow: "Animasi dan pesan",
    intro:
      "Cerita seru punya gerak dan suara. Blok Ucap akan menampilkan pesan!",
    goal: "Menggabungkan gerak, ucapan, dan jeda.",
    learn: [
      "Ucap menampilkan balon kata.",
      "Tunggu memberi jeda sebelum aksi berikutnya.",
      "Satu cerita bisa punya banyak adegan.",
    ],
    challenge: "Buat tokoh bergerak lalu berkata “Halo!”",
    reflection: "Kapan jeda membuat cerita lebih mudah diikuti?",
    starter: ["start", "say", "wait", "move"],
    color: "teal",
  },
  {
    id: "1-4",
    month: 1,
    number: 4,
    title: "Koreografi Kecil",
    eyebrow: "Rangkaian aksi",
    intro: "Sekarang gabungkan gerak dan ucapan menjadi tarian kecil!",
    goal: "Menyusun paling sedikit empat aksi dalam satu urutan.",
    learn: [
      "Beri awal yang jelas.",
      "Campur gerak dan putaran.",
      "Akhiri dengan pesan untuk penonton.",
    ],
    challenge: "Susun empat blok aksi lalu jalankan pertunjukanmu.",
    reflection: "Bagian mana yang ingin kamu ubah agar lebih menarik?",
    starter: ["start", "move", "left", "move", "say"],
    color: "orange",
  },
  {
    id: "1-p",
    month: 1,
    number: 5,
    title: "Proyek: Cerita Gerak",
    eyebrow: "Karya akhir bulan 1",
    intro: "Buat cerita pendek milikmu: awal, perjalanan, dan akhir.",
    goal: "Menyimpan cerita gerak yang bisa dimainkan ulang.",
    learn: [
      "Rencanakan awal cerita.",
      "Buat tokoh melakukan beberapa aksi.",
      "Simpan dan unduh hasilmu.",
    ],
    challenge:
      "Buat cerita dengan gerak, putar, dan ucapan. Beri judul saat menyimpan.",
    reflection: "Apa judul paling cocok untuk cerita buatanmu?",
    starter: ["start", "say", "move", "right", "move", "say"],
    project: true,
    color: "blue",
  },
  {
    id: "2-1",
    month: 2,
    number: 1,
    title: "Tombol Ajaib",
    eyebrow: "Peristiwa",
    intro:
      "Game bergerak saat ada pemicu. Tekan Tombol aksi untuk memulai gerakan!",
    goal: "Memahami aksi dimulai oleh sebuah peristiwa.",
    learn: [
      "Blok tombol aksi menandai awal program.",
      "Tekan Tombol aksi untuk memicu peristiwanya.",
      "Letakkan aksi setelah pemicu.",
    ],
    challenge: "Tekan Tombol aksi dan lihat gerak serta pesan yang muncul.",
    reflection: "Apa yang terjadi bila kita belum menekan Tombol aksi?",
    starter: ["key", "move", "say"],
    color: "purple",
  },
  {
    id: "2-2",
    month: 2,
    number: 2,
    title: "Ulangi Lagi!",
    eyebrow: "Pengulangan",
    intro: "Tidak perlu menaruh blok yang sama berkali-kali. Pakai Ulangi!",
    goal: "Memakai pengulangan untuk aksi berulang.",
    learn: [
      "Ulangi menjalankan aksi berikutnya beberapa kali.",
      "Atur jumlah antara 2 dan 12.",
      "Perhatikan gerak tokoh di kanvas.",
    ],
    challenge: "Buat tokoh maju tiga kali dengan satu blok Ulangi.",
    reflection: "Apa manfaat Ulangi dibanding tiga blok Maju?",
    starter: ["start", "repeat", "move"],
    color: "teal",
  },
  {
    id: "2-3",
    month: 2,
    number: 3,
    title: "Pilih Jalan",
    eyebrow: "Kondisi",
    intro:
      "Game bisa memilih aksi. Jika menyentuh bintang, tokoh akan bereaksi.",
    goal: "Mengenal kondisi jika dan hasilnya.",
    learn: [
      "Kondisi dicek saat blok dijalankan.",
      "Jika tokoh dekat bintang, aksi berikutnya dilakukan.",
      "Jika belum dekat, aksi berikutnya dilewati.",
    ],
    challenge:
      "Susun gerak hingga bintang lalu tampilkan pesan dengan Jika Sentuh Bintang.",
    reflection: "Mengapa pesan tidak muncul saat tokoh masih jauh?",
    starter: ["start", "move", "ifStar", "say"],
    color: "orange",
  },
  {
    id: "2-4",
    month: 2,
    number: 4,
    title: "Skor Seru",
    eyebrow: "Angka dalam game",
    intro: "Setiap bintang yang tertangkap bisa menambah skor!",
    goal: "Menggunakan blok tambah skor dalam permainan.",
    learn: [
      "Skor dimulai dari nol.",
      "Tambah Skor menaikkan angka satu.",
      "Gabungkan dengan kondisi untuk aturan game.",
    ],
    challenge: "Buat skor bertambah saat tokoh mendekati bintang.",
    reflection: "Aturan apa yang membuat game terasa adil?",
    starter: ["start", "move", "ifStar", "score"],
    color: "pink",
  },
  {
    id: "2-p",
    month: 2,
    number: 5,
    title: "Proyek: Tangkap Bintang",
    eyebrow: "Karya akhir bulan 2",
    intro: "Bangun game kecil dengan gerak, aturan, dan skor.",
    goal: "Menyimpan game yang dapat dimainkan ulang.",
    learn: [
      "Mulai dengan pemicu.",
      "Buat jalur menuju bintang.",
      "Tambah skor saat bintang tertangkap.",
    ],
    challenge: "Susun game dengan gerak, kondisi, dan skor. Simpan lalu unduh.",
    reflection: "Apa yang akan kamu tambah pada game berikutnya?",
    starter: ["key", "repeat", "move", "ifStar", "score", "say"],
    project: true,
    color: "purple",
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
