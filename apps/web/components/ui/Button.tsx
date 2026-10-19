import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "light"
  | "danger"
  | "action";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === "action"
      ? "action-button"
      : variant === "secondary"
        ? "secondary"
        : variant;
  return (
    <button
      type={type}
      className={`button ${variantClass} btn-${size} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
