"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "./supabase";

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
      })),
      { onConflict: "contact_id,topic_id" },
    );
    if (linkError) throw new Error(linkError.message);
  }

  revalidatePath("/");
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
  revalidatePath("/pendientes");
  revalidatePath("/");
}

export async function togglePostPendingDone(postId: string, done: boolean) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("posts")
    .update({ pending_done: done })
    .eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath("/pendientes");
  revalidatePath("/");
}

export async function createPost(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const pendingAction = String(formData.get("pending_action") ?? "").trim() || null;
  const topicNames = parseTopicNames(String(formData.get("topics") ?? ""));

  if (!title || !url) throw new Error("El post necesita título y URL.");

  const supabase = getSupabase();
  const { data: post, error } = await supabase
    .from("posts")
    .insert({ title, url, notes, pending_action: pendingAction })
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

  revalidatePath("/");
}
