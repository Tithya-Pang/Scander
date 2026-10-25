
import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.js";

const app = express();

// Global middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json({ limit: "100kb" }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Scander backend is running",
  });
});

// Authentication routes
app.use("/auth", authRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

export default app;
