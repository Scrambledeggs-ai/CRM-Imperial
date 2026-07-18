import { getSetting } from "@/lib/queries";
import { WebhookSettings } from "./WebhookSettings";

const EXPORTS = [
  {
    href: "/api/export/json",
    label: "Todo (JSON)",
    desc: "Contactos, posts, temas y sus relaciones en un solo archivo.",
  },
  {
    href: "/api/export/sql",
    label: "Todo (SQL)",
    desc: "Statements INSERT listos para restaurar en cualquier Postgres.",
  },
  {
    href: "/api/export/contacts-csv",
    label: "Contactos (CSV)",
    desc: "Para abrir en Excel, Google Sheets, etc.",
  },
  {
    href: "/api/export/posts-csv",
    label: "Posts (CSV)",
    desc: "Para abrir en Excel, Google Sheets, etc.",
  },
];

export default async function ExportarPage() {
  const webhookUrl = await getSetting("webhook_url");

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold">Exportar</h1>
        <p className="text-sm text-muted mt-1">
          Descarga tus datos en el formato que necesites. Nada de esto queda
          guardado en ningún lado más que en tu descarga.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {EXPORTS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-[var(--radius-panel)] border border-panel-border bg-panel p-4 hover:border-accent transition-colors"
          >
            <p className="font-medium">{item.label}</p>
            <p className="text-sm text-muted mt-1">{item.desc}</p>
          </a>
        ))}
      </div>

      <WebhookSettings initialValue={webhookUrl ?? ""} />
    </div>
  );
}
