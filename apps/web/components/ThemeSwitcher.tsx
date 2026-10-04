"use client";
import { useEffect, useState } from "react";
import { Flower2, Orbit } from "lucide-react";
type Theme = "space" | "garden";
export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("space");
  useEffect(() => {
    const saved = localStorage.getItem("atala-theme");
    const next: Theme = saved === "garden" ? "garden" : "space";
    setTheme(next);
    document.body.dataset.theme = next;
  }, []);
  const change = (next: Theme) => {
    setTheme(next);
    document.body.dataset.theme = next;
    localStorage.setItem("atala-theme", next);
  };
  return (
    <div className="theme-switch" role="group" aria-label="Pilih tema tampilan">
      <button
        type="button"
        aria-pressed={theme === "space"}
        onClick={() => change("space")}
        title="Tema Luar Angkasa"
      >
        <Orbit size={16} />
        <span>Angkasa</span>
      </button>
      <button
        type="button"
        aria-pressed={theme === "garden"}
        onClick={() => change("garden")}
        title="Tema Taman"
      >
        <Flower2 size={16} />
        <span>Taman</span>
      </button>
    </div>
  );
}
