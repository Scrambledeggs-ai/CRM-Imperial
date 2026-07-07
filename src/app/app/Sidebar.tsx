"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NewItemModal } from "./NewItemModal";

export function Sidebar() {
  const pathname = usePathname();
  const [modalTab, setModalTab] = useState<"contacto" | "post" | null>(null);

  const navItemClass = (active: boolean) =>
    `px-3 py-2 rounded-[var(--radius-control)] text-sm font-medium ${
      active ? "bg-accent text-accent-ink" : "text-muted hover:text-foreground"
    }`;

  return (
    <>
      <aside className="w-[220px] shrink-0 bg-background border-r border-panel-border flex flex-col p-4 gap-6 min-h-screen">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/imperio-logo-light.png"
            alt="Imperio"
            width={28}
            height={28}
          />
          <span className="font-semibold text-sm">CRM Imperial</span>
        </Link>

        <nav className="flex flex-col gap-1">
          <Link href="/app" className={navItemClass(pathname === "/app")}>
            Inicio
          </Link>
          <Link
            href="/app/pendientes"
            className={navItemClass(pathname === "/app/pendientes")}
          >
            Pendientes
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setModalTab("contacto")}
            className="px-3 py-2 rounded-[var(--radius-control)] text-sm font-medium border border-panel-border hover:border-accent"
          >
            + Contacto
          </button>
          <button
            type="button"
            onClick={() => setModalTab("post")}
            className="px-3 py-2 rounded-[var(--radius-control)] text-sm font-medium border border-panel-border hover:border-accent"
          >
            + Post
          </button>

          <a
            href="mailto:flow@zenau.ai?subject=CRM%20Imperial%20v2.0%20-%20idea"
            className="mt-4 text-center px-3 py-2 rounded-[var(--radius-control)] text-xs font-mono border border-dashed border-panel-border text-muted hover:text-accent hover:border-accent"
          >
            ¿Querés v2.0?
            <br />
            Pedí tu función →
          </a>
        </div>
      </aside>

      {modalTab && (
        <NewItemModal defaultTab={modalTab} onClose={() => setModalTab(null)} />
      )}
    </>
  );
}
