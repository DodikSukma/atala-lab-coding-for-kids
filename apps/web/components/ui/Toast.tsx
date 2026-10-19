import { CheckCircle2, Info, Sparkles, TriangleAlert, X } from "lucide-react";

export type ToastTone = "info" | "success" | "warning" | "error";

export default function Toast({
  message,
  tone = "info",
  onDismiss,
}: {
  message: string;
  tone?: ToastTone;
  onDismiss?: () => void;
}) {
  if (!message) return null;
  const Icon =
    tone === "success"
      ? CheckCircle2
      : tone === "warning" || tone === "error"
        ? TriangleAlert
        : tone === "info"
          ? Sparkles
          : Info;

  return (
    <div
      className={`ui-toast toast-${tone}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      <Icon size={18} className="ui-toast-icon" aria-hidden="true" />
      <span className="ui-toast-text">{message}</span>
      {onDismiss && (
        <button
          type="button"
          className="ui-toast-close"
          aria-label="Tutup pemberitahuan"
          onClick={onDismiss}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
