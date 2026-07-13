export type Database = {
  public: {
    Tables: {
      topics: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id?: string; name: string; created_at?: string };
        Update: { id?: string; name?: string; created_at?: string };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          skool_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          skool_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          skool_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          url: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      contact_topics: {
        Row: {
          contact_id: string;
          topic_id: string;
          context: string | null;
          created_at: string;
        };
        Insert: {
          contact_id: string;
          topic_id: string;
          context?: string | null;
          created_at?: string;
        };
        Update: {
          contact_id?: string;
          topic_id?: string;
          context?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pendings: {
        Row: {
          id: string;
          text: string;
          done: boolean;
          due_date: string | null;
          contact_id: string | null;
          post_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          done?: boolean;
          due_date?: string | null;
          contact_id?: string | null;
          post_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          done?: boolean;
          due_date?: string | null;
          contact_id?: string | null;
          post_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      post_topics: {
        Row: { post_id: string; topic_id: string; created_at: string };
        Insert: { post_id: string; topic_id: string; created_at?: string };
        Update: { post_id?: string; topic_id?: string; created_at?: string };
        Relationships: [];
      };
      settings: {
        Row: { key: string; value: string | null; updated_at: string };
        Insert: { key: string; value?: string | null; updated_at?: string };
        Update: { key?: string; value?: string | null; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
