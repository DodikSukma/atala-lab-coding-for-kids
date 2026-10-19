import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Clock,
  Compass,
  FlaskConical,
  GraduationCap,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import { blockLabels, getLesson, lessons } from "@/lib/curriculum";
import { blockClass } from "@/components/block-studio/blockStyles";
import Editor from "@/components/Editor";
import CharacterGuide from "@/components/ui/CharacterGuide";
import { LessonStatusPill } from "@/components/ProgressBadges";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  const index = lessons.findIndex((l) => l.id === id);
  const prev = index > 0 ? lessons[index - 1] : undefined;
  const next = lessons[index + 1];

  return (
    <div className="container inner-page lesson-page-v2">
      <div className="lesson-top-nav">
        <Link href={`/bulan/${lesson.month}`} className="back">
          <ArrowLeft size={17} aria-hidden="true" /> Kembali ke Bulan{" "}
          {lesson.month}
        </Link>
        <div className="lesson-top-meta">
          <span className="lesson-time-pill">
            <Clock size={14} aria-hidden="true" /> ~{lesson.estimatedMinutes}{" "}
            menit
          </span>
          <LessonStatusPill lessonId={lesson.id} />
        </div>
      </div>

      <div className="lesson-heading">
        <div>
          <span className="eyebrow">
            BULAN {lesson.month} ·{" "}
            {lesson.project ? "PROYEK AKHIR BULAN" : `PERTEMUAN ${lesson.number}`}
          </span>
          <h1>{lesson.title}</h1>
          <p>{lesson.intro}</p>
        </div>
        <div className="lesson-badge">
          <Target size={19} aria-hidden="true" />
          <span>{lesson.eyebrow}</span>
        </div>
      </div>

      {/* 1. Pembuka Misi dengan Kiko / Kiki */}
      <CharacterGuide
        character={lesson.guideCharacter}
        state="talk"
        badgeText={`Misi ${lesson.id.toUpperCase()}`}
        title={`Cerita Misi: ${lesson.title}`}
        message={lesson.story}
        companion={Boolean(lesson.project)}
      />

      {/* 2. "Hari ini kamu akan bisa..." + 3. Contoh Visual Konsep + 4. Langkah Praktik */}
      <div className="mission-prep-grid">
        <section className="stage-card goal-visual-card" aria-label="Tujuan dan konsep visual">
          <div className="stage-card-head">
            <span className="stage-icon blue">
              <Compass size={19} aria-hidden="true" />
            </span>
            <div>
              <span className="mini-label">TUJUAN HARI INI</span>
              <h2>Hari ini kamu akan bisa…</h2>
            </div>
          </div>
          <p className="goal-highlight">{lesson.goal}</p>

          <div className="visual-concept-box">
            <div className="visual-concept-header">
              <Sparkles size={15} aria-hidden="true" />
              <strong>Contoh Visual: {lesson.concept.title}</strong>
            </div>
            <div
              className="visual-block-chain"
              aria-label="Contoh susunan blok"
            >
              {lesson.concept.visualExample.map((kind, i) => (
                <span
                  key={`${kind}-${i}`}
                  className={`mini-code-block ${blockClass[kind]} kind-${kind}`}
                >
                  <small>{String(i + 1).padStart(2, "0")}</small>
                  {blockLabels[kind]}
                </span>
              ))}
            </div>
            <p className="visual-concept-caption">
              {lesson.concept.visualCaption}
            </p>
            <p className="visual-concept-summary">{lesson.concept.summary}</p>
          </div>

          <div className="vocabulary-strip" aria-label="Kosakata penting">
            <span className="mini-label">KAMUS KODE HARI INI</span>
            <div className="vocabulary-chips">
              {lesson.vocabulary.map((v) => (
                <div key={v.term} className="vocab-chip">
                  <strong>{v.term}:</strong> <span>{v.definition}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="stage-card mission-steps-card" aria-label="Langkah praktik dan eksperimen">
          <div className="stage-card-head">
            <span className="stage-icon purple">
              <ListChecks size={19} aria-hidden="true" />
            </span>
            <div>
              <span className="mini-label">LANGKAH PRAKTIK</span>
              <h2>Ayo Lakukan Langkah Ini</h2>
            </div>
          </div>
          <ol className="mission-steps-list">
            {lesson.missionSteps.map((step, idx) => (
              <li key={idx}>
                <span className="mission-step-num">{idx + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="experiment-callout">
            <div className="experiment-callout-head">
              <FlaskConical size={16} aria-hidden="true" />
              <strong>Eksperimen Kecil</strong>
            </div>
            <p>{lesson.experiment}</p>
          </div>
        </section>
      </div>

      {/* 5–8. Studio Blok + 3 Tingkat Tantangan + Checklist Keberhasilan + Refleksi */}
      <Editor lesson={lesson} />

      {/* 9. Catatan Guru / Pendamping (Collapsible Panel) */}
      <details className="teacher-note-accordion">
        <summary>
          <span className="teacher-note-summary-left">
            <GraduationCap size={20} aria-hidden="true" />
            <strong>Catatan untuk Guru &amp; Pendamping</strong>
          </span>
          <span className="teacher-note-summary-right">
            Estimasi {lesson.estimatedMinutes} menit · Klik untuk buka/tutup
          </span>
        </summary>
        <div className="teacher-note-content">
          <p>{lesson.teacherNote}</p>
          <div className="teacher-note-links">
            <Link href="/catatan" className="text-link">
              Buka Papan Guru untuk menggambar skema algoritma →
            </Link>
            {lesson.starterProjectId && (
              <Link
                href={`/proyek?preview=${lesson.starterProjectId}`}
                className="text-link"
              >
                Buka template proyek terkait di Galeri →
              </Link>
            )}
          </div>
        </div>
      </details>

      <div className="lesson-next lesson-pagination">
        {prev && prev.month === lesson.month ? (
          <Link className="button outline" href={`/belajar/${prev.id}`}>
            <ArrowLeft size={17} aria-hidden="true" /> Sebelumnya: {prev.title}
          </Link>
        ) : (
          <Link className="button outline" href={`/bulan/${lesson.month}`}>
            <BookOpenCheck size={17} aria-hidden="true" /> Daftar Modul Bulan{" "}
            {lesson.month}
          </Link>
        )}

        {next && next.month === lesson.month ? (
          <Link className="button primary" href={`/belajar/${next.id}`}>
            Berikutnya: {next.title}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ) : (
          <Link
            className="button primary"
            href={`/bulan/${lesson.month === 1 ? 2 : 1}`}
          >
            {lesson.month === 1 ? "Lanjut ke Bulan 2" : "Kembali ke Bulan 1"}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
