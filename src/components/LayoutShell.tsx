"use client";

import { usePathname } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import AdminNavbar from "@/components/AdminNavbar";

const NO_CHROME_PATHS = ["/admin/login"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = NO_CHROME_PATHS.some((p) => pathname.startsWith(p));

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminHeader />
      <main className="flex-1 pb-20">{children}</main>
      <AdminNavbar />
    </div>
  );
}