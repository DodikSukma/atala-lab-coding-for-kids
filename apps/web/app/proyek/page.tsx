"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileCode2,
  FileUp,
  FolderOpen,
  Trash2,
} from "lucide-react";
import {
  deleteProject,
  downloadProject,
  importProject,
  readProjects,
  saveProject,
  type Project,
} from "@/lib/projects";
import { getLesson } from "@/lib/curriculum";
import { downloadStandaloneHtml } from "@/lib/standaloneHtml";
export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [notice, setNotice] = useState("");
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => setItems(readProjects()), []);
  const remove = (id: string) => {
    if (!confirm("Hapus proyek ini dari browser?")) return;
    deleteProject(id);
    setItems(readProjects());
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
      setNotice("Proyek berhasil diimpor.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Gagal mengimpor proyek.");
    }
    e.target.value = "";
  };
  return (
    <div className="container inner-page">
      <Link href="/" className="back">
        <ArrowLeft size={17} /> Beranda
      </Link>
      <div className="projects-heading">
        <div>
          <span className="eyebrow">KARYA CIPTAANMU</span>
          <h1>Proyek Saya</h1>
          <p>Di sini kamu bisa membuka, memainkan, dan melanjutkan karyamu.</p>
        </div>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={onImport}
        />
        <button
          className="button outline"
          onClick={() => file.current?.click()}
        >
          <FileUp size={18} /> Impor proyek
        </button>
      </div>
      <p className="storage-note">
        Unduh karya HTML untuk dimainkan di browser tanpa internet. Cadangan
        JSON dipakai untuk mengimpor proyek kembali ke Atala Lab.
      </p>
      {notice && (
        <p className="feedback" role="status">
          {notice}
        </p>
      )}
      {items.length ? (
        <div className="project-list">
          {items.map((p) => (
            <div className="project-row" key={p.id}>
              <div className="project-icon">
                <FolderOpen size={25} />
              </div>
              <div className="project-text">
                <span className="mini-label">
                  {getLesson(p.lessonId)?.title || p.lessonId}
                </span>
                <h2>{p.title}</h2>
                <p>
                  {p.blocks.length} blok · Diperbarui{" "}
                  {new Date(p.updatedAt).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div className="project-actions">
                <Link
                  href={`/belajar/${p.lessonId}?project=${p.id}`}
                  className="button primary"
                >
                  Buka <ArrowRight size={17} />
                </Link>
                <button
                  className="button outline"
                  onClick={() => {
                    try {
                      downloadStandaloneHtml(p);
                      setNotice(`Karya HTML “${p.title}” berhasil diunduh.`);
                    } catch {
                      setNotice("Karya HTML belum bisa diunduh.");
                    }
                  }}
                >
                  <FileCode2 size={17} /> Unduh HTML
                </button>
                <button
                  className="icon-button"
                  aria-label={`Unduh cadangan JSON ${p.title}`}
                  onClick={() => downloadProject(p)}
                >
                  <Download size={18} />
                </button>
                <button
                  className="icon-button danger"
                  aria-label={`Hapus ${p.title}`}
                  onClick={() => remove(p.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-card">
          <FolderOpen size={38} />
          <h2>Belum ada proyek</h2>
          <p>Mulai dari pertemuan pertama dan simpan hasil percobaanmu!</p>
          <Link className="button primary" href="/bulan/1">
            Mulai belajar <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
