import type { Block, BlockKind } from "./curriculum";
import type { Frame } from "./runtime";

export type CharacterVisualState =
  | "idle"
  | "move"
  | "turn"
  | "talk"
  | "success"
  | "error";

export type CharacterId = "bot" | "cat";

export const CHARACTER_META: Record<
  CharacterId,
  { name: "Kiko" | "Kiki"; role: string; tagline: string }
> = {
  bot: {
    name: "Kiko",
    role: "Robot Penjelajah Atala",
    tagline: "Suka menghitung langkah presisi dan menyalakan bintang!",
  },
  cat: {
    name: "Kiki",
    role: "Kucing Penjelajah Atala",
    tagline: "Gesit berputar, ramah menyapa, dan suka bertualang di taman!",
  },
};

export function deriveDirectionLabel(direction: number): string {
  const normalized = ((direction % 4) + 4) % 4;
  switch (normalized) {
    case 0:
      return "Kanan →";
    case 1:
      return "Bawah ↓";
    case 2:
      return "Kiri ←";
    case 3:
      return "Atas ↑";
    default:
      return "Kanan →";
  }
}

export function deriveCharacterState(params: {
  currentFrame: Frame;
  prevFrame?: Frame | null;
  playing?: boolean;
  hasError?: boolean;
  blocks?: Block[];
}): CharacterVisualState {
  const { currentFrame, prevFrame, playing = false, hasError = false, blocks = [] } = params;

  if (hasError) {
    return "error";
  }

  if (currentFrame.starCaught) {
    return "success";
  }

  const activeBlock = currentFrame.active
    ? blocks.find((b) => b.id === currentFrame.active)
    : undefined;
  const activeKind: BlockKind | undefined = activeBlock?.kind;

  if (activeKind === "say" || (Boolean(currentFrame.message) && playing && (!prevFrame || currentFrame.message !== prevFrame.message))) {
    return "talk";
  }

  if (activeKind === "left" || activeKind === "right") {
    return "turn";
  }

  if (prevFrame && currentFrame.direction !== prevFrame.direction) {
    return "turn";
  }

  if (activeKind === "move") {
    return "move";
  }

  if (prevFrame && (currentFrame.x !== prevFrame.x || currentFrame.y !== prevFrame.y)) {
    return "move";
  }

  if (Boolean(currentFrame.message)) {
    return "talk";
  }

  return "idle";
}
