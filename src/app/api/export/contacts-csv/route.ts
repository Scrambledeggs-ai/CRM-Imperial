import { getAllDataForExport } from "@/lib/queries";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const { contacts } = await getAllDataForExport();
  return new Response(toCsv(contacts), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="crm-imperial-contactos.csv"',
    },
  });
}
