import Link from "next/link";
import { TopicChip } from "./TopicChip";
import type { PostWithTopics } from "@/lib/types";

export function PostCard({ post }: { post: PostWithTopics }) {
  const pending = post.pendings.filter((p) => !p.done);

  return (
    <Link
      href={`/app/posts/${post.id}`}
      className="block rounded-[var(--radius-panel)] border border-panel-border bg-panel p-4 hover:border-accent transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[17px] font-semibold line-clamp-2">{post.title}</span>
        {post.topics[0] && <TopicChip name={post.topics[0].name} />}
      </div>
      {post.notes && (
        <p className="text-sm text-muted mt-1 line-clamp-2">{post.notes}</p>
      )}
      {pending.length > 0 && (
        <p className="text-sm text-amber-400 mt-2">⏳ {pending[0].text}</p>
      )}
    </Link>
  );
}
