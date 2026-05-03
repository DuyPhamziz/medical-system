import { InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, className = "", ...props },
  ref,
) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-700">
      {label && <span>{label}</span>}
      <input
        ref={ref}
        className={`h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-900 outline-none ring-cyan-200 transition focus:border-cyan-500 focus:ring-2 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
});
