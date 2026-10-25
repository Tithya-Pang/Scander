import {
  createSupabaseClient,
  adminSupabase,
} from "../config/supabase.js";

// Get staff profile from database
export const getStaffProfile = async (userId) => {
  const { data, error } = await adminSupabase
    .from("staff")
    .select("staff_id, full_name, role, restaurant_id, is_active")
    .eq("staff_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to retrieve staff profile");
  }

  return data;
};

// Login staff
export const loginStaff = async (email, password) => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user || !data?.session) {
    return {
      status: 401,
      message: "Invalid email or password",
    };
  }

  const staff = await getStaffProfile(data.user.id);

  if (!staff || !staff.is_active) {
    return {
      status: 403,
      message: "Staff account is not authorized",
    };
  }

  if (!["ADMIN", "KITCHEN_STAFF"].includes(staff.role)) {
    return {
      status: 403,
      message: "Invalid staff role",
    };
  }

  return {
    status: 200,
    data: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: staff.full_name,
        role: staff.role,
        restaurant_id: staff.restaurant_id,
      },
    },
  };
};
