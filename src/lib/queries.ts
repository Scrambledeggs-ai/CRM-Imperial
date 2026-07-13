import { getSupabase } from "./supabase";
import type { ContactWithTopics, Pending, PostWithTopics, Topic } from "./types";

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

const byDoneThenDate = (a: Pending, b: Pending) => {
  if (a.done !== b.done) return Number(a.done) - Number(b.done);
  if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
  if (a.due_date) return -1;
  if (b.due_date) return 1;
  return 0;
};

export async function getContacts(
  topicId?: string,
  search?: string,
): Promise<ContactWithTopics[]> {
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

  let searchIds: Set<string> | null = null;
  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    const [{ data: byField, error: e1 }, { data: byTopic, error: e2 }] =
      await Promise.all([
        supabase.from("contacts").select("id").or(`name.ilike.${term},notes.ilike.${term}`),
        supabase
          .from("contact_topics")
          .select("contact_id, topics!inner(name)")
          .ilike("topics.name", term),
      ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    const topicRows = (byTopic ?? []) as unknown as { contact_id: string }[];
    searchIds = new Set([
      ...(byField ?? []).map((r) => r.id),
      ...topicRows.map((r) => r.contact_id),
    ]);
    if (searchIds.size === 0) return [];
  }

  const finalIds =
    contactIds && searchIds
      ? contactIds.filter((id) => searchIds!.has(id))
      : (contactIds ?? (searchIds ? [...searchIds] : null));
  if (finalIds && finalIds.length === 0) return [];

  let query = supabase
    .from("contacts")
    .select(
      "id, name, skool_url, notes, created_at, contact_topics(context, topics(id, name)), pendings(id, text, done, due_date)",
    )
    .order("created_at", { ascending: false });
  if (finalIds) query = query.in("id", finalIds);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  type ContactRow = {
    id: string;
    name: string;
    skool_url: string | null;
    notes: string | null;
    created_at: string;
    contact_topics: { context: string | null; topics: Topic | null }[];
    pendings: Pending[];
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
      .map((ct) => ({ topic: ct.topics as Topic, context: ct.context })),
    pendings: (row.pendings ?? []).slice().sort(byDoneThenDate),
  }));
}

export async function getPosts(
  topicId?: string,
  search?: string,
): Promise<PostWithTopics[]> {
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

  let searchIds: Set<string> | null = null;
  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    const [{ data: byField, error: e1 }, { data: byTopic, error: e2 }] =
      await Promise.all([
        supabase.from("posts").select("id").or(`title.ilike.${term},notes.ilike.${term}`),
        supabase
          .from("post_topics")
          .select("post_id, topics!inner(name)")
          .ilike("topics.name", term),
      ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    const topicRows = (byTopic ?? []) as unknown as { post_id: string }[];
    searchIds = new Set([
      ...(byField ?? []).map((r) => r.id),
      ...topicRows.map((r) => r.post_id),
    ]);
    if (searchIds.size === 0) return [];
  }

  const finalIds =
    postIds && searchIds
      ? postIds.filter((id) => searchIds!.has(id))
      : (postIds ?? (searchIds ? [...searchIds] : null));
  if (finalIds && finalIds.length === 0) return [];

  let query = supabase
    .from("posts")
    .select(
      "id, title, url, notes, created_at, post_topics(topics(id, name)), pendings(id, text, done, due_date)",
    )
    .order("created_at", { ascending: false });
  if (finalIds) query = query.in("id", finalIds);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  type PostRow = {
    id: string;
    title: string;
    url: string;
    notes: string | null;
    created_at: string;
    post_topics: { topics: Topic | null }[];
    pendings: Pending[];
  };
  const rows = (data ?? []) as unknown as PostRow[];

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    url: row.url,
    notes: row.notes,
    created_at: row.created_at,
    topics: (row.post_topics ?? [])
      .filter((pt) => pt.topics)
      .map((pt) => pt.topics as Topic),
    pendings: (row.pendings ?? []).slice().sort(byDoneThenDate),
  }));
}

export async function getContact(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .select(
      "id, name, skool_url, notes, created_at, contact_topics(context, topics(id, name)), pendings(id, text, done, due_date)",
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
    contact_topics: { context: string | null; topics: Topic | null }[];
    pendings: Pending[];
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
      .map((ct) => ({ topic: ct.topics as Topic, context: ct.context })),
    pendings: (row.pendings ?? []).slice().sort(byDoneThenDate),
  };
}

export async function getPost(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, url, notes, created_at, post_topics(topics(id, name)), pendings(id, text, done, due_date)",
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
    created_at: string;
    post_topics: { topics: Topic | null }[];
    pendings: Pending[];
  };
  const row = data as unknown as Row;

  return {
    id: row.id,
    title: row.title,
    url: row.url,
    notes: row.notes,
    created_at: row.created_at,
    topics: (row.post_topics ?? [])
      .filter((pt) => pt.topics)
      .map((pt) => pt.topics as Topic),
    pendings: (row.pendings ?? []).slice().sort(byDoneThenDate),
  };
}

export async function getContactMentions(contactId: string) {
  const supabase = getSupabase();
  const pattern = `%](${contactId})%`;
  const [{ data: contacts, error: e1 }, { data: posts, error: e2 }] = await Promise.all([
    supabase.from("contacts").select("id, name").ilike("notes", pattern).neq("id", contactId),
    supabase.from("posts").select("id, title").ilike("notes", pattern),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  return { contacts: contacts ?? [], posts: posts ?? [] };
}

export async function getSetting(key: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.value ?? null;
}

export async function getAllDataForExport() {
  const supabase = getSupabase();
  const [contacts, posts, topics, contactTopics, postTopics, pendings] = await Promise.all([
    supabase.from("contacts").select("*").order("created_at"),
    supabase.from("posts").select("*").order("created_at"),
    supabase.from("topics").select("*").order("name"),
    supabase.from("contact_topics").select("*"),
    supabase.from("post_topics").select("*"),
    supabase.from("pendings").select("*").order("created_at"),
  ]);
  for (const r of [contacts, posts, topics, contactTopics, postTopics, pendings]) {
    if (r.error) throw new Error(r.error.message);
  }
  return {
    contacts: contacts.data ?? [],
    posts: posts.data ?? [],
    topics: topics.data ?? [],
    contact_topics: contactTopics.data ?? [],
    post_topics: postTopics.data ?? [],
    pendings: pendings.data ?? [],
  };
}

export async function getPendingItems() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("pendings")
    .select("id, text, done, due_date, contacts(id, name), posts(id, title, url)");
  if (error) throw new Error(error.message);

  type Row = {
    id: string;
    text: string;
    done: boolean;
    due_date: string | null;
    contacts: { id: string; name: string } | null;
    posts: { id: string; title: string; url: string } | null;
  };
  const rows = (data as unknown as Row[]) ?? [];

  const contacts = rows
    .filter((row) => row.contacts)
    .map((row) => ({
      id: row.id,
      text: row.text,
      done: row.done,
      due_date: row.due_date,
      contact: row.contacts as { id: string; name: string },
    }));
  const posts = rows
    .filter((row) => row.posts)
    .map((row) => ({
      id: row.id,
      text: row.text,
      done: row.done,
      due_date: row.due_date,
      post: row.posts as { id: string; title: string; url: string },
    }));

  const byDoneThenDueDate = (a: { done: boolean; due_date: string | null }, b: typeof a) => {
    if (a.done !== b.done) return Number(a.done) - Number(b.done);
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return 0;
  };
  contacts.sort(byDoneThenDueDate);
  posts.sort(byDoneThenDueDate);

  return { contacts, posts };
}
