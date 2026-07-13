import { getTopicsWithCounts } from "@/lib/queries";
import { MergeTopicsForm } from "./MergeTopicsForm";

export default async function TemasPage() {
  const topics = await getTopicsWithCounts();

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold">Temas</h1>
        <p className="text-sm text-muted mt-1">
          {topics.length} tema{topics.length === 1 ? "" : "s"} en total.
        </p>
      </header>

      <MergeTopicsForm topics={topics} />

      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <span
            key={t.id}
            className="text-sm px-3 py-1.5 rounded-full border border-panel-border"
          >
            {t.name} <span className="text-muted">({t.contactCount + t.postCount})</span>
          </span>
        ))}
      </div>
    </div>
  );
}
