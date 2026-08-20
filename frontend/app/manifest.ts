import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LMS AKL | SMK Ma'arif NU 01 Limpung",
    short_name: "LMS AKL",
    description:
      "Sistem pembelajaran digital untuk siswa, guru, dan admin jurusan Akuntansi dan Keuangan Lembaga SMK Ma'arif NU 01 Limpung.",
    start_url: "/",
    display: "standalone",
    background_color: "#F2F0E4",
    theme_color: "#B45309",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
