"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "./supabase";
import { fireWebhook } from "./webhook";

export async function setSetting(key: string, value: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value: value.trim() || null, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/app/exportar");
}

function parseTopicNames(raw: string): string[] {
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const name = part.trim().toLowerCase();
    if (name) seen.add(name);
  }
  return [...seen];
}

async function upsertTopics(names: string[]) {
  if (names.length === 0) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("topics")
    .upsert(
      names.map((name) => ({ name })),
      { onConflict: "name" },
    )
    .select("id, name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const skoolUrl = String(formData.get("skool_url") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const pendingAction = String(formData.get("pending_action") ?? "").trim() || null;
  const pendingDate = String(formData.get("pending_date") ?? "").trim() || null;
  const topicNames = parseTopicNames(String(formData.get("topics") ?? ""));

  if (!name) throw new Error("El contacto necesita un nombre.");

  const supabase = getSupabase();
  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({ name, skool_url: skoolUrl, notes })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const topics = await upsertTopics(topicNames);
  if (topics.length > 0) {
    const { error: linkError } = await supabase.from("contact_topics").upsert(
      topics.map((topic) => ({ contact_id: contact.id, topic_id: topic.id })),
      { onConflict: "contact_id,topic_id" },
    );
    if (linkError) throw new Error(linkError.message);
  }

  if (pendingAction) {
    const { error: pendingError } = await supabase
      .from("pendings")
      .insert({ text: pendingAction, due_date: pendingDate, contact_id: contact.id });
    if (pendingError) throw new Error(pendingError.message);
  }

  await fireWebhook("contact.created", {
    type: "contact",
    id: contact.id,
    name,
    topics: topics.map((t) => t.name),
    pending_action: pendingAction,
    pending_date: pendingDate,
  });

  revalidatePath("/");
  revalidatePath("/app");
}

export async function updateContactField(
  contactId: string,
  field: "name" | "skool_url" | "notes",
  value: string,
) {
  const supabase = getSupabase();
  const clean = value.trim();
  const patch =
    field === "name"
      ? { name: clean || "Sin nombre" }
      : field === "skool_url"
        ? { skool_url: clean || null }
        : { notes: clean || null };
  const { error } = await supabase.from("contacts").update(patch).eq("id", contactId);
  if (error) throw new Error(error.message);
  revalidatePath(`/app/contactos/${contactId}`);
  revalidatePath("/app");
}

export async function updatePostField(
  postId: string,
  field: "title" | "url" | "notes",
  value: string,
) {
  const supabase = getSupabase();
  const clean = value.trim();
  const patch =
    field === "title"
      ? { title: clean || "Sin título" }
      : field === "url"
        ? { url: clean || "https://" }
        : { notes: clean || null };
  const { error } = await supabase.from("posts").update(patch).eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath(`/app/posts/${postId}`);
  revalidatePath("/app");
}

type PendingTarget = { contactId: string } | { postId: string };

function pendingOwnerColumn(target: PendingTarget) {
  return "contactId" in target
    ? { column: "contact_id" as const, id: target.contactId, type: "contact" as const }
    : { column: "post_id" as const, id: target.postId, type: "post" as const };
}

function revalidatePendingTarget(target: PendingTarget) {
  if ("contactId" in target) revalidatePath(`/app/contactos/${target.contactId}`);
  else revalidatePath(`/app/posts/${target.postId}`);
  revalidatePath("/app/pendientes");
  revalidatePath("/app");
}

export async function addPending(target: PendingTarget, text: string) {
  const clean = text.trim();
  if (!clean) throw new Error("El pendiente no puede estar vacío.");
  const supabase = getSupabase();
  const { error } = await supabase.from("pendings").insert(
    "contactId" in target
      ? { text: clean, contact_id: target.contactId }
      : { text: clean, post_id: target.postId },
  );
  if (error) throw new Error(error.message);
  revalidatePendingTarget(target);
}

export async function updatePendingText(pendingId: string, text: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pendings")
    .update({ text: text.trim() })
    .eq("id", pendingId)
    .select("contact_id, post_id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePendingTarget(
    data.contact_id ? { contactId: data.contact_id } : { postId: data.post_id! },
  );
}

export async function updatePendingDate(pendingId: string, dueDate: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pendings")
    .update({ due_date: dueDate || null })
    .eq("id", pendingId)
    .select("text, due_date, contact_id, post_id")
    .single();
  if (error) throw new Error(error.message);

  const target: PendingTarget = data.contact_id
    ? { contactId: data.contact_id }
    : { postId: data.post_id! };
  const owner = pendingOwnerColumn(target);
  await fireWebhook("pending.updated", {
    type: owner.type,
    id: owner.id,
    pending_action: data.text,
    pending_date: data.due_date,
  });

  revalidatePendingTarget(target);
}

export async function togglePendingDone(pendingId: string, done: boolean) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pendings")
    .update({ done })
    .eq("id", pendingId)
    .select("contact_id, post_id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePendingTarget(
    data.contact_id ? { contactId: data.contact_id } : { postId: data.post_id! },
  );
}

export async function deletePending(pendingId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pendings")
    .delete()
    .eq("id", pendingId)
    .select("contact_id, post_id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePendingTarget(
    data.contact_id ? { contactId: data.contact_id } : { postId: data.post_id! },
  );
}

