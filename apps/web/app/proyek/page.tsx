"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Download,
  Edit3,
  Eye,
  FileCode2,
  FileUp,
  FolderOpen,
  Play,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteProject,
  downloadProject,
  duplicateProject,
  importProject,
  readProjects,
  renameProject,
  saveProject,
  type Project,
} from "@/lib/projects";
import {
  getProjectTemplate,
  projectTemplates,
  remixAndSaveTemplate,
  templateToProject,
  type ProjectTemplate,
  type TemplateCategory,
  type TemplateDifficulty,
} from "@/lib/templates";
import { blockLabels, getLesson } from "@/lib/curriculum";
import { runBlocks, type Frame } from "@/lib/runtime";
import { analyzeProgramRun } from "@/lib/learningFeedback";
import { downloadStandaloneHtml } from "@/lib/standaloneHtml";
import CharacterSprite from "@/components/block-studio/CharacterSprite";
import Stage from "@/components/block-studio/Stage";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import "@/components/block-studio/studio.css";

const initialFrame: Frame = {
  x: 1,
  y: 3,
  direction: 0,
  message: "",
  score: 0,
  active: "",
  starCaught: false,
};

const categories: Array<"Semua" | TemplateCategory> = [
  "Semua",
  "Urutan & Gerak",
  "Cerita & Animasi",
  "Pengulangan",
  "Game & Skor",
];

const difficulties: Array<"Semua" | TemplateDifficulty> = [
  "Semua",
  "Mudah",
  "Menengah",
  "Menantang",
];

