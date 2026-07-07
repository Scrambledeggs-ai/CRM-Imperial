import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const FEATURES = [
  {
    title: "Captura rápida",
    body: "Guardá un post o un contacto en segundos, desde el celular o la compu, sin copiar links a mano en un doc aparte.",
  },
  {
    title: "Cruce por tema",
    body: "Contactos y posts se conectan por tema de interés. Filtrás por tema y ves quién habló de qué, y qué posts hay sobre eso.",
  },
  {
    title: "Pendientes tachables",
    body: "Lo que quedó por hacer con cada contacto o post, en un solo checklist. Tildás y queda tachado, sin perderlo de vista.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Image src="/imperio-logo-light.png" alt="Imperio" width={28} height={28} />
          <span className="font-semibold text-sm">CRM Imperial</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted">
          <a
            href="https://github.com/Scrambledeggs-ai/CRM-Imperial"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Comunidad
          </a>
          <ThemeToggle />
          <Link
            href="/app"
            className="px-4 py-2 rounded-[var(--radius-control)] bg-accent text-accent-ink font-medium"
          >
            Entrar
          </Link>
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-8 py-20 grid gap-12 sm:grid-cols-[minmax(0,620px)_auto] items-center">
        <div className="flex flex-col gap-6">
          <h1 className="text-[40px] sm:text-[56px] font-bold leading-[1.05]">
            El CRM que Skool no tiene
          </h1>
          <p className="text-[19px] text-[#c3cad8] leading-relaxed">
            Guardá los posts que te interesan y llevá un CRM de tu comunidad,
            cruzados por tema. Sin copiar links a mano en un doc aparte.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/app"
              className="px-5 py-3 rounded-[var(--radius-control)] bg-accent text-accent-ink font-medium"
            >
              Entrar
            </Link>
          </div>
        </div>
        <NodesIllustration />
      </header>

      <section
        id="landing-features"
        className="max-w-6xl mx-auto px-8 pb-24 grid gap-[22px] sm:grid-cols-3"
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-[var(--radius-panel)] p-6 bg-panel border border-panel-border"
          >
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function NodesIllustration() {
  const nodes = [
    { cx: 150, cy: 40, color: "#3b82f6" },
    { cx: 60, cy: 100, color: "#ef4444" },
    { cx: 240, cy: 100, color: "#f2c94c" },
    { cx: 150, cy: 160, color: "#2dd4bf" },
    { cx: 70, cy: 230, color: "#2dd4bf" },
    { cx: 190, cy: 240, color: "#22c55e" },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
    [3, 5],
  ];
  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      className="hidden sm:block justify-self-center"
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx}
          y1={nodes[a].cy}
          x2={nodes[b].cx}
          y2={nodes[b].cy}
          stroke="rgba(241,239,232,0.25)"
          strokeWidth={2}
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.cx} cy={n.cy} r={14} fill={n.color} />
      ))}
    </svg>
  );
}
