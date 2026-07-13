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
          pending_action: string | null;
          pending_done: boolean;
          pending_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          notes?: string | null;
          pending_action?: string | null;
          pending_done?: boolean;
          pending_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          notes?: string | null;
          pending_action?: string | null;
          pending_done?: boolean;
          pending_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      contact_topics: {
        Row: {
          contact_id: string;
          topic_id: string;
          context: string | null;
          pending_action: string | null;
          pending_done: boolean;
          pending_date: string | null;
          created_at: string;
        };
        Insert: {
          contact_id: string;
          topic_id: string;
          context?: string | null;
          pending_action?: string | null;
          pending_done?: boolean;
          pending_date?: string | null;
          created_at?: string;
        };
        Update: {
          contact_id?: string;
          topic_id?: string;
          context?: string | null;
          pending_action?: string | null;
          pending_done?: boolean;
          pending_date?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
