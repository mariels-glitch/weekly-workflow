import { useState, useMemo } from "react";
import { format, startOfWeek, addDays, isToday } from "date-fns";
import { Plus, ExternalLink, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflow } from "@/context/WorkflowContext";
import TaskEditDialog from "./TaskEditDialog";
import type { Task } from "@/types/workflow";
import { PRIORITY_COLORS } from "@/types/workflow";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";

interface DraggableKanbanCardProps {
  task: Task;
  onClick: () => void;
}

function DraggableKanbanCard({ task, onClick }: DraggableKanbanCardProps) {
  const { toggleTask, getLabel, getWorkstream } = useWorkflow();
  const workstream = getWorkstream(task.workstreamId);
  const taskLabels = task.labelIds.map(id => getLabel(id)).filter(Boolean);
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group rounded-xl p-2.5 border cursor-pointer transition-all duration-150",
        "hover:translate-y-[-1px] hover:shadow-lg hover:border-white/20",
        task.completed 
          ? "bg-green-500/[0.05] border-green-500/20 opacity-70" 
          : "bg-white/[0.03] border-white/[0.08]",
        isDragging && "opacity-50 scale-95"
      )}
      onClick={onClick}
      data-testid={`kanban-card-${task.id}`}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTask(task.id);
          }}
          className={cn(
            "w-4 h-4 mt-0.5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all duration-150",
            task.completed
              ? "border-green-500/80"
              : "border-white/30 bg-gradient-to-b from-white/10 to-white/[0.02]"
          )}
          style={task.completed ? { background: "radial-gradient(circle at top, #32d74b, #00c853)" } : {}}
          data-testid={`button-toggle-kanban-${task.id}`}
        >
          {task.completed && (
            <div className="w-2 h-2 rounded-sm bg-[#0b0c10]" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p 
            className={cn(
              "text-[12px] font-medium leading-tight",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>
          
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {task.priority !== "none" && (
              <span 
                className="text-[9px] font-bold rounded px-1 py-0.5"
                style={{ 
                  backgroundColor: `${PRIORITY_COLORS[task.priority]}25`,
                  color: PRIORITY_COLORS[task.priority],
                }}
              >
                {task.priority}
              </span>
            )}
            {workstream && (
              <span
                className="inline-flex items-center gap-1 text-[10px] rounded-full px-1.5 py-0.5 bg-white/[0.06] text-muted-foreground"
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: workstream.color }}
                />
                {workstream.name}
              </span>
            )}
            {taskLabels.map(label => label && (
              <span
                key={label.id}
                className="text-[9px] rounded px-1 py-0.5"
                style={{ 
                  backgroundColor: `${label.color}25`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ))}
            {task.externalLink && (
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanCardOverlay({ task }: { task: Task }) {
  const { getLabel, getWorkstream } = useWorkflow();
  const workstream = getWorkstream(task.workstreamId);
  const taskLabels = task.labelIds.map(id => getLabel(id)).filter(Boolean);

  return (
    <div
      className={cn(
        "rounded-xl p-2.5 border shadow-2xl",
        task.completed 
          ? "bg-green-500/[0.15] border-green-500/40" 
          : "bg-[#1a1b1f] border-white/20"
      )}
      style={{ width: 200 }}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-3 h-3 text-muted-foreground mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-[12px] font-medium leading-tight",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {task.priority !== "none" && (
              <span 
                className="text-[9px] font-bold rounded px-1 py-0.5"
                style={{ 
                  backgroundColor: `${PRIORITY_COLORS[task.priority]}25`,
                  color: PRIORITY_COLORS[task.priority],
                }}
              >
                {task.priority}
              </span>
            )}
            {workstream && (
              <span
                className="inline-flex items-center gap-1 text-[10px] rounded-full px-1.5 py-0.5 bg-white/[0.06] text-muted-foreground"
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: workstream.color }}
                />
                {workstream.name}
              </span>
            )}
            {taskLabels.map(label => label && (
              <span
                key={label.id}
                className="text-[9px] rounded px-1 py-0.5"
                style={{ 
                  backgroundColor: `${label.color}25`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DroppableColumnProps {
  dayIndex: number;
  children: React.ReactNode;
  isTodayCol: boolean;
}

function DroppableColumn({ dayIndex, children, isTodayCol }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${dayIndex}`,
    data: { dayIndex },
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex-1 flex flex-col gap-1.5 overflow-auto scrollbar-thin min-h-[100px] p-1 rounded-lg transition-colors duration-200",
        isOver && "bg-primary/[0.12] ring-1 ring-primary/30 ring-inset"
      )}
      data-testid={`kanban-tasks-${dayIndex}`}
    >
      {children}
    </div>
  );
}

interface DroppableBacklogProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

function DroppableBacklog({ onAddTask, onEditTask }: DroppableBacklogProps) {
  const { getBacklogTasks } = useWorkflow();
  const backlogTasks = getBacklogTasks();
  
  const { setNodeRef, isOver } = useDroppable({
    id: "backlog",
    data: { dayIndex: -1 },
  });

  return (
    <div
      className="mt-4 glassmorphic rounded-[22px] border border-white/[0.08] shadow-xl relative overflow-hidden"
      data-testid="kanban-backlog-section"
    >
      <div className="p-4 border-b border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            <h3 className="text-[14px] font-semibold text-muted-foreground uppercase tracking-wide">
              Backlog
            </h3>
            <span className="text-[11px] text-muted-foreground/60">
              {backlogTasks.length} {backlogTasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>
          <button
            onClick={onAddTask}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-white/[0.05]"
            data-testid="button-add-backlog-kanban"
          >
            <Plus className="w-3 h-3" />
            Add task
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Drop tasks here to add to backlog
        </p>
      </div>
      
      <div 
        ref={setNodeRef}
        className={cn(
          "p-4 min-h-[100px] transition-colors duration-200",
          isOver && "bg-primary/[0.12] ring-2 ring-inset ring-primary/30"
        )}
      >
        {backlogTasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground/40 text-[12px]">
            No backlog tasks - drag tasks here to save for later
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {backlogTasks.map(task => (
              <DraggableKanbanCard 
                key={task.id} 
                task={task} 
                onClick={() => onEditTask(task)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const { tasks, workstreams, moveTask } = useWorkflow();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskContext, setNewTaskContext] = useState<{ workstreamId: string; dayIndex: number } | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const activeWorkstreamIds = useMemo(() => {
    return new Set(workstreams.filter(ws => ws.isActive).map(ws => ws.id));
  }, [workstreams]);

  const getTasksForDay = (dayIndex: number) => {
    return tasks.filter(task => 
      task.dayIndex === dayIndex && 
      activeWorkstreamIds.has(task.workstreamId)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    
    const { active, over } = event;
    if (!over) return;
    
    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const overData = over.data.current as { dayIndex: number } | undefined;
    
    if (overData !== undefined) {
      moveTask(taskId, task.workstreamId, overData.dayIndex);
    }
  };

  const handleAddBacklogTask = () => {
    const firstActiveWorkstream = workstreams.find(ws => ws.isActive);
    if (!firstActiveWorkstream) return;
    setEditingTask(null);
    setNewTaskContext({ workstreamId: firstActiveWorkstream.id, dayIndex: -1 });
    setIsDialogOpen(true);
  };

  const handleAddTask = (dayIndex: number) => {
    const firstActiveWorkstream = workstreams.find(ws => ws.isActive);
    if (!firstActiveWorkstream) {
      return;
    }
    setEditingTask(null);
    setNewTaskContext({ 
      workstreamId: firstActiveWorkstream.id, 
      dayIndex 
    });
    setIsDialogOpen(true);
  };

  const hasActiveWorkstreams = workstreams.some(ws => ws.isActive);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskContext(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
    setNewTaskContext(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="glassmorphic rounded-[22px] p-4 border border-white/[0.08] shadow-xl relative overflow-hidden panel-glow"
        data-testid="kanban-board"
      >
        <div className="relative z-10">
          <div className="flex items-baseline justify-between gap-2.5 mb-4">
            <div>
              <h2 className="text-[16px] font-semibold uppercase tracking-wide text-muted-foreground">
                Weekly Board
              </h2>
              <p className="text-[12px] text-muted-foreground">
                Tasks organized by day - drag cards between days
              </p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2" data-testid="kanban-columns">
            {weekDays.map((day, index) => {
              const dayTasks = getTasksForDay(index);
              const isTodayCol = isToday(day);
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "flex flex-col rounded-xl p-2 min-h-[300px]",
                    "bg-white/[0.02] border border-white/[0.06]",
                    isTodayCol && "bg-primary/[0.04] border-primary/30"
                  )}
                  data-testid={`kanban-column-${index}`}
                >
                  <div className={cn(
                    "text-center pb-2 mb-2 border-b border-white/[0.08]",
                    isTodayCol && "border-primary/30"
                  )}>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {format(day, "EEE")}
                    </div>
                    <div className={cn(
                      "text-[13px] font-medium",
                      isTodayCol ? "text-primary" : "text-foreground"
                    )}>
                      {format(day, "MMM d")}
                    </div>
                    {isTodayCol && (
                      <span className="inline-block mt-1 text-[9px] uppercase tracking-widest text-primary bg-primary/20 rounded-full px-2 py-0.5">
                        Today
                      </span>
                    )}
                  </div>

                  <DroppableColumn dayIndex={index} isTodayCol={isTodayCol}>
                    {dayTasks.map((task) => (
                      <DraggableKanbanCard
                        key={task.id}
                        task={task}
                        onClick={() => handleEditTask(task)}
                      />
                    ))}
                  </DroppableColumn>

                  <div className="mt-2 pt-2 border-t border-white/[0.06]">
                    <button
                      onClick={() => handleAddTask(index)}
                      disabled={!hasActiveWorkstreams}
                      className={cn(
                        "w-full text-[11px] py-1.5 rounded-lg transition-all flex items-center justify-center gap-1",
                        hasActiveWorkstreams 
                          ? "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                          : "text-muted-foreground/40 cursor-not-allowed"
                      )}
                      data-testid={`button-add-card-${index}`}
                    >
                      <Plus className="w-3 h-3" />
                      Add card
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <DroppableBacklog
        onAddTask={handleAddBacklogTask}
        onEditTask={handleEditTask}
      />

      <TaskEditDialog
        task={editingTask}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        defaultDayIndex={newTaskContext?.dayIndex}
        defaultWorkstreamId={newTaskContext?.workstreamId}
      />

      <DragOverlay>
        {activeTask && <KanbanCardOverlay task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
