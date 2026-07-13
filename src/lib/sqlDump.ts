function sqlValue(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

function insertStatements(table: string, rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return `-- (sin filas en ${table})\n`;
  const columns = Object.keys(rows[0]);
  const lines = rows.map(
    (row) =>
      `insert into ${table} (${columns.join(", ")}) values (${columns
        .map((c) => sqlValue(row[c]))
        .join(", ")});`,
  );
  return lines.join("\n") + "\n";
}

export function buildSqlDump(data: {
  contacts: Record<string, unknown>[];
  posts: Record<string, unknown>[];
  topics: Record<string, unknown>[];
  contact_topics: Record<string, unknown>[];
  post_topics: Record<string, unknown>[];
}): string {
  const parts = [
    `-- CRM Imperial — export SQL (${new Date().toISOString()})`,
    `-- Restaurar contra el esquema de supabase/migrations/*.sql`,
    "",
    "-- topics",
    insertStatements("topics", data.topics),
    "-- contacts",
    insertStatements("contacts", data.contacts),
    "-- posts",
    insertStatements("posts", data.posts),
    "-- contact_topics",
    insertStatements("contact_topics", data.contact_topics),
    "-- post_topics",
    insertStatements("post_topics", data.post_topics),
  ];
  return parts.join("\n");
}
