import Link from "next/link";

export function SearchBox({
  search,
  topicId,
}: {
  search?: string;
  topicId?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <form action="/app" method="GET" className="flex-1 max-w-sm">
        {topicId && <input type="hidden" name="topic" value={topicId} />}
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Buscar por nombre, título, nota, tema o @mención…"
          className="w-full bg-panel border border-panel-border rounded-[var(--radius-control)] px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </form>
      {search && (
        <Link
          href={topicId ? `/app?topic=${topicId}` : "/app"}
          className="text-sm text-muted hover:text-accent whitespace-nowrap"
        >
          Ver todos
        </Link>
      )}
    </div>
  );
}
