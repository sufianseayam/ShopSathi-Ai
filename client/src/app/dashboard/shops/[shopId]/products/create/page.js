"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/product-form";
import { ErrorMessage, LoadingState } from "@/components/dashboard-ui";
import { apiRequest } from "@/lib/api";

export default function CreateProductPage() {
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
  return <ProductForm shopId={shopId} />;
}
