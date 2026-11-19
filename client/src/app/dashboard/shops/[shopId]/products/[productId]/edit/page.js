"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/product-form";
import { ErrorMessage, LoadingState } from "@/components/dashboard-ui";
import { apiRequest } from "@/lib/api";

export default function EditProductPage() {
  const { shopId, productId } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(`/shops/${shopId}/products/${productId}`)
      .then((result) => setProduct(result.product))
      .catch((requestError) => setError(requestError.message));
  }, [productId, shopId]);

  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!product) return <LoadingState label="Loading product…" />;
  return <ProductForm shopId={shopId} product={product} />;
}
