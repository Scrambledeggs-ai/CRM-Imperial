import { getAllDataForExport } from "@/lib/queries";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const { posts } = await getAllDataForExport();
  return new Response(toCsv(posts), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="crm-imperial-posts.csv"',
    },
  });
}
