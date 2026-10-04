import type { Block } from "./curriculum";
export type Frame = {
  x: number;
  y: number;
  direction: number;
  message: string;
  score: number;
  active: string;
  starCaught: boolean;
};
const origin: Frame = {
  x: 1,
  y: 3,
  direction: 0,
  message: "",
  score: 0,
  active: "",
  starCaught: false,
};
export function runBlocks(
  blocks: Block[],
  trigger: "start" | "key" = "start",
): Frame[] {
  const frames: Frame[] = [{ ...origin }];
  let state = { ...origin };
  let steps = 0;
  if (blocks.length > 80) throw new Error("Terlalu banyak blok (maksimal 80).");
  if (blocks.length && !blocks.some((b) => b.kind === trigger))
    throw new Error(
      trigger === "key"
        ? "Tambahkan blok “Saat tombol aksi ditekan” dahulu."
        : "Tambahkan blok “Ketika mulai” dahulu.",
    );
  const start = blocks.findIndex((b) => b.kind === trigger);
  const action = (block: Block) => {
    steps++;
    if (steps > 500)
      throw new Error("Program terlalu panjang. Kurangi pengulangan.");
    switch (block.kind) {
      case "move": {
        const dirs = [
          [1, 0],
          [0, 1],
          [-1, 0],
          [0, -1],
        ];
        const [dx, dy] = dirs[state.direction];
        state.x = Math.max(0, Math.min(5, state.x + dx));
        state.y = Math.max(0, Math.min(5, state.y + dy));
        break;
      }
      case "left":
        state.direction = (state.direction + 3) % 4;
        break;
      case "right":
        state.direction = (state.direction + 1) % 4;
        break;
      case "say":
        state.message = String(block.value || "Halo, teman!").slice(0, 40);
        break;
      case "wait":
        break;
      case "score":
        state.score = Math.min(999, state.score + 1);
        break;
    }
    state.starCaught = state.x === 4 && state.y === 3;
    state = { ...state, active: block.id };
    frames.push(state);
  };
  for (let i = start + 1; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.kind === "start" || block.kind === "key") break;
    if (block.kind === "repeat") {
      const next = blocks[i + 1];
      if (next) {
        const count = Math.max(2, Math.min(12, Number(block.value) || 3));
        for (let n = 0; n < count; n++) action(next);
        i++;
      }
      continue;
    }
    if (block.kind === "ifStar") {
      const next = blocks[i + 1];
      if (next) {
        if (state.x === 4 && state.y === 3) action(next);
        i++;
      }
      continue;
    }
    action(block);
  }
  return frames;
}
