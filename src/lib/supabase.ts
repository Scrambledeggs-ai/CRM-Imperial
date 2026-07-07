import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let _client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (!_client) {
    _client = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _client;
}
