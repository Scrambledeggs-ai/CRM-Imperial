"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "./supabase";
import { fireWebhook } from "./webhook";

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
      topics.map((topic) => ({
        contact_id: contact.id,
        topic_id: topic.id,
        pending_action: pendingAction,
        pending_date: pendingDate,
      })),
      { onConflict: "contact_id,topic_id" },
    );
    if (linkError) throw new Error(linkError.message);
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

export async function updateContactTopicPending(
  contactId: string,
  topicId: string,
  pendingAction: string,
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("contact_topics")
    .update({ pending_action: pendingAction.trim() || null })
    .eq("contact_id", contactId)
    .eq("topic_id", topicId);
  if (error) throw new Error(error.message);
  revalidatePath(`/app/contactos/${contactId}`);
  revalidatePath("/app/pendientes");
}

export async function updateContactTopicPendingDate(
  contactId: string,
  topicId: string,
  pendingDate: string,
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("contact_topics")
    .update({ pending_date: pendingDate || null })
    .eq("contact_id", contactId)
    .eq("topic_id", topicId);
  if (error) throw new Error(error.message);

  const { data: row } = await supabase
    .from("contact_topics")
    .select("pending_action")
    .eq("contact_id", contactId)
    .eq("topic_id", topicId)
    .maybeSingle();
  await fireWebhook("contact.pending_updated", {
    type: "contact",
    id: contactId,
    pending_action: row?.pending_action ?? null,
    pending_date: pendingDate || null,
  });

  revalidatePath(`/app/contactos/${contactId}`);
  revalidatePath("/app/pendientes");
}

export async function updatePostPending(postId: string, pendingAction: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("posts")
    .update({ pending_action: pendingAction.trim() || null })
    .eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath(`/app/posts/${postId}`);
  revalidatePath("/app/pendientes");
}

export async function updatePostPendingDate(postId: string, pendingDate: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("posts")
    .update({ pending_date: pendingDate || null })
    .eq("id", postId);
  if (error) throw new Error(error.message);

  const { data: row } = await supabase
    .from("posts")
    .select("pending_action")
    .eq("id", postId)
    .maybeSingle();
  await fireWebhook("post.pending_updated", {
    type: "post",
    id: postId,
    pending_action: row?.pending_action ?? null,
    pending_date: pendingDate || null,
  });

  revalidatePath(`/app/posts/${postId}`);
  revalidatePath("/app/pendientes");
}

export async function addContactTopic(contactId: string, topicName: string) {
  const name = topicName.trim().toLowerCase();
  if (!name) throw new Error("El tema no puede estar vacío.");

  const supabase = getSupabase();
  const [topic] = await upsertTopics([name]);
  const { error } = await supabase
    .from("contact_topics")
    .upsert({ contact_id: contactId, topic_id: topic.id }, { onConflict: "contact_id,topic_id" });
  if (error) throw new Error(error.message);
  revalidatePath(`/app/contactos/${contactId}`);
  revalidatePath("/app");
}

export async function addPostTopic(postId: string, topicName: string) {
  const name = topicName.trim().toLowerCase();
  if (!name) throw new Error("El tema no puede estar vacío.");

  const supabase = getSupabase();
  const [topic] = await upsertTopics([name]);
  const { error } = await supabase
    .from("post_topics")
    .upsert({ post_id: postId, topic_id: topic.id }, { onConflict: "post_id,topic_id" });
  if (error) throw new Error(error.message);
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
  if (sourceId === targetId) throw new Error("Elegí dos temas distintos.");
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

export async function toggleContactPendingDone(
  contactId: string,
  topicId: string,
  done: boolean,
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("contact_topics")
    .update({ pending_done: done })
    .eq("contact_id", contactId)
    .eq("topic_id", topicId);
  if (error) throw new Error(error.message);
  revalidatePath("/app/pendientes");
  revalidatePath("/app");
}

export async function togglePostPendingDone(postId: string, done: boolean) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("posts")
    .update({ pending_done: done })
    .eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath("/app/pendientes");
  revalidatePath("/app");
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
    .insert({
      title,
      url,
      notes,
      pending_action: pendingAction,
      pending_date: pendingDate,
    })
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
