import Link from "next/link";
import { getContacts, getPosts, getTopicExperts, getTopicsWithCounts } from "@/lib/queries";
import { TopicFilterChips } from "./TopicFilterChips";
import { SearchBox } from "./SearchBox";
import { ContactCard } from "./ContactCard";
import { PostCard } from "./PostCard";

export default async function AppHome({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; search?: string }>;
}) {
  const { topic: topicId, search } = await searchParams;

  const [topics, contacts, posts, experts] = await Promise.all([
    getTopicsWithCounts(),
    getContacts(topicId, search),
    getPosts(topicId, search),
    topicId ? getTopicExperts(topicId) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <header>
        <h1 className="text-2xl font-semibold">Inicio</h1>
        <p className="text-sm text-muted mt-1">
          Compañeros de comunidad y posts guardados, cruzados por tema.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <SearchBox search={search} topicId={topicId} />
        <TopicFilterChips topics={topics} activeTopicId={topicId} basePath="/app" />
      </div>

      {topicId && experts.length > 0 && (
        <div className="rounded-[var(--radius-panel)] border border-panel-border bg-panel p-4">
          <h2 className="font-mono text-[13px] uppercase tracking-wide text-muted mb-2">
            Quién sabe de esto
          </h2>
          <div className="flex flex-wrap gap-2">
            {experts.map((e) => (
              <Link
                key={e.id}
                href={`/app/contactos/${e.id}`}
                className="text-sm px-3 py-1.5 rounded-full border border-panel-border hover:border-accent"
              >
                {e.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <section className="grid gap-8 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-[13px] uppercase tracking-wide text-muted">
            Contactos ({contacts.length})
          </h2>
          {contacts.length === 0 && (
            <p className="text-sm text-muted">
              {search ? "Nada coincide con esa búsqueda." : "Nada por acá todavía."}
            </p>
          )}
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-[13px] uppercase tracking-wide text-muted">
            Posts ({posts.length})
          </h2>
          {posts.length === 0 && (
            <p className="text-sm text-muted">
              {search ? "Nada coincide con esa búsqueda." : "Nada por acá todavía."}
            </p>
          )}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
