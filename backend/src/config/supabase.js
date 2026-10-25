
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !publishableKey || !secretKey) {
  throw new Error("Missing Supabase environment variables");
}

const authOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

// Regular Supabase client
export const createSupabaseClient = () =>
  createClient(supabaseUrl, publishableKey, authOptions);

// Server-only privileged client
export const adminSupabase = createClient(
  supabaseUrl,
  secretKey,
  authOptions
);

// Keep existing imports working
const supabase = createSupabaseClient();

export default supabase;
