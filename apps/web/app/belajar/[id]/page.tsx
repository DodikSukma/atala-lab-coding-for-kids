import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  ListChecks,
  MessageCircleQuestion,
  Target,
} from "lucide-react";
import { getLesson, lessons } from "@/lib/curriculum";
import Editor from "@/components/Editor";
export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  const index = lessons.findIndex((l) => l.id === id);
  const next = lessons[index + 1];
  return (
    <div className="container inner-page">
      <Link href={`/bulan/${lesson.month}`} className="back">
        <ArrowLeft size={17} /> Bulan {lesson.month}
      </Link>
      <div className="lesson-heading">
        <div>
          <span className="eyebrow">
            BULAN {lesson.month} ·{" "}
            {lesson.project ? "PROYEK" : `PERTEMUAN ${lesson.number}`}
          </span>
          <h1>{lesson.title}</h1>
          <p>{lesson.intro}</p>
        </div>
        <div className="lesson-badge">
          <Target size={19} />
          {lesson.eyebrow}
        </div>
      </div>
      <div className="stages">
        <div className="stage-card">
          <span className="stage-icon blue">
            <Lightbulb size={19} />
          </span>
          <h2>1. Kenali</h2>
          <p>{lesson.goal}</p>
        </div>
        <div className="stage-card">
          <span className="stage-icon purple">
            <ListChecks size={19} />
          </span>
          <h2>2. Coba</h2>
          <ul>
            {lesson.learn.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
        <div className="stage-card">
          <span className="stage-icon orange">
            <Target size={19} />
          </span>
          <h2>3. Tantangan</h2>
          <p>{lesson.challenge}</p>
        </div>
      </div>
      <Editor lesson={lesson} />
      <div className="reflection">
        <MessageCircleQuestion size={24} />
        <div>
          <h2>4. Ceritakan</h2>
          <p>{lesson.reflection}</p>
        </div>
      </div>
      <div className="lesson-next">
        {next && next.month === lesson.month ? (
          <Link className="button primary" href={`/belajar/${next.id}`}>
            Berikutnya: {next.title}
            <ArrowRight size={18} />
          </Link>
        ) : (
          <Link
            className="button primary"
            href={`/bulan/${lesson.month === 1 ? 2 : 1}`}
          >
            {lesson.month === 1 ? "Lanjut ke bulan 2" : "Kembali ke awal"}
            <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}
