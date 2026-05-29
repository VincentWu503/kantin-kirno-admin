import type { Metadata } from "next";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import LayoutShell from "@/components/LayoutShell";
import "./globals.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export const metadata: Metadata = {
  title: "Admin – Sahera Pak Kirno",
  description: "Admin panel untuk Sistem Pesan Online Kantin Sahera Pak Kirno",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AdminAuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
