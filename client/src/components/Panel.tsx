import { cn } from "@/lib/utils";

interface PanelProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Panel({ title, subtitle, headerActions, children, className }: PanelProps) {
  return (
    <section
      className={cn(
        "glassmorphic rounded-[22px] p-4 md:p-[18px] border border-white/[0.08] shadow-xl relative overflow-hidden panel-glow",
        className
      )}
      data-testid="panel-container"
    >
      <div className="relative z-10">
        <div className="flex items-baseline justify-between gap-2.5 mb-2.5 flex-wrap">
          <div>
            <h2 
              className="text-[16px] font-semibold uppercase tracking-wide text-muted-foreground"
              data-testid="text-panel-title"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12px] text-muted-foreground" data-testid="text-panel-subtitle">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground" data-testid="panel-actions">
              {headerActions}
            </div>
          )}
        </div>
        <div className="relative z-10 mt-1.5" data-testid="panel-body">
          {children}
        </div>
      </div>
    </section>
  );
}
