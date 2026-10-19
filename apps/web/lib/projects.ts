import type { Block } from "./curriculum";
import type { Scene } from "@/components/block-studio/Stage";

export type Project = {
  id: string;
  title: string;
  lessonId: string;
  blocks: Block[];
  scene?: Scene;
  remixedFromId?: string;
  updatedAt: string;
};

const KEY = "atala-lab-projects-v1";

export function readProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter(isProject) : [];
  } catch {
    return [];
  }
}

export function isProject(p: unknown): p is Project {
  if (!p || typeof p !== "object") return false;
  const v = p as Record<string, unknown>;
  const validScene =
    v.scene === undefined ||
    (Boolean(v.scene) &&
      typeof v.scene === "object" &&
      ["space", "garden"].includes(String((v.scene as Scene).backdrop)) &&
      ["bot", "cat"].includes(String((v.scene as Scene).sprite)));
  return (
    typeof v.id === "string" &&
    v.id.length > 0 &&
    typeof v.title === "string" &&
    v.title.length <= 80 &&
    typeof v.lessonId === "string" &&
    validScene &&
    Array.isArray(v.blocks) &&
    v.blocks.length <= 80 &&
    v.blocks.every(
      (b: unknown) =>
        !!b &&
        typeof b === "object" &&
        typeof (b as Block).id === "string" &&
        [
          "start",
          "key",
          "move",
          "left",
          "right",
          "say",
          "wait",
          "repeat",
          "ifStar",
          "score",
        ].includes((b as Block).kind),
    )
  );
}

export function saveProject(p: Project) {
  const all = readProjects().filter((x) => x.id !== p.id);
  localStorage.setItem(KEY, JSON.stringify([p, ...all]));
}

export function deleteProject(id: string) {
  localStorage.setItem(
    KEY,
    JSON.stringify(readProjects().filter((x) => x.id !== id)),
  );
}

export function renameProject(id: string, newTitle: string): Project | null {
  const trimmed = newTitle.trim().slice(0, 80);
  if (!trimmed) return null;
  const all = readProjects();
  const target = all.find((p) => p.id === id);
  if (!target) return null;
  const updated: Project = {
    ...target,
    title: trimmed,
    updatedAt: new Date().toISOString(),
  };
  const next = [updated, ...all.filter((p) => p.id !== id)];
  localStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

export function duplicateProject(
  source: Project,
  existingProjects: Project[] = readProjects(),
): Project {
  const baseTitle = `Remix: ${source.title}`.slice(0, 72);
  let candidateTitle = baseTitle;
  let counter = 2;
  const existingTitles = new Set(existingProjects.map((p) => p.title));
  while (existingTitles.has(candidateTitle)) {
    candidateTitle = `${baseTitle} (${counter})`.slice(0, 80);
    counter++;
  }
  const copy: Project = {
    id: crypto.randomUUID(),
    title: candidateTitle,
    lessonId: source.lessonId,
    scene: source.scene
      ? { ...source.scene }
      : { backdrop: "space", sprite: "bot" },
    blocks: source.blocks.map((b) => ({
      ...b,
      id: crypto.randomUUID(),
    })),
    remixedFromId: source.id,
    updatedAt: new Date().toISOString(),
  };
  return copy;
}

export function downloadProject(p: Project) {
  const payload = { format: "atala-lab-project", version: 1, project: p };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `atala-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "proyek"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportedProjectJson(rawText: string): Project {
  if (rawText.length > 65536) {
    throw new Error("File terlalu besar. Maksimal 64 KB.");
  }
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("Format JSON tidak valid.");
  }
  if (
    !data ||
    typeof data !== "object" ||
    data.format !== "atala-lab-project" ||
    data.version !== 1 ||
    !isProject(data.project)
  ) {
    throw new Error("Ini bukan file proyek Atala Lab yang valid.");
  }
  return {
    ...data.project,
    id: crypto.randomUUID(),
    blocks: data.project.blocks.map((b) => ({
      ...b,
      id: crypto.randomUUID(),
    })),
    updatedAt: new Date().toISOString(),
  };
}

export async function importProject(file: File): Promise<Project> {
  if (file.size > 65536) throw new Error("File terlalu besar. Maksimal 64 KB.");
  const text = await file.text();
  return parseImportedProjectJson(text);
}
