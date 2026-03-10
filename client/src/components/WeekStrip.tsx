import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface WeekStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function WeekStrip({ selectedDate, onSelectDate }: WeekStripProps) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-7 gap-1.5 mb-3" data-testid="week-strip">
      {weekDays.map((day, index) => {
        const isSelected = isSameDay(day, selectedDate);
        const isTodayDate = isToday(day);

        return (
          <button
            key={index}
            onClick={() => onSelectDate(day)}
            className={cn(
              "rounded-[14px] py-2 px-1.5 text-center text-[11px] cursor-pointer select-none border transition-all duration-150",
              "bg-white/[0.02] border-transparent",
              "hover:translate-y-[-1px] hover:shadow-lg",
              isTodayDate && !isSelected && "border-white/[0.26]",
              isSelected && "gradient-primary border-transparent text-foreground glow-primary shadow-[0_18px_40px_rgba(10,132,255,0.5)]"
            )}
            data-testid={`button-day-${format(day, 'yyyy-MM-dd')}`}
          >
            <span className="block text-[10px] uppercase tracking-widest mb-0.5 opacity-70">
              {format(day, "EEE")}
            </span>
            <strong className="block text-[12px] font-medium">
              {format(day, "d")}
            </strong>
          </button>
        );
      })}
    </div>
  );
}
