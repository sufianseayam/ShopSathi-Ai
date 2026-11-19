"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Store, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const roleDetails = {
  shop_owner: {
    title: "Shop Owner",
    heading: "Welcome to your shop space.",
    description:
      "Your ShopSathi workspace is ready. Shop management tools will be added in a future phase.",
    icon: Store,
  },
  customer: {
    title: "Customer",
    heading: "Welcome to your customer space.",
    description:
      "Your customer account is ready. Order features will be added in a future phase.",
    icon: UserRound,
  },
};

export function RoleLanding({ requiredRole }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const userRole = session?.user?.role === "shop_owner" ? "shop_owner" : "customer";
  const details = roleDetails[requiredRole];
  const Icon = details.icon;

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (userRole !== requiredRole) {
      router.replace(userRole === "shop_owner" ? "/owner" : "/customer");
    }
  }, [isPending, requiredRole, router, session, userRole]);

  if (isPending || !session?.user || userRole !== requiredRole) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <p className="text-sm font-medium text-slate-500">Checking your account…</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-50 via-white to-orange-50 px-5 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl shadow-blue-900/[0.06] sm:p-12">
        <Link href="/" className="mx-auto inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-700">
          <ArrowLeft size={16} /> ShopSathi AI
        </Link>
        <span className="mx-auto mt-8 grid size-16 place-items-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon size={28} />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-orange-600">
          {details.title} account
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          {details.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-slate-600">
          {details.description}
        </p>
        <p className="mt-6 text-sm text-slate-500">
          Signed in as <span className="font-semibold text-slate-700">{session.user.name}</span>
        </p>
        {requiredRole === "shop_owner" && (
          <Link href="/dashboard" className="mt-7 inline-flex rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800">
            Open Shop Owner dashboard
          </Link>
        )}
        <button
          type="button"
          onClick={async () => {
            await authClient.signOut();
            router.replace("/login");
          }}
          className="mt-4 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
        >
          Sign out
        </button>
      </section>
    </main>
  );
}
