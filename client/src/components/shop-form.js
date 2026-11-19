"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, ImagePlus, LoaderCircle, X } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { ErrorMessage } from "@/components/dashboard-ui";

const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export function ShopForm({ shop }) {
  const [logoFile, setLogoFile] = useState(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [serverError, setServerError] = useState("");
  const [createdShopId, setCreatedShopId] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: shop?.name || "",
      description: shop?.description || "",
      category: shop?.category || "",
      email: shop?.email || "",
      phone: shop?.phone || "",
      website: shop?.website || "",
      address: shop?.address || "",
      facebookPage: shop?.facebookPage || "",
    },
  });

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }

    const preview = URL.createObjectURL(logoFile);
    setLogoPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [logoFile]);

  async function onSubmit(values) {
    setServerError("");
    setCreatedShopId("");
    const body = {
      ...values,
      email: values.email.trim(),
      website: values.website.trim(),
      facebookPage: values.facebookPage.trim(),
      logo: shop?.logo && !logoRemoved && !logoFile ? shop.logo : null,
    };

    try {
      let savedShop;
      if (shop) {
        if (logoFile) {
          const formData = new FormData();
          formData.append("images", logoFile);
          const upload = await apiRequest(`/shops/${shop._id}/logo`, {
            method: "POST",
            body: formData,
          });
          body.logo = upload.image;
        } else if (logoRemoved) {
          body.logo = null;
        }
        savedShop = (await apiRequest(`/shops/${shop._id}`, { method: "PATCH", body })).shop;
      } else {
        savedShop = (await apiRequest("/shops", { method: "POST", body })).shop;
        setCreatedShopId(savedShop._id);
        if (logoFile) {
          const formData = new FormData();
          formData.append("images", logoFile);
          const upload = await apiRequest(`/shops/${savedShop._id}/logo`, {
            method: "POST",
            body: formData,
          });
          savedShop = (await apiRequest(`/shops/${savedShop._id}`, {
            method: "PATCH",
            body: { logo: upload.image },
          })).shop;
        }
      }

      window.location.assign(`/dashboard/shops/${savedShop._id}`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not save this shop.");
    }
  }

  const shownLogo = logoPreview || (!logoRemoved ? shop?.logo?.url : null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      <div className="flex items-start gap-4">
        <Link href="/dashboard/shops" aria-label="Back to shops" className="mt-1 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-blue-700"><ArrowLeft size={18} /></Link>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">{shop ? "Shop details" : "Create a shop"}</h2>
          <p className="mt-1 text-sm text-slate-500">Set up the details customers will use to recognize your shop.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="mb-6">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Shop logo</span>
          <div className="flex items-center gap-4">
            {shownLogo ? (
              <div className="relative size-20 overflow-hidden rounded-2xl border border-slate-200">
                <img src={shownLogo} alt="Shop logo preview" className="size-full object-cover" />
                <button type="button" onClick={() => { setLogoFile(null); setLogoRemoved(true); }} aria-label="Remove shop logo" className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-slate-950/75 text-white hover:bg-red-600"><X size={14} /></button>
              </div>
            ) : (
              <label className="grid size-20 cursor-pointer place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-blue-400 hover:text-blue-700">
                <span className="flex flex-col items-center gap-1 text-xs font-semibold"><ImagePlus size={20} /> Add logo</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file && ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024) {
                    setLogoFile(file);
                    setLogoRemoved(false);
                  } else if (file) setServerError("Choose a JPG, PNG, or WebP logo up to 5 MB.");
                }} />
              </label>
            )}
            <p className="max-w-sm text-xs leading-5 text-slate-500">JPG, PNG, or WebP. Up to 5 MB. Configure ImgBB on the server to enable uploads.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Shop name" error={errors.name?.message}>
            <input className={fieldClass} placeholder="e.g. Dhaka Style House" {...register("name", { required: "Shop name is required.", minLength: { value: 2, message: "Use at least 2 characters." }, maxLength: { value: 100, message: "Use 100 characters or fewer." } })} />
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <select className={fieldClass} {...register("category", { required: "Choose a shop category." })}>
              <option value="">Select a category</option>
              {["Fashion", "Beauty & Care", "Electronics", "Home & Living", "Food & Grocery", "Books & Stationery", "Other"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description" error={errors.description?.message}>
              <textarea rows={4} className={fieldClass} placeholder="Tell customers a little about your shop." {...register("description", { maxLength: { value: 2000, message: "Use 2,000 characters or fewer." } })} />
            </Field>
          </div>
          <Field label="Contact email" error={errors.email?.message}>
            <input type="email" className={fieldClass} placeholder="hello@example.com" {...register("email", { pattern: { value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." } })} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input type="tel" className={fieldClass} placeholder="+880 1XXX-XXXXXX" {...register("phone", { maxLength: { value: 40, message: "Phone must be 40 characters or fewer." } })} />
          </Field>
          <Field label="Website" error={errors.website?.message}>
            <input type="url" className={fieldClass} placeholder="https://example.com" {...register("website", { pattern: { value: /^$|^https?:\/\/.+/i, message: "Include http:// or https://." } })} />
          </Field>
          <Field label="Facebook page" error={errors.facebookPage?.message}>
            <input type="url" className={fieldClass} placeholder="https://facebook.com/yourshop" {...register("facebookPage", { pattern: { value: /^$|^https?:\/\/.+/i, message: "Include http:// or https://." } })} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Address" error={errors.address?.message}>
              <textarea rows={2} className={fieldClass} placeholder="Shop or business address" {...register("address", { maxLength: { value: 500, message: "Use 500 characters or fewer." } })} />
            </Field>
          </div>
        </div>
        <div className="mt-6"><ErrorMessage>{serverError}</ErrorMessage></div>
        {createdShopId && serverError && (
          <Link href={`/dashboard/shops/${createdShopId}`} className="mt-3 inline-block text-sm font-bold text-blue-700 hover:underline">
            Shop created. Open it to finish setup.
          </Link>
        )}
        <div className="mt-7 flex justify-end">
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60">
            {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
            {isSubmitting ? "Saving…" : shop ? "Save changes" : "Create shop"}
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
