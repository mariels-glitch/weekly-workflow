import { useState, useEffect } from "react";
import { X, Plus, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkflow } from "@/context/WorkflowContext";
import type { Task, Priority, WorkstreamLabel } from "@/types/workflow";
import { PRIORITY_COLORS } from "@/types/workflow";

interface TaskEditDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  defaultDayIndex?: number;
  defaultWorkstreamId?: string;
}

export default function TaskEditDialog({ 
  task, 
  isOpen, 
  onClose,
  defaultDayIndex = 0,
  defaultWorkstreamId,
}: TaskEditDialogProps) {
  const { workstreams, labels, addTask, updateTask, deleteTask, addLabel, getLabelsForWorkstream } = useWorkflow();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workstreamId, setWorkstreamId] = useState("");
  const [dayIndex, setDayIndex] = useState(0);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>("none");
  const [externalLink, setExternalLink] = useState("");
  const [showNewLabel, setShowNewLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#0a84ff");

  const isEditing = task !== null;
  const availableLabels = getLabelsForWorkstream(workstreamId);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setWorkstreamId(task.workstreamId);
      setDayIndex(task.dayIndex);
      setSelectedLabels(task.labelIds);
      setPriority(task.priority);
      setExternalLink(task.externalLink || "");
    } else {
      setTitle("");
      setDescription("");
      setWorkstreamId(defaultWorkstreamId || workstreams[0]?.id || "");
      setDayIndex(defaultDayIndex);
      setSelectedLabels([]);
      setPriority("none");
      setExternalLink("");
    }
    setShowNewLabel(false);
    setNewLabelName("");
  }, [task, isOpen, defaultDayIndex, defaultWorkstreamId, workstreams]);

  const handleSave = () => {
    if (!title.trim() || !workstreamId) return;

    const taskData = {
      title: title.trim(),
      description,
      workstreamId,
      dayIndex,
      labelIds: selectedLabels,
      priority,
      externalLink: externalLink.trim() || undefined,
      completed: task?.completed ?? false,
    };

    if (isEditing && task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (task) {
      deleteTask(task.id);
      onClose();
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleAddLabel = () => {
    if (newLabelName.trim() && workstreamId) {
      addLabel({
        name: newLabelName.trim(),
        color: newLabelColor,
        workstreamId,
      });
      setNewLabelName("");
      setShowNewLabel(false);
    }
  };

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="glassmorphic border-white/[0.12] max-w-md"
        data-testid="task-edit-dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold text-foreground">
            {isEditing ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="bg-black/40 border-white/[0.12] text-[13px] focus-visible:ring-primary/50"
              autoFocus
              data-testid="input-task-title"
            />
          </div>

          <div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)..."
              className="bg-black/40 border-white/[0.12] text-[13px] min-h-[60px] resize-none focus-visible:ring-primary/50"
              data-testid="input-task-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Workstream
              </label>
              <Select value={workstreamId} onValueChange={setWorkstreamId}>
                <SelectTrigger 
                  className="bg-black/40 border-white/[0.12] text-[12px] h-9"
                  data-testid="select-workstream"
                >
                  <SelectValue placeholder="Select workstream" />
                </SelectTrigger>
                <SelectContent>
                  {workstreams.map(ws => (
                    <SelectItem key={ws.id} value={ws.id}>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: ws.color }}
                        />
                        {ws.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Day
              </label>
              <Select value={dayIndex.toString()} onValueChange={(v) => setDayIndex(parseInt(v))}>
                <SelectTrigger 
                  className="bg-black/40 border-white/[0.12] text-[12px] h-9"
                  data-testid="select-day"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayLabels.map((day, i) => (
                    <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Priority
            </label>
            <div className="flex gap-1.5" data-testid="priority-selector">
              {(["none", "P0", "P1", "P2"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium border transition-all duration-150",
                    priority === p 
                      ? "border-white/30" 
                      : "border-transparent bg-white/[0.04]",
                    p === "none" && "text-muted-foreground",
                  )}
                  style={{ 
                    backgroundColor: priority === p && p !== "none" ? `${PRIORITY_COLORS[p]}30` : undefined,
                    color: p !== "none" ? PRIORITY_COLORS[p] : undefined,
                    borderColor: priority === p && p !== "none" ? PRIORITY_COLORS[p] : undefined,
                  }}
                  data-testid={`button-priority-${p}`}
                >
                  {p === "none" ? "None" : p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Labels
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[32px]" data-testid="labels-selector">
              {availableLabels.map(label => (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] border transition-all duration-150",
                    selectedLabels.includes(label.id) 
                      ? "border-white/30" 
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                  style={{ 
                    backgroundColor: `${label.color}30`,
                    color: label.color,
                    borderColor: selectedLabels.includes(label.id) ? label.color : undefined,
                  }}
                  data-testid={`button-label-${label.id}`}
                >
                  {label.name}
                </button>
              ))}
              
              {showNewLabel ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name"
                    className="h-7 w-24 bg-black/40 border-white/[0.12] text-[11px]"
                    onKeyDown={(e) => e.key === "Enter" && handleAddLabel()}
                    data-testid="input-new-label"
                  />
                  <input
                    type="color"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0"
                    data-testid="input-label-color"
                  />
                  <Button size="sm" onClick={handleAddLabel} className="h-7 px-2">
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setShowNewLabel(false)}
                    className="h-7 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewLabel(true)}
                  className="rounded-full px-2 py-1 text-[11px] text-muted-foreground border border-dashed border-white/[0.12] hover:border-white/30 transition-all"
                  data-testid="button-add-label"
                >
                  <Plus className="w-3 h-3 inline mr-0.5" />
                  Add label
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
              External Link
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://..."
                className="bg-black/40 border-white/[0.12] text-[12px] pl-8 focus-visible:ring-primary/50"
                data-testid="input-external-link"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-white/[0.08]">
          {isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              data-testid="button-delete-task"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              className="gradient-primary"
              disabled={!title.trim() || !workstreamId}
              data-testid="button-save-task"
            >
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
