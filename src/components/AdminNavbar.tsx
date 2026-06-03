"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

const NAV_ITEMS = [
  {
    key: "order",
    label: "Order",
    href: "/order",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    key: "edit",
    label: "Edit",
    href: "/admin/menu",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    key: "close",
    label: "Close",
    href: "/admin/status",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </svg>
    ),
  },
  {
    key: "account",
    label: "Account",
    href: "/account",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  const handleClick = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.href) {
      router.push(item.href);
    }
  };

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (!item.href) return false;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-500 flex items-center justify-around py-3 px-2 z-40">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => handleClick(item)}
          className={`flex flex-col items-center gap-1 px-3 transition active:scale-90 ${
            isActive(item) ? "opacity-100" : "opacity-70 hover:opacity-100"
          }`}
        >
          <span className="text-white">{item.icon}</span>
          <span className="text-white text-[10px] font-medium">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
