import { useState } from "react";
import {
  Bot,
  Cat,
  Compass,
  Footprints,
  Play,
  RotateCcw,
  Sparkles,
  Square,
} from "lucide-react";
import type { Block } from "@/lib/curriculum";
import { blockLabels } from "@/lib/curriculum";
import type { Frame } from "@/lib/runtime";
import {
  CHARACTER_META,
  deriveCharacterState,
  deriveDirectionLabel,
  type CharacterVisualState,
} from "@/lib/characterState";
import CharacterSprite from "./CharacterSprite";

export type Scene = { backdrop: "space" | "garden"; sprite: "bot" | "cat" };

export default function Stage({
  frame,
  prevFrame,
  trail = [],
  blocks = [],
  scene,
  onScene,
  onRun,
  onStop,
  onReset,
  playing,
  hasStart,
  hasKey,
  hasError = false,
  message,
  feedbackTone = "info",
}: {
  frame: Frame;
  prevFrame?: Frame | null;
  trail?: Array<{ x: number; y: number }>;
  blocks?: Block[];
  scene: Scene;
  onScene: (scene: Scene) => void;
  onRun: (trigger: "start" | "key") => void;
  onStop: () => void;
  onReset: () => void;
  playing: boolean;
  hasStart: boolean;
  hasKey: boolean;
  hasError?: boolean;
  message: string;
  feedbackTone?: "info" | "success" | "warning" | "error";
}) {
  const [showTrail, setShowTrail] = useState(true);

  const charState: CharacterVisualState = deriveCharacterState({
    currentFrame: frame,
    prevFrame,
    playing,
    hasError,
    blocks,
  });

  const activeBlock = frame.active
    ? blocks.find((b) => b.id === frame.active)
    : undefined;
  const activeBlockIndex = frame.active
    ? blocks.findIndex((b) => b.id === frame.active)
    : -1;

  const charMeta = CHARACTER_META[scene.sprite];
  const directionLabel = deriveDirectionLabel(frame.direction);

  // Position speech bubble so it never covers target at (4,3) or goes off-screen
  const speechAbove = frame.y >= 2;
  const speechLeft = Math.max(12, Math.min(72, ((frame.x + 0.5) / 6) * 100));
  const speechTop = speechAbove
    ? Math.max(10, ((frame.y + 0.5) / 6) * 100 - 22)
    : Math.min(82, ((frame.y + 0.5) / 6) * 100 + 18);

  return (
    <div className="studio-pane studio-stage">
      <div className="pane-head">
        <span className="pane-step">02</span>
        <div>
          <h3>Panggung Atala</h3>
          <p>Lihat {charMeta.name} beraksi mengikuti susunan blokmu.</p>
        </div>
        <button
          type="button"
          className={`trail-toggle ${showTrail ? "active" : ""}`}
          aria-pressed={showTrail}
          title="Tampilkan atau sembunyikan jejak langkah"
          onClick={() => setShowTrail((v) => !v)}
        >
          <Footprints size={14} aria-hidden="true" />
          <span>Jejak</span>
        </button>
      </div>

      <div className="scene-picker">
        <div className="scene-picker-group" role="group" aria-label="Pilih latar panggung">
          <span>LATAR</span>
          <button
            type="button"
            aria-pressed={scene.backdrop === "space"}
            className={scene.backdrop === "space" ? "active" : ""}
            onClick={() => onScene({ ...scene, backdrop: "space" })}
          >
            Angkasa
          </button>
          <button
            type="button"
            aria-pressed={scene.backdrop === "garden"}
            className={scene.backdrop === "garden" ? "active" : ""}
            onClick={() => onScene({ ...scene, backdrop: "garden" })}
          >
            Taman
          </button>
        </div>
        <div className="scene-picker-group" role="group" aria-label="Pilih tokoh penjelajah">
          <span>TOKOH</span>
          <button
            type="button"
            aria-pressed={scene.sprite === "bot"}
            className={scene.sprite === "bot" ? "active" : ""}
            onClick={() => onScene({ ...scene, sprite: "bot" })}
          >
            <Bot size={14} aria-hidden="true" /> Kiko
          </button>
          <button
            type="button"
            aria-pressed={scene.sprite === "cat"}
            className={scene.sprite === "cat" ? "active" : ""}
            onClick={() => onScene({ ...scene, sprite: "cat" })}
          >
            <Cat size={14} aria-hidden="true" /> Kiki
          </button>
        </div>
      </div>

      <div
        className={`stage stage-${scene.backdrop} state-${charState} ${frame.starCaught ? "stage-success" : ""}`}
        role="region"
        aria-label={`Kanvas panggung ${scene.backdrop === "space" ? "Angkasa" : "Taman"}: ${charMeta.name} (${charState}) di petak ${frame.x + 1}, ${frame.y + 1} menghadap ${directionLabel}; skor ${frame.score}`}
      >
        <div className="stage-grid" aria-hidden="true" />

        {/* Layered Environment SVG */}
        <div className="stage-decoration" aria-hidden="true">
          {scene.backdrop === "space" ? (
            <>
              <i className="planet" />
              <i className="planet-ring" />
              <i className="moon" />
              <i className="nebula-glow" />
            </>
          ) : (
            <>
              <i className="sun" />
              <i className="cloud cloud-a" />
              <i className="cloud cloud-b" />
              <i className="hill hill-back" />
              <i className="hill" />
            </>
          )}
        </div>

        {/* Optional Step Trail */}
        {showTrail && trail.length > 1 && (
          <svg
            className="stage-trail-svg"
            viewBox="0 0 600 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              points={trail
                .map((p) => `${(p.x + 0.5) * 100},${(p.y + 0.5) * 100}`)
                .join(" ")}
              fill="none"
              stroke={scene.backdrop === "space" ? "#38bdf8" : "#15803d"}
              strokeWidth="8"
              strokeDasharray="14 10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
            {trail.map((p, idx) => (
              <circle
                key={`${p.x}-${p.y}-${idx}`}
                cx={(p.x + 0.5) * 100}
                cy={(p.y + 0.5) * 100}
                r={idx === 0 ? "10" : "7"}
                fill={scene.backdrop === "space" ? "#facc15" : "#ffffff"}
                stroke={scene.backdrop === "space" ? "#1e3a8a" : "#15803d"}
                strokeWidth="3"
                opacity="0.85"
              />
            ))}
          </svg>
        )}

        {/* Target Star / Flower at (4, 3) */}
        <div
          className={`star-target ${frame.starCaught ? "caught" : ""}`}
          style={{ left: `${(4.5 / 6) * 100}%`, top: `${(3.5 / 6) * 100}%` }}
          aria-hidden="true"
        >
          <span className="target-halo" />
          <span className="target-glyph">
            {scene.backdrop === "space" ? "★" : "✿"}
          </span>
          {frame.starCaught && (
            <span className="target-burst">
              <i />
              <i />
              <i />
              <i />
            </span>
          )}
        </div>

        {/* Original Vector Character Kiko / Kiki */}
        <div
          className={`sprite sprite-${scene.sprite} sprite-state-${charState}`}
          data-character={scene.sprite}
          data-state={charState}
          style={{
            left: `${((frame.x + 0.5) / 6) * 100}%`,
            top: `${((frame.y + 0.5) / 6) * 100}%`,
            transform: `translate(-50%,-50%) rotate(${frame.direction * 90}deg)`,
          }}
          aria-hidden="true"
        >
          <CharacterSprite
            character={scene.sprite}
            state={charState}
            size={62}
          />
        </div>

        {/* Speech Bubble */}
        {frame.message && (
          <div
            className={`speech ${speechAbove ? "speech-above" : "speech-below"}`}
            style={{ left: `${speechLeft}%`, top: `${speechTop}%` }}
          >
            <span className="speech-speaker">{charMeta.name}:</span>{" "}
            {frame.message}
          </div>
        )}

        {/* Active Block Sync Badge on Stage */}
        {activeBlock && (
          <div className="stage-active-block" aria-live="off">
            <Sparkles size={13} aria-hidden="true" />
            <span>
              Blok #{String(activeBlockIndex + 1).padStart(2, "0")}:{" "}
              {blockLabels[activeBlock.kind]}
            </span>
          </div>
        )}
      </div>

      <div className="stage-status">
        <div className="stage-score-box">
          <span>SKOR</span>
          <strong>{frame.score}</strong>
        </div>
        <div className="stage-telemetry">
          <span className="stage-direction" title="Arah hadap tokoh">
            <Compass size={13} aria-hidden="true" />
            HADAP {directionLabel.toUpperCase()}
          </span>
          <span className="stage-position">
            PETAK {frame.x + 1} : {frame.y + 1}
          </span>
        </div>
      </div>

      <div className="run-actions">
        <button
          type="button"
          className="button primary"
          onClick={() => onRun("start")}
          disabled={playing || !hasStart}
        >
          <Play size={16} fill="currentColor" aria-hidden="true" /> Jalankan
        </button>
        {hasKey && (
          <button
            type="button"
            className="button action-button"
            onClick={() => onRun("key")}
            disabled={playing}
          >
            Tombol aksi
          </button>
        )}
        {playing ? (
          <button type="button" className="button outline" onClick={onStop}>
            <Square size={16} aria-hidden="true" /> Hentikan
          </button>
        ) : (
          <button type="button" className="button outline" onClick={onReset}>
            <RotateCcw size={16} aria-hidden="true" /> Reset
          </button>
        )}
      </div>

      <div
        className={`feedback feedback-box feedback-${feedbackTone}`}
        role="status"
        aria-live="polite"
      >
        <span className="feedback-char-tag">{charMeta.name}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
