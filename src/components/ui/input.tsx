import {
  cloneElement,
  isValidElement,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactElement,
  type TextareaHTMLAttributes,
} from "react";
import { clsx } from "clsx";
import type { FormState } from "@/lib/form-state";

const control =
  "w-full rounded-input border-(length:--stroke) border-line bg-surface text-ink " +
  "placeholder:text-faint transition-colors duration-(--duration-1) ease-out-soft " +
  "hover:border-line-strong focus:border-accent " +
  "aria-[invalid=true]:border-critical " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps): ReactElement {
  return <input className={clsx(control, "h-10 px-3 text-small", className)} {...props} />;
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, rows = 4, ...props }: TextareaProps): ReactElement {
  return (
    <textarea rows={rows} className={clsx(control, "px-3 py-2 text-small", className)} {...props} />
  );
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>): ReactElement {
  return <label className={clsx("block text-caption text-muted", className)} {...props} />;
}

/** The props Field writes onto whatever control it wraps. */
type FieldControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

export type FieldProps = {
  /** Id of the control. Field sets it on the child and points the label at it. */
  id: string;
  label: string;
  /** Always-visible helper text. Read out after the label. */
  hint?: string;
  /** When set, the control turns critical and the message replaces the hint. */
  error?: string;
  className?: string;
  children: ReactElement<FieldControlProps>;
};

/**
 * Label + control + one line of hint or error, wired together. The control
 * never has to know its own id or describedby: Field writes both.
 */
export function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: FieldProps): ReactElement {
  const hintId = hint ? id + "-hint" : undefined;
  const errorId = error ? id + "-error" : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const field = isValidElement<FieldControlProps>(children)
    ? cloneElement(children, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {field}
      {error ? (
        <p id={errorId} className="text-caption text-critical">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-caption text-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export type FormMessageProps = {
  status: FormState["status"];
  message: string;
  className?: string;
};

/**
 * The one place a FormState turns into colour. Anything that is not "error" and
 * not "ok" - idle, and the degraded status the AI helpers set - reads muted, so
 * a new status can never render as a success.
 */
export function FormMessage({ status, message, className }: FormMessageProps): ReactElement | null {
  if (!message) return null;
  const tone =
    status === "error" ? "text-critical" : status === "ok" ? "text-positive" : "text-muted";
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={clsx("text-small", tone, className)}
    >
      {message}
    </p>
  );
}
