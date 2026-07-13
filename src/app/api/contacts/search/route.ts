import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const supabase = getSupabase();
  let query = supabase.from("contacts").select("id, name").order("name").limit(8);
  if (q) query = query.ilike("name", `%${q}%`);
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}
