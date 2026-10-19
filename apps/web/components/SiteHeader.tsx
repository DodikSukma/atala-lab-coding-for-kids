"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Compass, FolderKanban, Home, Menu, PencilRuler, X } from "lucide-react";
import logo from "../public/atala-logo.png";
import ThemeSwitcher from "./ThemeSwitcher";

const navItems = [
  {
    href: "/",
    label: "Beranda",
    icon: Home,
    match: (pathname: string) => pathname === "/" || pathname === "",
  },
  {
    href: "/bulan/1",
    label: "Belajar",
    icon: Compass,
    match: (pathname: string) =>
      pathname.startsWith("/bulan") || pathname.startsWith("/belajar"),
  },
  {
    href: "/proyek",
    label: "Galeri & Proyek",
    icon: FolderKanban,
    match: (pathname: string) => pathname.startsWith("/proyek"),
  },
  {
    href: "/catatan",
    label: "Papan Guru",
    icon: PencilRuler,
    match: (pathname: string) => pathname.startsWith("/catatan"),
  },
];

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand" aria-label="Atala Lab Beranda">
          <Image
            src={logo}
            alt="Logo Atala Lab"
            width={36}
            height={36}
            className="brand-logo"
          />
          <span>
            Atala <b>Lab</b>
          </span>
        </Link>

        <div className="nav-right">
          <nav
            id="primary-navigation"
            className={`primary-nav ${mobileOpen ? "is-open" : ""}`}
            aria-label="Navigasi utama"
          >
            {navItems.map(({ href, label, icon: Icon, match }) => {
              const active = match(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${active ? "active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <ThemeSwitcher />

          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={mobileOpen}
            aria-controls="primary-navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="mobile-nav-toggle-label">Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
