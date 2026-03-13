import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TaskCategory = "Core" | "Ops" | "Strategy" | "People";

interface TaskInputProps {
  onAddTask: (title: string, category: TaskCategory) => void;
  selectedDayLabel?: string;
}

export default function TaskInput({ onAddTask, selectedDayLabel = "This week" }: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Core");

  const handleSubmit = () => {
    if (title.trim()) {
      onAddTask(title.trim(), category);
      setTitle("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div 
      className="flex items-center gap-2 bg-muted rounded-[16px] p-2 md:p-2.5 border border-border mb-2.5"
      data-testid="task-input-container"
    >
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex gap-1.5 items-center">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Capture a concrete outcome (e.g. Ship v1 of Smart Card MVP)"
            className="flex-1 bg-transparent border-0 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-1 px-0"
            data-testid="input-task-title"
          />
          <Select value={category} onValueChange={(val) => setCategory(val as TaskCategory)}>
            <SelectTrigger 
              className="w-auto min-w-[100px] h-auto rounded-full border border-border bg-background text-[11px] text-muted-foreground px-2 py-1"
              data-testid="select-category-trigger"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent data-testid="select-category-content">
              <SelectItem value="Core" data-testid="option-category-core">Core Product</SelectItem>
              <SelectItem value="Ops" data-testid="option-category-ops">Ops / GTM</SelectItem>
              <SelectItem value="Strategy" data-testid="option-category-strategy">Strategy</SelectItem>
              <SelectItem value="People" data-testid="option-category-people">People / Hiring</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 text-[11px] text-muted-foreground flex-wrap">
          <span className="rounded-full bg-background px-2 py-0.5 border border-border" data-testid="text-selected-day">
            {selectedDayLabel}
          </span>
          <span className="rounded-full bg-background px-2 py-0.5 border border-border">
            Cmd + Enter to add
          </span>
        </div>
      </div>
      <Button
        onClick={handleSubmit}
        size="icon"
        className="rounded-full w-7 h-7 gradient-primary glow-primary text-white flex-shrink-0 transition-all duration-150 hover:translate-y-[-1px] hover:scale-[1.03] hover:brightness-105"
        data-testid="button-add-task"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
