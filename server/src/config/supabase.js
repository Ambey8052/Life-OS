import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

// Server-only client using the service role key — bypasses Row Level Security.
// LifeOS uses its own JWT auth, so every query below scopes by user_id itself;
// this key must never be sent to the browser.
export const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function pingSupabase() {
  const { error } = await supabase.from("users").select("id").limit(1);
  if (error) throw new Error(`Supabase connection failed: ${error.message}`);
}
