import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Flag,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { lessons, months } from "@/lib/curriculum";
import CharacterSprite from "@/components/block-studio/CharacterSprite";
import { LessonStatusPill, MonthProgressCard } from "@/components/ProgressBadges";

export function generateStaticParams() {
  return months.map((m) => ({ month: String(m.number) }));
}

export default async function MonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const num = Number(month);
  const current = months.find((m) => m.number === num);
  if (!current) notFound();
  const active = num <= 2;
  const items = lessons.filter((l) => l.month === num);
  const lessonIds = items.map((l) => l.id);

  return (
    <div className="container inner-page">
      <Link href="/" className="back">
        <ArrowLeft size={17} aria-hidden="true" /> Semua bulan
      </Link>

      <div className={`month-hero month-hero-v2 ${current.color}`}>
        <div className="month-hero-copy">
          <span className="eyebrow">BULAN {String(num).padStart(2, "0")}</span>
          <h1>{current.title}</h1>
          <p>{current.description}</p>
          {!active ? (
            <span className="coming">
              <LockKeyhole size={16} aria-hidden="true" /> Segera hadir
            </span>
          ) : (
            <MonthProgressCard
              lessonIds={lessonIds}
              label={`Progres belajar Bulan ${num}`}
            />
          )}
        </div>
        {active && (
          <div className="month-hero-mascot" aria-hidden="true">
            <CharacterSprite
              character={num === 1 ? "bot" : "cat"}
              state="success"
              size={108}
            />
          </div>
        )}
      </div>

      {active ? (
        <>
          <div className="section-heading">
            <div>
              <h2>Peta Misi Bulan {num}</h2>
              <p>
                Ikuti pertemuan sesuai urutan, atau pilih misi mana pun yang
                ingin kamu latih kembali.
              </p>
            </div>
            <span className="count-pill">4 pertemuan + 1 proyek akhir</span>
          </div>

          <div className="lesson-list">
            {items.map((l) => (
              <Link
                href={`/belajar/${l.id}`}
                className="lesson-row lesson-row-v2"
                key={l.id}
              >
                <div className={`lesson-number ${l.project ? "project" : ""}`}>
                  {l.project ? (
                    <Flag size={22} aria-hidden="true" />
                  ) : (
                    String(l.number).padStart(2, "0")
                  )}
                </div>
                <div className="lesson-row-main">
                  <div className="lesson-row-meta">
                    <span className="mini-label">
                      {l.project
                        ? "PROYEK AKHIR BULAN"
                        : `PERTEMUAN ${l.number} · ${l.eyebrow.toUpperCase()}`}
                    </span>
                    <span className="lesson-row-time">
                      <Clock size={12} aria-hidden="true" /> {l.estimatedMinutes}{" "}
                      mnt
                    </span>
                    <LessonStatusPill lessonId={l.id} />
                  </div>
                  <h3>{l.title}</h3>
                  <p>{l.intro}</p>
                </div>
                <span className="row-arrow" aria-hidden="true">
                  <ArrowRight size={20} />
                </span>
              </Link>
            ))}
          </div>

          <div className="month-gallery-callout">
            <div>
              <span className="eyebrow">BUTUH INSPIRASI?</span>
              <h3>Lihat &amp; Remix Proyek Contoh Bulan {num}</h3>
              <p>
                Mainkan karya contoh buatan Kiko &amp; Kiki, lalu tekan Remix
                untuk memodifikasinya di Studio.
              </p>
            </div>
            <Link href="/proyek" className="button outline">
              <Sparkles size={16} aria-hidden="true" /> Buka Galeri Proyek
            </Link>
          </div>
        </>
      ) : (
        <div className="empty-card">
          <BookOpen size={32} aria-hidden="true" />
          <h2>Petualangan ini sedang disiapkan</h2>
          <p>
            Jelajahi Bulan 1 dan Bulan 2 dulu bersama Kiko dan Kiki. Banyak
            cerita dan game seru yang bisa kamu buat sekarang!
          </p>
          <Link className="button primary" href="/bulan/1">
            Mulai dari Bulan 1 <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
