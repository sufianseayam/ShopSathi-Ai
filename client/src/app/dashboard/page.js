"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Boxes, Package, Plus, Store } from "lucide-react";
import { apiRequest, formatPrice } from "@/lib/api";
import { EmptyState, ErrorMessage, LoadingState } from "@/components/dashboard-ui";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/dashboard/summary")
      .then(setSummary)
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Overview</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Your shops at a glance</h2>
          <p className="mt-2 text-slate-600">Manage your stores and keep product information organized.</p>
        </div>
        <Link href="/dashboard/shops/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"><Plus size={18} /> Create a shop</Link>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!summary && !error ? <LoadingState label="Loading your overview…" /> : null}
      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total shops" value={summary.totalShops} icon={Store} accent="blue" />
            <StatCard label="Products" value={summary.totalProducts} icon={Boxes} accent="orange" />
            <StatCard label="Units in stock" value={summary.totalStock} icon={Package} accent="green" />
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div><h3 className="text-lg font-bold text-slate-950">Recent products</h3><p className="mt-1 text-sm text-slate-500">The latest items added across your shops.</p></div>
              <Link href="/dashboard/products" className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:text-blue-900">View all <ArrowRight size={16} /></Link>
            </div>
            {summary.recentProducts.length === 0 ? (
              <EmptyState
                title="No products yet"
                description="Create your first shop, then add a product to get started."
                action={<Link href="/dashboard/shops/create" className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800">Create a shop</Link>}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {summary.recentProducts.map((product) => (
                  <div key={product._id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <ProductThumbnail image={product.images?.[0]?.url} />
                    <div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{product.name}</p><p className="mt-1 text-xs text-slate-500">{product.shopName} · {product.category}</p></div>
                    <div className="text-right"><p className="font-bold text-slate-900">{formatPrice(product.price)}</p><p className="mt-1 text-xs text-slate-500">{product.stockQuantity} in stock</p></div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-700",
  };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`grid size-10 place-items-center rounded-xl ${colors[accent]}`}><Icon size={20} /></span></div>
      <p className="mt-4 text-3xl font-black text-slate-950">{Number(value || 0).toLocaleString()}</p>
    </article>
  );
}

export function ProductThumbnail({ image }) {
  return image
    ? <img src={image} alt="" className="size-12 shrink-0 rounded-xl border border-slate-100 object-cover" />
    : <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400"><Package size={20} /></span>;
}
