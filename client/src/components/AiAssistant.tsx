import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWorkflow } from "@/context/WorkflowContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Mail,
  MessageSquare,
  Check,
  X,
  Loader2,
  Zap,
  RefreshCw,
  ArrowRight,
  CircleDot,
  ClipboardPaste,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationStatus {
  gmail: { connected: boolean; label: string };
  slack: { connected: boolean; label: string };
  jira: { connected: boolean; label: string };
}

interface AiSuggestion {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  suggestedWorkstreamId: string | null;
  suggestedDayIndex: number;
  priority: string;
  source: string;
  sourcePreview: string | null;
  status: string;
  createdAt: string;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SOURCE_CONFIG: Record<string, { icon: typeof Mail; label: string; color: string }> = {
  gmail: { icon: Mail, label: "Gmail", color: "text-red-500" },
  slack: { icon: MessageSquare, label: "Slack", color: "text-purple-500" },
  jira: { icon: CircleDot, label: "Jira", color: "text-blue-500" },
  general: { icon: Sparkles, label: "AI", color: "text-amber-500" },
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-600 border-red-500/25",
  high: "bg-orange-500/15 text-orange-600 border-orange-500/25",
  medium: "bg-yellow-500/15 text-yellow-600 border-yellow-500/25",
  low: "bg-blue-500/15 text-blue-600 border-blue-500/25",
  none: "bg-muted text-muted-foreground border-border",
};

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [pastedContext, setPastedContext] = useState("");
  const queryClient = useQueryClient();
  const { workstreams } = useWorkflow();

  const { data: integrations } = useQuery<IntegrationStatus>({
    queryKey: ["/api/integrations/status"],
    enabled: isOpen,
  });

  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery<AiSuggestion[]>({
    queryKey: ["/api/ai/suggestions"],
    enabled: isOpen,
  });

