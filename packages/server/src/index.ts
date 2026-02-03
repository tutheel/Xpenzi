import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import groupsRouter from "./routes/groups.js";
import expensesRouter from "./routes/expenses.js";

// Check required environment variables
const requiredEnvVars = ["CLERK_SECRET_KEY", "DATABASE_URL"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// CORS configuration
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

// Parse JSON bodies
app.use(express.json());

// Clerk authentication middleware - pass secretKey explicitly
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  }),
);

// Health check
app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok", clientUrl: CLIENT_URL });
});

// Debug auth endpoint
app.get("/api/debug/auth", (req, res) => {
  const { getAuth } = require("@clerk/express");
  const auth = getAuth(req);
  res.json({
    hasAuthHeader: !!req.headers.authorization,
    authHeaderPreview: req.headers.authorization
      ? `${req.headers.authorization.substring(0, 20)}...`
      : null,
    clerkAuth: {
      userId: auth.userId,
      sessionId: auth.sessionId,
    },
  });
});

// API routes
app.use("/api/groups", groupsRouter);
app.use("/api/expenses", expensesRouter);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Server Error]", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Accepting requests from: ${CLIENT_URL}`);
  console.log(`Clerk Secret Key: ${process.env.CLERK_SECRET_KEY ? process.env.CLERK_SECRET_KEY.substring(0, 15) + "..." : "MISSING"}`);
  console.log(`Clerk Publishable Key: ${process.env.CLERK_PUBLISHABLE_KEY ? process.env.CLERK_PUBLISHABLE_KEY.substring(0, 15) + "..." : "MISSING"}`);
});
