import { getSupabase } from "./supabase";

export async function fireWebhook(event: string, payload: Record<string, unknown>) {
  let url: string | null = null;
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "webhook_url")
      .maybeSingle();
    url = data?.value ?? null;
  } catch {
    // si falla la lectura del setting, seguimos al fallback de la env var
  }
  url ||= process.env.WEBHOOK_URL ?? null;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, timestamp: new Date().toISOString(), ...payload }),
    });
  } catch {
    // El webhook es best-effort: si falla, no debe romper la acción principal.
  }
}
