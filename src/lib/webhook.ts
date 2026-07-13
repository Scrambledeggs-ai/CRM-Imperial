export async function fireWebhook(event: string, payload: Record<string, unknown>) {
  const url = process.env.WEBHOOK_URL;
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
