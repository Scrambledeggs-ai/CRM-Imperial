"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NewItemModal } from "./NewItemModal";
import { FeedbackCta } from "./FeedbackCta";
import { ThemeToggle } from "../ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();
  const [modalTab, setModalTab] = useState<"contacto" | "post" | null>(null);

  const navItemClass = (active: boolean) =>
    `px-3 py-2 rounded-[var(--radius-control)] text-sm font-medium ${
      active ? "bg-accent text-accent-ink" : "text-muted hover:text-foreground"
    }`;

  return (
    <>
      <aside className="w-[220px] shrink-0 bg-background border-r border-panel-border flex flex-col p-4 gap-6 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/imperio-logo-light.png"
              alt="Imperio"
              width={28}
              height={28}
            />
            <span className="font-semibold text-sm">CRM Imperial</span>
          </Link>
          <ThemeToggle />
        </div>

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
          <Link
            href="/app/exportar"
            className={navItemClass(pathname === "/app/exportar")}
          >
            Exportar
          </Link>
          <Link href="/app/temas" className={navItemClass(pathname === "/app/temas")}>
            Temas
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

          <FeedbackCta />

          <p className="text-center text-[11px] text-muted mt-2">
            Desarrollado por{" "}
            <a
              href="https://zenau.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent underline"
            >
              zenau.ai
            </a>
          </p>
        </div>
      </aside>

      {modalTab && (
        <NewItemModal defaultTab={modalTab} onClose={() => setModalTab(null)} />
      )}
    </>
  );
}
