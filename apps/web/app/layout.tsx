import type { Metadata } from "next";
import "./tokens.css";
import "./globals.css";
import "./redesign.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Atala Lab — Coding for Kids",
  description:
    "Ruang belajar coding visual berbahasa Indonesia bersama Kiko dan Kiki untuk siswa kelas 4 SD.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" className="skip-link">
          Langsung ke isi utama
        </a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer>
          <div className="container footer-inner">
            <div>
              <strong>Atala Lab</strong> · Satu blok, banyak kemungkinan bersama
              Kiko &amp; Kiki.
            </div>
            <div className="footer-meta">
              Belajar coding visual untuk SD · Offline-ready · Tanpa akun
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
