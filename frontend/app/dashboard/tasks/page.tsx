"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { createTask, deleteTask, listTasks, updateTask } from "../../../lib/tasksApi";
import type { Task } from "../../../lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [newTitle, setNewTitle] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editTask, setEditTask] = React.useState<Task | null>(null);
  const [editTitle, setEditTitle] = React.useState("");

  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const items = await listTasks();
      setTasks(items);
    } catch (err: any) {
      setError(err?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onCreate = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setError(null);
    try {
      const created = await createTask(title);
      setTasks((prev) => [created, ...prev]);
      setNewTitle("");
    } catch (err: any) {
      setError(err?.message || "Failed to create task");
    }
  };

  const onToggle = async (t: Task) => {
    setError(null);
    try {
      const updated = await updateTask(t.id, { completed: !t.completed });
      setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch (err: any) {
      setError(err?.message || "Failed to update task");
    }
  };

  const onDelete = async (t: Task) => {
    setError(null);
    try {
      await deleteTask(t.id);
      setTasks((prev) => prev.filter((x) => x.id !== t.id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete task");
    }
  };

  const openEdit = (t: Task) => {
    setEditTask(t);
    setEditTitle(t.title);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditTask(null);
    setEditTitle("");
  };

  const saveEdit = async () => {
    if (!editTask) return;
    const title = editTitle.trim();
    if (!title) return;
    setError(null);
    try {
      const updated = await updateTask(editTask.id, { title });
      setTasks((prev) => prev.map((x) => (x.id === editTask.id ? updated : x)));
      closeEdit();
    } catch (err: any) {
      setError(err?.message || "Failed to update task");
    }
  };

  const showSetupHint =
    error &&
    (error.includes("404") ||
      error.toLowerCase().includes("not found"));

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Tasks
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create, edit, complete, and delete tasks.
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            {showSetupHint ? (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  It looks like your backend doesn&apos;t expose `/tasks` yet. This page expects:
                  GET/POST `/tasks` and PATCH/DELETE `/tasks/:id` (JWT Bearer protected).
                </Typography>
              </Box>
            ) : null}
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <TextField
            label="New task"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            fullWidth
            onKeyDown={(e) => {
              if (e.key === "Enter") onCreate();
            }}
          />
          <Button startIcon={<AddIcon />} onClick={onCreate} sx={{ flexShrink: 0 }}>
            Add
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : tasks.length === 0 ? (
          <Typography color="text.secondary">No tasks yet. Add your first task above.</Typography>
        ) : (
          <List>
            {tasks.map((t) => (
              <ListItem key={t.id} divider>
                <Checkbox checked={t.completed} onChange={() => onToggle(t)} />
                <ListItemText
                  primary={t.title}
                  secondary={
                    t.createdAt ? `Created: ${new Date(t.createdAt).toLocaleString()}` : undefined
                  }
                  primaryTypographyProps={{
                    sx: { textDecoration: t.completed ? "line-through" : "none" },
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton aria-label="edit" onClick={() => openEdit(t)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => onDelete(t)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit task</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={closeEdit}>
            Cancel
          </Button>
          <Button onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

