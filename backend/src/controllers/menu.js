import { getRestaurantMenu } from "../services/menu.js";

export async function getMenu(req, res) {
  // The restaurant is configured on the server, not selected by arbitrary input.
  const restaurantId = process.env.RESTAURANT_ID;
  if (!restaurantId || !/^[1-9]\d*$/.test(restaurantId)) {
    return res.status(503).json({ message: "Restaurant configuration is missing or invalid" });
  }

  try {
    const menu = await getRestaurantMenu(restaurantId);
    if (!menu) return res.status(404).json({ message: "Restaurant not found" });
    return res.status(200).json({ data: menu });
  } catch (error) {
    console.error("Menu lookup failed:", error.code || "database_error");
    return res.status(503).json({ message: "Menu is temporarily unavailable. Please try again." });
  }
}
