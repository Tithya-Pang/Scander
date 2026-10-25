import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.js";
import kitchenRoutes from "./routes/kitchen.js";
import menuRoutes from "./routes/menu.js";
import adminRoutes from "./routes/admin.js";

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

app.use("/kitchen", kitchenRoutes);
app.use("/menu", menuRoutes);
app.use("/admin", adminRoutes);
// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

export default app;
