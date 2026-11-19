"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { ErrorMessage } from "@/components/dashboard-ui";

export function ImageUploader({ shopId, value = [], onChange, multiple = true, label = "Product images" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(files) {
    if (!files.length) return;
    setError("");

    if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      setError("Choose JPG, PNG, or WebP images.");
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const path = multiple
        ? `/shops/${shopId}/products/images`
        : `/shops/${shopId}/logo`;
      const result = await apiRequest(path, { method: "POST", body: formData });
      onChange(multiple ? [...value, ...result.images] : result.image);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const images = multiple ? value : value ? [value] : [];

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <div key={image.publicId} className="group relative size-24 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <img src={image.url} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(multiple ? value.filter(({ publicId }) => publicId !== image.publicId) : null)}
              aria-label="Remove image"
              className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-slate-950/75 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        ))}
        {(multiple ? value.length < 5 : images.length === 0) && (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="grid size-24 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-blue-400 hover:text-blue-700 disabled:opacity-60"
          >
            {busy ? <LoaderCircle className="animate-spin" size={22} /> : <span className="flex flex-col items-center gap-1 text-xs font-semibold"><ImagePlus size={21} /> Add image</span>}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className="hidden"
        onChange={(event) => upload(Array.from(event.target.files || []).slice(0, multiple ? 5 - value.length : 1))}
      />
      <p className="mt-2 text-xs text-slate-500">JPG, PNG, or WebP; up to 5 MB each{multiple ? ", 5 images maximum" : ""}.</p>
      <div className="mt-2"><ErrorMessage>{error}</ErrorMessage></div>
    </div>
  );
}
