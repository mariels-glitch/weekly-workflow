import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskCategory } from "./TaskInput";

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  completed: boolean;
  dayLabel?: string;
  timeEstimate?: string;
  dayIndex?: number;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const categoryColors: Record<TaskCategory, string> = {
  Core: "bg-category-core",
  Ops: "bg-category-ops",
  Strategy: "bg-category-strategy",
  People: "bg-category-people",
};

const categoryTextColors: Record<TaskCategory, string> = {
  Core: "text-orange-200",
  Ops: "text-green-200",
  Strategy: "text-cyan-200",
  People: "text-purple-200",
};

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_auto] gap-2 items-center rounded-[14px] py-1.5 px-2 md:px-2.5",
        "bg-white/[0.02] border border-white/[0.08] text-[12px]",
        "transition-all duration-150",
        "hover:bg-white/[0.04] hover:border-white/[0.18] hover:translate-y-[-1px] hover:shadow-lg",
        task.completed && "opacity-60 bg-green-500/[0.05] border-green-500/[0.28]"
      )}
      data-testid={`task-item-${task.id}`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "w-[18px] h-[18px] rounded-[7px] border flex items-center justify-center cursor-pointer flex-shrink-0",
          "transition-all duration-150",
          task.completed
            ? "border-green-500/80 glow-success"
            : "border-white/[0.36] bg-gradient-to-b from-white/[0.12] to-white/[0.02]"
        )}
        style={task.completed ? { background: "radial-gradient(circle at top, #32d74b, #00c853)" } : {}}
        data-testid={`button-toggle-task-${task.id}`}
      >
        {task.completed && (
          <div className="w-2.5 h-2.5 rounded bg-[#0b0c10]" />
        )}
      </button>

      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className={cn(
            "text-[13px] font-medium truncate",
            task.completed && "line-through text-muted-foreground"
          )}
          data-testid={`text-task-title-${task.id}`}
        >
          {task.title}
        </span>
        <div className="flex gap-1.5 flex-wrap text-[11px] text-muted-foreground">
          <span
            className={cn(
              "rounded-full py-0.5 px-1.5 inline-flex items-center gap-1",
              "bg-primary/[0.15]",
              categoryTextColors[task.category]
            )}
            data-testid={`badge-category-${task.id}`}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", categoryColors[task.category])} />
            {task.category}
          </span>
          {task.timeEstimate && (
            <span 
              className="rounded-full py-0.5 px-1.5 bg-white/[0.04] border border-white/[0.08]"
              data-testid={`text-time-estimate-${task.id}`}
            >
              {task.timeEstimate}
            </span>
          )}
          {task.dayLabel && (
            <span 
              className="text-muted-foreground"
              data-testid={`text-day-label-${task.id}`}
            >
              {task.dayLabel}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="rounded-full bg-transparent text-white/30 cursor-pointer text-[14px] px-1 transition-all duration-150 hover:text-destructive hover:translate-y-[-0.5px] hover:scale-[1.05]"
        data-testid={`button-delete-task-${task.id}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
