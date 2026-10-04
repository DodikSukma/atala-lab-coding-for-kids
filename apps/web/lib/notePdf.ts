import { jsPDF } from "jspdf";
import {
  BOARD_PAGE_HEIGHT,
  BOARD_WIDTH,
  arrowHead,
  type NoteElement,
} from "./notes";

const LEFT = 28;
const TOP = 57;
function rgb(hex: string): [number, number, number] {
  const safe = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#17213b";
  return [
    parseInt(safe.slice(1, 3), 16),
    parseInt(safe.slice(3, 5), 16),
    parseInt(safe.slice(5, 7), 16),
  ];
}

export function buildNotePdf(
  title: string,
  elements: NoteElement[],
  pageCount = 1,
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const scale = Math.min(
    (width - 2 * LEFT) / BOARD_WIDTH,
    (height - TOP - 36) / BOARD_PAGE_HEIGHT,
  );
  const total = Math.max(1, pageCount);
  for (let page = 0; page < total; page++) {
    if (page) doc.addPage();
    const offset = page * BOARD_PAGE_HEIGHT;
    const x = (value: number) => LEFT + value * scale;
    const y = (value: number) => TOP + (value - offset) * scale;
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, width, 41, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text((title.trim() || "Catatan kelas").slice(0, 75), LEFT, 26);
    doc.setDrawColor(219, 226, 239);
    doc.setLineWidth(0.7);
    doc.rect(LEFT, TOP, BOARD_WIDTH * scale, BOARD_PAGE_HEIGHT * scale);
    for (const item of elements) {
      const [r, g, b] = rgb(item.color);
      doc.setDrawColor(r, g, b);
      doc.setTextColor(r, g, b);
      if (item.type === "stroke") {
        doc.setLineWidth(Math.max(0.8, item.width * scale));
        for (let i = 1; i < item.points.length; i++) {
          const a = item.points[i - 1],
            b = item.points[i];
          if (
            a.y >= offset &&
            a.y <= offset + BOARD_PAGE_HEIGHT &&
            b.y >= offset &&
            b.y <= offset + BOARD_PAGE_HEIGHT
          )
            doc.line(x(a.x), y(a.y), x(b.x), y(b.y));
        }
      } else if (item.type === "arrow") {
        if (item.y1 < offset || item.y1 >= offset + BOARD_PAGE_HEIGHT) continue;
        doc.setLineWidth(Math.max(0.8, item.width * scale));
        doc.line(x(item.x1), y(item.y1), x(item.x2), y(item.y2));
        const [tip, left, right] = arrowHead(
          { x: item.x1, y: item.y1 },
          { x: item.x2, y: item.y2 },
        );
        doc.triangle(
          x(tip.x),
          y(tip.y),
          x(left.x),
          y(left.y),
          x(right.x),
          y(right.y),
          "F",
        );
      } else if (item.y >= offset && item.y < offset + BOARD_PAGE_HEIGHT) {
        if (item.type === "rect") {
          doc.setLineWidth(Math.max(0.8, item.width * scale));
          doc.rect(x(item.x), y(item.y), item.w * scale, item.h * scale);
        } else if (item.type === "ellipse") {
          doc.setLineWidth(Math.max(0.8, item.width * scale));
          doc.ellipse(
            x(item.x + item.w / 2),
            y(item.y + item.h / 2),
            (item.w * scale) / 2,
            (item.h * scale) / 2,
          );
        } else if (item.type === "image") {
          doc.addImage(
            item.dataUrl,
            item.dataUrl.startsWith("data:image/jpeg")
              ? "JPEG"
              : item.dataUrl.startsWith("data:image/webp")
                ? "WEBP"
                : "PNG",
            x(item.x),
            y(item.y),
            item.w * scale,
            item.h * scale,
          );
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(14);
          doc.text(item.text.slice(0, 200), x(item.x), y(item.y));
        }
      }
    }
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("ATALA LAB / PAPAN CATATAN", LEFT, height - 16);
    doc.text(`${page + 1} / ${total}`, width - LEFT, height - 16, {
      align: "right",
    });
  }
  return doc;
}
