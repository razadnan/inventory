"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: "▦",
  },
  {
    name: "Products",
    href: "/products",
    icon: "📦",
  },
  {
    name: "Stock",
    href: "/stock",
    icon: "↕",
  },
  {
    name: "Challans",
    href: "/challans",
    icon: "📄",
  },
  {
    name: "AI Assistant",
    href: "/ai-assistant",
    icon: "✦",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 px-6 py-5">
        <h1 className="text-xl font-bold">Inventory</h1>
        <p className="mt-1 text-xs text-slate-400">
          Warehouse Management
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-slate-900"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <div className="rounded-lg bg-slate-800 p-3">
          <p className="text-sm font-medium">Admin</p>
          <p className="mt-1 text-xs text-slate-400">
            Warehouse Manager
          </p>
        </div>
      </div>
    </aside>
  );
}