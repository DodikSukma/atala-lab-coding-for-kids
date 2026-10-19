"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Download,
  FileCode2,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Save,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  evaluateCriterion,
  type Block,
  type BlockKind,
  type Lesson,
} from "@/lib/curriculum";
import { runBlocks, type Frame } from "@/lib/runtime";
import {
  downloadProject,
  readProjects,
  saveProject,
  type Project,
} from "@/lib/projects";
import { getProjectTemplate } from "@/lib/templates";
import { syncAvailable, syncProject } from "@/lib/sync";
import { downloadStandaloneHtml } from "@/lib/standaloneHtml";
import {
  dropIndexAtPoint,
  insertBlock,
  reorderBlock,
  type DragSource,
} from "@/lib/blockDnD";
import { analyzeProgramRun } from "@/lib/learningFeedback";
import {
  getLessonProgress,
  markLessonCompleted,
  markLessonEdited,
  markLessonRan,
  saveLessonReflection,
} from "@/lib/progress";
import ProgressSteps from "./ui/ProgressSteps";
import ConfirmDialog from "./ui/ConfirmDialog";
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

type DragState = { source: DragSource; kind: BlockKind; x: number; y: number };

export default function Editor({ lesson }: { lesson: Lesson }) {
  const defaultScene: Scene = {
    backdrop: lesson.guideCharacter === "cat" ? "garden" : "space",
    sprite: lesson.guideCharacter || "bot",
  };

  const [blocks, setBlocks] = useState<Block[]>(() =>
    lesson.starter.map((kind) => ({
      id: crypto.randomUUID(),
      kind,
      value: kind === "repeat" ? 3 : kind === "say" ? "Halo!" : undefined,
    })),
  );
  const [scene, setScene] = useState<Scene>(defaultScene);
  const [frame, setFrame] = useState<Frame>(initial);
  const [prevFrame, setPrevFrame] = useState<Frame | null>(null);
  const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([
    { x: initial.x, y: initial.y },
  ]);
  const [playing, setPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [feedbackTone, setFeedbackTone] = useState<
    "info" | "success" | "warning" | "error"
  >("info");
  const [message, setMessage] = useState(
    lesson.starter.includes("key")
      ? "Tekan Tombol aksi untuk memulai permainanmu."
      : "Seret blok atau klik untuk menambah, lalu tekan Jalankan.",
  );
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState<Project | null>(null);
  const [hasEdited, setHasEdited] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [everStarCaught, setEverStarCaught] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [remixedFromId, setRemixedFromId] = useState<string | undefined>(
    undefined,
  );
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragSource = useRef<DragSource | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedProject = params.get("project");
    const requestedTemplate = params.get("template");

    const progressEntry = getLessonProgress(lesson.id);
    if (progressEntry.reflectionNote) {
      setReflectionText(progressEntry.reflectionNote);
    }
    if (progressEntry.starReached) {
      setEverStarCaught(true);
    }

    if (requestedTemplate) {
      const tpl = getProjectTemplate(requestedTemplate);
      if (tpl) {
        setBlocks(
          tpl.blocks.map((b) => ({ ...b, id: crypto.randomUUID() })),
        );
        setScene({ ...tpl.scene });
        setTitle(`Remix: ${tpl.title}`);
        setRemixedFromId(tpl.id);
        setHasEdited(true);
        markLessonEdited(lesson.id);
        return;
      }
    }

    const old = readProjects().find(
      (p) =>
        p.lessonId === lesson.id &&
        (!requestedProject || p.id === requestedProject),
    );
    if (old) {
      setBlocks(old.blocks);
      setHasEdited(true);
      setTitle(old.title);
      setSaved(old);
      setCurrentId(old.id);
      setRemixedFromId(old.remixedFromId);
      if (old.scene) setScene(old.scene);
    } else if (localStorage.getItem("atala-theme") === "garden") {
      setScene((s) => ({ ...s, backdrop: "garden" }));
    }
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
        setHasError(false);
        setFeedbackTone("info");
        setMessage(
          "Klik! Blok menyatu di jalur. Coba tekan Jalankan untuk melihat hasilnya.",
        );
        markLessonEdited(lesson.id);
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
  }, [lesson.id]);

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
      setHasError(true);
      setFeedbackTone("warning");
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
      setHasError(true);
      setFeedbackTone("warning");
      setMessage("Maksimal 80 blok. Hapus beberapa blok dulu.");
      return;
    }
    setBlocks((prev) =>
      insertBlock(prev, kind, prev.length, crypto.randomUUID()),
    );
    setSaved(null);
    setHasEdited(true);
    setHasRun(false);
    setHasError(false);
    setFeedbackTone("info");
    setMessage(
      "Blok baru terpasang. Kamu bisa menyeretnya atau memakai tombol panah untuk mengubah urutan.",
    );
    markLessonEdited(lesson.id);
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
    setHasError(false);
    markLessonEdited(lesson.id);
  };

  const run = (trigger: "start" | "key") => {
    stop();
    setHasError(false);
    try {
      const frames = runBlocks(blocks, trigger);
      setHasRun(true);
      setPrevFrame(null);
      setFrame(initial);
      setTrail([{ x: initial.x, y: initial.y }]);
      let index = 0;
      setPlaying(true);
      setFeedbackTone("info");
      setMessage("Program sedang berjalan… perhatikan langkah di panggung!");
      timer.current = setInterval(() => {
        index++;
        if (index >= frames.length) {
          stop();
          const analysis = analyzeProgramRun({
            blocks,
            frames,
            trigger,
            sprite: scene.sprite,
          });
          setFeedbackTone(analysis.tone);
          setMessage(analysis.message);
          if (analysis.starCaught) {
            setEverStarCaught(true);
          }
          markLessonRan(lesson.id, analysis.starCaught);
          return;
        }
        const current = frames[index];
        const previous = frames[index - 1] || initial;
        setPrevFrame(previous);
        setFrame(current);
        setTrail((prevTrail) => {
          const lastPt = prevTrail.at(-1);
          if (!lastPt || lastPt.x !== current.x || lastPt.y !== current.y) {
            return [...prevTrail, { x: current.x, y: current.y }];
          }
          return prevTrail;
        });
      }, 460);
    } catch (e) {
      const errText =
        e instanceof Error ? e.message : "Program belum bisa dijalankan.";
      setHasError(true);
      const analysis = analyzeProgramRun({
        blocks,
        frames: [initial],
        trigger,
        error: errText,
        sprite: scene.sprite,
      });
      setFeedbackTone(analysis.tone);
      setMessage(analysis.message);
    }
  };

  const performResetToStarter = () => {
    stop();
    setBlocks(
      lesson.starter.map((kind) => ({
        id: crypto.randomUUID(),
        kind,
        value: kind === "repeat" ? 3 : kind === "say" ? "Halo!" : undefined,
      })),
    );
    setScene(defaultScene);
    setPrevFrame(null);
    setFrame(initial);
    setTrail([{ x: initial.x, y: initial.y }]);
    setTitle("");
    setSaved(null);
    setHasEdited(false);
    setHasRun(false);
    setHasError(false);
    setFeedbackTone("info");
    setCurrentId(null);
    setRemixedFromId(undefined);
    setConfirmResetOpen(false);
    setMessage("Studio dikembalikan ke susunan awal pertemuan.");
    const cleanUrl = new URL(window.location.href);
    cleanUrl.search = "";
    window.history.replaceState(null, "", cleanUrl.pathname);
  };

  const save = async () => {
    const name = title.trim() || lesson.title;
    const project: Project = {
      id: currentId || crypto.randomUUID(),
      title: name.slice(0, 80),
      lessonId: lesson.id,
      blocks,
      scene,
      remixedFromId,
      updatedAt: new Date().toISOString(),
    };
    try {
      saveProject(project);
    } catch {
      setHasError(true);
      setFeedbackTone("error");
      setMessage(
        "Browser kehabisan ruang penyimpanan. Unduh proyek sebelumnya untuk cadangan.",
      );
      return;
    }
    setSaved(project);
    setCurrentId(project.id);
    setTitle(name);
    setHasError(false);
    setFeedbackTone("success");
    setMessage("Proyek tersimpan di browser ini dan masuk ke Proyek Saya!");
    markLessonCompleted(lesson.id, project.id);

    if (syncAvailable) {
      try {
        await syncProject(project);
        setMessage("Proyek tersimpan di browser dan tersinkron ke cloud.");
      } catch (e) {
        setMessage(
          e instanceof Error
            ? e.message
            : "Sinkronisasi gagal; salinan lokal tetap aman di browser ini.",
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
      setFeedbackTone("success");
      setMessage("File HTML karyamu siap dibuka di browser tanpa internet!");
    } catch (error) {
      setFeedbackTone("error");
      setMessage(
        error instanceof Error ? error.message : "Karya belum bisa diunduh.",
      );
    }
  };

  const criteriaResults = lesson.successCriteria.map((item) => ({
    ...item,
    passed: evaluateCriterion(item.check, {
      blocks,
      hasRun,
      starCaught: everStarCaught || frame.starCaught,
      saved: Boolean(saved),
    }),
  }));
  const allCriteriaPassed =
    criteriaResults.length > 0 && criteriaResults.every((c) => c.passed);

  return (
    <>
      <section className="editor-section" aria-label="Studio coding blok">
        <div className="editor-head">
          <div>
            <span className="eyebrow">STUDIO BLOK · LATIHAN INTERAKTIF</span>
            <h2>Buat &amp; Jalankan Programmu</h2>
            <p>
              Pilih blok di kiri, amati panggung di tengah, lalu rangkai urutan
              blokmu di jalur kanan.
            </p>
          </div>
          <div className="editor-head-right">
            {lesson.starterProjectId && (
              <Link
                href={`/proyek?preview=${lesson.starterProjectId}`}
                className="editor-template-link"
              >
                <Sparkles size={14} aria-hidden="true" /> Lihat Contoh Proyek
              </Link>
            )}
            <span className="editor-chip">
              {String(lesson.month).padStart(2, "0")} /{" "}
              {String(lesson.number).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="learning-guide" aria-label="Langkah belajar">
          <ProgressSteps
            steps={[
              {
                id: "edit",
                label: "Susun blok",
                done: hasEdited,
                active: !hasEdited,
              },
              {
                id: "run",
                label: "Jalankan",
                done: hasRun,
                active: hasEdited && !hasRun,
              },
              {
                id: "save",
                label: "Simpan karya",
                done: Boolean(saved),
                active: hasRun && !saved,
              },
            ]}
          />
          <div className="learning-challenge">
            <strong>Misi Utama:</strong> {lesson.challenge}
          </div>
          <button
            type="button"
            className="hint-toggle"
            aria-expanded={showHint}
            onClick={() => setShowHint((value) => !value)}
          >
            <HelpCircle size={15} aria-hidden="true" />
            <span>{showHint ? "Tutup petunjuk" : "Butuh petunjuk?"}</span>
          </button>
          {showHint && (
            <div className="learning-hint">
              <p>
                <strong>Tips Kiko &amp; Kiki:</strong> {lesson.learn[0]} Coba
                satu perubahan, lalu tekan{" "}
                <b>
                  {blocks.some((b) => b.kind === "key")
                    ? "Tombol aksi"
                    : "Jalankan"}
                </b>{" "}
                untuk memeriksa hasilnya.
              </p>
              {lesson.commonMistakes[0] && (
                <p className="learning-hint-mistake">
                  <Lightbulb size={14} aria-hidden="true" />{" "}
                  <span>
                    <b>Jika belum berhasil:</b> {lesson.commonMistakes[0].hint}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="editor-grid">
          <BlockPalette onAdd={add} onDrag={startDrag} />
          <Stage
            frame={frame}
            prevFrame={prevFrame}
            trail={trail}
            blocks={blocks}
            scene={scene}
            onScene={(next) => {
              setScene(next);
              setSaved(null);
              setHasEdited(true);
              setHasRun(false);
              markLessonEdited(lesson.id);
            }}
            onRun={run}
            onStop={stop}
            onReset={() => {
              stop();
              setPrevFrame(null);
              setFrame(initial);
              setTrail([{ x: initial.x, y: initial.y }]);
              setHasError(false);
              setFeedbackTone("info");
              setMessage("Panggung kembali ke posisi awal (2 : 4).");
            }}
            playing={playing}
            hasStart={blocks.some((b) => b.kind === "start")}
            hasKey={blocks.some((b) => b.kind === "key")}
            hasError={hasError}
            message={message}
            feedbackTone={feedbackTone}
          />
          <BlockWorkspace
            blocks={blocks}
            activeId={frame.active}
            dropIndex={dropIndex}
            dragging={Boolean(dragging)}
            draggedId={
              dragging?.source.type === "workspace" ? dragging.source.id : null
            }
            onMove={move}
            onRemove={(id) => {
              setBlocks(blocks.filter((b) => b.id !== id));
              setSaved(null);
              setHasEdited(true);
              setHasRun(false);
              markLessonEdited(lesson.id);
            }}
            onUpdate={(id, value) => {
              setBlocks(
                blocks.map((b) => (b.id === id ? { ...b, value } : b)),
              );
              setSaved(null);
              setHasEdited(true);
              setHasRun(false);
              markLessonEdited(lesson.id);
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
              placeholder={`Contoh: ${lesson.title}`}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaved(null);
              }}
            />
            <small>
              {syncAvailable
                ? "Simpan lokal dan coba sinkronkan ke cloud."
                : "Tersimpan aman di browser ini. Unduh HTML untuk dimainkan tanpa internet, JSON untuk cadangan."}
            </small>
          </div>
          <div className="save-actions">
            <button type="button" className="button primary" onClick={save}>
              <Save size={17} aria-hidden="true" /> Simpan proyek
            </button>
            <button
              type="button"
              className="button outline"
              onClick={exportHtml}
            >
              <FileCode2 size={17} aria-hidden="true" /> Unduh karya HTML
            </button>
            <button
              type="button"
              className="button outline"
              onClick={() => {
                if (saved) downloadProject(saved);
                else
                  setMessage("Simpan proyek dulu sebelum mengunduh cadangan.");
              }}
              disabled={!saved}
            >
              <Download size={17} aria-hidden="true" /> Cadangan JSON
            </button>
            <button
              type="button"
              className="button ghost new-project"
              onClick={() => {
                if (hasEdited && !saved) {
                  setConfirmResetOpen(true);
                } else {
                  performResetToStarter();
                }
              }}
            >
              <RotateCcw size={15} aria-hidden="true" /> Susunan awal
            </button>
            <Link href="/proyek" className="text-link">
              Galeri &amp; Proyek Saya →
            </Link>
          </div>
        </div>

        {dragging && (
          <DragGhost kind={dragging.kind} x={dragging.x} y={dragging.y} />
        )}
      </section>

      {/* Step 6 & 7: Three Challenge Levels + Interactive Success Checklist */}
      <div className="lesson-post-studio-grid">
        <section
          className="lesson-panel challenge-levels-panel"
          aria-label="Tiga tingkat tantangan"
        >
          <div className="lesson-panel-head">
            <Trophy size={20} className="panel-icon amber" aria-hidden="true" />
            <div>
              <span className="eyebrow">TANTANGAN BERTINGKAT</span>
              <h2>Uji Kemampuanmu!</h2>
            </div>
          </div>
          <div className="challenge-levels-list">
            {lesson.challengeLevels.map((ch, idx) => (
              <div
                key={ch.level}
                className={`challenge-level-card level-${ch.level.toLowerCase()}`}
              >
                <span className="challenge-level-badge">
                  {"★".repeat(idx + 1)} Tingkat {ch.level}
                </span>
                <p>{ch.description}</p>
              </div>
            ))}
          </div>

          {lesson.commonMistakes.length > 0 && (
            <div className="common-mistakes-box">
              <h3>Kesalahan Umum &amp; Petunjuk</h3>
              <ul>
                {lesson.commonMistakes.map((cm, i) => (
                  <li key={i}>
                    <strong>Jika: {cm.mistake}</strong>
                    <span>Solusi: {cm.hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section
          className="lesson-panel success-checklist-panel"
          aria-label="Checklist keberhasilan misi"
        >
          <div className="lesson-panel-head">
            <CheckCircle2
              size={20}
              className="panel-icon green"
              aria-hidden="true"
            />
            <div>
              <span className="eyebrow">BUKTI KEBERHASILAN</span>
              <h2>Checklist Misi</h2>
            </div>
          </div>
          <p className="checklist-intro">
            Daftar ini otomatis tercentang saat kamu menyusun blok, menjalankan
            program, dan menyimpan karyamu:
          </p>
          <ul className="criteria-list">
            {criteriaResults.map((item) => (
              <li
                key={item.id}
                className={`criteria-item ${item.passed ? "passed" : ""}`}
              >
                {item.passed ? (
                  <CheckCircle2
                    size={18}
                    className="criteria-icon passed"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle
                    size={18}
                    className="criteria-icon pending"
                    aria-hidden="true"
                  />
                )}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
          {allCriteriaPassed && (
            <div className="criteria-celebration" role="status">
              🎉 Luar biasa! Semua target misi pada pertemuan ini sudah
              terpenuhi!
            </div>
          )}

          {/* Step 8: Reflection Question with interactive local note */}
          <div className="reflection-interactive">
            <h3>Refleksi Kapten Kode</h3>
            <p className="reflection-question">{lesson.reflection}</p>
            <label htmlFor={`reflection-${lesson.id}`} className="sr-only">
              Jawaban refleksimu
            </label>
            <div className="reflection-input-row">
              <input
                id={`reflection-${lesson.id}`}
                type="text"
                maxLength={200}
                value={reflectionText}
                placeholder="Tulis pendapat singkatmu di sini (opsional)..."
                onChange={(e) => {
                  setReflectionText(e.target.value);
                  setReflectionSaved(false);
                }}
              />
              <button
                type="button"
                className="button outline btn-sm"
                onClick={() => {
                  saveLessonReflection(lesson.id, reflectionText);
                  setReflectionSaved(true);
                }}
              >
                Simpan catatan
              </button>
            </div>
            {reflectionSaved && (
              <small className="reflection-saved-note" role="status">
                ✓ Catatan refleksimu tersimpan di perangkat ini.
              </small>
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Kembalikan ke susunan awal?"
        description="Perubahan blok yang belum disimpan akan diganti dengan susunan blok awal pertemuan ini."
        confirmLabel="Ya, atur ulang"
        cancelLabel="Batal"
        tone="primary"
        onConfirm={performResetToStarter}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </>
  );
}
