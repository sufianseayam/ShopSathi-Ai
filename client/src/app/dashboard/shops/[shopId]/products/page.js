"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, PackagePlus, Pencil, Search, Trash2 } from "lucide-react";
import { apiRequest, formatPrice } from "@/lib/api";
import { EmptyState, ErrorMessage, LoadingState } from "@/components/dashboard-ui";

export default function ShopProductsPage() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [result, setResult] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [shopResult, productResult] = await Promise.all([
        shop ? Promise.resolve({ shop }) : apiRequest(`/shops/${shopId}`),
        apiRequest(`/shops/${shopId}/products?${new URLSearchParams({
          page: String(page),
          limit: "12",
          ...(search ? { search } : {}),
          ...(category ? { category } : {}),
          ...(stockStatus ? { stockStatus } : {}),
        })}`),
      ]);
      if (
        !productResult
        || !Array.isArray(productResult.products)
        || !Array.isArray(productResult.categories)
        || !productResult.pagination
        || !Number.isInteger(productResult.pagination.total)
        || !Number.isInteger(productResult.pagination.totalPages)
      ) {
        throw new Error("The server returned an invalid products response. Please try again.");
      }
      setShop(shopResult.shop);
      setResult(productResult);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, [category, page, search, shop, shopId, stockStatus]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  async function removeProduct(product) {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    try {
      await apiRequest(`/shops/${shopId}/products/${product._id}`, { method: "DELETE" });
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link href="/dashboard/shops" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-700"><ArrowLeft size={15} /> My shops</Link>
          <p className="mt-4 text-sm font-bold uppercase tracking-widest text-blue-700">Product catalog</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{shop?.name || "Products"}</h2>
          <p className="mt-2 text-slate-600">{result?.pagination?.total || 0} products in this shop.</p>
        </div>
        <Link href={`/dashboard/shops/${shopId}/products/create`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"><PackagePlus size={18} /> Add product</Link>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_200px]">
        <label className="relative block"><span className="sr-only">Search products</span><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search products, brand, or SKU" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500">
          <option value="">All categories</option>
          {(result?.categories || []).map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={stockStatus} onChange={(event) => { setStockStatus(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500">
          <option value="">Any stock status</option>
          <option value="in_stock">In stock (&gt; 5)</option>
          <option value="low_stock">Low stock (1–5)</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </div>

      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <LoadingState label="Loading products…" /> : !result ? (
        <div className="space-y-3">
          {!error && <ErrorMessage>Products could not be loaded.</ErrorMessage>}
          <button type="button" onClick={loadProducts} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Try again</button>
        </div>
      ) : result.products.length === 0 ? (
        <EmptyState
          title={search || category || stockStatus ? "No matching products" : "No products in this shop yet"}
          description={search || category || stockStatus ? "Try changing the search or filters." : "Add your first product to start building this shop’s catalog."}
          action={!search && !category && !stockStatus && <Link href={`/dashboard/shops/${shopId}/products/create`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white"><PackagePlus size={16} /> Add product</Link>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {result?.products.map((product) => (
              <article key={product._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {product.images?.[0]?.url
                  ? <img src={product.images[0].url} alt={product.name} className="h-48 w-full bg-slate-100 object-cover" />
                  : <div className="grid h-48 place-items-center bg-slate-100 text-slate-400"><PackagePlus size={30} /></div>}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><h3 className="truncate font-bold text-slate-950">{product.name}</h3><p className="mt-1 text-sm text-slate-500">{product.category}{product.brand ? ` · ${product.brand}` : ""}</p></div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${product.stockQuantity > 5 ? "bg-emerald-50 text-emerald-700" : product.stockQuantity > 0 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{product.stockQuantity > 5 ? "In stock" : product.stockQuantity > 0 ? "Low stock" : "Out of stock"}</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between"><p className="text-lg font-black text-slate-950">{formatPrice(product.discountPrice ?? product.price)}{product.discountPrice != null && <span className="ml-2 text-sm font-medium text-slate-400 line-through">{formatPrice(product.price)}</span>}</p><p className="text-sm text-slate-500">Qty: {product.stockQuantity}</p></div>
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    <Link href={`/dashboard/shops/${shopId}/products/${product._id}/edit`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={15} /> Edit</Link>
                    <button type="button" onClick={() => removeProduct(product)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /> Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {result.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm text-slate-500">Page {page} of {result.pagination.totalPages}</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40"><ChevronLeft size={16} /> Previous</button>
                <button type="button" disabled={page >= result.pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40">Next <ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
