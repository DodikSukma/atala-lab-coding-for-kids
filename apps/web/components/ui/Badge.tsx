import type { ReactNode } from "react";

export type BadgeTone =
  | "blue"
  | "purple"
  | "teal"
  | "amber"
  | "green"
  | "coral"
  | "neutral";

export default function Badge({
  tone = "blue",
  icon,
  children,
  className = "",
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`ui-badge badge-${tone} ${className}`.trim()}>
      {icon && <span className="ui-badge-icon" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
