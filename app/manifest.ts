import type { MetadataRoute } from "next";

import { messages } from "@/config/messages";
import { routes } from "@/config/routes";
import { site } from "@/config/site";

/**
 * The web app manifest, served by Next at `/manifest.webmanifest`.
 *
 * The icon files live in `public/icons/` and are referenced here ahead of being
 * added, so dropping them in is all that is left. `start_url` is the dashboard
 * — the app's home — and an unauthenticated launch simply lands on login.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: messages.app.description,
    start_url: routes.dashboard,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    dir: "rtl",
    lang: "fa",
    background_color: "#ffffff",
    theme_color: "#ff6b1a",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
