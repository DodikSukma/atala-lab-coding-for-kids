import type { Block } from "./curriculum";
import type { Frame } from "./runtime";
import { CHARACTER_META, deriveDirectionLabel, type CharacterId } from "./characterState";

export type FeedbackAnalysis = {
  message: string;
  tone: "info" | "success" | "warning" | "error";
  moveSteps: number;
  turnCount: number;
  usedRepeat: boolean;
  hasIfStar: boolean;
  ifStarTriggered: boolean;
  starCaught: boolean;
  finalScore: number;
};

export function analyzeProgramRun(params: {
  blocks: Block[];
  frames: Frame[];
  trigger: "start" | "key";
  error?: string | null;
  sprite: CharacterId;
}): FeedbackAnalysis {
  const { blocks, frames, trigger, error, sprite } = params;
  const spriteName = CHARACTER_META[sprite].name;

  if (error) {
    return {
      message: `${spriteName} sedang berpikir: ${error}`,
      tone: "error",
      moveSteps: 0,
      turnCount: 0,
      usedRepeat: false,
      hasIfStar: false,
      ifStarTriggered: false,
      starCaught: false,
      finalScore: 0,
    };
  }

  const startIndex = blocks.findIndex((b) => b.kind === trigger);
  const activeSegment: Block[] = [];
  if (startIndex >= 0) {
    for (let i = startIndex + 1; i < blocks.length; i++) {
      if (blocks[i].kind === "start" || blocks[i].kind === "key") break;
      activeSegment.push(blocks[i]);
    }
  }

  // Count executed move & turn actions deterministically from the executed frame active block IDs
  const blockById = new Map(blocks.map((b) => [b.id, b]));
  let moveSteps = 0;
  let turnCount = 0;
  for (let i = 1; i < frames.length; i++) {
    const activeBlock = blockById.get(frames[i].active);
    if (activeBlock?.kind === "move") moveSteps++;
    if (activeBlock?.kind === "left" || activeBlock?.kind === "right") turnCount++;
  }

  const usedRepeat = activeSegment.some((b) => b.kind === "repeat");
  const hasIfStar = activeSegment.some((b) => b.kind === "ifStar");
  const lastFrame = frames.at(-1) || {
    x: 1,
    y: 3,
    direction: 0,
    message: "",
    score: 0,
    active: "",
    starCaught: false,
  };
  const everCaughtStar = frames.some((f) => f.starCaught);
  const ifStarTriggered = hasIfStar && everCaughtStar;
  const finalScore = lastFrame.score;

  if (everCaughtStar) {
    if (usedRepeat) {
      return {
        message: `Hebat! Kamu memakai pengulangan untuk menghemat blok dan membawa ${spriteName} meraih target!${finalScore > 0 ? ` Skor akhir: ${finalScore}.` : ""}`,
        tone: "success",
        moveSteps,
        turnCount,
        usedRepeat,
        hasIfStar,
        ifStarTriggered,
        starCaught: true,
        finalScore,
      };
    }
    return {
      message: `Hebat! ${spriteName} bergerak ${moveSteps} langkah dan berhasil menyentuh target!${finalScore > 0 ? ` Skor bertambah menjadi ${finalScore}.` : ""}`,
      tone: "success",
      moveSteps,
      turnCount,
      usedRepeat,
      hasIfStar,
      ifStarTriggered,
      starCaught: true,
      finalScore,
    };
  }

  if (hasIfStar && !everCaughtStar) {
    const remainingRight = Math.max(0, 4 - lastFrame.x);
    const hint =
      lastFrame.y === 3 && remainingRight > 0
        ? `Coba tambahkan ${remainingRight} blok Maju sebelum blok Jika.`
        : "Pastikan tokoh tiba di petak target (5 : 4) sebelum blok Jika dijalankan.";
    return {
      message: `Blok Jika belum aktif karena ${spriteName} belum menyentuh target (berhenti di posisi ${lastFrame.x + 1} : ${lastFrame.y + 1}). ${hint}`,
      tone: "warning",
      moveSteps,
      turnCount,
      usedRepeat,
      hasIfStar,
      ifStarTriggered: false,
      starCaught: false,
      finalScore,
    };
  }

  if (moveSteps > 0) {
    if (lastFrame.y === 3 && lastFrame.x < 4) {
      const needed = 4 - lastFrame.x;
      return {
        message: `${spriteName} bergerak ${moveSteps} langkah ke kanan. Target belum tercapai — coba tambahkan ${needed} blok Maju lagi!`,
        tone: "info",
        moveSteps,
        turnCount,
        usedRepeat,
        hasIfStar,
        ifStarTriggered,
        starCaught: false,
        finalScore,
      };
    }
    return {
      message: `${spriteName} bergerak ${moveSteps} langkah ke posisi (${lastFrame.x + 1} : ${lastFrame.y + 1}) menghadap ${deriveDirectionLabel(lastFrame.direction)}. Target di (5 : 4) belum tercapai, ayo sesuaikan arah atau langkahmu!`,
      tone: "info",
      moveSteps,
      turnCount,
      usedRepeat,
      hasIfStar,
      ifStarTriggered,
      starCaught: false,
      finalScore,
    };
  }

  if (lastFrame.message || turnCount > 0) {
    return {
      message: `${spriteName} ${lastFrame.message ? `mengucapkan “${lastFrame.message}”` : "berputar"} di posisi (${lastFrame.x + 1} : ${lastFrame.y + 1}). Tambahkan blok Maju untuk mulai melangkah menuju target!`,
      tone: "info",
      moveSteps,
      turnCount,
      usedRepeat,
      hasIfStar,
      ifStarTriggered,
      starCaught: false,
      finalScore,
    };
  }

  return {
    message: `Program dijalankan, tetapi ${spriteName} belum memiliki blok aksi setelah pemicu. Tambahkan blok Maju atau Ucap!`,
    tone: "warning",
    moveSteps,
    turnCount,
    usedRepeat,
    hasIfStar,
    ifStarTriggered,
    starCaught: false,
    finalScore,
  };
}

export function generateLearningFeedback(params: {
  blocks: Block[];
  frames: Frame[];
  trigger: "start" | "key";
  error?: string | null;
  sprite: CharacterId;
}): string {
  return analyzeProgramRun(params).message;
}
