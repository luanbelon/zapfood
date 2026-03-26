import type { MetadataRoute } from "next";
import { getPrimaryColor, getStoreName } from "@/lib/env";

export default function manifest(): MetadataRoute.Manifest {
  const name = getStoreName();
  const theme = getPrimaryColor();
  return {
    name,
    short_name: name.slice(0, 12),
    description: "Peça pelo WhatsApp",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: theme,
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
