type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

type Props = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const styles: Record<BadgeVariant, string> = {
  default: "bg-cyan-700 text-white",
  secondary: "bg-slate-100 text-slate-700",
  destructive: "bg-rose-700 text-white",
  outline: "border border-slate-200 text-slate-700 bg-white",
};

export function Badge({ children, variant = "default", className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
