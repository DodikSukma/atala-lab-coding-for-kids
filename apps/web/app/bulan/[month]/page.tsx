import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Flag,
  LockKeyhole,
} from "lucide-react";
import { lessons, months } from "@/lib/curriculum";
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
  return (
    <div className="container inner-page">
      <Link href="/" className="back">
        <ArrowLeft size={17} /> Semua bulan
      </Link>
      <div className={`month-hero ${current.color}`}>
        <span className="eyebrow">BULAN {String(num).padStart(2, "0")}</span>
        <h1>{current.title}</h1>
        <p>{current.description}</p>
        {!active && (
          <span className="coming">
            <LockKeyhole size={16} /> Segera hadir
          </span>
        )}
      </div>
      {active ? (
        <>
          <div className="section-heading">
            <div>
              <h2>Perjalanan belajarmu</h2>
              <p>Ikuti pertemuan sesuai urutan, lalu buat proyekmu sendiri.</p>
            </div>
            <span className="count-pill">4 pertemuan + 1 proyek</span>
          </div>
          <div className="lesson-list">
            {items.map((l) => (
              <Link href={`/belajar/${l.id}`} className="lesson-row" key={l.id}>
                <div className={`lesson-number ${l.project ? "project" : ""}`}>
                  {l.project ? (
                    <Flag size={22} />
                  ) : (
                    String(l.number).padStart(2, "0")
                  )}
                </div>
                <div>
                  <span className="mini-label">
                    {l.project
                      ? "PROYEK BULAN INI"
                      : `PERTEMUAN ${l.number} · ${l.eyebrow.toUpperCase()}`}
                  </span>
                  <h3>{l.title}</h3>
                  <p>{l.intro}</p>
                </div>
                <span className="row-arrow">
                  <ArrowRight size={20} />
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-card">
          <BookOpen size={32} />
          <h2>Petualangan ini sedang disiapkan</h2>
          <p>
            Jelajahi bulan 1 dan 2 dulu. Banyak karya yang bisa kamu buat
            sekarang!
          </p>
          <Link className="button primary" href="/bulan/1">
            Mulai dari bulan 1 <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
