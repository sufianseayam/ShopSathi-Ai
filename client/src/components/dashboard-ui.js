import { AlertCircle, LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-medium text-slate-500">
      <LoaderCircle className="animate-spin text-blue-700" size={20} /> {label}
    </div>
  );
}

export function ErrorMessage({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
      <AlertCircle size={18} className="mt-0.5 shrink-0" /> {children}
    </p>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action}
    </div>
  );
}
