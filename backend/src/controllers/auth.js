
import {
  loginStaff,
} from "../services/auth.js";

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await loginStaff(
      email.trim(),
      password
    );

    if (result.status !== 200) {
      return res.status(result.status).json({
        message: result.message,
      });
    }

    return res.status(200).json({
      message: "Login successful",
      ...result.data,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};
