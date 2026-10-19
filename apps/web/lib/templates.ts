import type { Block, BlockKind } from "./curriculum";
import type { Scene } from "@/components/block-studio/Stage";
import { isProject, readProjects, saveProject, type Project } from "./projects";

export type TemplateDifficulty = "Mudah" | "Menengah" | "Menantang";
export type TemplateCategory =
  | "Urutan & Gerak"
  | "Cerita & Animasi"
  | "Pengulangan"
  | "Game & Skor";

export type ProjectTemplate = {
  id: string;
  title: string;
  description: string;
  difficulty: TemplateDifficulty;
  category: TemplateCategory;
  concepts: string[];
  mainBlocks: BlockKind[];
  lessonId: string;
  scene: Scene;
  blocks: Block[];
  remixGoal: string;
  accentColor: "blue" | "purple" | "teal" | "amber" | "green" | "coral";
};

export const projectTemplates: ProjectTemplate[] = [
  {
    id: "tpl-kiko-bintang",
    title: "Kiko Menuju Bintang",
    description:
      "Kiko melangkah tiga petak berurutan melintasi angkasa untuk meraih Bintang Energi pertamanya.",
    difficulty: "Mudah",
    category: "Urutan & Gerak",
    concepts: ["Urutan perintah", "Gerak lurus"],
    mainBlocks: ["start", "move", "say"],
    lessonId: "1-1",
    scene: { backdrop: "space", sprite: "bot" },
    blocks: [
      { id: "tpl-1-b1", kind: "start" },
      { id: "tpl-1-b2", kind: "move" },
      { id: "tpl-1-b3", kind: "move" },
      { id: "tpl-1-b4", kind: "move" },
      { id: "tpl-1-b5", kind: "say", value: "Bintang tercapai!" },
    ],
    remixGoal:
      "Ubah rute Kiko dengan menambahkan blok Putar dan buat Kiko mengucapkan namamu!",
    accentColor: "blue",
  },
  {
    id: "tpl-tarian-kiki",
    title: "Tarian Kiki",
    description:
      "Koreografi ceria Kiki di Taman Atala yang memadukan langkah, putaran kiri-kanan, jeda, dan sapaan.",
    difficulty: "Mudah",
    category: "Cerita & Animasi",
    concepts: ["Arah & putaran", "Jeda waktu", "Koreografi"],
    mainBlocks: ["start", "say", "wait", "move", "left", "right"],
    lessonId: "1-4",
    scene: { backdrop: "garden", sprite: "cat" },
    blocks: [
      { id: "tpl-2-b1", kind: "start" },
      { id: "tpl-2-b2", kind: "say", value: "Ayo menari!" },
      { id: "tpl-2-b3", kind: "wait" },
      { id: "tpl-2-b4", kind: "move" },
      { id: "tpl-2-b5", kind: "left" },
      { id: "tpl-2-b6", kind: "right" },
      { id: "tpl-2-b7", kind: "move" },
      { id: "tpl-2-b8", kind: "move" },
      { id: "tpl-2-b9", kind: "say", value: "Tarian selesai!" },
    ],
    remixGoal:
      "Tambahkan gerakan putaran ekstra atau gunakan blok Ulangi agar tarian Kiki makin seru!",
    accentColor: "coral",
  },
  {
    id: "tpl-pesan-atala",
    title: "Pesan dari Planet Atala",
    description:
      "Cerita animasi Kiko mengirim sinyal persahabatan sambil berjalan menuju menara bintang.",
    difficulty: "Mudah",
    category: "Cerita & Animasi",
    concepts: ["Dialog berurutan", "Animasi cerita", "Jeda"],
    mainBlocks: ["start", "say", "wait", "move"],
    lessonId: "1-3",
    scene: { backdrop: "space", sprite: "bot" },
    blocks: [
      { id: "tpl-3-b1", kind: "start" },
      { id: "tpl-3-b2", kind: "say", value: "Halo Bumi! Ini Kiko." },
      { id: "tpl-3-b3", kind: "wait" },
      { id: "tpl-3-b4", kind: "move" },
      { id: "tpl-3-b5", kind: "move" },
      { id: "tpl-3-b6", kind: "say", value: "Bintang sudah dekat!" },
      { id: "tpl-3-b7", kind: "wait" },
      { id: "tpl-3-b8", kind: "move" },
      { id: "tpl-3-b9", kind: "say", value: "Sinyal Atala aktif!" },
    ],
    remixGoal:
      "Ganti dialog Kiko dengan cerita petualangan angkasa versimu sendiri!",
    accentColor: "teal",
  },
  {
    id: "tpl-roket-berulang",
    title: "Roket Berulang",
    description:
      "Hemat blok dengan menyalakan pendorong Ulangi 3× agar Kiko meluncur cepat ke bintang.",
    difficulty: "Menengah",
    category: "Pengulangan",
    concepts: ["Pengulangan (Loop)", "Kondisi bintang"],
    mainBlocks: ["start", "repeat", "move", "ifStar", "say"],
    lessonId: "2-2",
    scene: { backdrop: "space", sprite: "bot" },
    blocks: [
      { id: "tpl-4-b1", kind: "start" },
      { id: "tpl-4-b2", kind: "repeat", value: 3 },
      { id: "tpl-4-b3", kind: "move" },
      { id: "tpl-4-b4", kind: "ifStar" },
      { id: "tpl-4-b5", kind: "say", value: "Roket hemat blok!" },
    ],
    remixGoal:
      "Tambahkan blok Tambah skor +1 saat bintang tersentuh dan coba ubah jumlah pengulangannya!",
    accentColor: "amber",
  },
  {
    id: "tpl-tangkap-bintang",
    title: "Tangkap Bintang",
    description:
      "Game interaktif dengan Tombol aksi: luncurkan Kiko ke bintang, periksa kondisi, dan raih skor kemenangan!",
    difficulty: "Menengah",
    category: "Game & Skor",
    concepts: ["Peristiwa tombol aksi", "Pengulangan", "Kondisi", "Skor"],
    mainBlocks: ["key", "repeat", "move", "ifStar", "score", "say"],
    lessonId: "2-p",
    scene: { backdrop: "space", sprite: "bot" },
    blocks: [
      { id: "tpl-5-b1", kind: "key" },
      { id: "tpl-5-b2", kind: "repeat", value: 3 },
      { id: "tpl-5-b3", kind: "move" },
      { id: "tpl-5-b4", kind: "ifStar" },
      { id: "tpl-5-b5", kind: "score" },
      { id: "tpl-5-b6", kind: "say", value: "Skor +1! Hebat!" },
    ],
    remixGoal:
      "Ganti tokoh menjadi Kiki atau tambahkan gerakan selebrasi setelah skor bertambah!",
    accentColor: "purple",
  },
  {
    id: "tpl-taman-bunga-kiki",
    title: "Taman Bunga Kiki",
    description:
      "Petualangan Kiki di Taman Atala memetik bunga berkilau, mengumpulkan poin, dan berputar gembira.",
    difficulty: "Menantang",
    category: "Game & Skor",
    concepts: ["Tema Taman", "Pengulangan", "Kondisi & Skor", "Koreografi"],
    mainBlocks: ["start", "say", "repeat", "move", "ifStar", "score", "right"],
    lessonId: "1-p",
    scene: { backdrop: "garden", sprite: "cat" },
    blocks: [
      { id: "tpl-6-b1", kind: "start" },
      { id: "tpl-6-b2", kind: "say", value: "Mencari bunga Atala!" },
      { id: "tpl-6-b3", kind: "repeat", value: 3 },
      { id: "tpl-6-b4", kind: "move" },
      { id: "tpl-6-b5", kind: "ifStar" },
      { id: "tpl-6-b6", kind: "score" },
      { id: "tpl-6-b7", kind: "ifStar" },
      { id: "tpl-6-b8", kind: "say", value: "Bunga mekar! +1" },
      { id: "tpl-6-b9", kind: "right" },
    ],
    remixGoal:
      "Ubah pemicunya menjadi Saat tombol aksi ditekan agar menjadi game Taman Bunga interaktif!",
    accentColor: "green",
  },
];

