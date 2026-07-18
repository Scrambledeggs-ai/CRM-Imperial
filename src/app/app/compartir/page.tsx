import { ShareCaptureForm } from "./ShareCaptureForm";

const URL_RE = /https?:\/\/\S+/;

export default async function CompartirPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; text?: string; url?: string }>;
}) {
  const { title, text, url } = await searchParams;

  const fromText = text ?? "";
  const extractedUrl = url || fromText.match(URL_RE)?.[0] || "";
  const remainder = fromText.replace(URL_RE, "").trim();
  const defaultTitle = title || remainder || "Post compartido";

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <header>
        <h1 className="text-2xl font-semibold">Guardar post compartido</h1>
        <p className="text-sm text-muted mt-1">
          Revisa los datos y guárdalo — llegó desde el botón &quot;Compartir&quot;.
        </p>
      </header>
      <ShareCaptureForm defaultUrl={extractedUrl} defaultTitle={defaultTitle} />
    </div>
  );
}
