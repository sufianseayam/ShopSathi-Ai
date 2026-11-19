"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Boxes, Pencil, Plus, Store, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { EmptyState, ErrorMessage, LoadingState } from "@/components/dashboard-ui";

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadShops = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiRequest("/shops");
      setShops(result.shops);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadShops(); }, [loadShops]);

  async function removeShop(shop) {
    if (!window.confirm(`Delete “${shop.name}” and all its products? This cannot be undone.`)) return;
    try {
      await apiRequest(`/shops/${shop._id}`, { method: "DELETE" });
      setShops((current) => current.filter((item) => item._id !== shop._id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold uppercase tracking-widest text-blue-700">Your business</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">My Shops</h2><p className="mt-2 text-slate-600">Each shop has its own product catalog.</p></div>
        <Link href="/dashboard/shops/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"><Plus size={18} /> Add shop</Link>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <LoadingState label="Loading your shops…" /> : shops.length === 0 ? (
        <EmptyState title="Your first shop starts here" description="Create a shop to organize products and manage its details." action={<Link href="/dashboard/shops/create" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"><Plus size={17} /> Create a shop</Link>} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shops.map((shop) => (
            <article key={shop._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-4 p-5">
                {shop.logo?.url ? <img src={shop.logo.url} alt="" className="size-14 rounded-2xl border border-slate-100 object-cover" /> : <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Store size={23} /></span>}
                <div className="min-w-0"><h3 className="truncate font-bold text-slate-950">{shop.name}</h3><p className="mt-1 text-sm text-slate-500">{shop.category}</p></div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500"><span className="inline-flex items-center gap-2"><Boxes size={16} /> {shop.productCount} products</span><span className="truncate pl-3">{shop.slug}</span></div>
              <div className="flex gap-2 border-t border-slate-100 p-4">
                <Link href={`/dashboard/shops/${shop._id}/products`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-blue-800">Manage products <ArrowRight size={15} /></Link>
                <Link href={`/dashboard/shops/${shop._id}`} aria-label={`Edit ${shop.name}`} className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><Pencil size={16} /></Link>
                <button type="button" onClick={() => removeShop(shop)} aria-label={`Delete ${shop.name}`} className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
