import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8">
      <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-700"><Settings size={22} /></span>
      <h2 className="mt-5 text-2xl font-black text-slate-950">Workspace settings</h2>
      <p className="mt-2 max-w-xl leading-7 text-slate-600">Account and workspace preferences will be available here in a future step.</p>
    </section>
  );
}
