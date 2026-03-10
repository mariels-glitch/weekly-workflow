import { useState } from "react";
import { format, startOfWeek, addDays, isToday } from "date-fns";
import { Plus, ChevronDown, ChevronRight, Settings2, ExternalLink, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflow } from "@/context/WorkflowContext";
import TaskEditDialog from "./TaskEditDialog";
import type { Task, Workstream } from "@/types/workflow";
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

interface DraggableTaskCardProps {
  task: Task;
  onClick: () => void;
}

function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
  const { toggleTask, getLabel } = useWorkflow();
  const taskLabels = task.labelIds.map(id => getLabel(id)).filter(Boolean);
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group rounded-lg p-2 border cursor-pointer transition-all duration-150",
        "hover:translate-y-[-1px] hover:shadow-lg hover:border-white/20",
        task.completed 
          ? "bg-green-500/[0.05] border-green-500/20 opacity-60" 
          : "bg-white/[0.03] border-white/[0.08]",
        isDragging && "opacity-50 scale-95"
      )}
      onClick={onClick}
      data-testid={`task-card-${task.id}`}
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
            "w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition-all duration-150",
            task.completed
              ? "border-green-500/80"
              : "border-white/30 bg-gradient-to-b from-white/10 to-white/[0.02]"
          )}
          style={task.completed ? { background: "radial-gradient(circle at top, #32d74b, #00c853)" } : {}}
          data-testid={`checkbox-${task.id}`}
        >
          {task.completed && (
            <div className="w-1.5 h-1.5 rounded-sm bg-[#0b0c10]" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p 
            className={cn(
              "text-[11px] font-medium leading-tight",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>
          
          {(taskLabels.length > 0 || task.priority !== "none" || task.externalLink) && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
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
          )}
        </div>
      </div>
    </div>
  );
}

function TaskCardOverlay({ task }: { task: Task }) {
  const { getLabel } = useWorkflow();
  const taskLabels = task.labelIds.map(id => getLabel(id)).filter(Boolean);

  return (
    <div
      className={cn(
        "rounded-lg p-2 border shadow-2xl",
        task.completed 
          ? "bg-green-500/[0.15] border-green-500/40" 
          : "bg-[#1a1b1f] border-white/20"
      )}
      style={{ width: 180 }}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-3 h-3 text-muted-foreground mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-[11px] font-medium leading-tight",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          {(taskLabels.length > 0 || task.priority !== "none") && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
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
          )}
        </div>
      </div>
    </div>
  );
}

interface DroppableCellProps {
  workstreamId: string;
  dayIndex: number;
  isToday: boolean;
  onAddTask: (workstreamId: string, dayIndex: number) => void;
  onEditTask: (task: Task) => void;
}

