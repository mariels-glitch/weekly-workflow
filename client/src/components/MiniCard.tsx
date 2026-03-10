import { cn } from "@/lib/utils";

interface MiniCardProps {
  label: string;
  value: string | number;
  meta?: string;
  className?: string;
}

export default function MiniCard({ label, value, meta, className }: MiniCardProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] py-2 px-2.5 bg-white/[0.02] border border-white/[0.08] text-[11px] flex flex-col gap-0.5",
        className
      )}
      data-testid="mini-card"
    >
      <span 
        className="text-[10px] uppercase tracking-widest text-muted-foreground"
        data-testid="text-mini-card-label"
      >
        {label}
      </span>
      <span className="text-[13px] font-medium text-foreground" data-testid="text-mini-card-value">
        {value}
      </span>
      {meta && (
        <span className="text-[11px] text-muted-foreground" data-testid="text-mini-card-meta">
          {meta}
        </span>
      )}
    </div>
  );
}
