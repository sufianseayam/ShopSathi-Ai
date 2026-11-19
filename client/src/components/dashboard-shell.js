"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/shops", label: "My Shops", icon: Store },
  { href: "/dashboard/products", label: "Products", icon: Boxes },
];

export function DashboardShell({ children, title }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) router.replace("/login");
    else if (session.user.role !== "shop_owner") router.replace("/customer");
  }, [isPending, router, session]);

  async function logout() {
    setLogoutError("");
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setLogoutError(result.error.message || "Could not sign out.");
        return;
      }
      router.replace("/login");
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  if (isPending || !session?.user || session.user.role !== "shop_owner") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <p className="text-sm font-medium text-slate-500">Loading your workspace…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="flex shrink-0 flex-col border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
        <Link href="/dashboard" className="flex items-center gap-3 px-5 py-5">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-700 font-black text-white">S</span>
          <span className="text-lg font-extrabold text-slate-950">ShopSathi <span className="text-orange-500">AI</span></span>
        </Link>
        <p className="px-5 pb-2 pt-5 text-xs font-bold uppercase tracking-widest text-slate-400">Workspace</p>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden border-t border-slate-100 p-3 lg:block">
          <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <Settings size={18} /> Settings
          </Link>
          <button type="button" onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700">
            <LogOut size={18} /> Log out
          </button>
          {logoutError && <p role="alert" className="px-3 py-2 text-xs text-red-600">{logoutError}</p>}
        </div>
      </aside>
      <div className="min-w-0 flex-1 lg:ml-64">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Shop Owner</p>
            <h1 className="mt-1 text-lg font-bold text-slate-900">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm font-medium text-slate-600 sm:inline">{session.user.name}</span>
            <button type="button" onClick={logout} aria-label="Log out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"><LogOut size={19} /></button>
          </div>
        </header>
        {logoutError && <p role="alert" className="px-5 pt-4 text-sm text-red-600 sm:px-8">{logoutError}</p>}
        <main className="mx-auto max-w-7xl p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
