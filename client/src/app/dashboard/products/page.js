"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Boxes, Store } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { EmptyState, ErrorMessage, LoadingState } from "@/components/dashboard-ui";

export default function ProductsOverviewPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/shops")
      .then((result) => setShops(result.shops))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-7">
      <div><p className="text-sm font-bold uppercase tracking-widest text-blue-700">Catalogs</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Products</h2><p className="mt-2 text-slate-600">Choose a shop to view and manage its products.</p></div>
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <LoadingState label="Loading product catalogs…" /> : shops.length === 0 ? (
        <EmptyState title="Create a shop first" description="Product catalogs belong to a shop. Create one to start adding products." action={<Link href="/dashboard/shops/create" className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white">Create a shop</Link>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shops.map((shop) => (
            <Link key={shop._id} href={`/dashboard/shops/${shop._id}/products`} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md">
              {shop.logo?.url ? <img src={shop.logo.url} alt="" className="size-12 rounded-xl object-cover" /> : <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-700"><Store size={20} /></span>}
              <span className="min-w-0 flex-1"><span className="block truncate font-bold text-slate-900">{shop.name}</span><span className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><Boxes size={15} /> {shop.productCount} products</span></span>
              <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
