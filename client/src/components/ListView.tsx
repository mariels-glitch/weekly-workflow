import { useState, useMemo } from "react";
import { format, addDays, isToday } from "date-fns";
import { Plus, ExternalLink, GripVertical, ChevronDown, ChevronRight, Calendar } from "lucide-react";
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

interface DraggableListItemProps {
  task: Task;
  onClick: () => void;
}

function DraggableListItem({ task, onClick }: DraggableListItemProps) {
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
        "group flex items-center gap-3 p-3 border-b border-border cursor-pointer transition-all duration-150",
        "hover:bg-muted/50",
        task.completed && "opacity-60",
        isDragging && "opacity-50"
      )}
      onClick={onClick}
      data-testid={`list-item-${task.id}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleTask(task.id);
        }}
        className={cn(
          "w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all duration-150",
          task.completed
            ? "border-green-500/80"
            : "border-border bg-background"
        )}
        style={task.completed ? { background: "radial-gradient(circle at top, #32d74b, #00c853)" } : {}}
        data-testid={`checkbox-list-${task.id}`}
      >
        {task.completed && (
          <div className="w-2 h-2 rounded-sm bg-white" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p 
          className={cn(
            "text-[13px] font-medium",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        
        {task.description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {task.priority !== "none" && (
          <span 
            className="text-[10px] font-bold rounded px-1.5 py-0.5"
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
            className="inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-muted text-muted-foreground"
          >
            <span 
              className="w-1.5 h-1.5 rounded-full" 
              style={{ backgroundColor: workstream.color }}
            />
            {workstream.name}
          </span>
        )}

        {taskLabels.slice(0, 2).map(label => label && (
          <span
            key={label.id}
            className="text-[9px] rounded px-1.5 py-0.5 hidden sm:inline-block"
            style={{ 
              backgroundColor: `${label.color}25`,
              color: label.color,
            }}
          >
            {label.name}
          </span>
        ))}
        
        {task.externalLink && (
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

function ListItemOverlay({ task }: { task: Task }) {
  const { getWorkstream } = useWorkflow();
  const workstream = getWorkstream(task.workstreamId);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border shadow-2xl"
      style={{ width: 400 }}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium">{task.title}</p>
      </div>
      <div className="flex items-center gap-2">
        {task.priority !== "none" && (
          <span 
            className="text-[10px] font-bold rounded px-1.5 py-0.5"
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
            className="inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-muted text-muted-foreground"
          >
            <span 
              className="w-1.5 h-1.5 rounded-full" 
              style={{ backgroundColor: workstream.color }}
            />
            {workstream.name}
          </span>
        )}
      </div>
    </div>
  );
}

interface DroppableDaySectionProps {
  dayIndex: number;
  day: Date;
  children: React.ReactNode;
  taskCount: number;
  onAddTask: () => void;
  hasActiveWorkstreams: boolean;
}

function DroppableDaySection({ dayIndex, day, children, taskCount, onAddTask, hasActiveWorkstreams }: DroppableDaySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isTodaySection = isToday(day);
  
  const { setNodeRef, isOver } = useDroppable({
    id: `list-day-${dayIndex}`,
    data: { dayIndex },
  });

  return (
    <div 
      className={cn(
        "rounded-xl border overflow-hidden transition-colors duration-200",
        "bg-card border-border",
        isTodaySection && "border-primary/30",
        isOver && "ring-2 ring-primary/40"
      )}
      data-testid={`list-day-section-${dayIndex}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-3 border-b border-border",
          isTodaySection && "bg-primary/[0.04]"
        )}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className={cn(
            "text-[13px] font-medium",
            isTodaySection ? "text-primary" : "text-foreground"
          )}>
            {format(day, "EEEE, MMM d")}
          </span>
          {isTodaySection && (
            <span className="text-[9px] uppercase tracking-widest text-primary bg-primary/20 rounded-full px-2 py-0.5">
              Today
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">
          {taskCount} {taskCount === 1 ? "task" : "tasks"}
        </span>
      </button>

      {isExpanded && (
        <div ref={setNodeRef} className={cn("min-h-[50px]", isOver && "bg-primary/[0.08]")}>
          {children}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddTask();
            }}
            disabled={!hasActiveWorkstreams}
            className={cn(
              "w-full text-[12px] py-2 transition-all flex items-center justify-center gap-1",
              hasActiveWorkstreams 
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-muted-foreground/40 cursor-not-allowed"
            )}
            data-testid={`button-add-list-item-${dayIndex}`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add task
          </button>
        </div>
      )}
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
  const [isExpanded, setIsExpanded] = useState(true);
  
  const { setNodeRef, isOver } = useDroppable({
    id: "backlog",
    data: { dayIndex: -1 },
  });

  return (
    <div
      className="mt-4 glassmorphic rounded-[22px] border border-border shadow-sm relative overflow-hidden"
      data-testid="list-backlog-section"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 border-b border-border"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
          <h3 className="text-[14px] font-semibold text-muted-foreground uppercase tracking-wide">
            Backlog
          </h3>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {backlogTasks.length} {backlogTasks.length === 1 ? "task" : "tasks"}
        </span>
      </button>

      {isExpanded && (
        <div 
          ref={setNodeRef}
          className={cn(
            "min-h-[80px] transition-colors duration-200",
            isOver && "bg-primary/[0.12] ring-2 ring-inset ring-primary/30"
          )}
        >
          {backlogTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground/40 text-[12px]">
              No backlog tasks - drag tasks here to save for later
            </div>
          ) : (
            backlogTasks.map(task => (
              <DraggableListItem 
                key={task.id} 
                task={task} 
                onClick={() => onEditTask(task)}
              />
            ))
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddTask();
            }}
            className="w-full text-[12px] py-2 transition-all flex items-center justify-center gap-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            data-testid="button-add-list-backlog"
          >
            <Plus className="w-3.5 h-3.5" />
            Add to backlog
          </button>
        </div>
      )}
    </div>
  );
}

export default function ListView() {
  const { tasks, workstreams, moveTask } = useWorkflow();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskContext, setNewTaskContext] = useState<{ workstreamId: string; dayIndex: number } | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const { currentWeekStart } = useWorkflow();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

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
        className="glassmorphic rounded-[22px] p-4 border border-border shadow-sm relative overflow-hidden panel-glow"
        data-testid="list-view"
      >
        <div className="relative z-10">
          <div className="flex items-baseline justify-between gap-2.5 mb-4">
            <div>
              <h2 className="text-[16px] font-semibold uppercase tracking-wide text-muted-foreground">
                Weekly List
              </h2>
              <p className="text-[12px] text-muted-foreground">
                All tasks by day - drag to reschedule
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3" data-testid="list-sections">
            {weekDays.map((day, index) => {
              const dayTasks = getTasksForDay(index);
              
              return (
                <DroppableDaySection
                  key={index}
                  dayIndex={index}
                  day={day}
                  taskCount={dayTasks.length}
                  onAddTask={() => handleAddTask(index)}
                  hasActiveWorkstreams={hasActiveWorkstreams}
                >
                  {dayTasks.map((task) => (
                    <DraggableListItem
                      key={task.id}
                      task={task}
                      onClick={() => handleEditTask(task)}
                    />
                  ))}
                </DroppableDaySection>
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
        {activeTask && <ListItemOverlay task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