export async function updateContactTopics(contactId: string, raw: string) {
  const names = parseTopicNames(raw);
  const supabase = getSupabase();
  const topics = await upsertTopics(names);

  const { data: current, error: currentError } = await supabase
    .from("contact_topics")
    .select("topic_id")
    .eq("contact_id", contactId);
  if (currentError) throw new Error(currentError.message);

  const currentIds = new Set((current ?? []).map((r) => r.topic_id));
  const nextIds = new Set(topics.map((t) => t.id));
  const toAdd = topics.filter((t) => !currentIds.has(t.id));
  const toRemove = [...currentIds].filter((id) => !nextIds.has(id));

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("contact_topics")
      .upsert(
        toAdd.map((t) => ({ contact_id: contactId, topic_id: t.id })),
        { onConflict: "contact_id,topic_id" },
      );
    if (error) throw new Error(error.message);
  }
  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("contact_topics")
      .delete()
      .eq("contact_id", contactId)
      .in("topic_id", toRemove);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/app/contactos/${contactId}`);
  revalidatePath("/app");
}

export async function updatePostTopics(postId: string, raw: string) {
  const names = parseTopicNames(raw);
  const supabase = getSupabase();
  const topics = await upsertTopics(names);

  const { data: current, error: currentError } = await supabase
    .from("post_topics")
    .select("topic_id")
    .eq("post_id", postId);
  if (currentError) throw new Error(currentError.message);

  const currentIds = new Set((current ?? []).map((r) => r.topic_id));
  const nextIds = new Set(topics.map((t) => t.id));
  const toAdd = topics.filter((t) => !currentIds.has(t.id));
  const toRemove = [...currentIds].filter((id) => !nextIds.has(id));

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("post_topics")
      .upsert(
        toAdd.map((t) => ({ post_id: postId, topic_id: t.id })),
        { onConflict: "post_id,topic_id" },
      );
    if (error) throw new Error(error.message);
  }
  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("post_topics")
      .delete()
      .eq("post_id", postId)
      .in("topic_id", toRemove);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/app/posts/${postId}`);
  revalidatePath("/app");
}

export async function deleteContact(contactId: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("contacts").delete().eq("id", contactId);
  if (error) throw new Error(error.message);
  await fireWebhook("contact.deleted", { type: "contact", id: contactId });
  revalidatePath("/app");
  redirect("/app");
}

export async function deletePost(postId: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw new Error(error.message);
  await fireWebhook("post.deleted", { type: "post", id: postId });
  revalidatePath("/app");
  redirect("/app");
}

export async function mergeTopics(sourceId: string, targetId: string) {
  if (sourceId === targetId) throw new Error("Elige dos temas distintos.");
  const supabase = getSupabase();

  const [{ data: sourceContacts }, { data: targetContacts }] = await Promise.all([
    supabase.from("contact_topics").select("*").eq("topic_id", sourceId),
    supabase.from("contact_topics").select("contact_id").eq("topic_id", targetId),
  ]);
  const targetContactIds = new Set((targetContacts ?? []).map((r) => r.contact_id));
  const contactsToMove = (sourceContacts ?? []).filter(
    (r) => !targetContactIds.has(r.contact_id),
  );
  if (contactsToMove.length > 0) {
    const { error } = await supabase
      .from("contact_topics")
      .insert(contactsToMove.map((r) => ({ ...r, topic_id: targetId })));
    if (error) throw new Error(error.message);
  }

  const [{ data: sourcePosts }, { data: targetPosts }] = await Promise.all([
    supabase.from("post_topics").select("*").eq("topic_id", sourceId),
    supabase.from("post_topics").select("post_id").eq("topic_id", targetId),
  ]);
  const targetPostIds = new Set((targetPosts ?? []).map((r) => r.post_id));
  const postsToMove = (sourcePosts ?? []).filter((r) => !targetPostIds.has(r.post_id));
  if (postsToMove.length > 0) {
    const { error } = await supabase
      .from("post_topics")
      .insert(postsToMove.map((r) => ({ ...r, topic_id: targetId })));
    if (error) throw new Error(error.message);
  }

  const { error: deleteError } = await supabase.from("topics").delete().eq("id", sourceId);
  if (deleteError) throw new Error(deleteError.message);

  revalidatePath("/app/temas");
  revalidatePath("/app");
  revalidatePath("/app/pendientes");
}

export async function createPost(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const pendingAction = String(formData.get("pending_action") ?? "").trim() || null;
  const pendingDate = String(formData.get("pending_date") ?? "").trim() || null;
  const topicNames = parseTopicNames(String(formData.get("topics") ?? ""));

  if (!title || !url) throw new Error("El post necesita título y URL.");

  const supabase = getSupabase();
  const { data: post, error } = await supabase
    .from("posts")
    .insert({ title, url, notes })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const topics = await upsertTopics(topicNames);
  if (topics.length > 0) {
    const { error: linkError } = await supabase.from("post_topics").upsert(
      topics.map((topic) => ({ post_id: post.id, topic_id: topic.id })),
      { onConflict: "post_id,topic_id" },
    );
    if (linkError) throw new Error(linkError.message);
  }

  if (pendingAction) {
    const { error: pendingError } = await supabase
      .from("pendings")
      .insert({ text: pendingAction, due_date: pendingDate, post_id: post.id });
    if (pendingError) throw new Error(pendingError.message);
  }

  await fireWebhook("post.created", {
    type: "post",
    id: post.id,
    title,
    url,
    topics: topics.map((t) => t.name),
    pending_action: pendingAction,
    pending_date: pendingDate,
  });

  revalidatePath("/app");
}
