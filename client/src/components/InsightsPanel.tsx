import Panel from "./Panel";
import HighlightCard from "./HighlightCard";
import MiniCard from "./MiniCard";
import type { Task } from "./TaskItem";

interface InsightsPanelProps {
  tasks: Task[];
}

export default function InsightsPanel({ tasks }: InsightsPanelProps) {
  const completedToday = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const incompleteTasks = tasks.filter(t => !t.completed);
  const priorityTask = incompleteTasks[0];
  
  const categoryBreakdown = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

  return (
    <Panel title="Today's Focus" subtitle="Your day at a glance">
      <div className="flex flex-col gap-3" data-testid="insights-panel">
        {priorityTask && (
          <HighlightCard
            label="Priority"
            title={priorityTask.title}
            meta={[priorityTask.category, priorityTask.timeEstimate || "No estimate"]}
          />
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" />

        <div className="grid grid-cols-2 gap-2" data-testid="insights-stats">
          <MiniCard 
            label="Completed" 
            value={completedToday} 
            meta={`of ${totalTasks} tasks`} 
          />
          <MiniCard 
            label="Remaining" 
            value={incompleteTasks.length} 
            meta="tasks left" 
          />
          <MiniCard 
            label="Top Focus" 
            value={topCategory ? topCategory[0] : "—"} 
            meta={topCategory ? `${topCategory[1]} tasks` : "No tasks"} 
          />
          <MiniCard 
            label="Streak" 
            value="5 days" 
            meta="keep it up" 
          />
        </div>

        {incompleteTasks.length > 1 && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" />
            <div data-testid="next-up-section">
              <h3 className="text-[12px] text-muted-foreground mb-2">Next Up</h3>
              <div className="flex flex-col gap-1.5">
                {incompleteTasks.slice(1, 4).map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-2 text-[12px] py-1 px-2 rounded-lg bg-card border border-border[0.06]"
                    data-testid={`next-task-${task.id}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-category-${task.category.toLowerCase()}`} 
                          style={{ 
                            backgroundColor: task.category === 'Core' ? '#ff9f0a' : 
                                           task.category === 'Ops' ? '#32d74b' : 
                                           task.category === 'Strategy' ? '#64d2ff' : '#bf5af2' 
                          }} 
                    />
                    <span className="truncate flex-1 text-foreground">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
