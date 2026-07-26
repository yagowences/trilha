import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

/**
 * Campo de texto do sistema de design.
 *
 * "Input Fields: 1px mist border, Radius MD, Inter Body Small text.
 *  Focus state: border changes to trail (100%)." — 01-sistema-de-design.md
 */
export function TextField({ label, id, className, ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body-sm text-ink">
        {label}
      </label>
      <input
        id={id}
        className={[
          "rounded-md border border-mist bg-white px-3 py-2",
          "text-body-sm text-ink placeholder:text-ink/40",
          "transition-colors duration-150 ease-out",
          "focus:border-trail focus:outline-none",
          className ?? "",
        ].join(" ")}
        {...props}
      />
    </div>
  );
}
