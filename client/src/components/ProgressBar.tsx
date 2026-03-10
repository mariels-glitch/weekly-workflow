import { cn } from "@/lib/utils";

interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

export default function ProgressBar({ completed, total, className }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div 
      className={cn("flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap", className)}
      data-testid="progress-container"
    >
      <span data-testid="text-progress-stats">
        <strong className="font-semibold text-foreground">{completed}</strong> / {total} complete
      </span>
      <div className="relative h-1.5 rounded-full bg-white/[0.06] flex-1 min-w-[100px] overflow-hidden">
        <div
          className="absolute inset-0 rounded-full transition-all duration-300 ease-out"
          style={{ 
            width: `${percentage}%`,
            background: "linear-gradient(90deg, #0a84ff, #64d2ff, #5e5ce6)"
          }}
          data-testid="progress-bar-fill"
        />
      </div>
      <span className="text-[10px]" data-testid="text-progress-percentage">{percentage}%</span>
    </div>
  );
}
