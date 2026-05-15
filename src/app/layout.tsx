import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import LayoutShell from "@/components/LayoutShell";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Admin – Sahera Pak Kirno",
  description: "Admin panel untuk Sistem Pesan Online Kantin Sahera Pak Kirno",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={montserrat.className}>
        <AdminAuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
