import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "quiet";
};

/**
 * "Primary Action: Solid trail background with white text."
 * — 01-sistema-de-design.md
 *
 * Sem sombra: elevação real existe só em modais e drawers.
 */
export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const base = [
    "rounded-md px-4 py-2 text-body-sm",
    "transition-colors duration-150 ease-out",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ];

  const variants = {
    primary: "bg-trail text-paper hover:bg-trail/90",
    quiet: "border border-mist text-ink hover:border-trail/40",
  } as const;

  return (
    <button
      className={[...base, variants[variant], className ?? ""].join(" ")}
      {...props}
    />
  );
}
