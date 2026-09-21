import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAS TI26A3 | Sistem Kas Kelas TI26A3 Universitas Duta Bangsa",
  description: "Kelola iuran kelas, pembayaran, dan laporan kas secara digital, transparan, dan mudah.",
  keywords: ["kas kelas", "ti26a3", "universitas duta bangsa", "pembayaran digital", "qris"],
  authors: [{ name: "TI26A3" }],
  openGraph: {
    title: "KAS TI26A3 - Sistem Kas Kelas Digital",
    description: "Kelola iuran kelas secara digital dan transparan",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
