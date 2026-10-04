import Link from "next/link";
import { ArrowLeft, PencilRuler } from "lucide-react";
import Whiteboard from "@/components/whiteboard/Whiteboard";
import "./whiteboard.css";
export default function NotesPage() {
  return (
    <div className="notes-page">
      <div className="container notes-intro">
        <Link href="/" className="back">
          <ArrowLeft size={17} /> Beranda
        </Link>
        <div className="notes-title">
          <span className="notes-title-icon">
            <PencilRuler size={24} />
          </span>
          <div>
            <span className="eyebrow">RUANG GURU · STUDIO CATATAN</span>
            <h1>Papan ide kelas</h1>
            <p>Gambar penjelasan, tulis catatan, lalu bagikan sebagai PDF.</p>
          </div>
        </div>
      </div>
      <div className="container">
        <Whiteboard />
      </div>
    </div>
  );
}
