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
} from "lucide-react";
import { lessons, months } from "@/lib/curriculum";
import { projectTemplates } from "@/lib/templates";
import CharacterSprite from "@/components/block-studio/CharacterSprite";
import { MonthProgressCard } from "@/components/ProgressBadges";

const icons = [Rocket, Gamepad2, Code2, FileText, ChartNoAxesColumn, Sparkles];

export default function Home() {
  return (
    <>
      <section className="hero hero-v2">
        <div className="container hero-v2-grid">
          <div className="hero-copy">
            <div className="hero-overline">
              <span className="hero-pulse" /> ATALA LAB / CODING UNTUK KELAS 4 SD
            </div>
            <h1>
              Dari satu blok,
              <br />
              <em>jadi karya besar.</em>
            </h1>
            <p>
              Belajar berpikir logis, merangkai misi cerita, dan membuat game
              pertama bersama <strong>Kiko</strong> &amp; <strong>Kiki</strong>{" "}
              dengan blok visual yang ramah anak.
            </p>
            <div className="hero-actions">
              <Link className="button hero-primary" href="/bulan/1">
                Mulai Misi Bulan 1 <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="button hero-secondary" href="/proyek">
                Galeri &amp; Proyek <Sparkles size={17} aria-hidden="true" />
              </Link>
              <Link className="button hero-secondary" href="/catatan">
                Papan Guru <MoveUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className="hero-meta">
              <span>
                <b>10</b> modul misi aktif
              </span>
              <span>
                <b>06</b> proyek siap remix
              </span>
              <span>
                <b>100%</b> tanpa akun &amp; offline-ready
              </span>
            </div>
          </div>

          <div
            className="hero-demo"
            aria-label="Contoh tampilan studio belajar bersama Kiko dan Kiki"
          >
            <div className="demo-head">
              <span className="demo-mark" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <strong>STUDIO BLOK ATALA</strong>
              <span>KIKO &amp; KIKI</span>
            </div>
            <div className="demo-body">
              <div className="demo-program">
                <span>MISI 01 · PROGRAM</span>
                <div className="demo-block demo-event">Ketika mulai</div>
                <div className="demo-block demo-control">Ulangi 3×</div>
                <div className="demo-block demo-move demo-nested">
                  Maju 1 langkah
                </div>
                <div className="demo-block demo-control">
                  Jika sentuh bintang
                </div>
                <div className="demo-block demo-score demo-nested">
                  Tambah skor +1
                </div>
              </div>
              <div className="demo-stage">
                <span className="demo-stage-label">PANGGUNG ANGKASA</span>
                <div className="demo-planet" />
                <div className="demo-characters" aria-hidden="true">
                  <div className="demo-char-kiko">
                    <CharacterSprite character="bot" state="success" size={74} />
                  </div>
                  <div className="demo-char-kiki">
                    <CharacterSprite character="cat" state="talk" size={58} />
                  </div>
                </div>
                <div className="demo-star" aria-hidden="true">
                  ★
                </div>
                <Link href="/belajar/1-1" className="demo-play">
                  <Play size={14} fill="currentColor" aria-hidden="true" /> COBA
                  SEKARANG
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="learning-strip" aria-label="Empat langkah belajar">
        <div className="container learning-strip-grid">
          <div>
            <span>01</span>
            <strong>Baca cerita misi</strong>
            <p>Kiko &amp; Kiki memandu tujuanmu.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Susun &amp; seret blok</strong>
            <p>Rangkai perintah seperti puzzle.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Jalankan &amp; amati</strong>
            <p>Dapatkan umpan balik spesifik.</p>
          </div>
          <div>
            <span>04</span>
            <strong>Simpan &amp; Remix</strong>
            <p>Unduh HTML mandiri tanpa internet.</p>
          </div>
        </div>
      </section>

      <section className="container courses-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">JALUR BELAJAR / KELAS 4 SD</span>
            <h2>Petualangan dimulai di sini</h2>
            <p>
              Dua bulan pertama (8 pertemuan dan 2 proyek akhir) siap dimainkan.
              Progresmu tersimpan otomatis di perangkat ini.
            </p>
          </div>
          <span className="curriculum-tag">
            <BookOpen size={16} aria-hidden="true" /> Kurikulum 6 bulan
          </span>
        </div>

        <div className="course-feature-grid">
          {months.slice(0, 2).map((m, i) => {
            const Icon = icons[i];
            const monthLessons = lessons
              .filter((l) => l.month === m.number)
              .map((l) => l.id);
            return (
              <div
                className={`course-feature feature-${i + 1}`}
                key={m.number}
              >
                <div className="course-feature-top">
                  <span>
                    BULAN {String(m.number).padStart(2, "0")} / 05 MODUL MISI
                  </span>
                  <CharacterSprite
                    character={m.number === 1 ? "bot" : "cat"}
                    state="idle"
                    size={42}
                  />
                </div>
                <div className="course-feature-icon">
                  <Icon size={34} aria-hidden="true" />
                </div>
                <h3>{m.title}</h3>
                <p>{m.description}</p>
                <MonthProgressCard
                  lessonIds={monthLessons}
                  label={`Progres Bulan ${m.number}`}
                />
                <div className="course-feature-bottom">
                  <span>4 pertemuan + 1 proyek</span>
                  <Link
                    href={`/bulan/${m.number}`}
                    className="course-feature-cta"
                  >
                    Mulai jelajah <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Project Gallery Preview */}
        <div className="home-gallery-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CONTOH ATALA · SIAP DIMAINKAN</span>
              <h2>Galeri Proyek &amp; Ide Remix</h2>
              <p>
                Coba mainkan 6 proyek pilihan atau tekan Remix untuk membuat
                versimu sendiri di Studio.
              </p>
            </div>
            <Link href="/proyek" className="button outline">
              Lihat Semua 6 Proyek <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-template-grid">
            {projectTemplates.slice(0, 3).map((tpl) => (
              <div key={tpl.id} className="home-template-card">
                <div
                  className={`home-template-thumb backdrop-${tpl.scene.backdrop}`}
                >
                  <CharacterSprite
                    character={tpl.scene.sprite}
                    state="move"
                    size={54}
                  />
                  <span className="home-template-target" aria-hidden="true">
                    {tpl.scene.backdrop === "space" ? "★" : "✿"}
                  </span>
                  <span className="home-template-badge">{tpl.difficulty}</span>
                </div>
                <div className="home-template-body">
                  <span className="mini-label">{tpl.category.toUpperCase()}</span>
                  <h3>{tpl.title}</h3>
                  <p>{tpl.description}</p>
                  <div className="home-template-actions">
                    <Link
                      href={`/proyek?preview=${tpl.id}`}
                      className="button outline btn-sm"
                    >
                      <Play size={14} aria-hidden="true" /> Mainkan
                    </Link>
                    <Link
                      href={`/belajar/${tpl.lessonId}?template=${tpl.id}`}
                      className="button primary btn-sm"
                    >
                      <Sparkles size={14} aria-hidden="true" /> Remix
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="coming-heading">
          <span className="eyebrow">SELANJUTNYA</span>
          <h3>Jalur Belajar Bulan 3–6</h3>
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
                  <Icon size={20} aria-hidden="true" />
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
          <PencilRuler size={29} aria-hidden="true" />
        </div>
        <div>
          <span>UNTUK GURU DAN PENDAMPING</span>
          <h2>Papan Guru Bergaya Whiteboard Interaktif</h2>
          <p>
            Gambar diagram algoritma dengan pena halus, bentuk, panah, sticky
            note, multi-select, zoom/pan, lalu ekspor ke PDF A4 atau PNG.
          </p>
        </div>
        <Link className="button light" href="/catatan">
          Buka Papan Guru <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
