import { getAllDataForExport } from "@/lib/queries";
import { buildSqlDump } from "@/lib/sqlDump";

export async function GET() {
  const data = await getAllDataForExport();
  const sql = buildSqlDump(data);
  return new Response(sql, {
    headers: {
      "Content-Type": "application/sql",
      "Content-Disposition": 'attachment; filename="crm-imperial-export.sql"',
    },
  });
}
