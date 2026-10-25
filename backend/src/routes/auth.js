
import express from "express";

import {
  login,
  getMe,
} from "../controllers/auth.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.js";

const router = express.Router();

// Staff login
router.post("/login", login);

// Get logged-in staff profile
router.get("/me", authenticate, getMe);

// Admin-only test
router.get(
  "/admin-test",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
    res.json({
      message: "Welcome Admin",
      user: req.user,
    });
  }
);

// Kitchen access test
router.get(
  "/kitchen-test",
  authenticate,
  authorize("ADMIN", "KITCHEN_STAFF"),
  (req, res) => {
    res.json({
      message: "Kitchen access granted",
      user: req.user,
    });
  }
);

export default router;
