import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  userName?: string;
  userInitials?: string;
}

export default function AppHeader({ userName = "Product Manager", userInitials = "PM" }: AppHeaderProps) {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMM d");

  return (
    <header 
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-3.5 rounded-full glassmorphic-header border border-white/[0.16] shadow-xl"
      data-testid="app-header"
    >
      <div className="flex items-center gap-2.5">
        <div 
          className="w-7 h-7 rounded-[10px] gradient-primary glow-primary flex items-center justify-center text-white font-bold text-base"
          data-testid="brand-logo"
        >
          W
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-[15px] tracking-wide text-foreground" data-testid="text-brand-name">
            Weekly Workflow
          </span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-widest" data-testid="text-brand-subtitle">
            Product Management
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <div 
          className="rounded-full border border-white/[0.18] bg-black/40 text-muted-foreground text-[11px] px-2.5 py-1 inline-flex items-center gap-1.5"
          data-testid="status-pill"
        >
          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(10,132,255,0.18)]" />
          Focused week
        </div>
        <span className="text-[13px] text-muted-foreground" data-testid="text-today-date">
          {formattedDate}
        </span>
        <Avatar className="w-7 h-7 border border-white/[0.24] shadow-lg" data-testid="avatar-user">
          <AvatarFallback className="bg-gradient-to-br from-[#1f1f2b] to-[#101018] text-[12px] font-semibold text-foreground">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
