import { getAllDataForExport } from "@/lib/queries";

export async function GET() {
  const data = await getAllDataForExport();
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="crm-imperial-export.json"',
    },
  });
}
