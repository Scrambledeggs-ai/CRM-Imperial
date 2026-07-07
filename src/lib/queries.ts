import { getSupabase } from "./supabase";
import type { ContactWithTopics, PostWithTopics, Topic } from "./types";

export async function getTopicsWithCounts() {
  const supabase = getSupabase();
  const [{ data: topics, error }, { data: contactLinks }, { data: postLinks }] =
    await Promise.all([
      supabase.from("topics").select("id, name").order("name"),
      supabase.from("contact_topics").select("topic_id"),
      supabase.from("post_topics").select("topic_id"),
    ]);
  if (error) throw new Error(error.message);

  const contactCounts = new Map<string, number>();
  for (const row of contactLinks ?? []) {
    contactCounts.set(row.topic_id, (contactCounts.get(row.topic_id) ?? 0) + 1);
  }
  const postCounts = new Map<string, number>();
  for (const row of postLinks ?? []) {
    postCounts.set(row.topic_id, (postCounts.get(row.topic_id) ?? 0) + 1);
  }

  return (topics ?? []).map((topic) => ({
    ...(topic as Topic),
    contactCount: contactCounts.get(topic.id) ?? 0,
    postCount: postCounts.get(topic.id) ?? 0,
  }));
}

export async function getContacts(topicId?: string): Promise<ContactWithTopics[]> {
  const supabase = getSupabase();

  let contactIds: string[] | null = null;
  if (topicId) {
    const { data, error } = await supabase
      .from("contact_topics")
      .select("contact_id")
      .eq("topic_id", topicId);
    if (error) throw new Error(error.message);
    contactIds = (data ?? []).map((row) => row.contact_id);
    if (contactIds.length === 0) return [];
  }

  let query = supabase
    .from("contacts")
    .select(
      "id, name, skool_url, notes, created_at, contact_topics(context, pending_action, topics(id, name))",
    )
    .order("created_at", { ascending: false });
  if (contactIds) query = query.in("id", contactIds);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  type ContactRow = {
    id: string;
    name: string;
    skool_url: string | null;
    notes: string | null;
    created_at: string;
    contact_topics: {
      context: string | null;
      pending_action: string | null;
      topics: Topic | null;
    }[];
  };
  const rows = (data ?? []) as unknown as ContactRow[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    skool_url: row.skool_url,
    notes: row.notes,
    created_at: row.created_at,
    topics: (row.contact_topics ?? [])
      .filter((ct) => ct.topics)
      .map((ct) => ({
        topic: ct.topics as Topic,
        context: ct.context,
        pending_action: ct.pending_action,
      })),
  }));
}

export async function getPosts(topicId?: string): Promise<PostWithTopics[]> {
  const supabase = getSupabase();

  let postIds: string[] | null = null;
  if (topicId) {
    const { data, error } = await supabase
      .from("post_topics")
      .select("post_id")
      .eq("topic_id", topicId);
    if (error) throw new Error(error.message);
    postIds = (data ?? []).map((row) => row.post_id);
    if (postIds.length === 0) return [];
  }

  let query = supabase
    .from("posts")
    .select(
      "id, title, url, notes, pending_action, created_at, post_topics(topics(id, name))",
    )
    .order("created_at", { ascending: false });
  if (postIds) query = query.in("id", postIds);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  type PostRow = {
    id: string;
    title: string;
    url: string;
    notes: string | null;
    pending_action: string | null;
    created_at: string;
    post_topics: { topics: Topic | null }[];
  };
  const rows = (data ?? []) as unknown as PostRow[];

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    url: row.url,
    notes: row.notes,
    pending_action: row.pending_action,
    created_at: row.created_at,
    topics: (row.post_topics ?? [])
      .filter((pt) => pt.topics)
      .map((pt) => pt.topics as Topic),
  }));
}

export async function getContact(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .select(
      "id, name, skool_url, notes, created_at, contact_topics(context, pending_action, pending_done, topics(id, name))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  type Row = {
    id: string;
    name: string;
    skool_url: string | null;
    notes: string | null;
    created_at: string;
    contact_topics: {
      context: string | null;
      pending_action: string | null;
      pending_done: boolean;
      topics: Topic | null;
    }[];
  };
  const row = data as unknown as Row;

  return {
    id: row.id,
    name: row.name,
    skool_url: row.skool_url,
    notes: row.notes,
    created_at: row.created_at,
    topics: (row.contact_topics ?? [])
      .filter((ct) => ct.topics)
      .map((ct) => ({
        topic: ct.topics as Topic,
        context: ct.context,
        pending_action: ct.pending_action,
        pending_done: ct.pending_done,
      })),
  };
}

export async function getPost(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, url, notes, pending_action, pending_done, created_at, post_topics(topics(id, name))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  type Row = {
    id: string;
    title: string;
    url: string;
    notes: string | null;
    pending_action: string | null;
    pending_done: boolean;
    created_at: string;
    post_topics: { topics: Topic | null }[];
  };
  const row = data as unknown as Row;

  return {
    id: row.id,
    title: row.title,
    url: row.url,
    notes: row.notes,
    pending_action: row.pending_action,
    pending_done: row.pending_done,
    created_at: row.created_at,
    topics: (row.post_topics ?? [])
      .filter((pt) => pt.topics)
      .map((pt) => pt.topics as Topic),
  };
}

export async function getPendingItems() {
  const supabase = getSupabase();

  const [{ data: contactPending, error: e1 }, { data: postPending, error: e2 }] =
    await Promise.all([
      supabase
        .from("contact_topics")
        .select("pending_action, pending_done, contacts(id, name), topics(id, name)")
        .not("pending_action", "is", null),
      supabase
        .from("posts")
        .select("id, title, url, pending_action, pending_done")
        .not("pending_action", "is", null),
    ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  type ContactPendingRow = {
    pending_action: string;
    pending_done: boolean;
    contacts: { id: string; name: string } | null;
    topics: { id: string; name: string } | null;
  };
  type PostPendingRow = {
    id: string;
    title: string;
    url: string;
    pending_action: string;
    pending_done: boolean;
  };

  const contacts = (contactPending as unknown as ContactPendingRow[] | null ?? [])
    .filter((row) => row.contacts)
    .map((row) => ({
      contact: row.contacts as { id: string; name: string },
      topic: row.topics as { id: string; name: string } | null,
      pending_action: row.pending_action,
      pending_done: row.pending_done,
    }));
  const posts = (postPending as unknown as PostPendingRow[] | null) ?? [];

  contacts.sort((a, b) => Number(a.pending_done) - Number(b.pending_done));
  posts.sort((a, b) => Number(a.pending_done) - Number(b.pending_done));

  return { contacts, posts };
}
