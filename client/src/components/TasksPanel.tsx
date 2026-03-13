import { useState, useMemo } from "react";
import { format, isToday } from "date-fns";
import { TrendingUp } from "lucide-react";
import Panel from "./Panel";
import WeekStrip from "./WeekStrip";
import TaskInput, { type TaskCategory } from "./TaskInput";
import TaskItem, { type Task } from "./TaskItem";
import ProgressBar from "./ProgressBar";
import ViewToggle from "./ViewToggle";
import CategoryFilter from "./CategoryFilter";

interface TasksPanelProps {
  tasks: Task[];
  onAddTask: (title: string, category: TaskCategory) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

type FilterCategory = TaskCategory | "All";
type ViewScope = "week" | "today";

export default function TasksPanel({ tasks, onAddTask, onToggleTask, onDeleteTask }: TasksPanelProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewScope, setViewScope] = useState<ViewScope>("week");
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("All");

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (categoryFilter !== "All") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }
    return filtered;
  }, [tasks, categoryFilter]);

  const selectedDayLabel = isToday(selectedDate) 
    ? "Today" 
    : format(selectedDate, "EEEE");

  const headerActions = (
    <>
      <div className="rounded-full bg-card border border-border[0.12] px-2.5 py-1 inline-flex items-center gap-1.5">
        <TrendingUp className="w-3 h-3" />
        <span data-testid="text-weekly-stats">{completedCount} / {totalCount} complete</span>
      </div>
      <ViewToggle scope={viewScope} onScopeChange={setViewScope} />
    </>
  );

  return (
    <Panel 
      title="Weekly System" 
      subtitle="Plan once, execute daily"
      headerActions={headerActions}
    >
      <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      
      <TaskInput onAddTask={onAddTask} selectedDayLabel={selectedDayLabel} />
      
      <CategoryFilter selected={categoryFilter} onSelect={setCategoryFilter} />

      <div 
        className="flex flex-col gap-1.5 max-h-[360px] overflow-auto pr-0.5 scrollbar-thin mt-1"
        data-testid="tasks-list"
      >
        {filteredTasks.length === 0 ? (
          <p className="text-[12px] text-muted-foreground py-3 px-1" data-testid="text-empty-state">
            No tasks yet. Add your first task above.
          </p>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.16] to-transparent my-2.5" />
      
      <ProgressBar completed={completedCount} total={totalCount} />
    </Panel>
  );
}
