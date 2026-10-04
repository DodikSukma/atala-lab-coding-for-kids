import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChartNoAxesColumn,
  Code2,
  FileText,
  Gamepad2,
  MoveUpRight,
  PencilRuler,
  Play,
  Rocket,
  Sparkles,
  Star,
} from "lucide-react";
import { months } from "@/lib/curriculum";
const icons = [Rocket, Gamepad2, Code2, FileText, ChartNoAxesColumn, Sparkles];
export default function Home() {
  return (
    <>
      <section className="hero hero-v2">
        <div className="container hero-v2-grid">
          <div className="hero-copy">
            <div className="hero-overline">
              <span className="hero-pulse" /> ATALA LAB / BELAJAR CODING
            </div>
            <h1>
              Dari satu blok,
              <br />
              <em>jadi ide besar.</em>
            </h1>
            <p>
              Tempat anak kelas 4 belajar berpikir, mencoba, dan membuat game
              pertama dengan blok yang bisa disusun sendiri.
            </p>
            <div className="hero-actions">
              <Link className="button hero-primary" href="/bulan/1">
                Mulai belajar <ArrowRight size={18} />
              </Link>
              <Link className="button hero-secondary" href="/catatan">
                Papan catatan guru <MoveUpRight size={17} />
              </Link>
            </div>
            <div className="hero-meta">
              <span>
                <b>08</b> pertemuan
              </span>
              <span>
                <b>02</b> proyek akhir bulan
              </span>
              <span>
                <b>100%</b> praktik
              </span>
            </div>
          </div>
          <div
            className="hero-demo"
            aria-label="Contoh tampilan studio belajar"
          >
            <div className="demo-head">
              <span className="demo-mark">
                <i />
                <i />
                <i />
              </span>
              <strong>STUDIO BLOK</strong>
              <span>CONTOH</span>
            </div>
            <div className="demo-body">
              <div className="demo-program">
                <span>PROGRAM 01</span>
                <div className="demo-block demo-event">Ketika mulai</div>
                <div className="demo-block demo-move">Maju 1 langkah</div>
                <div className="demo-block demo-control">Ulangi 3×</div>
                <div className="demo-block demo-move demo-nested">
                  Maju 1 langkah
                </div>
                <div className="demo-block demo-score">Tambah skor +1</div>
              </div>
              <div className="demo-stage">
                <span className="demo-stage-label">PANGGUNG</span>
                <div className="demo-planet" />
                <div className="demo-robot">
                  <i />
                  <i />
                  <b />
                </div>
                <div className="demo-star">★</div>
                <span className="demo-play">
                  <Play size={15} fill="currentColor" /> JALANKAN
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="learning-strip">
        <div className="container learning-strip-grid">
          <div>
            <span>01</span>
            <strong>Pilih pertemuan</strong>
            <p>Materi pendek dan jelas.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Susun blok</strong>
            <p>Seret, ubah, dan coba lagi.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Lihat hasil</strong>
            <p>Tokoh bergerak di panggung.</p>
          </div>
          <div>
            <span>04</span>
            <strong>Simpan karya</strong>
            <p>Unduh untuk dibagikan.</p>
          </div>
        </div>
      </section>
      <section className="container courses-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">JALUR BELAJAR / KELAS 4 SD</span>
            <h2>Petualangan dimulai di sini</h2>
            <p>
              Dua bulan pertama sudah siap dimainkan. Ikuti modulnya satu per
              satu.
            </p>
          </div>
          <span className="curriculum-tag">
            <BookOpen size={16} /> Kurikulum 6 bulan
          </span>
        </div>
        <div className="course-feature-grid">
          {months.slice(0, 2).map((m, i) => {
            const Icon = icons[i];
            return (
              <Link
                className={`course-feature feature-${i + 1}`}
                href={`/bulan/${m.number}`}
                key={m.number}
              >
                <div className="course-feature-top">
                  <span>
                    JALUR {String(m.number).padStart(2, "0")} / 05 MODUL
                  </span>
                  <span className="course-feature-arrow">
                    <ArrowRight size={20} />
                  </span>
                </div>
                <div className="course-feature-icon">
                  <Icon size={36} />
                </div>
                <h3>{m.title}</h3>
                <p>{m.description}</p>
                <div className="course-feature-bottom">
                  <span>4 pertemuan + 1 proyek</span>
                  <b>
                    Mulai jelajah <ArrowRight size={15} />
                  </b>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="coming-heading">
          <span className="eyebrow">SELANJUTNYA</span>
          <h3>Yang akan kamu pelajari</h3>
        </div>
        <div className="coming-list">
          {months.slice(2).map((m, i) => {
            const Icon = icons[i + 2];
            return (
              <div className="coming-item" key={m.number}>
                <span className="coming-index">
                  {String(m.number).padStart(2, "0")}
                </span>
                <span className="coming-icon">
                  <Icon size={20} />
                </span>
                <div>
                  <h4>{m.title}</h4>
                  <p>{m.description}</p>
                </div>
                <span className="coming-badge">Segera hadir</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="container teacher-banner">
        <div className="teacher-banner-icon">
          <PencilRuler size={29} />
        </div>
        <div>
          <span>UNTUK GURU DAN PENDAMPING</span>
          <h2>Jelaskan idemu di papan catatan.</h2>
          <p>
            Gambar langkah, tambahkan teks, lalu unduh PDF untuk dibagikan ke
            kelas.
          </p>
        </div>
        <Link className="button light" href="/catatan">
          Buka papan catatan <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
