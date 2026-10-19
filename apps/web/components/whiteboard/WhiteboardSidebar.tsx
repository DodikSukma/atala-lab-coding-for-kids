import {
  AlertTriangle,
  Download,
  FileJson,
  FilePlus2,
  FileUp,
  Image as ImageIcon,
} from "lucide-react";
import type { Note } from "@/lib/notes";

export default function WhiteboardSidebar({
  notes,
  activeNoteId,
  nearQuota,
  percentUsed,
  onNewNote,
  onOpenNote,
  onExportPdf,
  onExportPng,
  onExportJson,
  onImportJsonClick,
}: {
  notes: Note[];
  activeNoteId: string;
  nearQuota: boolean;
  percentUsed: number;
  onNewNote: () => void;
  onOpenNote: (note: Note) => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onImportJsonClick: () => void;
}) {
  return (
    <aside className="board-library" aria-label="Perpustakaan catatan guru">
      <div className="board-library-head">
        <span>PERPUSTAKAAN</span>
        <h2>Catatan saya</h2>
        <div className="board-library-actions">
          <button type="button" className="button primary btn-sm" onClick={onNewNote}>
            <FilePlus2 size={16} aria-hidden="true" /> Catatan Baru
          </button>
          <button
            type="button"
            className="button outline btn-sm"
            onClick={onImportJsonClick}
            title="Impor file cadangan JSON catatan"
          >
            <FileUp size={15} aria-hidden="true" /> Impor JSON
          </button>
        </div>
      </div>

      <div className="note-list">
        {notes.length ? (
          notes.map((note) => (
            <button
              key={note.id}
              type="button"
              className={`note-list-item ${note.id === activeNoteId ? "active" : ""}`}
              onClick={() => onOpenNote(note)}
            >
              <span className="note-list-mark" />
              <strong>{note.title}</strong>
              <small>
                {note.pageCount || 1} hal A4 · {note.elements.length} objek ·{" "}
                {new Date(note.updatedAt).toLocaleDateString("id-ID")}
              </small>
            </button>
          ))
        ) : (
          <p>Belum ada catatan tersimpan. Gambar di kanvas lalu otomatis tersimpan.</p>
        )}
      </div>

      <div className="wb-export-panel">
        <span className="wb-prop-label">EKSPOR &amp; CADANGAN</span>
        <button
          type="button"
          className="button outline btn-sm wb-side-btn"
          onClick={onExportPdf}
        >
          <Download size={15} aria-hidden="true" /> Unduh PDF A4
        </button>
        <button
          type="button"
          className="button outline btn-sm wb-side-btn"
          onClick={onExportPng}
        >
          <ImageIcon size={15} aria-hidden="true" /> Unduh PNG Halaman Aktif
        </button>
        <button
          type="button"
          className="button outline btn-sm wb-side-btn"
          onClick={onExportJson}
        >
          <FileJson size={15} aria-hidden="true" /> Cadangan JSON
        </button>
      </div>

      {nearQuota && (
        <div className="wb-quota-warning" role="alert">
          <AlertTriangle size={16} aria-hidden="true" />
          <div>
            <strong>Penyimpanan hampir penuh ({percentUsed}%)</strong>
            <p>
              Unduh cadangan JSON atau PDF, lalu hapus catatan lama yang tidak
              dipakai.
            </p>
          </div>
        </div>
      )}

      <div className="library-tip">
        <b>Pintasan Keyboard</b>
        <p>
          Tekan <kbd>V</kbd> Pilih, <kbd>P</kbd> Pena, <kbd>R</kbd> Kotak,{" "}
          <kbd>A</kbd> Panah, <kbd>T</kbd> Teks, <kbd>S</kbd> Sticky, atau tahan{" "}
          <kbd>Spasi</kbd> untuk menggeser kanvas.
        </p>
      </div>
    </aside>
  );
}
