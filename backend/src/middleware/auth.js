
import { createSupabaseClient } from "../config/supabase.js";
import { getStaffProfile } from "../services/auth.js";

// ==========================================
// 1. Authentication Middleware
// ==========================================

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token required",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token with Supabase Auth
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    // Retrieve staff information from database
    const staff = await getStaffProfile(data.user.id);

    if (!staff || !staff.is_active) {
      return res.status(403).json({
        message: "Staff access denied",
      });
    }

    // Attach authenticated user to request
    req.user = {
      id: data.user.id,
      email: data.user.email,
      full_name: staff.full_name,
      role: staff.role,
      restaurant_id: staff.restaurant_id,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "Authentication service unavailable",
    });
  }
};


// ==========================================
// 2. Role Authorization Middleware
// ==========================================

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};
