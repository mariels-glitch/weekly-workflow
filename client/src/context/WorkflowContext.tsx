import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Workstream {
  id: string;
  userId: string;
  name: string;
  color: string;
  order: number;
  isActive: boolean;
}

interface WorkstreamLabel {
  id: string;
  userId: string;
  workstreamId: string;
  name: string;
  color: string;
}

type Priority = "P0" | "P1" | "P2" | "none";

interface Task {
  id: string;
  userId: string;
  title: string;
  workstreamId: string;
  dayIndex: number;
  completed: boolean;
  labelIds: string[];
  priority: string;
  description?: string | null;
  externalLink?: string | null;
  timeEstimate?: string | null;
}

interface WorkflowContextValue {
  tasks: Task[];
  workstreams: Workstream[];
  labels: WorkstreamLabel[];
  isLoading: boolean;
  addTask: (task: Omit<Task, "id" | "userId">) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "userId">>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  moveTask: (taskId: string, newWorkstreamId: string, newDayIndex: number) => void;
  addWorkstream: (workstream: Omit<Workstream, "id" | "userId" | "order">) => void;
  updateWorkstream: (id: string, updates: Partial<Omit<Workstream, "id" | "userId">>) => void;
  deleteWorkstream: (id: string) => void;
  reorderWorkstreams: (orderedIds: string[]) => void;
  addLabel: (label: Omit<WorkstreamLabel, "id" | "userId">) => void;
  updateLabel: (id: string, updates: Partial<Omit<WorkstreamLabel, "id" | "userId">>) => void;
  deleteLabel: (id: string) => void;
  getTasksForCell: (workstreamId: string, dayIndex: number) => Task[];
  getBacklogTasks: () => Task[];
  getLabelsForWorkstream: (workstreamId: string) => WorkstreamLabel[];
  getWorkstream: (id: string) => Workstream | undefined;
  getLabel: (id: string) => WorkstreamLabel | undefined;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: workstreamsRaw = [], isLoading: wsLoading } = useQuery<Workstream[]>({
    queryKey: ["/api/workstreams"],
  });

  const { data: labels = [], isLoading: labelsLoading } = useQuery<WorkstreamLabel[]>({
    queryKey: ["/api/labels"],
  });

  const isLoading = tasksLoading || wsLoading || labelsLoading;

  const workstreams = useMemo(() => {
    return [...workstreamsRaw].filter(ws => ws.isActive).sort((a, b) => a.order - b.order);
  }, [workstreamsRaw]);

  const createTaskMutation = useMutation({
    mutationFn: (task: Omit<Task, "id" | "userId">) =>
      apiRequest("POST", "/api/tasks", task).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Task, "id" | "userId">> }) =>
      apiRequest("PATCH", `/api/tasks/${id}`, updates).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });

  const createWsMutation = useMutation({
    mutationFn: (ws: Omit<Workstream, "id" | "userId" | "order">) =>
      apiRequest("POST", "/api/workstreams", { ...ws, order: workstreamsRaw.length }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/workstreams"] }),
  });

  const updateWsMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Workstream, "id" | "userId">> }) =>
      apiRequest("PATCH", `/api/workstreams/${id}`, updates).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/workstreams"] }),
  });

  const deleteWsMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/workstreams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workstreams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/labels"] });
    },
  });

  const reorderWsMutation = useMutation({
    mutationFn: (orderedIds: string[]) =>
      apiRequest("PUT", "/api/workstreams/reorder", { orderedIds }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/workstreams"] }),
  });

  const createLabelMutation = useMutation({
    mutationFn: (label: Omit<WorkstreamLabel, "id" | "userId">) =>
      apiRequest("POST", "/api/labels", label).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/labels"] }),
  });

  const updateLabelMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<WorkstreamLabel, "id" | "userId">> }) =>
      apiRequest("PATCH", `/api/labels/${id}`, updates).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/labels"] }),
  });

  const deleteLabelMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/labels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/labels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const addTask = useCallback((task: Omit<Task, "id" | "userId">) => {
    createTaskMutation.mutate(task);
  }, [createTaskMutation]);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, "id" | "userId">>) => {
    updateTaskMutation.mutate({ id, updates });
  }, [updateTaskMutation]);

  const deleteTask = useCallback((id: string) => {
    deleteTaskMutation.mutate(id);
  }, [deleteTaskMutation]);

  const toggleTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTaskMutation.mutate({ id, updates: { completed: !task.completed } });
    }
  }, [tasks, updateTaskMutation]);

  const moveTask = useCallback((taskId: string, newWorkstreamId: string, newDayIndex: number) => {
    if (!taskId || !newWorkstreamId || newDayIndex < -1 || newDayIndex > 6) {
      return;
    }
    updateTaskMutation.mutate({ id: taskId, updates: { workstreamId: newWorkstreamId, dayIndex: newDayIndex } });
  }, [updateTaskMutation]);

  const addWorkstream = useCallback((workstream: Omit<Workstream, "id" | "userId" | "order">) => {
    createWsMutation.mutate(workstream);
  }, [createWsMutation]);

  const updateWorkstream = useCallback((id: string, updates: Partial<Omit<Workstream, "id" | "userId">>) => {
    updateWsMutation.mutate({ id, updates });
  }, [updateWsMutation]);

  const deleteWorkstream = useCallback((id: string) => {
    deleteWsMutation.mutate(id);
  }, [deleteWsMutation]);

  const reorderWorkstreams = useCallback((orderedIds: string[]) => {
    reorderWsMutation.mutate(orderedIds);
  }, [reorderWsMutation]);

  const addLabel = useCallback((label: Omit<WorkstreamLabel, "id" | "userId">) => {
    createLabelMutation.mutate(label);
  }, [createLabelMutation]);

  const updateLabel = useCallback((id: string, updates: Partial<Omit<WorkstreamLabel, "id" | "userId">>) => {
    updateLabelMutation.mutate({ id, updates });
  }, [updateLabelMutation]);

  const deleteLabel = useCallback((id: string) => {
    deleteLabelMutation.mutate(id);
  }, [deleteLabelMutation]);

  const getTasksForCell = useCallback((workstreamId: string, dayIndex: number) => {
    return tasks.filter(t => t.workstreamId === workstreamId && t.dayIndex === dayIndex);
  }, [tasks]);

  const getBacklogTasks = useCallback(() => {
    return tasks.filter(t => t.dayIndex === -1);
  }, [tasks]);

  const getLabelsForWorkstream = useCallback((workstreamId: string) => {
    return labels.filter(l => l.workstreamId === workstreamId);
  }, [labels]);

  const getWorkstream = useCallback((id: string) => {
    return workstreamsRaw.find(ws => ws.id === id);
  }, [workstreamsRaw]);

  const getLabel = useCallback((id: string) => {
    return labels.find(l => l.id === id);
  }, [labels]);

  const value: WorkflowContextValue = {
    tasks,
    workstreams,
    labels,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    moveTask,
    addWorkstream,
    updateWorkstream,
    deleteWorkstream,
    reorderWorkstreams,
    addLabel,
    updateLabel,
    deleteLabel,
    getTasksForCell,
    getBacklogTasks,
    getLabelsForWorkstream,
    getWorkstream,
    getLabel,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
}
