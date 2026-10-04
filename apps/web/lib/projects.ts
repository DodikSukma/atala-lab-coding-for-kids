import type { Block } from "./curriculum";
import type { Scene } from "@/components/block-studio/Stage";
export type Project = {
  id: string;
  title: string;
  lessonId: string;
  blocks: Block[];
  scene?: Scene;
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
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    v.title.length <= 80 &&
    typeof v.lessonId === "string" &&
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
export async function importProject(file: File): Promise<Project> {
  if (file.size > 65536) throw new Error("File terlalu besar. Maksimal 64 KB.");
  const data = JSON.parse(await file.text());
  if (
    data.format !== "atala-lab-project" ||
    data.version !== 1 ||
    !isProject(data.project)
  )
    throw new Error("Ini bukan file proyek Atala Lab yang valid.");
  return {
    ...data.project,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };
}
