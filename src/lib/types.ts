export type Topic = {
  id: string;
  name: string;
};

export type Contact = {
  id: string;
  name: string;
  skool_url: string | null;
  notes: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  title: string;
  url: string;
  notes: string | null;
  pending_action: string | null;
  created_at: string;
};

export type ContactWithTopics = Contact & {
  topics: { topic: Topic; context: string | null; pending_action: string | null }[];
};

export type PostWithTopics = Post & {
  topics: Topic[];
};
