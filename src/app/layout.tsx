import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "700", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Bwaji Group",
    template: "%s | Bwaji Group",
  },
  description: "Bwaji Group - Dapur Bwaji & Hoki Dimsum. Cita rasa terbaik untuk setiap momen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${archivo.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-[#1D1A40]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
