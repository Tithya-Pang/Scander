import test from "node:test";
import assert from "node:assert/strict";

// No real credentials or live database requests are used by these checks.
process.env.SUPABASE_URL = "https://scander-test.invalid";
process.env.SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";
process.env.SUPABASE_SECRET_KEY = "test-secret-key";
process.env.RESTAURANT_ID = "42";

let mode = "success";
const requests = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = new URL(input);
  requests.push(url);
  assert.equal(new Headers(options.headers).get("apikey"), "test-publishable-key");
  assert.equal(url.searchParams.get("restaurant_id"), "eq.42");
  assert.equal(url.searchParams.get("is_active"), "eq.true");
  const table = url.pathname.split("/").at(-1);
  if (mode === "error") return Response.json({ code: "TEST_ERROR", message: "private database detail" }, { status: 500 });
  if (table === "restaurant") return Response.json(mode === "missing" ? null : { restaurant_id: 42, name: "Gather Grounds" });
  if (mode === "empty") return Response.json([]);
  if (table === "menu_category") return Response.json([{ category_id: 2, name: "Coffee", display_order: 0 }]);
  if (table === "menu_item") {
    assert.equal(url.searchParams.get("is_available"), "eq.true");
    return Response.json([
      { item_id: 5, category_id: 2, name: "Latte", description: null, price: "2.95", image_url: "/images/menu/latte.png" },
      { item_id: 6, category_id: 99, name: "Hidden category item", price: "4.50" },
    ]);
  }
  throw new Error(`Unexpected table: ${table}`);
};

const { getMenu } = await import("../src/controllers/menu.js");
async function request() {
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  await getMenu({}, res);
  return res;
}

test("returns only active-category items using the public client, with numeric prices and card-compatible fields", async () => {
  const response = await request();
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.data.items, [{ id: 5, categoryId: 2, category: "Coffee", name: "Latte", description: "", price: 2.95, image: "/images/menu/latte.png" }]);
});
test("returns a successful empty menu when no items have been added", async () => {
  mode = "empty";
  const response = await request();
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.data.categories, []);
  assert.deepEqual(response.body.data.items, []);
});
test("returns 404 for a missing or inaccessible restaurant", async () => {
  mode = "missing";
  assert.equal((await request()).statusCode, 404);
});
test("returns 503 without exposing database details", async () => {
  mode = "error";
  const response = await request();
  assert.equal(response.statusCode, 503);
  assert.equal(JSON.stringify(response.body).includes("private database detail"), false);
});
test("rejects missing or malformed restaurant configuration before querying", async () => {
  const count = requests.length;
  for (const value of ["", "abc", "0", "-1", "1.5"]) {
    process.env.RESTAURANT_ID = value;
    assert.equal((await request()).statusCode, 503);
  }
  assert.equal(requests.length, count);
});
test.after(() => { globalThis.fetch = originalFetch; });
