import { getContacts, getPosts, getTopicsWithCounts } from "@/lib/queries";
import { TopicFilterChips } from "./TopicFilterChips";
import { ContactCard } from "./ContactCard";
import { PostCard } from "./PostCard";

export default async function AppHome({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic: topicId } = await searchParams;

  const [topics, contacts, posts] = await Promise.all([
    getTopicsWithCounts(),
    getContacts(topicId),
    getPosts(topicId),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <header>
        <h1 className="text-2xl font-semibold">Inicio</h1>
        <p className="text-sm text-muted mt-1">
          Compañeros de comunidad y posts guardados, cruzados por tema.
        </p>
      </header>

      <TopicFilterChips topics={topics} activeTopicId={topicId} basePath="/app" />

      <section className="grid gap-8 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-[13px] uppercase tracking-wide text-muted">
            Contactos ({contacts.length})
          </h2>
          {contacts.length === 0 && (
            <p className="text-sm text-muted">Nada por acá todavía.</p>
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
            <p className="text-sm text-muted">Nada por acá todavía.</p>
          )}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