function DroppableCell({ workstreamId, dayIndex, isToday: isTodayCell, onAddTask, onEditTask }: DroppableCellProps) {
  const { getTasksForCell } = useWorkflow();
  const tasks = getTasksForCell(workstreamId, dayIndex);
  
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${workstreamId}-${dayIndex}`,
    data: { workstreamId, dayIndex },
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "min-h-[80px] p-1.5 border-r border-b border-white/[0.06] transition-colors duration-200",
        isTodayCell && "bg-primary/[0.03]",
        isOver && "bg-primary/[0.12] ring-1 ring-primary/30 ring-inset"
      )}
      data-testid={`cell-${workstreamId}-${dayIndex}`}
    >
      <div className="flex flex-col gap-1">
        {tasks.map(task => (
          <DraggableTaskCard 
            key={task.id} 
            task={task} 
            onClick={() => onEditTask(task)}
          />
        ))}
      </div>
      <button
        onClick={() => onAddTask(workstreamId, dayIndex)}
        className="w-full mt-1 py-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground rounded hover:bg-white/[0.03] transition-all flex items-center justify-center gap-0.5"
        data-testid={`add-task-${workstreamId}-${dayIndex}`}
      >
        <Plus className="w-2.5 h-2.5" />
        Add card
      </button>
    </div>
  );
}

interface WorkstreamRowProps {
  workstream: Workstream;
  weekDays: Date[];
  onAddTask: (workstreamId: string, dayIndex: number) => void;
  onEditTask: (task: Task) => void;
}

function WorkstreamRow({ workstream, weekDays, onAddTask, onEditTask }: WorkstreamRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <div 
        className="sticky left-0 z-10 glassmorphic border-r border-b border-white/[0.06] p-2 min-w-[140px]"
        data-testid={`workstream-row-${workstream.id}`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 w-full text-left group"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )}
          <span 
            className="w-2 h-2 rounded-full flex-shrink-0" 
            style={{ backgroundColor: workstream.color }}
          />
          <span className="text-[11px] font-medium text-foreground truncate">
            {workstream.name}
          </span>
        </button>
      </div>
      
      {isExpanded && weekDays.map((day, dayIndex) => (
        <DroppableCell
          key={dayIndex}
          workstreamId={workstream.id}
          dayIndex={dayIndex}
          isToday={isToday(day)}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
        />
      ))}
      
      {!isExpanded && (
        <div 
          className="col-span-7 border-b border-white/[0.06] h-8 bg-white/[0.01] cursor-pointer"
          onClick={() => setIsExpanded(true)}
        />
      )}
    </>
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
    data: { workstreamId: "backlog", dayIndex: -1 },
  });

  return (
    <div
      className="mt-4 glassmorphic rounded-[22px] border border-white/[0.08] shadow-xl relative overflow-hidden"
      data-testid="backlog-section"
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
            data-testid="add-task-backlog"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {backlogTasks.map(task => (
              <DraggableTaskCard 
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

interface WeeklyGridTableProps {
  onOpenSettings?: () => void;
}

export default function WeeklyGridTable({ onOpenSettings }: WeeklyGridTableProps) {
  const { workstreams, tasks, moveTask } = useWorkflow();
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
    const overData = over.data.current as { workstreamId: string; dayIndex: number } | undefined;
    
    if (overData && task) {
      if (overData.workstreamId === "backlog") {
        moveTask(taskId, task.workstreamId, -1);
      } else {
        moveTask(taskId, overData.workstreamId, overData.dayIndex);
      }
    }
  };

  const handleAddTask = (workstreamId: string, dayIndex: number) => {
    setEditingTask(null);
    setNewTaskContext({ workstreamId, dayIndex });
    setIsDialogOpen(true);
  };

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

  const handleAddBacklogTask = () => {
    setEditingTask(null);
    setNewTaskContext({ workstreamId: workstreams[0]?.id || "", dayIndex: -1 });
    setIsDialogOpen(true);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-0">
        <div 
          className="glassmorphic rounded-[22px] border border-white/[0.08] shadow-xl relative overflow-hidden panel-glow"
          data-testid="weekly-grid-table"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2.5 p-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-[16px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Weekly Board
                </h2>
                <p className="text-[12px] text-muted-foreground">
                  Organize tasks by workstream and day - drag cards to move them
                </p>
              </div>
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
                  data-testid="button-workstream-settings"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="overflow-auto">
              <div 
                className="grid min-w-[900px]"
                style={{ gridTemplateColumns: "140px repeat(7, 1fr)" }}
              >
                <div className="sticky left-0 top-0 z-20 glassmorphic border-r border-b border-white/[0.06] p-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Workstream
                  </span>
                </div>
                
                {weekDays.map((day, index) => {
                  const isTodayCol = isToday(day);
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "sticky top-0 z-10 border-r border-b border-white/[0.06] p-2 text-center",
                        isTodayCol ? "bg-primary/[0.08]" : "bg-black/40"
                      )}
                      data-testid={`header-day-${index}`}
                    >
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {format(day, "EEE")}
                      </div>
                      <div className={cn(
                        "text-[12px] font-medium",
                        isTodayCol ? "text-primary" : "text-foreground"
                      )}>
                        {format(day, "MMM d")}
                      </div>
                      {isTodayCol && (
                        <span className="inline-block mt-0.5 text-[8px] uppercase tracking-widest text-primary bg-primary/20 rounded-full px-1.5 py-0.5">
                          Today
                        </span>
                      )}
                    </div>
                  );
                })}

                {workstreams.map(workstream => (
                  <WorkstreamRow
                    key={workstream.id}
                    workstream={workstream}
                    weekDays={weekDays}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <DroppableBacklog
          onAddTask={handleAddBacklogTask}
          onEditTask={handleEditTask}
        />
      </div>

      <TaskEditDialog
        task={editingTask}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        defaultDayIndex={newTaskContext?.dayIndex}
        defaultWorkstreamId={newTaskContext?.workstreamId}
      />

      <DragOverlay>
        {activeTask && <TaskCardOverlay task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
