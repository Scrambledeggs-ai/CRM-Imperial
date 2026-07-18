import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CRM Imperial",
  description: "Contactos y posts de comunidad, cruzados por tema.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CRM Imperial",
  },
};

export const viewport = {
  themeColor: "#0a0e18",
};

// Sin preferencia guardada, arranca en oscuro (es el look pensado para la app).
const themeInitScript = `
(function () {
  var stored = localStorage.getItem("theme");
  var dark = stored ? stored === "dark" : true;
  document.documentElement.classList.toggle("dark", dark);
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
