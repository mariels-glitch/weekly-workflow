import { useState } from "react";
import { X, Plus, Trash2, GripVertical, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useWorkflow } from "@/context/WorkflowContext";
import type { Workstream, WorkstreamLabel } from "@/types/workflow";

const PRESET_COLORS = [
  "#ff453a", "#ff9f0a", "#ffd60a", "#32d74b", "#64d2ff", 
  "#0a84ff", "#5e5ce6", "#bf5af2", "#ff375f", "#ac8e68"
];

interface WorkstreamConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LabelEditorProps {
  label: WorkstreamLabel;
  onUpdate: (updates: Partial<WorkstreamLabel>) => void;
  onDelete: () => void;
}

function LabelEditor({ label, onUpdate, onDelete }: LabelEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(label.name);

  const handleSave = () => {
    if (name.trim()) {
      onUpdate({ name: name.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 py-1">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
            style={{ backgroundColor: label.color }}
            data-testid={`color-picker-${label.id}`}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 glassmorphic border-white/[0.12]">
          <div className="grid grid-cols-5 gap-1">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => onUpdate({ color })}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  label.color === color ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {isEditing ? (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="h-6 text-[11px] bg-black/40 border-white/[0.12] flex-1"
          autoFocus
        />
      ) : (
        <span 
          onClick={() => setIsEditing(true)}
          className="text-[11px] text-foreground cursor-pointer hover:text-primary flex-1"
        >
          {label.name}
        </span>
      )}

      <button
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive transition-colors"
        data-testid={`delete-label-${label.id}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

interface WorkstreamEditorProps {
  workstream: Workstream;
}

function WorkstreamEditor({ workstream }: WorkstreamEditorProps) {
  const { updateWorkstream, deleteWorkstream, getLabelsForWorkstream, addLabel, updateLabel, deleteLabel } = useWorkflow();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workstream.name);
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");

  const labels = getLabelsForWorkstream(workstream.id);

  const handleSaveName = () => {
    if (name.trim()) {
      updateWorkstream(workstream.id, { name: name.trim() });
    }
    setIsEditing(false);
  };

  const handleAddLabel = () => {
    if (newLabelName.trim()) {
      addLabel({
        name: newLabelName.trim(),
        color: workstream.color,
        workstreamId: workstream.id,
      });
      setNewLabelName("");
      setShowAddLabel(false);
    }
  };

  return (
    <div 
      className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-3"
      data-testid={`workstream-editor-${workstream.id}`}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
        
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
              style={{ backgroundColor: workstream.color }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 glassmorphic border-white/[0.12]">
            <div className="grid grid-cols-5 gap-1">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => updateWorkstream(workstream.id, { color })}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    workstream.color === color ? "border-white scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {isEditing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            className="h-7 text-[12px] bg-black/40 border-white/[0.12] flex-1"
            autoFocus
          />
        ) : (
          <span 
            onClick={() => setIsEditing(true)}
            className="text-[12px] font-medium text-foreground cursor-pointer hover:text-primary flex-1"
          >
            {workstream.name}
          </span>
        )}

        <div className="flex items-center gap-2">
          <Switch
            checked={workstream.isActive}
            onCheckedChange={(checked) => updateWorkstream(workstream.id, { isActive: checked })}
            className="scale-75"
            data-testid={`toggle-workstream-${workstream.id}`}
          />
          <button
            onClick={() => deleteWorkstream(workstream.id)}
            className="text-muted-foreground hover:text-destructive transition-colors"
            data-testid={`delete-workstream-${workstream.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="pl-6 space-y-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Labels
        </div>
        {labels.map(label => (
          <LabelEditor
            key={label.id}
            label={label}
            onUpdate={(updates) => updateLabel(label.id, updates)}
            onDelete={() => deleteLabel(label.id)}
          />
        ))}
        
        {showAddLabel ? (
          <div className="flex items-center gap-2 py-1">
            <Input
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddLabel()}
              placeholder="Label name"
              className="h-6 text-[11px] bg-black/40 border-white/[0.12] flex-1"
              autoFocus
            />
            <Button size="sm" onClick={handleAddLabel} className="h-6 px-2 text-[10px]">
              Add
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowAddLabel(false)}
              className="h-6 px-1"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddLabel(true)}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 py-1"
          >
            <Plus className="w-3 h-3" />
            Add label
          </button>
        )}
      </div>
    </div>
  );
}

export default function WorkstreamConfigurator({ isOpen, onClose }: WorkstreamConfiguratorProps) {
  const { workstreams, addWorkstream } = useWorkflow();
  const [showAddWorkstream, setShowAddWorkstream] = useState(false);
  const [newWorkstreamName, setNewWorkstreamName] = useState("");

  const allWorkstreams = [...workstreams].sort((a, b) => a.order - b.order);

  const handleAddWorkstream = () => {
    if (newWorkstreamName.trim()) {
      addWorkstream({
        name: newWorkstreamName.trim(),
        color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
        isActive: true,
      });
      setNewWorkstreamName("");
      setShowAddWorkstream(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="glassmorphic border-white/[0.12] max-w-lg max-h-[80vh] overflow-auto"
        data-testid="workstream-configurator"
      >
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Manage Workstreams
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {allWorkstreams.map(workstream => (
            <WorkstreamEditor key={workstream.id} workstream={workstream} />
          ))}

          {showAddWorkstream ? (
            <div className="rounded-xl border border-dashed border-white/[0.16] p-3 flex items-center gap-2">
              <Input
                value={newWorkstreamName}
                onChange={(e) => setNewWorkstreamName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddWorkstream()}
                placeholder="Workstream name"
                className="h-8 text-[12px] bg-black/40 border-white/[0.12] flex-1"
                autoFocus
              />
              <Button size="sm" onClick={handleAddWorkstream} className="gradient-primary">
                Add
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowAddWorkstream(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddWorkstream(true)}
              className="w-full rounded-xl border border-dashed border-white/[0.16] p-3 text-[12px] text-muted-foreground hover:text-foreground hover:border-white/30 transition-all flex items-center justify-center gap-1.5"
              data-testid="button-add-workstream"
            >
              <Plus className="w-4 h-4" />
              Add Workstream
            </button>
          )}
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-white/[0.08]">
          <Button onClick={onClose} data-testid="button-done">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
