import Link from "next/link";

type TopicWithCounts = {
  id: string;
  name: string;
  contactCount: number;
  postCount: number;
};

export function TopicFilterChips({
  topics,
  activeTopicId,
  basePath,
}: {
  topics: TopicWithCounts[];
  activeTopicId?: string;
  basePath: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={basePath}
        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
          !activeTopicId
            ? "bg-accent text-accent-ink"
            : "border border-panel-border text-muted"
        }`}
      >
        Todos
      </Link>
      {topics.map((topic) => (
        <Link
          key={topic.id}
          href={`${basePath}?topic=${topic.id}`}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            activeTopicId === topic.id
              ? "bg-accent text-accent-ink"
              : "border border-panel-border text-muted"
          }`}
        >
          {topic.name} <span className="opacity-70">{topic.contactCount + topic.postCount}</span>
        </Link>
      ))}
    </div>
  );
}
