import { cn } from "@/lib/utils";
import type { TaskCategory } from "./TaskInput";

type FilterCategory = TaskCategory | "All";

interface CategoryFilterProps {
  selected: FilterCategory;
  onSelect: (category: FilterCategory) => void;
}

const categories: { value: FilterCategory; label: string; dotClass: string }[] = [
  { value: "All", label: "All", dotClass: "bg-white/50" },
  { value: "Core", label: "Core Product", dotClass: "bg-category-core" },
  { value: "Ops", label: "Ops / GTM", dotClass: "bg-category-ops" },
  { value: "Strategy", label: "Strategy", dotClass: "bg-category-strategy" },
  { value: "People", label: "People", dotClass: "bg-category-people" },
];

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-1.5 flex-wrap text-[11px] mb-1.5" data-testid="category-filter">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={cn(
            "rounded-full py-1 px-2.5 cursor-pointer inline-flex items-center gap-1 transition-all duration-150",
            "bg-white/[0.02] border border-white/[0.1] text-muted-foreground",
            selected === cat.value && "bg-primary/[0.22] border-primary/80 text-blue-100 translate-y-[-1px]"
          )}
          data-testid={`button-filter-${cat.value.toLowerCase()}`}
        >
          <span className={cn("w-[7px] h-[7px] rounded-full", cat.dotClass)} />
          {cat.label}
        </button>
      ))}
    </div>
  );
}
