import Link from "next/link";
import { getContacts, getPosts, getTopicsWithCounts } from "@/lib/queries";
import { QuickCapture } from "./QuickCapture";
import { TopicChips } from "./TopicChips";
import { ThemeToggle } from "./ThemeToggle";

export default async function Home({
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

  const activeTopic = topics.find((t) => t.id === topicId);

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8 max-w-4xl mx-auto flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">CRM Imperial</h1>
          <p className="text-sm opacity-60">
            Compañeros de comunidad y posts guardados, cruzados por tema.
          </p>
          <Link href="/pendientes" className="text-sm underline opacity-80">
            Ver pendientes →
          </Link>
        </div>
        <ThemeToggle />
      </header>

      <QuickCapture />

      <section className="flex flex-col gap-3">
        <TopicChips topics={topics} activeTopicId={topicId} />
        {activeTopic && (
          <p className="text-sm opacity-60">
            Mostrando todo lo relacionado con <strong>{activeTopic.name}</strong>.
          </p>
        )}
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide opacity-60">
            Contactos ({contacts.length})
          </h2>
          {contacts.length === 0 && (
            <p className="text-sm opacity-60">Nada por acá todavía.</p>
          )}
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-lg border border-black/10 dark:border-white/15 p-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                {contact.skool_url ? (
                  <a
                    href={contact.skool_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    {contact.name}
                  </a>
                ) : (
                  <span className="font-medium">{contact.name}</span>
                )}
              </div>
              {contact.notes && (
                <p className="text-sm opacity-80 mt-1">{contact.notes}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {contact.topics.map(({ topic }) => (
                  <span
                    key={topic.id}
                    className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10"
                  >
                    {topic.name}
                  </span>
                ))}
              </div>
              {contact.topics.some((t) => t.pending_action) && (
                <ul className="mt-2 text-sm">
                  {contact.topics
                    .filter((t) => t.pending_action)
                    .map((t) => (
                      <li key={t.topic.id} className="text-amber-600 dark:text-amber-400">
                        ⏳ {t.pending_action} ({t.topic.name})
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide opacity-60">
            Posts ({posts.length})
          </h2>
          {posts.length === 0 && (
            <p className="text-sm opacity-60">Nada por acá todavía.</p>
          )}
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-black/10 dark:border-white/15 p-3"
            >
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                {post.title}
              </a>
              {post.notes && (
                <p className="text-sm opacity-80 mt-1">{post.notes}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {post.topics.map((topic) => (
                  <span
                    key={topic.id}
                    className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10"
                  >
                    {topic.name}
                  </span>
                ))}
              </div>
              {post.pending_action && (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  ⏳ {post.pending_action}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
