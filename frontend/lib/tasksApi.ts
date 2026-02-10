import { apiFetch } from "./api";
import type { Task } from "./types";

function mapTask(t: any): Task {
  return {
    id: String(t.id ?? t._id ?? ""),
    title: String(t.title ?? t.text ?? ""),
    completed: Boolean(t.completed ?? t.done ?? false),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export async function listTasks(): Promise<Task[]> {
  const res = await apiFetch<any>("/tasks", { method: "GET" });
  const items = Array.isArray(res) ? res : res?.tasks;
  return (items || []).map(mapTask);
}

export async function createTask(title: string): Promise<Task> {
  const res = await apiFetch<any>("/tasks", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  return mapTask(res?.task ?? res);
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<Task, "title" | "completed">>
): Promise<Task> {
  const res = await apiFetch<any>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return mapTask(res?.task ?? res);
}

export async function deleteTask(id: string): Promise<void> {
  await apiFetch<any>(`/tasks/${id}`, { method: "DELETE" });
}

