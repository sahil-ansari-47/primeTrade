import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { env } from "./config/env";
import { initMongo } from "./db/mongo";
import { authMiddleware, signToken, AuthenticatedRequest } from "./middleware/auth";
import { User } from "./models/user";
import { Task } from "./models/task";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Register endpoint - creates a user with hashed password and returns a JWT
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = signToken({ userId: user._id.toString() });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Login endpoint - verifies email/password using bcrypt and returns a JWT
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ userId: user._id.toString() });

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Auth/me endpoint - returns the current authenticated user's info
app.get("/auth/me", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId).select("_id email createdAt updatedAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("Auth/me error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Simple logout endpoint (for completeness; with JWTs this is usually handled client-side)
app.post("/auth/logout", (_req, res) => {
  // For stateless JWT auth, logout is typically handled by the client deleting the token.
  return res.status(200).json({ message: "Logged out" });
});

// ----- Protected task routes (CRUD) -----

// List tasks for the authenticated user
app.get("/tasks", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tasks = await Task.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.json({ tasks });
  } catch (err) {
    console.error("List tasks error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new task
app.post("/tasks", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title } = req.body;
    const trimmedTitle = typeof title === "string" ? title.trim() : "";

    if (!trimmedTitle) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      userId: req.user.userId,
      title: trimmedTitle,
    });

    return res.status(201).json({ task });
  } catch (err) {
    console.error("Create task error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update an existing task (title and/or completed)
app.patch("/tasks/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const updates: Partial<{ title: string; completed: boolean }> = {};

    if (typeof req.body.title === "string") {
      const trimmedTitle = req.body.title.trim();
      if (!trimmedTitle) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      updates.title = trimmedTitle;
    }

    if (typeof req.body.completed !== "undefined") {
      updates.completed = Boolean(req.body.completed);
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updates,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({ task });
  } catch (err) {
    console.error("Update task error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a task
app.delete("/tasks/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Delete task error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

async function bootstrap() {
  try {
    await initMongo();

    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

bootstrap();

