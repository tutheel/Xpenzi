import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import groupsRouter from "./routes/groups.js";
import expensesRouter from "./routes/expenses.js";
const app = express();
const PORT = process.env.PORT || 4000;
// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
// Parse JSON bodies
app.use(express.json());
// Clerk authentication middleware
app.use(clerkMiddleware());
// Health check
app.get("/api/healthz", (_req, res) => {
    res.json({ status: "ok" });
});
// API routes
app.use("/api/groups", groupsRouter);
app.use("/api/expenses", expensesRouter);
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
