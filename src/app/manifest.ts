import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CRM Imperial",
    short_name: "Imperial",
    description: "Contactos y posts de comunidad, cruzados por tema.",
    start_url: "/app",
    display: "standalone",
    background_color: "#0a0e18",
    theme_color: "#0a0e18",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    share_target: {
      action: "/app/compartir",
      method: "GET",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
  };
}
