export type BrandSlug = "dapur-bwaji" | "hoki-dimsum";

export interface Brand {
  slug: BrandSlug;
  name: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  logoPath: string;
  heroImagePath: string;
}

export const BRANDS: Brand[] = [
  {
    slug: "dapur-bwaji",
    name: "Dapur Bwaji",
    tagline: "Cita Rasa Rumahan yang Menggugah Selera",
    description:
      "Masakan nusantara dengan bahan pilihan dan bumbu rempah asli Indonesia.",
    primaryColor: "#E85D04",
    accentColor: "#FAA307",
    logoPath: "/images/brands/dapur-bwaji/logo.png",
    heroImagePath: "/images/brands/dapur-bwaji/hero.jpg",
  },
  {
    slug: "hoki-dimsum",
    name: "Hoki Dimsum",
    tagline: "Dimsum Segar, Rezeki Lancar",
    description:
      "Dimsum premium dengan kulit tipis dan isian melimpah, dibuat fresh setiap hari.",
    primaryColor: "#D62828",
    accentColor: "#F7B731",
    logoPath: "/images/brands/hoki-dimsum/logo.png",
    heroImagePath: "/images/brands/hoki-dimsum/hero.jpg",
  },
];
