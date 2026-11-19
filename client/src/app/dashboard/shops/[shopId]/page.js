"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Boxes } from "lucide-react";
import { ShopForm } from "@/components/shop-form";
import { ErrorMessage, LoadingState } from "@/components/dashboard-ui";
import { apiRequest } from "@/lib/api";

export default function ShopDetailsPage() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(`/shops/${shopId}`)
      .then((result) => setShop(result.shop))
      .catch((requestError) => setError(requestError.message));
  }, [shopId]);

  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!shop) return <LoadingState label="Loading shop…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:p-6">
        <div><p className="text-sm font-semibold text-blue-700">{shop.productCount} products</p><h2 className="mt-1 text-xl font-black text-slate-950">Manage products for {shop.name}</h2></div>
        <Link href={`/dashboard/shops/${shop._id}/products`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"><Boxes size={17} /> View products <ArrowRight size={16} /></Link>
      </div>
      <ShopForm shop={shop} />
    </div>
  );
}
