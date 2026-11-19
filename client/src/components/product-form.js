"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { ErrorMessage } from "@/components/dashboard-ui";
import { ImageUploader } from "@/components/image-uploader";

const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const defaultValues = {
  name: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  discountPrice: "",
  sku: "",
  stockQuantity: 0,
  availability: "",
};

export function ProductForm({ shopId, product }) {
  const [images, setImages] = useState(product?.images || []);
  const [variantsText, setVariantsText] = useState(
    (product?.variants || []).map(({ name, options }) => `${name}: ${options.join(", ")}`).join("\n"),
  );
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: product ? {
      ...product,
      price: String(product.price),
      discountPrice: product.discountPrice == null ? "" : String(product.discountPrice),
    } : defaultValues,
  });

  useEffect(() => {
    if (!product) return;
    reset({
      ...product,
      price: String(product.price),
      discountPrice: product.discountPrice == null ? "" : String(product.discountPrice),
    });
    setImages(product.images || []);
    setVariantsText((product.variants || []).map(({ name, options }) => `${name}: ${options.join(", ")}`).join("\n"));
  }, [product, reset]);

  async function onSubmit(values) {
    setServerError("");
    let variants;
    try {
      variants = variantsText.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
        const separator = line.indexOf(":");
        if (separator <= 0) throw new Error("Write each variant as “Name: Option 1, Option 2”.");
        return {
          name: line.slice(0, separator).trim(),
          options: line.slice(separator + 1).split(",").map((option) => option.trim()).filter(Boolean),
        };
      });
    } catch (error) {
      setServerError(error.message);
      return;
    }

    const body = {
      ...values,
      price: Number(values.price),
      discountPrice: values.discountPrice === "" ? null : Number(values.discountPrice),
      stockQuantity: Number(values.stockQuantity),
      images,
      variants,
      availability: values.availability || undefined,
    };

    try {
      const path = `/shops/${shopId}/products${product ? `/${product._id}` : ""}`;
      await apiRequest(path, { method: product ? "PATCH" : "POST", body });
      window.location.assign(`/dashboard/shops/${shopId}/products`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not save this product.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-start gap-4">
        <Link href={`/dashboard/shops/${shopId}/products`} aria-label="Back to products" className="mt-1 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-blue-700"><ArrowLeft size={18} /></Link>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">{product ? "Edit product" : "Add a product"}</h2>
          <p className="mt-1 text-sm text-slate-500">Keep product details structured and up to date.</p>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <ImageUploader shopId={shopId} value={images} onChange={setImages} />

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Product name" error={errors.name?.message}>
            <input className={fieldClass} placeholder="e.g. Cotton Panjabi" {...register("name", { required: "Product name is required.", minLength: { value: 1, message: "Enter a product name." }, maxLength: { value: 160, message: "Use 160 characters or fewer." } })} />
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <input className={fieldClass} placeholder="e.g. Men's clothing" {...register("category", { required: "Category is required.", maxLength: { value: 100, message: "Use 100 characters or fewer." } })} />
          </Field>
          <Field label="Brand" error={errors.brand?.message}>
            <input className={fieldClass} placeholder="Brand name (optional)" {...register("brand", { maxLength: { value: 100, message: "Use 100 characters or fewer." } })} />
          </Field>
          <Field label="SKU" error={errors.sku?.message}>
            <input className={fieldClass} placeholder="Unique stock keeping unit (optional)" {...register("sku", { maxLength: { value: 100, message: "Use 100 characters or fewer." } })} />
          </Field>
          <Field label="Price (BDT)" error={errors.price?.message}>
            <input type="number" step="0.01" min="0" className={fieldClass} placeholder="0.00" {...register("price", { required: "Price is required.", valueAsNumber: true, min: { value: 0, message: "Price cannot be negative." }, validate: (value) => Number.isFinite(value) || "Enter a valid price." })} />
          </Field>
          <Field label="Discount price (BDT)" error={errors.discountPrice?.message}>
            <input type="number" step="0.01" min="0" className={fieldClass} placeholder="Optional" {...register("discountPrice", { setValueAs: (value) => value === "" ? "" : Number(value), min: { value: 0, message: "Discount price cannot be negative." }, validate: (value, formValues) => value === "" || Number(value) <= Number(formValues.price) || "Discount must not exceed the regular price." })} />
          </Field>
          <Field label="Stock quantity" error={errors.stockQuantity?.message}>
            <input type="number" min="0" step="1" className={fieldClass} {...register("stockQuantity", { required: "Stock quantity is required.", valueAsNumber: true, min: { value: 0, message: "Stock cannot be negative." }, validate: (value) => Number.isInteger(value) || "Use a whole number." })} />
          </Field>
          <Field label="Availability" error={errors.availability?.message}>
            <select className={fieldClass} {...register("availability")}>
              <option value="">Set automatically from stock</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="preorder">Pre-order</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description" error={errors.description?.message}>
              <textarea rows={5} className={fieldClass} placeholder="Describe the product, its materials, sizing, or other helpful details." {...register("description", { maxLength: { value: 5000, message: "Use 5,000 characters or fewer." } })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Variants" error="">
              <textarea rows={3} className={fieldClass} placeholder={"Size: S, M, L\nColor: Navy, Black"} value={variantsText} onChange={(event) => setVariantsText(event.target.value)} />
              <span className="mt-1.5 block text-xs text-slate-500">One per line. Format: Variant name: Option 1, Option 2</span>
            </Field>
          </div>
        </div>

        <ErrorMessage>{serverError}</ErrorMessage>
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60">
            {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
            {isSubmitting ? "Saving…" : product ? "Save product" : "Create product"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-semibold text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
