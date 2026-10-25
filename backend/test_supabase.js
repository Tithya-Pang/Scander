
import "dotenv/config";
import supabase from "./src/config/supabase.js";

async function testConnection() {
  console.log("Testing Scander database connection...");

  const { data, error } = await supabase
    .from("restaurant")
    .select("restaurant_id, name")
    .limit(1);

  if (error) {
    console.error("Database error:", error.message);
    return;
  }

  console.log("Database connection successful!");
  console.log("Restaurant:", data);
}

testConnection();
