import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import "./redesign.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";
export const metadata: Metadata = {
  title: "Atala Lab — Coding for Kids",
  description: "Belajar coding seru untuk anak SD",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        <header className="site-header">
          <div className="container nav">
            <Link href="/" className="brand">
              <Image
                src="/atala-logo.png"
                alt="Atala"
                width={36}
                height={36}
                className="brand-logo"
              />
              <span>
                Atala <b>Lab</b>
              </span>
            </Link>
            <div className="nav-right">
              <nav aria-label="Navigasi utama">
                <Link href="/">Beranda</Link>
                <Link href="/proyek">Proyek Saya</Link>
                <Link href="/catatan">Papan Guru</Link>
              </nav>
              <ThemeSwitcher />
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <div className="container">
            Atala Lab · Satu blok, banyak kemungkinan.
          </div>
        </footer>
      </body>
    </html>
  );
}