  const generateMutation = useMutation({
    mutationFn: (context?: string) =>
      apiRequest("POST", "/api/ai/suggest", context ? { context } : {}).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/suggestions"] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PATCH", `/api/ai/suggestions/${id}/accept`).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PATCH", `/api/ai/suggestions/${id}/decline`).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/suggestions"] });
    },
  });

  const pendingSuggestions = suggestions.filter(s => s.status === "pending");

  const getWorkstreamForSuggestion = (suggestion: AiSuggestion) => {
    if (!suggestion.suggestedWorkstreamId) return null;
    return workstreams.find(ws => ws.id === suggestion.suggestedWorkstreamId);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "w-12 h-12 rounded-full",
          "bg-gradient-to-br from-primary/80 to-primary/40",
          "border border-primary/30",
          "shadow-lg shadow-primary/20",
          "flex items-center justify-center",
          "transition-all duration-200",
          "hover:scale-105 hover:shadow-primary/30",
          "active:scale-95",
          "group"
        )}
        data-testid="button-ai-assistant"
      >
        <Sparkles className="w-5 h-5 text-primary-foreground group-hover:rotate-12 transition-transform" />
        {pendingSuggestions.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
            {pendingSuggestions.length}
          </span>
        )}
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className={cn(
            "w-[400px] sm:w-[440px] p-0 border-l border-border",
            "bg-card"
          )}
          data-testid="ai-assistant-panel"
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-[14px] font-semibold text-foreground">
                    AI Assistant
                  </SheetTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Smart task suggestions from your tools
                  </p>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="p-5 space-y-5">
                <div className="space-y-2">
                  <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Connected Sources
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {integrations && Object.entries(integrations).map(([key, info]) => {
                      const config = SOURCE_CONFIG[key];
                      if (!config) return null;
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-3 rounded-lg",
                            "border transition-colors",
                            info.connected
                              ? "bg-muted/50 border-border"
                              : "bg-muted/20 border-border opacity-60"
                          )}
                          data-testid={`integration-${key}`}
                        >
                          <Icon className={cn("w-4 h-4", config.color)} />
                          <span className="text-[10px] text-muted-foreground">
                            {info.label}
                          </span>
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-full",
                            info.connected
                              ? "bg-green-500/10 text-green-600"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {info.connected ? "Connected" : "Not linked"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="space-y-2">
                  <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Paste Context
                  </h3>
                  <p className="text-[10px] text-muted-foreground/60">
                    Paste emails, Slack threads, Jira tickets, or meeting notes for smarter suggestions
                  </p>
                  <Textarea
                    value={pastedContext}
                    onChange={(e) => setPastedContext(e.target.value)}
                    placeholder="Paste an email, Slack message, Jira ticket, meeting notes..."
                    className={cn(
                      "min-h-[80px] max-h-[200px] resize-y text-[12px]",
                      "bg-muted/30 border-border",
                      "placeholder:text-muted-foreground/40",
                      "focus-visible:ring-primary/30"
                    )}
                    data-testid="input-ai-context"
                  />
                  {pastedContext.length > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-muted-foreground/50">
                        {pastedContext.length.toLocaleString()} / 10,000 chars
                      </span>
                      <button
                        onClick={() => setPastedContext("")}
                        className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        data-testid="button-clear-context"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                <Separator className="bg-border" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Suggestions
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => generateMutation.mutate(pastedContext || undefined)}
                      disabled={generateMutation.isPending}
                      className="h-7 text-[11px] gap-1.5"
                      data-testid="button-generate-suggestions"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Thinking...
                        </>
                      ) : (
                        <>
                          {pendingSuggestions.length > 0 ? (
                            <RefreshCw className="w-3 h-3" />
                          ) : (
                            <Zap className="w-3 h-3" />
                          )}
                          {pendingSuggestions.length > 0 ? "Refresh" : "Generate"}
                        </>
                      )}
                    </Button>
                  </div>

                  {generateMutation.isPending && pendingSuggestions.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Analyzing your workstreams and tasks...
                      </p>
                    </div>
                  )}

                  {!generateMutation.isPending && pendingSuggestions.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                      <p className="text-[12px] text-muted-foreground">
                        No suggestions yet
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 max-w-[220px]">
                        Paste context above or just click Generate to get AI-powered task recommendations
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {pendingSuggestions.map((suggestion) => {
                      const ws = getWorkstreamForSuggestion(suggestion);
                      const sourceConfig = SOURCE_CONFIG[suggestion.source] || SOURCE_CONFIG.general;
                      const SourceIcon = sourceConfig.icon;
                      const dayLabel = suggestion.suggestedDayIndex === -1
                        ? "Backlog"
                        : DAY_NAMES[suggestion.suggestedDayIndex] || "?";
                      const isAccepting = acceptMutation.isPending && acceptMutation.variables === suggestion.id;
                      const isDeclining = declineMutation.isPending && declineMutation.variables === suggestion.id;

                      return (
                        <div
                          key={suggestion.id}
                          className={cn(
                            "rounded-lg border border-border bg-card p-3",
                            "transition-all duration-150",
                            (isAccepting || isDeclining) && "opacity-50"
                          )}
                          data-testid={`suggestion-${suggestion.id}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-[12px] font-medium text-foreground leading-snug flex-1">
                              {suggestion.title}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => acceptMutation.mutate(suggestion.id)}
                                disabled={isAccepting || isDeclining}
                                className="h-6 w-6 text-green-600 hover:text-green-500"
                                data-testid={`button-accept-${suggestion.id}`}
                              >
                                {isAccepting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => declineMutation.mutate(suggestion.id)}
                                disabled={isAccepting || isDeclining}
                                className="h-6 w-6 text-red-500 hover:text-red-400"
                                data-testid={`button-decline-${suggestion.id}`}
                              >
                                {isDeclining ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {suggestion.description && (
                            <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                              {suggestion.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-1.5">
                            {ws && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: ws.color }}
                                />
                                <span className="text-muted-foreground truncate max-w-[100px]">
                                  {ws.name}
                                </span>
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                              <ArrowRight className="w-2.5 h-2.5" />
                              {dayLabel}
                            </span>

                            {suggestion.priority !== "none" && (
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded border",
                                PRIORITY_COLORS[suggestion.priority] || PRIORITY_COLORS.none
                              )}>
                                {suggestion.priority}
                              </span>
                            )}

                            <span className={cn(
                              "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border",
                              sourceConfig.color
                            )}>
                              <SourceIcon className="w-2.5 h-2.5" />
                              {sourceConfig.label}
                            </span>
                          </div>

                          {suggestion.sourcePreview && (
                            <p className="text-[10px] text-muted-foreground/60 mt-2 italic leading-relaxed">
                              {suggestion.sourcePreview}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="px-5 py-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground/50 text-center">
                Suggestions are generated by AI and may need adjustments
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