export default function ProjectsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Project[]>([]);
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<
    "info" | "success" | "warning" | "error"
  >("info");
  const [selectedCategory, setSelectedCategory] = useState<
    "Semua" | TemplateCategory
  >("Semua");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "Semua" | TemplateDifficulty
  >("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "title">("updated");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  // Interactive Template Preview Modal State
  const [previewTemplate, setPreviewTemplate] =
    useState<ProjectTemplate | null>(null);
  const [previewFrame, setPreviewFrame] = useState<Frame>(initialFrame);
  const [previewPrevFrame, setPreviewPrevFrame] = useState<Frame | null>(null);
  const [previewTrail, setPreviewTrail] = useState<
    Array<{ x: number; y: number }>
  >([{ x: 1, y: 3 }]);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewMsg, setPreviewMsg] = useState(
    "Tekan Jalankan atau Tombol aksi untuk mencoba proyek contoh ini!",
  );
  const [previewTone, setPreviewTone] = useState<
    "info" | "success" | "warning" | "error"
  >("info");
  const previewTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(readProjects());
    const params = new URLSearchParams(window.location.search);
    const previewId = params.get("preview");
    if (previewId) {
      const found = getProjectTemplate(previewId);
      if (found) {
        openPreview(found);
      }
    }
    return () => {
      if (previewTimer.current) clearInterval(previewTimer.current);
    };
  }, []);

  const stopPreview = () => {
    if (previewTimer.current) clearInterval(previewTimer.current);
    previewTimer.current = null;
    setPreviewPlaying(false);
  };

  const openPreview = (tpl: ProjectTemplate, autoPlay = false) => {
    stopPreview();
    setPreviewTemplate(tpl);
    setPreviewFrame(initialFrame);
    setPreviewPrevFrame(null);
    setPreviewTrail([{ x: 1, y: 3 }]);
    setPreviewTone("info");
    setPreviewMsg(
      tpl.blocks.some((b) => b.kind === "key")
        ? "Game ini memakai Tombol aksi! Tekan Tombol aksi di bawah panggung."
        : "Tekan Jalankan untuk memainkan pratinjau proyek ini.",
    );
    if (autoPlay) {
      const trigger = tpl.blocks.some((b) => b.kind === "start")
        ? "start"
        : "key";
      setTimeout(() => runPreview(tpl, trigger), 60);
    }
  };

  const runPreview = (
    tpl: ProjectTemplate,
    trigger: "start" | "key",
  ) => {
    stopPreview();
    try {
      const frames = runBlocks(tpl.blocks, trigger);
      setPreviewFrame(initialFrame);
      setPreviewPrevFrame(null);
      setPreviewTrail([{ x: 1, y: 3 }]);
      setPreviewPlaying(true);
      setPreviewTone("info");
      setPreviewMsg("Memainkan contoh proyek…");
      let idx = 0;
      previewTimer.current = setInterval(() => {
        idx++;
        if (idx >= frames.length) {
          stopPreview();
          const analysis = analyzeProgramRun({
            blocks: tpl.blocks,
            frames,
            trigger,
            sprite: tpl.scene.sprite,
          });
          setPreviewTone(analysis.tone);
          setPreviewMsg(analysis.message);
          return;
        }
        const curr = frames[idx];
        const prev = frames[idx - 1] || initialFrame;
        setPreviewPrevFrame(prev);
        setPreviewFrame(curr);
        setPreviewTrail((old) => {
          const last = old.at(-1);
          if (!last || last.x !== curr.x || last.y !== curr.y) {
            return [...old, { x: curr.x, y: curr.y }];
          }
          return old;
        });
      }, 450);
    } catch (err) {
      setPreviewTone("error");
      setPreviewMsg(
        err instanceof Error ? err.message : "Gagal menjalankan pratinjau.",
      );
    }
  };

  const handleRemixTemplate = (tpl: ProjectTemplate) => {
    stopPreview();
    const remixed = remixAndSaveTemplate(tpl.id);
    setItems(readProjects());
    router.push(`/belajar/${remixed.lessonId}?project=${remixed.id}`);
  };

  const handleDuplicateUserProject = (p: Project) => {
    const copy = duplicateProject(p, items);
    saveProject(copy);
    setItems(readProjects());
    setNoticeTone("success");
    setNotice(`Salinan remix “${copy.title}” berhasil dibuat di Proyek Saya.`);
  };

  const handleRenameSubmit = (id: string) => {
    const updated = renameProject(id, renameValue);
    setRenamingId(null);
    if (updated) {
      setItems(readProjects());
      setNoticeTone("success");
      setNotice(`Nama proyek diperbarui menjadi “${updated.title}”.`);
    }
  };

  const confirmRemove = () => {
    if (!deleteTarget) return;
    deleteProject(deleteTarget.id);
    setItems(readProjects());
    setNoticeTone("info");
    setNotice(`Proyek “${deleteTarget.title}” telah dihapus dari browser.`);
    setDeleteTarget(null);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const p = await importProject(f);
      const lesson = getLesson(p.lessonId);
      if (!lesson) throw new Error("Pertemuan proyek ini tidak ditemukan.");
      saveProject(p);
      setItems(readProjects());
      setNoticeTone("success");
      setNotice(`Proyek “${p.title}” berhasil diimpor ke Proyek Saya.`);
    } catch (err) {
      setNoticeTone("error");
      setNotice(err instanceof Error ? err.message : "Gagal mengimpor proyek.");
    }
    e.target.value = "";
  };

  const filteredTemplates = useMemo(() => {
    return projectTemplates.filter((tpl) => {
      if (selectedCategory !== "Semua" && tpl.category !== selectedCategory)
        return false;
      if (
        selectedDifficulty !== "Semua" &&
        tpl.difficulty !== selectedDifficulty
      )
        return false;
      return true;
    });
  }, [selectedCategory, selectedDifficulty]);

  const filteredUserProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = items.filter((p) => {
      if (!q) return true;
      const lessonTitle = getLesson(p.lessonId)?.title.toLowerCase() || "";
      return p.title.toLowerCase().includes(q) || lessonTitle.includes(q);
    });
    return [...list].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title, "id-ID");
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [items, searchQuery, sortBy]);

  return (
    <div className="container inner-page projects-page-v2">
      <Link href="/" className="back">
        <ArrowLeft size={17} aria-hidden="true" /> Beranda
      </Link>

      <div className="projects-heading">
        <div>
          <span className="eyebrow">GALERI INSPIRASI &amp; KARYA SISWA</span>
          <h1>Jelajahi &amp; Kelola Proyek</h1>
          <p>
            Mainkan 6 contoh karya Kiko &amp; Kiki, lakukan <b>Remix</b> untuk
            membuat versimu sendiri, atau kelola proyek yang sudah kamu simpan.
          </p>
        </div>
        <div className="projects-heading-actions">
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={onImport}
          />
          <button
            type="button"
            className="button outline"
            onClick={() => file.current?.click()}
          >
            <FileUp size={18} aria-hidden="true" /> Impor JSON
          </button>
          <Link href="/bulan/1" className="button primary">
            Buat Proyek Baru <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {notice && (
        <Toast
          message={notice}
          tone={noticeTone}
          onDismiss={() => setNotice("")}
        />
      )}

      {/* SECTION 1: CONTOH ATALA (PROJECT GALLERY) */}
      <section className="gallery-section" aria-label="Galeri Contoh Atala">
        <div className="gallery-section-header">
          <div>
            <span className="section-pill pill-atala">
              <Sparkles size={14} aria-hidden="true" /> CONTOH ATALA
            </span>
            <h2>Galeri Proyek Siap Dimainkan &amp; Di-Remix</h2>
            <p>
              Pratinjau dan mainkan langsung tanpa mengubah proyekmu. Klik{" "}
              <b>Remix</b> untuk menyalinnya sebagai proyek baru milikmu!
            </p>
          </div>
          <div className="gallery-filters">
            <div
              className="filter-group"
              role="group"
              aria-label="Filter konsep"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={selectedCategory === cat}
                  className={`filter-chip ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div
              className="filter-group"
              role="group"
              aria-label="Filter tingkat kesulitan"
            >
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  aria-pressed={selectedDifficulty === diff}
                  className={`filter-chip ${selectedDifficulty === diff ? "active" : ""}`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="template-gallery-grid">
          {filteredTemplates.map((tpl) => {
            const lesson = getLesson(tpl.lessonId);
            return (
              <article key={tpl.id} className="template-card">
                <div
                  className={`template-card-preview backdrop-${tpl.scene.backdrop}`}
                >
                  <span className="template-origin-tag">Contoh Atala</span>
                  <span
                    className={`template-difficulty-tag diff-${tpl.difficulty.toLowerCase()}`}
                  >
                    {tpl.difficulty}
                  </span>
                  <div className="template-preview-scene" aria-hidden="true">
                    <div className="template-preview-char">
                      <CharacterSprite
                        character={tpl.scene.sprite}
                        state="move"
                        size={64}
                      />
                    </div>
                    <div className="template-preview-path" />
                    <div className="template-preview-target">
                      {tpl.scene.backdrop === "space" ? "★" : "✿"}
                    </div>
                  </div>
                  <div className="template-preview-meta">
                    <span>
                      {tpl.scene.sprite === "bot" ? "Kiko" : "Kiki"} ·{" "}
                      {tpl.scene.backdrop === "space" ? "Angkasa" : "Taman"}
                    </span>
                    <span>{tpl.blocks.length} blok</span>
                  </div>
                </div>

                <div className="template-card-body">
                  <div className="template-card-kicker">
                    <span>{tpl.category}</span>
                    {lesson && <span>· Modul {lesson.id.toUpperCase()}</span>}
                  </div>
                  <h3>{tpl.title}</h3>
                  <p className="template-card-desc">{tpl.description}</p>

                  <div className="template-block-pills">
                    {tpl.mainBlocks.map((kind) => (
                      <span key={kind} className="template-block-pill">
                        {blockLabels[kind]}
                      </span>
                    ))}
                  </div>

                  <div className="template-remix-goal">
                    <strong>Ide Remix:</strong> {tpl.remixGoal}
                  </div>

                  <div className="template-card-actions">
                    <button
                      type="button"
                      className="button outline btn-sm"
                      onClick={() => openPreview(tpl, false)}
                    >
                      <Eye size={15} aria-hidden="true" /> Lihat
                    </button>
                    <button
                      type="button"
                      className="button outline btn-sm"
                      onClick={() => openPreview(tpl, true)}
                    >
                      <Play size={15} aria-hidden="true" /> Mainkan
                    </button>
                    <button
                      type="button"
                      className="button primary btn-sm"
                      onClick={() => handleRemixTemplate(tpl)}
                    >
                      <Sparkles size={15} aria-hidden="true" /> Remix
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: PROYEK SAYA (USER PROJECTS) */}
      <section className="my-projects-section" aria-label="Proyek Saya">
        <div className="my-projects-header">
          <div>
            <span className="section-pill pill-user">
              <FolderOpen size={14} aria-hidden="true" /> PROYEK SAYA
            </span>
            <h2>Karya Tersimpan di Perangkat Ini ({items.length})</h2>
            <p>
              Unduh karya HTML untuk dimainkan tanpa internet, atau Cadangan
              JSON untuk memindahkan proyek ke perangkat lain.
            </p>
          </div>
          {items.length > 0 && (
            <div className="my-projects-controls">
              <div className="project-search-box">
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Cari proyek saya"
                  placeholder="Cari judul proyek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <label className="project-sort-select">
                <span>Urutkan:</span>
                <select
                  aria-label="Urutkan daftar proyek"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "updated" | "title")
                  }
                >
                  <option value="updated">Terakhir diubah</option>
                  <option value="title">Judul (A–Z)</option>
                </select>
              </label>
            </div>
          )}
        </div>

        {filteredUserProjects.length > 0 ? (
          <div className="project-list">
            {filteredUserProjects.map((p) => {
              const sceneBackdrop = p.scene?.backdrop || "space";
              const sceneSprite = p.scene?.sprite || "bot";
              const isRenaming = renamingId === p.id;
              return (
                <div className="project-row project-row-v2" key={p.id}>
                  <div
                    className={`project-scene-thumb backdrop-${sceneBackdrop}`}
                    aria-hidden="true"
                  >
                    <CharacterSprite
                      character={sceneSprite}
                      state="idle"
                      size={44}
                    />
                    <span className="thumb-star">
                      {sceneBackdrop === "space" ? "★" : "✿"}
                    </span>
                  </div>

                  <div className="project-text">
                    <div className="project-meta-row">
                      <span className="mini-label">
                        {getLesson(p.lessonId)?.title || `Modul ${p.lessonId}`}
                      </span>
                      {p.remixedFromId && (
                        <span className="remix-origin-pill">Hasil Remix</span>
                      )}
                    </div>

                    {isRenaming ? (
                      <div className="project-rename-inline">
                        <input
                          type="text"
                          aria-label="Judul proyek baru"
                          value={renameValue}
                          maxLength={80}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameSubmit(p.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                        />
                        <button
                          type="button"
                          className="button primary btn-sm"
                          onClick={() => handleRenameSubmit(p.id)}
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          className="button outline btn-sm"
                          onClick={() => setRenamingId(null)}
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <h2>{p.title}</h2>
                    )}

                    <p>
                      {p.blocks.length} blok ·{" "}
                      {sceneSprite === "bot" ? "Kiko" : "Kiki"} di{" "}
                      {sceneBackdrop === "space" ? "Angkasa" : "Taman"} ·
                      Diperbarui{" "}
                      {new Date(p.updatedAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>

                  <div className="project-actions">
                    <Link
                      href={`/belajar/${p.lessonId}?project=${p.id}`}
                      className="button primary btn-sm"
                    >
                      Buka <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      className="button outline btn-sm"
                      onClick={() => handleDuplicateUserProject(p)}
                      title="Gandakan atau remix proyek ini"
                    >
                      <Copy size={15} aria-hidden="true" /> Duplikat
                    </button>
                    <button
                      type="button"
                      className="button outline btn-sm"
                      onClick={() => {
                        setRenamingId(p.id);
                        setRenameValue(p.title);
                      }}
                      title="Ubah judul proyek"
                    >
                      <Edit3 size={15} aria-hidden="true" /> Ubah nama
                    </button>
                    <button
                      type="button"
                      className="button outline btn-sm"
                      onClick={() => {
                        try {
                          downloadStandaloneHtml(p);
                          setNoticeTone("success");
                          setNotice(
                            `Karya HTML “${p.title}” berhasil diunduh.`,
                          );
                        } catch {
                          setNoticeTone("error");
                          setNotice("Karya HTML belum bisa diunduh.");
                        }
                      }}
                    >
                      <FileCode2 size={16} aria-hidden="true" /> HTML
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Unduh cadangan JSON ${p.title}`}
                      title="Unduh cadangan JSON"
                      onClick={() => downloadProject(p)}
                    >
                      <Download size={18} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      aria-label={`Hapus ${p.title}`}
                      title="Hapus proyek"
                      onClick={() => setDeleteTarget(p)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-card">
            <FolderOpen size={38} aria-hidden="true" />
            <h2>
              {items.length === 0
                ? "Belum ada proyek di Proyek Saya"
                : "Tidak ada proyek yang cocok dengan pencarianmu"}
            </h2>
            <p>
              {items.length === 0
                ? "Pilih salah satu Contoh Atala di atas lalu tekan Remix, atau mulai dari Pertemuan 1!"
                : "Coba kata kunci lain atau kosongkan kotak pencarian."}
            </p>
            <div className="empty-state-actions">
              <Link className="button primary" href="/bulan/1">
                Mulai dari Bulan 1 <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* TEMPLATE PREVIEW & PLAY MODAL */}
      {previewTemplate && (
        <div
          className="ui-modal-backdrop preview-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              stopPreview();
              setPreviewTemplate(null);
            }
          }}
        >
          <div
            className="preview-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
          >
            <div className="preview-modal-head">
              <div>
                <span className="eyebrow">
                  PRATINJAU CONTOH ATALA · {previewTemplate.difficulty.toUpperCase()}
                </span>
                <h2 id="preview-modal-title">{previewTemplate.title}</h2>
                <p>{previewTemplate.description}</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Tutup pratinjau"
                onClick={() => {
                  stopPreview();
                  setPreviewTemplate(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="preview-modal-body">
              <div className="preview-stage-col">
                <Stage
                  frame={previewFrame}
                  prevFrame={previewPrevFrame}
                  trail={previewTrail}
                  blocks={previewTemplate.blocks}
                  scene={previewTemplate.scene}
                  onScene={() => {}}
                  onRun={(trigger) => runPreview(previewTemplate, trigger)}
                  onStop={stopPreview}
                  onReset={() => {
                    stopPreview();
                    setPreviewFrame(initialFrame);
                    setPreviewPrevFrame(null);
                    setPreviewTrail([{ x: 1, y: 3 }]);
                    setPreviewMsg("Panggung pratinjau direset ke awal.");
                  }}
                  playing={previewPlaying}
                  hasStart={previewTemplate.blocks.some(
                    (b) => b.kind === "start",
                  )}
                  hasKey={previewTemplate.blocks.some((b) => b.kind === "key")}
                  message={previewMsg}
                  feedbackTone={previewTone}
                />
              </div>

              <div className="preview-blocks-col">
                <h3>Susunan Blok ({previewTemplate.blocks.length} blok)</h3>
                <ol className="preview-block-list">
                  {previewTemplate.blocks.map((b, idx) => (
                    <li
                      key={b.id}
                      className={previewFrame.active === b.id ? "active" : ""}
                    >
                      <span className="preview-block-num">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <strong>{blockLabels[b.kind]}</strong>
                      {b.value !== undefined && (
                        <span className="preview-block-val">
                          ({String(b.value)})
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
                <div className="preview-remix-callout">
                  <strong>Tantangan Remix:</strong>
                  <p>{previewTemplate.remixGoal}</p>
                </div>
                <div className="preview-modal-actions">
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => handleRemixTemplate(previewTemplate)}
                  >
                    <Sparkles size={16} aria-hidden="true" /> Remix di Studio
                  </button>
                  <button
                    type="button"
                    className="button outline"
                    onClick={() =>
                      downloadStandaloneHtml(
                        templateToProject(previewTemplate),
                      )
                    }
                  >
                    <FileCode2 size={16} aria-hidden="true" /> Unduh HTML
                  </button>
                  <button
                    type="button"
                    className="button outline"
                    onClick={() =>
                      downloadProject(templateToProject(previewTemplate))
                    }
                  >
                    <Download size={16} aria-hidden="true" /> Unduh JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Hapus proyek “${deleteTarget?.title || ""}”?`}
        description="Proyek ini akan dihapus dari penyimpanan browser. Pastikan kamu sudah mengunduh HTML atau Cadangan JSON bila masih membutuhkannya."
        confirmLabel="Ya, hapus proyek"
        cancelLabel="Batal"
        tone="danger"
        onConfirm={confirmRemove}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
