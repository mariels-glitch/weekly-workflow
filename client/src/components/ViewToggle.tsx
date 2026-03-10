import { cn } from "@/lib/utils";

type ViewScope = "week" | "today";

interface ViewToggleProps {
  scope: ViewScope;
  onScopeChange: (scope: ViewScope) => void;
}

export default function ViewToggle({ scope, onScopeChange }: ViewToggleProps) {
  return (
    <div 
      className="inline-flex p-0.5 rounded-full bg-white/[0.04] border border-white/[0.12] gap-1"
      data-testid="view-toggle"
    >
      {(["week", "today"] as const).map((s) => (
        <button
          key={s}
          onClick={() => onScopeChange(s)}
          className={cn(
            "rounded-full border-0 px-2.5 py-1 text-[11px] cursor-pointer transition-all duration-150",
            scope === s
              ? "bg-primary/[0.18] text-primary translate-y-[-0.5px]"
              : "bg-transparent text-muted-foreground"
          )}
          data-testid={`button-view-${s}`}
        >
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </button>
      ))}
    </div>
  );
}
