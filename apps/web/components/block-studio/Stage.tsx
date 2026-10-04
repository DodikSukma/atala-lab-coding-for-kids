import { Bot, Cat, Play, RotateCcw, Square } from "lucide-react";
import type { Frame } from "@/lib/runtime";
export type Scene = { backdrop: "space" | "garden"; sprite: "bot" | "cat" };
export default function Stage({
  frame,
  scene,
  onScene,
  onRun,
  onStop,
  onReset,
  playing,
  hasStart,
  hasKey,
  message,
}: {
  frame: Frame;
  scene: Scene;
  onScene: (scene: Scene) => void;
  onRun: (trigger: "start" | "key") => void;
  onStop: () => void;
  onReset: () => void;
  playing: boolean;
  hasStart: boolean;
  hasKey: boolean;
  message: string;
}) {
  return (
    <div className="studio-pane studio-stage">
      <div className="pane-head">
        <span className="pane-step">02</span>
        <div>
          <h3>Panggung</h3>
          <p>Tekan jalankan dan lihat idemu hidup.</p>
        </div>
      </div>
      <div className="scene-picker">
        <div className="scene-picker-group">
          <span>LATAR</span>
          <button
            className={scene.backdrop === "space" ? "active" : ""}
            onClick={() => onScene({ ...scene, backdrop: "space" })}
          >
            Angkasa
          </button>
          <button
            className={scene.backdrop === "garden" ? "active" : ""}
            onClick={() => onScene({ ...scene, backdrop: "garden" })}
          >
            Taman
          </button>
        </div>
        <div className="scene-picker-group">
          <span>TOKOH</span>
          <button
            className={scene.sprite === "bot" ? "active" : ""}
            onClick={() => onScene({ ...scene, sprite: "bot" })}
          >
            <Bot size={14} /> Kiko
          </button>
          <button
            className={scene.sprite === "cat" ? "active" : ""}
            onClick={() => onScene({ ...scene, sprite: "cat" })}
          >
            <Cat size={14} /> Kiki
          </button>
        </div>
      </div>
      <div
        className={`stage stage-${scene.backdrop}`}
        aria-label={`Kanvas: ${scene.sprite === "bot" ? "Kiko" : "Kiki"} di ${frame.x}, ${frame.y}; skor ${frame.score}`}
      >
        <div className="stage-grid" />
        <div className="stage-decoration" aria-hidden="true">
          {scene.backdrop === "space" ? (
            <>
              <i className="planet" />
              <i className="moon" />
            </>
          ) : (
            <>
              <i className="hill" />
              <i className="sun" />
            </>
          )}
        </div>
        <div
          className={`star-target ${frame.starCaught ? "caught" : ""}`}
          style={{ left: `${(4.5 / 6) * 100}%`, top: `${(3.5 / 6) * 100}%` }}
          aria-hidden="true"
        >
          {scene.backdrop === "space" ? "★" : "✿"}
        </div>
        <div
          className={`sprite sprite-${scene.sprite}`}
          style={{
            left: `${((frame.x + 0.5) / 6) * 100}%`,
            top: `${((frame.y + 0.5) / 6) * 100}%`,
            transform: `translate(-50%,-50%) rotate(${frame.direction * 90}deg)`,
          }}
          aria-hidden="true"
        >
          <span className="sprite-eye" />
          {scene.sprite === "cat" && <span className="cat-ear" />}
        </div>
        {frame.message && <div className="speech">{frame.message}</div>}
      </div>
      <div className="stage-status">
        <div>
          <span>SKOR</span>
          <strong>{frame.score}</strong>
        </div>
        <span className="stage-position">
          POSISI {frame.x + 1} : {frame.y + 1}
        </span>
      </div>
      <div className="run-actions">
        <button
          className="button primary"
          onClick={() => onRun("start")}
          disabled={playing || !hasStart}
        >
          <Play size={16} fill="currentColor" /> Jalankan
        </button>
        {hasKey && (
          <button
            className="button action-button"
            onClick={() => onRun("key")}
            disabled={playing}
          >
            Tombol aksi
          </button>
        )}
        {playing ? (
          <button className="button outline" onClick={onStop}>
            <Square size={16} /> Hentikan
          </button>
        ) : (
          <button className="button outline" onClick={onReset}>
            <RotateCcw size={16} /> Reset
          </button>
        )}
      </div>
      <p className="feedback" role="status">
        {message}
      </p>
    </div>
  );
}
