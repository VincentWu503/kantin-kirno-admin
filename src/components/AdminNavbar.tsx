"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  {
    key: "order",
    label: "Order",
    href: "/order",
    icon: (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (!href) return false;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed left-0 right-0 bg-blue-600 text-white shadow-sm z-50
                    md:top-0 md:h-16
                    max-md:bottom-0 max-md:h-20">
      <div className="flex h-full items-center px-4 max-w-screen-xl mx-auto">
        
        {/* Hamburger Menu (Desktop Only) */}
        <div className="hidden md:flex items-center mr-4">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex h-full items-center justify-around flex-1 gap-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center justify-center transition-all p-2 md:px-4 md:py-2 rounded-lg
                            max-md:flex-col max-md:space-y-1 
                            md:flex-row md:space-x-0
                            hover:bg-blue-700 hover:shadow-sm ${
                              active ? "bg-blue-700 shadow-sm font-semibold" : "opacity-90 hover:opacity-100"
                            }`}
              >
                <div className="w-6 h-6 hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                {/* REUSED LOGIC: Conditional rendering structure from User Navbar adapted with state logic */}
                <span className={`text-xs md:text-sm tracking-wide transition-all duration-300 overflow-hidden
                                  max-md:block md:whitespace-nowrap 
                                  ${isOpen ? 'md:max-w-[100px] md:opacity-100 md:ml-3' : 'md:max-w-0 md:opacity-0 md:ml-0'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
