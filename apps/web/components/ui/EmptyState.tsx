import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
  actions,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="empty-card ui-empty-state" role="region" aria-label={title}>
      {icon && <div className="empty-state-icon" aria-hidden="true">{icon}</div>}
      <h2>{title}</h2>
      <p>{description}</p>
      {actions && <div className="empty-state-actions">{actions}</div>}
    </div>
  );
}
