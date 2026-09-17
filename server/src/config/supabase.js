import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

// The service role key bypasses Row Level Security, so every query must filter by
// user_id itself, and this key must never reach the browser.
export const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function pingSupabase() {
  const { error } = await supabase.from("users").select("id").limit(1);
  if (error) throw new Error(`Supabase connection failed: ${error.message}`);
}
