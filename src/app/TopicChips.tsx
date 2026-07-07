import Link from "next/link";

type TopicWithCounts = {
  id: string;
  name: string;
  contactCount: number;
  postCount: number;
};

export function TopicChips({
  topics,
  activeTopicId,
}: {
  topics: TopicWithCounts[];
  activeTopicId?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={`px-3 py-1 rounded-full text-sm border ${
          !activeTopicId
            ? "bg-foreground text-background border-foreground"
            : "border-black/15 dark:border-white/20"
        }`}
      >
        Todos
      </Link>
      {topics.map((topic) => (
        <Link
          key={topic.id}
          href={`/?topic=${topic.id}`}
          className={`px-3 py-1 rounded-full text-sm border ${
            activeTopicId === topic.id
              ? "bg-foreground text-background border-foreground"
              : "border-black/15 dark:border-white/20"
          }`}
        >
          {topic.name}{" "}
          <span className="opacity-60">
            {topic.contactCount + topic.postCount}
          </span>
        </Link>
      ))}
      {topics.length === 0 && (
        <span className="text-sm opacity-60">
          Todavía no hay temas — se crean solos al capturar un post o contacto.
        </span>
      )}
    </div>
  );
}
