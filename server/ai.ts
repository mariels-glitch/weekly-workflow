import Anthropic from "@anthropic-ai/sdk";
import type { Workstream, Task } from "@shared/schema";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

export interface SuggestedTask {
  title: string;
  description: string;
  suggestedWorkstreamName: string;
  suggestedDayIndex: number;
  priority: string;
  source: string;
  sourcePreview: string;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export async function generateTaskSuggestions(
  workstreams: Workstream[],
  existingTasks: Task[],
  connectedSources: { gmail: boolean; slack: boolean; jira: boolean },
  sourceData?: { gmail?: string; slack?: string; jira?: string; pasted?: string }
): Promise<SuggestedTask[]> {
  const activeWorkstreams = workstreams.filter(ws => ws.isActive);

  const workstreamList = activeWorkstreams
    .map(ws => `- "${ws.name}" (color: ${ws.color})`)
    .join("\n");

  const existingTaskSummary = existingTasks
    .filter(t => !t.completed)
    .map(t => {
      const ws = workstreams.find(w => w.id === t.workstreamId);
      const day = t.dayIndex === -1 ? "Backlog" : DAY_NAMES[t.dayIndex] || "Unknown";
      return `- "${t.title}" [${ws?.name || "Unknown"}] (${day}, priority: ${t.priority})`;
    })
    .join("\n");

  let sourceContext = "";
  if (sourceData?.gmail) {
    sourceContext += `\n\nRecent Gmail messages:\n${sourceData.gmail}`;
  }
  if (sourceData?.slack) {
    sourceContext += `\n\nRecent Slack messages:\n${sourceData.slack}`;
  }
  if (sourceData?.jira) {
    sourceContext += `\n\nRecent Jira issues:\n${sourceData.jira}`;
  }
  if (sourceData?.pasted) {
    sourceContext += `\n\nUser-provided context (pasted text — extract actionable tasks from this):\n${sourceData.pasted}`;
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  const currentDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const currentDayName = DAY_NAMES[currentDayIndex];

  const prompt = `You are a smart task management assistant for a product manager. Today is ${currentDayName}.

The user's workstreams (categories for organizing tasks):
${workstreamList}

Their current incomplete tasks:
${existingTaskSummary || "(No tasks yet)"}
${sourceContext}

Based on the user's workstreams, existing tasks, and any available data from connected services, suggest 3-5 actionable tasks that would be valuable for a product manager this week. Consider:
- Gaps in their current task coverage across workstreams
- Common PM activities they might be missing (standups, reviews, planning, etc.)
- Tasks that complement their existing work
- Appropriate prioritization and day assignment

For each suggestion, assign it to the most appropriate workstream from their list.
For dayIndex: use -1 for backlog, 0=Monday through 6=Sunday. Prefer scheduling tasks on ${currentDayName} (index ${currentDayIndex}) or later this week.

${!connectedSources.gmail && !connectedSources.slack && !connectedSources.jira
  ? "Note: No external services are connected yet. Base suggestions on their workstreams and existing tasks."
  : ""}

Respond ONLY with a JSON array. Each object must have:
{
  "title": "short task title",
  "description": "1-2 sentence description",
  "suggestedWorkstreamName": "exact name from their workstream list",
  "suggestedDayIndex": number,
  "priority": "none" | "low" | "medium" | "high" | "urgent",
  "source": "general" | "gmail" | "slack" | "jira",
  "sourcePreview": "brief context for why this was suggested"
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not parse suggestions from Claude response");
  }

  const suggestions: SuggestedTask[] = JSON.parse(jsonMatch[0]);
  return suggestions;
}
