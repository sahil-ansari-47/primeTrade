import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { initMongo } from "./db/mongo";
import { authMiddleware, signToken, AuthenticatedRequest } from "./middleware/auth";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Example public route that issues a JWT for a fake user
app.post("/auth/login", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  const token = signToken({ userId: String(userId) });
  res.json({ token });
});

// Example protected route
app.get("/protected", authMiddleware, (req: AuthenticatedRequest, res) => {
  res.json({
    message: "You have accessed a protected route",
    user: req.user,
  });
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

