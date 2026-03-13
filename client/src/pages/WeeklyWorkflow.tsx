import { useState } from "react";
import { LayoutGrid, List, TableProperties, LogOut, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, isSameWeek } from "date-fns";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/AppHeader";
import KanbanBoard from "@/components/KanbanBoard";
import WeeklyGridTable from "@/components/WeeklyGridTable";
import ListView from "@/components/ListView";
import WorkstreamConfigurator from "@/components/WorkstreamConfigurator";
import AiAssistant from "@/components/AiAssistant";
import { useWorkflow } from "@/context/WorkflowContext";
import { Button } from "@/components/ui/button";

type ViewMode = "kanban" | "grid" | "list";

interface WeeklyWorkflowProps {
  userEmail?: string;
  onLogout?: () => void;
}

export default function WeeklyWorkflow({ userEmail, onLogout }: WeeklyWorkflowProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { isLoading, currentWeekStart, goToPrevWeek, goToNextWeek, goToThisWeek } = useWorkflow();

  const isThisWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(currentWeekStart, 6);
  const weekLabel = format(currentWeekStart, "MMM d") + " – " + format(weekEnd, "MMM d, yyyy");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-[12px] text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6 gap-4" data-testid="weekly-workflow-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1">
          <AppHeader />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" data-testid="week-navigation">
            <Button
              size="icon"
              variant="ghost"
              onClick={goToPrevWeek}
              data-testid="button-prev-week"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1.5 px-1">
              <span className="text-[12px] text-foreground font-medium whitespace-nowrap" data-testid="text-week-label">
                {weekLabel}
              </span>
              {!isThisWeek && (
                <button
                  onClick={goToThisWeek}
                  className="text-[10px] text-primary hover:text-primary/80 border border-primary/30 hover:border-primary/50 rounded px-1.5 py-0.5 transition-colors"
                  data-testid="button-this-week"
                >
                  Today
                </button>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={goToNextWeek}
              data-testid="button-next-week"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div 
            className="flex p-0.5 rounded-full bg-muted border border-border gap-0.5"
            data-testid="view-mode-toggle"
          >
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] flex items-center gap-1.5 transition-all duration-150",
                viewMode === "grid"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="button-view-grid"
            >
              <TableProperties className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] flex items-center gap-1.5 transition-all duration-150",
                viewMode === "kanban"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="button-view-kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] flex items-center gap-1.5 transition-all duration-150",
                viewMode === "list"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="button-view-list"
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          {userEmail && onLogout && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                {userEmail}
              </span>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                title="Sign out"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {viewMode === "grid" && (
        <main className="flex-1" data-testid="main-content-grid">
          <WeeklyGridTable onOpenSettings={() => setIsConfigOpen(true)} />
        </main>
      )}

      {viewMode === "kanban" && (
        <main className="flex-1" data-testid="main-content-kanban">
          <KanbanBoard />
        </main>
      )}

      {viewMode === "list" && (
        <main className="flex-1" data-testid="main-content-list">
          <ListView />
        </main>
      )}

      <WorkstreamConfigurator 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
      />

      <AiAssistant />

      <footer className="py-2 text-center text-[10px] text-muted-foreground opacity-70" data-testid="app-footer">
        Weekly Workflow v1.0 — Plan once, execute daily
      </footer>
    </div>
  );
}
