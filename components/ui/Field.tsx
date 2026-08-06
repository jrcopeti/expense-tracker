import type { ReactNode } from "react";
import clsx from "clsx";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

const fieldBaseClasses =
  "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted transition-colors " +
  "focus:outline-none focus:ring-2 focus:ring-accent/40";

export function Field({ label, htmlFor, error, children, className }: FieldProps) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function fieldClasses(hasError?: boolean): string {
  return clsx(fieldBaseClasses, hasError ? "border-danger focus:ring-danger/40" : "border-border");
}
