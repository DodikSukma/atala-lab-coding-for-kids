import type { Block, BlockKind } from "./curriculum";
export function insertBlock(
  blocks: Block[],
  kind: BlockKind,
  index: number,
  id: string,
): Block[] {
  if (blocks.length >= 80) return blocks;
  const next = [...blocks];
  next.splice(Math.max(0, Math.min(next.length, index)), 0, { id, kind });
  return next;
}
export function reorderBlock(
  blocks: Block[],
  sourceId: string,
  index: number,
): Block[] {
  const from = blocks.findIndex((b) => b.id === sourceId);
  if (from < 0) return blocks;
  const next = [...blocks];
  const [block] = next.splice(from, 1);
  const target = index > from ? index - 1 : index;
  next.splice(Math.max(0, Math.min(next.length, target)), 0, block);
  return next;
}
export type DragSource =
  { type: "palette"; kind: BlockKind } | { type: "workspace"; id: string };
export function dropIndexAtPoint(x: number, y: number): number | null {
  const element = document
    .elementFromPoint(x, y)
    ?.closest("[data-drop-index],[data-row-index],[data-workspace]");
  if (!element) return null;
  if (element.hasAttribute("data-drop-index"))
    return Number(element.getAttribute("data-drop-index"));
  if (element.hasAttribute("data-row-index")) {
    const i = Number(element.getAttribute("data-row-index"));
    const rect = element.getBoundingClientRect();
    return y < rect.top + rect.height / 2 ? i : i + 1;
  }
  return Number(element.getAttribute("data-block-count"));
}