export function getProjectTemplate(id: string): ProjectTemplate | undefined {
  return projectTemplates.find((t) => t.id === id);
}

export function templateToProject(template: ProjectTemplate): Project {
  return {
    id: template.id,
    title: template.title,
    lessonId: template.lessonId,
    scene: { ...template.scene },
    blocks: template.blocks.map((b) => ({ ...b })),
    updatedAt: "2026-10-01T00:00:00.000Z",
  };
}

export function isValidProjectTemplate(tpl: unknown): tpl is ProjectTemplate {
  if (!tpl || typeof tpl !== "object") return false;
  const t = tpl as ProjectTemplate;
  if (
    typeof t.id !== "string" ||
    !t.id.startsWith("tpl-") ||
    typeof t.title !== "string" ||
    typeof t.description !== "string" ||
    !["Mudah", "Menengah", "Menantang"].includes(t.difficulty) ||
    typeof t.remixGoal !== "string" ||
    !t.remixGoal.length
  ) {
    return false;
  }
  return isProject(templateToProject(t));
}

export function createRemixFromTemplate(
  templateId: string,
  existingProjects: Project[] = readProjects(),
): Project {
  const template = getProjectTemplate(templateId);
  if (!template) {
    throw new Error("Template proyek tidak ditemukan.");
  }
  const baseTitle = `Remix: ${template.title}`.slice(0, 72);
  let candidateTitle = baseTitle;
  let counter = 2;
  const existingTitles = new Set(existingProjects.map((p) => p.title));
  while (existingTitles.has(candidateTitle)) {
    candidateTitle = `${baseTitle} (${counter})`.slice(0, 80);
    counter++;
  }
  return {
    id: crypto.randomUUID(),
    title: candidateTitle,
    lessonId: template.lessonId,
    scene: { ...template.scene },
    blocks: template.blocks.map((b) => ({
      ...b,
      id: crypto.randomUUID(),
    })),
    remixedFromId: template.id,
    updatedAt: new Date().toISOString(),
  };
}

export function remixAndSaveTemplate(templateId: string): Project {
  const remixed = createRemixFromTemplate(templateId, readProjects());
  saveProject(remixed);
  return remixed;
}
