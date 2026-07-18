import { getPendingItems } from "@/lib/queries";
import { PendingTabs } from "./PendingTabs";
import { OverdueChecker } from "./OverdueChecker";

export default async function PendientesPage() {
  const { contacts, posts } = await getPendingItems();
  const pendingCount =
    contacts.filter((c) => !c.done).length + posts.filter((p) => !p.done).length;

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <OverdueChecker />
      <header>
        <h1 className="text-2xl font-semibold">Pendientes ({pendingCount})</h1>
        <p className="text-sm text-muted mt-1">
          Todo lo que quedó por hacer, de contactos y posts, en un solo lugar.
        </p>
      </header>

      <PendingTabs contacts={contacts} posts={posts} />
    </div>
  );
}
