"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { Download, FileCode2, Save } from "lucide-react";
import type { Block, BlockKind, Lesson } from "@/lib/curriculum";
import { blockLabels } from "@/lib/curriculum";
import { runBlocks, type Frame } from "@/lib/runtime";
import {
  downloadProject,
  readProjects,
  saveProject,
  type Project,
} from "@/lib/projects";
import { syncAvailable, syncProject } from "@/lib/sync";
import { downloadStandaloneHtml } from "@/lib/standaloneHtml";
import {
  dropIndexAtPoint,
  insertBlock,
  reorderBlock,
  type DragSource,
} from "@/lib/blockDnD";
import BlockPalette from "./block-studio/BlockPalette";
import BlockWorkspace from "./block-studio/BlockWorkspace";
import DragGhost from "./block-studio/DragGhost";
import Stage, { type Scene } from "./block-studio/Stage";
import "./block-studio/studio.css";
const initial: Frame = {
  x: 1,
  y: 3,
  direction: 0,
  message: "",
  score: 0,
  active: "",
  starCaught: false,
};
const defaultScene: Scene = { backdrop: "space", sprite: "bot" };
type DragState = { source: DragSource; kind: BlockKind; x: number; y: number };
export default function Editor({ lesson }: { lesson: Lesson }) {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    lesson.starter.map((kind) => ({ id: crypto.randomUUID(), kind })),
  );
  const [scene, setScene] = useState<Scene>(defaultScene);
  const [frame, setFrame] = useState<Frame>(initial);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState(
    lesson.starter.includes("key")
      ? "Tekan Tombol aksi untuk memulai."
      : "Seret blok atau klik untuk menambah, lalu Jalankan.",
  );
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState<Project | null>(null);
  const [hasEdited, setHasEdited] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragSource = useRef<DragSource | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get(
      "project",
    );
    const old = readProjects().find(
      (p) => p.lessonId === lesson.id && (!requested || p.id === requested),
    );
    if (old) {
      setBlocks(old.blocks);
      setHasEdited(true);
      setTitle(old.title);
      setSaved(old);
      setCurrentId(old.id);
      if (old.scene) setScene(old.scene);
    } else if (localStorage.getItem("atala-theme") === "garden")
      setScene({ ...defaultScene, backdrop: "garden" });
  }, [lesson.id]);
  useEffect(() => {
    const move = (e: globalThis.PointerEvent) => {
      if (!dragSource.current) return;
      const index = dropIndexAtPoint(e.clientX, e.clientY);
      setDropIndex(index);
      setDragging((old) =>
        old ? { ...old, x: e.clientX, y: e.clientY } : null,
      );
    };
    const up = (e: globalThis.PointerEvent) => {
      const source = dragSource.current;
      if (!source) return;
      const index = dropIndexAtPoint(e.clientX, e.clientY);
      if (index !== null) {
        setBlocks((prev) =>
          source.type === "palette"
            ? insertBlock(prev, source.kind, index, crypto.randomUUID())
            : reorderBlock(prev, source.id, index),
        );
        setSaved(null);
        setHasEdited(true);
        setHasRun(false);
        setMessage("Klik! Blok menyatu di jalur. Coba Jalankan untuk melihat hasilnya.");
      }
      dragSource.current = null;
      setDragging(null);
      setDropIndex(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  const startDrag = (
    source: DragSource,
    e: PointerEvent<HTMLButtonElement>,
  ) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (source.type === "palette" && blocks.length >= 80) {
      setMessage("Maksimal 80 blok. Hapus beberapa blok dulu.");
      return;
    }
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragSource.current = source;
    const kind =
      source.type === "palette"
        ? source.kind
        : blocks.find((b) => b.id === source.id)?.kind;
    if (!kind) return;
    setDragging({ source, kind, x: e.clientX, y: e.clientY });
  };
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  };
  const add = (kind: BlockKind) => {
    if (blocks.length >= 80) {
      setMessage("Maksimal 80 blok. Hapus beberapa blok dulu.");
      return;
    }
    setBlocks((prev) =>
      insertBlock(prev, kind, prev.length, crypto.randomUUID()),
    );
    setSaved(null);
    setHasEdited(true);
    setHasRun(false);
    setMessage("Blok baru terpasang. Kamu bisa menyeretnya untuk mengubah urutan.");
  };
  const move = (index: number, dir: number) => {
    const next = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
    setSaved(null);
    setHasEdited(true);
    setHasRun(false);
  };
  const run = (trigger: "start" | "key") => {
    stop();
    try {
      const frames = runBlocks(blocks, trigger);
      setHasRun(true);
      setFrame(initial);
      let index = 0;
      setPlaying(true);
      setMessage("Program sedang berjalan…");
      timer.current = setInterval(() => {
        index++;
        if (index >= frames.length) {
          stop();
          const last = frames.at(-1)!;
          setMessage(
            last.starCaught
              ? "Hebat! Kamu menyentuh target!"
              : "Bagus! Coba ubah susunan untuk hasil lain.",
          );
          return;
        }
        setFrame(frames[index]);
      }, 500);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Program belum bisa dijalankan.",
      );
    }
  };
  const newProject = () => {
    stop();
    setBlocks(
      lesson.starter.map((kind) => ({ id: crypto.randomUUID(), kind })),
    );
    setScene(defaultScene);
    setFrame(initial);
    setTitle("");
    setSaved(null);
    setHasEdited(false);
    setHasRun(false);
    setCurrentId(null);
    setMessage("Proyek baru siap. Proyek lama tetap tersimpan.");
    window.history.replaceState(null, "", `/belajar/${lesson.id}`);
  };
  const save = async () => {
    const name = title.trim() || lesson.title;
    const project: Project = {
      id: currentId || crypto.randomUUID(),
      title: name.slice(0, 80),
      lessonId: lesson.id,
      blocks,
      scene,
      updatedAt: new Date().toISOString(),
    };
    try {
      saveProject(project);
    } catch {
      setMessage(
        "Browser kehabisan ruang. Unduh proyek sebelumnya untuk cadangan.",
      );
      return;
    }
    setSaved(project);
    setCurrentId(project.id);
    setTitle(name);
    setMessage("Proyek tersimpan di browser ini.");
    if (syncAvailable) {
      try {
        await syncProject(project);
        setMessage("Proyek tersimpan di browser dan tersinkron.");
      } catch (e) {
        setMessage(
          e instanceof Error
            ? e.message
            : "Sinkronisasi gagal; salinan lokal aman.",
        );
      }
    }
  };
  const exportHtml = () => {
    try {
      downloadStandaloneHtml({
        id: currentId || crypto.randomUUID(),
        title: (title.trim() || lesson.title).slice(0, 80),
        lessonId: lesson.id,
        blocks,
        scene,
        updatedAt: new Date().toISOString(),
      });
      setMessage("File HTML karyamu siap dibuka tanpa internet.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Karya belum bisa diunduh.",
      );
    }
  };
  return (
    <section className="editor-section" aria-label="Studio coding blok">
      <div className="editor-head">
        <div>
          <span className="eyebrow">STUDIO BLOK · LATIHAN INTERAKTIF</span>
          <h2>Buat programmu</h2>
          <p>
            Pilih blok di kiri, lihat panggung di tengah, lalu rangkai programmu
            di jalur kanan.
          </p>
        </div>
        <span className="editor-chip">
          {String(lesson.month).padStart(2, "0")} /{" "}
          {String(lesson.number).padStart(2, "0")}
        </span>
      </div>
      <div className="learning-guide" aria-label="Langkah belajar">
        <div className="learning-steps">
          <span className={hasEdited ? "done" : ""}>1 · Susun blok</span>
          <span className={hasRun ? "done" : ""}>2 · Jalankan</span>
          <span className={saved ? "done" : ""}>3 · Simpan karya</span>
        </div>
        <div className="learning-challenge">
          <strong>Tantangan:</strong> {lesson.challenge}
        </div>
        <button
          type="button"
          className="hint-toggle"
          aria-expanded={showHint}
          onClick={() => setShowHint((value) => !value)}
        >
          {showHint ? "Tutup petunjuk" : "Butuh petunjuk?"}
        </button>
        {showHint && (
          <p className="learning-hint">
            {lesson.learn[0]} Coba satu perubahan, lalu tekan{" "}
            {blocks.some((b) => b.kind === "key") ? "Tombol aksi" : "Jalankan"}{" "}
            untuk melihat hasilnya.
          </p>
        )}
      </div>
      <div className="editor-grid">
        <BlockPalette onAdd={add} onDrag={startDrag} />
        <Stage
          frame={frame}
          scene={scene}
          onScene={(next) => {
            setScene(next);
            setSaved(null);
            setHasEdited(true);
            setHasRun(false);
          }}
          onRun={run}
          onStop={stop}
          onReset={() => {
            stop();
            setFrame(initial);
            setMessage("Panggung kembali ke awal.");
          }}
          playing={playing}
          hasStart={blocks.some((b) => b.kind === "start")}
          hasKey={blocks.some((b) => b.kind === "key")}
          message={message}
        />
        <BlockWorkspace
          blocks={blocks}
          activeId={frame.active}
          dropIndex={dropIndex}
          dragging={Boolean(dragging)}
          draggedId={dragging?.source.type === "workspace" ? dragging.source.id : null}
          onMove={move}
          onRemove={(id) => {
            setBlocks(blocks.filter((b) => b.id !== id));
            setSaved(null);
            setHasEdited(true);
            setHasRun(false);
          }}
          onUpdate={(id, value) => {
            setBlocks(blocks.map((b) => (b.id === id ? { ...b, value } : b)));
            setSaved(null);
            setHasEdited(true);
            setHasRun(false);
          }}
          onDrag={startDrag}
        />
      </div>
      <div className="save-bar">
        <div>
          <label htmlFor="project-title">Nama proyekmu</label>
          <input
            id="project-title"
            value={title}
            maxLength={80}
            placeholder="Contoh: Petualangan Bintang"
            onChange={(e) => {
              setTitle(e.target.value);
              setSaved(null);
            }}
          />
          <small>
            {syncAvailable
              ? "Simpan lokal dan coba sinkronkan"
              : "Simpan di browser. Unduh HTML untuk dimainkan, JSON untuk cadangan."}
          </small>
        </div>
        <div className="save-actions">
          <button className="button primary" onClick={save}>
            <Save size={17} /> Simpan proyek
          </button>
          <button className="button outline" onClick={exportHtml}>
            <FileCode2 size={17} /> Unduh karya HTML
          </button>
          <button
            className="button outline"
            onClick={() => {
              if (saved) downloadProject(saved);
              else setMessage("Simpan proyek dulu sebelum mengunduh.");
            }}
            disabled={!saved}
          >
            <Download size={17} /> Cadangan JSON
          </button>
          <button
            type="button"
            className="text-link new-project"
            onClick={newProject}
          >
            Buat baru
          </button>
          <Link href="/proyek" className="text-link">
            Proyek Saya →
          </Link>
        </div>
      </div>
      {dragging && (
        <DragGhost kind={dragging.kind} x={dragging.x} y={dragging.y} />
      )}
    </section>
  );
}
