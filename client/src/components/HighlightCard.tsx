import { cn } from "@/lib/utils";

interface HighlightCardProps {
  label: string;
  title: string;
  meta?: string[];
  className?: string;
}

export default function HighlightCard({ label, title, meta, className }: HighlightCardProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] p-2.5 md:p-3 flex flex-col gap-1 text-[12px]",
        "border border-cyan-400/60 shadow-xl",
        className
      )}
      style={{
        background: "radial-gradient(circle at top left, rgba(99, 230, 255, 0.21), rgba(20, 20, 28, 0.95))"
      }}
      data-testid="highlight-card"
    >
      <span 
        className="text-[10px] uppercase tracking-widest text-[rgba(5,11,19,0.8)] bg-cyan-100/90 self-start px-2 py-0.5 rounded-full font-medium"
        data-testid="text-highlight-label"
      >
        {label}
      </span>
      <span className="text-[13px] font-medium text-foreground" data-testid="text-highlight-title">
        {title}
      </span>
      {meta && meta.length > 0 && (
        <div className="flex gap-2 flex-wrap text-[11px] text-cyan-100/80" data-testid="highlight-meta">
          {meta.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      )}
    </div>
  );
}
