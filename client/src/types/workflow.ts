export interface Workstream {
  id: string;
  userId: string;
  name: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface WorkstreamLabel {
  id: string;
  userId: string;
  workstreamId: string;
  name: string;
  color: string;
}

export type Priority = "P0" | "P1" | "P2" | "none";

export interface Task {
  id: string;
  userId: string;
  title: string;
  workstreamId: string;
  dayIndex: number;
  weekOf: string | null;
  completed: boolean;
  labelIds: string[];
  priority: string;
  description?: string | null;
  externalLink?: string | null;
  timeEstimate?: string | null;
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  P0: "#ff453a",
  P1: "#ff9f0a",
  P2: "#ffd60a",
  none: "transparent",
};

export function getWorkstreamById(workstreams: Workstream[], id: string): Workstream | undefined {
  return workstreams.find(ws => ws.id === id);
}

export function getLabelsByWorkstream(labels: WorkstreamLabel[], workstreamId: string): WorkstreamLabel[] {
  return labels.filter(label => label.workstreamId === workstreamId);
}

export function getLabelsById(labels: WorkstreamLabel[], ids: string[]): WorkstreamLabel[] {
  return labels.filter(label => ids.includes(label.id));
}
