import { CheckCircle2, Circle } from "lucide-react";

export type StepItem = {
  id: string;
  label: string;
  done: boolean;
  active?: boolean;
};

export default function ProgressSteps({
  steps,
  ariaLabel = "Langkah kemajuan belajar",
}: {
  steps: StepItem[];
  ariaLabel?: string;
}) {
  return (
    <div className="learning-steps ui-progress-steps" role="list" aria-label={ariaLabel}>
      {steps.map((step, idx) => (
        <span
          key={step.id}
          role="listitem"
          className={`step-pill ${step.done ? "done" : ""} ${step.active ? "active" : ""}`.trim()}
        >
          {step.done ? (
            <CheckCircle2 size={14} aria-hidden="true" />
          ) : (
            <Circle size={14} aria-hidden="true" />
          )}
          <span>
            {idx + 1} · {step.label}
          </span>
        </span>
      ))}
    </div>
  );
}
