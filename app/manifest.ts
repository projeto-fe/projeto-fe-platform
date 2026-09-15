import type { MetadataRoute } from "next";

import { marca } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Portal Projeto Fé",
    short_name: "Projeto Fé",
    description: "Portal da equipe do Instituto Projeto Fé.",
    start_url: "/",
    display: "standalone",
    background_color: marca.azul,
    theme_color: marca.azul,
    icons: [{ src: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  };
}
