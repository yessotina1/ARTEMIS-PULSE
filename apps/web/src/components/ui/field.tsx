import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icons";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function Field({ label, hint, error, htmlFor, required, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-xs", className)}>
      <label
        htmlFor={htmlFor}
        className="font-mono text-label-md uppercase tracking-wider text-on-surface-variant"
      >
        {label}
        {required ? <span aria-hidden className="ml-1 text-primary">*</span> : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="flex items-center gap-xs text-body-sm text-error">
          <Icon name="alert-triangle" size={13} />
          {error}
        </p>
      ) : hint ? (
        <p className="text-body-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

const controlClass =
  "h-10 w-full rounded border border-grid bg-container-lowest px-sm font-mono text-label-lg text-on-surface placeholder:text-on-surface-variant/60 hover:border-outline-variant focus:border-primary focus:outline-none disabled:opacity-60";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(controlClass, invalid && "border-error", className)}
      {...props}
    />
  );
}

export type SelectOption = { value: string; label: string };

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
  invalid?: boolean;
};

export function Select({ options, className, invalid, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(controlClass, "appearance-none pr-xl", invalid && "border-error", className)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        size={14}
        className="pointer-events-none absolute top-1/2 right-sm -translate-y-1/2 text-on-surface-variant"
      />
    </div>
  );
}
