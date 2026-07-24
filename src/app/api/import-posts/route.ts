import { getSupabase } from "@/lib/supabase";

// Importa posts seleccionados desde el digest de Skool (skool-digest).
// Protegido con SKOOL_IMPORT_TOKEN. CORS abierto porque el digest se abre
// como archivo local (origin null); la autorización real es el token.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

type IncomingPost = {
  title: string;
  url: string;
  author: string;
  authorHandle: string | null;
  createdAt: string | null;
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: Request) {
  const token = process.env.SKOOL_IMPORT_TOKEN;
  const auth = request.headers.get("authorization");
  if (!token || auth !== `Bearer ${token}`) {
    return Response.json({ error: "No autorizado" }, { status: 401, headers: CORS });
  }

  let body: { posts?: IncomingPost[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400, headers: CORS });
  }

  const posts = (body.posts ?? []).filter(
    (p) =>
      typeof p?.title === "string" &&
      typeof p?.url === "string" &&
      p.url.startsWith("https://www.skool.com/") &&
      typeof p?.author === "string",
  );
  if (posts.length === 0 || posts.length > 100) {
    return Response.json(
      { error: "Se esperan entre 1 y 100 posts válidos" },
      { status: 400, headers: CORS },
    );
  }

  const supabase = getSupabase();
  let contactsCreated = 0;
  let postsCreated = 0;
  let postsSkipped = 0;

  for (const p of posts) {
    // Autor → contacto: por URL de perfil; si hay uno con el mismo nombre y
    // sin skool_url, se le completa la URL en vez de duplicar.
    let contactId: string | null = null;
    if (p.authorHandle) {
      const profileUrl = `https://www.skool.com/@${p.authorHandle}`;
      const { data: byUrl } = await supabase
        .from("contacts").select("id").eq("skool_url", profileUrl).limit(1);
      if (byUrl?.length) {
        contactId = byUrl[0].id;
      } else {
        const { data: byName } = await supabase
          .from("contacts").select("id, skool_url").ilike("name", p.author).limit(1);
        if (byName?.length && !byName[0].skool_url) {
          await supabase.from("contacts")
            .update({ skool_url: profileUrl }).eq("id", byName[0].id);
          contactId = byName[0].id;
        } else {
          const { data: created, error } = await supabase
            .from("contacts")
            .insert({ name: p.author, skool_url: profileUrl })
            .select("id").single();
          if (error) {
            return Response.json({ error: error.message }, { status: 500, headers: CORS });
          }
          contactId = created.id;
          contactsCreated++;
        }
      }
    }

    // Post: si ya existe por URL no se duplica (solo se completa el autor).
    const { data: existing } = await supabase
      .from("posts").select("id, contact_id").eq("url", p.url).limit(1);
    if (existing?.length) {
      if (!existing[0].contact_id && contactId) {
        await supabase.from("posts")
          .update({ contact_id: contactId }).eq("id", existing[0].id);
      }
      postsSkipped++;
      continue;
    }
    const when = p.createdAt
      ? new Date(p.createdAt).toLocaleDateString("es-AR")
      : "s/f";
    const { error } = await supabase.from("posts").insert({
      title: p.title,
      url: p.url,
      contact_id: contactId,
      notes: `Publicado en Skool por ${p.author} · ${when}`,
    });
    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers: CORS });
    }
    postsCreated++;
  }

  return Response.json(
    { ok: true, postsCreated, postsSkipped, contactsCreated },
    { headers: CORS },
  );
}
