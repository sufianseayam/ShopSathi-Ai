"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const navigation = [
  ["Why ShopSathi", "#problem"],
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
];

export function SiteHeader() {
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setSigningOut(true);
    setError("");

    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(result.error.message || "Unable to sign out. Please try again.");
      }
    } catch {
      setError("Unable to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="ShopSathi AI home">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-700 text-sm font-black text-white">
            S
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-950">
            ShopSathi <span className="text-orange-500">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navigation.map(([label, href]) => (
            <a key={href} href={href} className="text-sm font-medium text-slate-600 transition hover:text-blue-700">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          {isPending ? (
            <span className="hidden text-sm text-slate-500 sm:inline">Checking session…</span>
          ) : session?.user ? (
            <>
              <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 sm:inline">
                {session.user.name}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-60"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-blue-700 sm:inline-flex">
                Log in
              </Link>
              <Link href="/signup" className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mx-auto max-w-7xl px-8 pb-3 text-right text-sm text-red-600">
          {error}
        </p>
      )}
    </header>
  );
}
