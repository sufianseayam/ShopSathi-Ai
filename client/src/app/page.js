import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Check,
  Globe2,
  Headphones,
  MessageCircle,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Always-on answers",
    description: "Help shoppers get quick answers about orders, delivery, returns, and your shop policies—any time of day.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: Store,
    title: "Your shop, your knowledge",
    description: "Bring product details and business policies together so support can stay relevant to your store.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Globe2,
    title: "Speak your customers’ language",
    description: "Make every conversation feel closer with Bangla, English, and Banglish support.",
    color: "bg-sky-50 text-sky-700",
  },
  {
    icon: ShieldCheck,
    title: "A consistent experience",
    description: "Give customers a clearer, more dependable place to turn when they need help shopping.",
    color: "bg-indigo-50 text-indigo-700",
  },
];

const steps = [
  ["01", "Connect your shop", "Bring your store information and support essentials into one place."],
  ["02", "Share what customers ask", "Organize product, order, delivery, and policy information for support."],
  ["03", "Support in their language", "Give shoppers a simple way to find the help they need."],
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative isolate bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="pointer-events-none absolute -right-36 -top-32 -z-10 size-[34rem] rounded-full border-[70px] border-blue-100/50" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm">
              <Sparkles size={16} className="text-orange-500" />
              A better way to support every shopper
            </p>
            <h1 className="mt-7 max-w-2xl text-5xl font-black leading-[1.06] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Every customer deserves to feel{" "}
              <span className="text-blue-700">understood.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Make e-commerce support feel easy, helpful, and closer to home—in Bangla, English, or Banglish.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-7 py-4 font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600">
                Get started for free <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
                See how it works <ArrowDown size={17} />
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Check size={16} className="text-blue-700" /> Made for online shops</span>
              <span className="inline-flex items-center gap-1.5"><Check size={16} className="text-blue-700" /> Three language styles</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -left-7 top-16 hidden rounded-2xl bg-white p-4 shadow-xl shadow-blue-900/10 sm:block">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-orange-100 text-orange-600"><PackageCheck size={21} /></span>
                <div><p className="text-xs text-slate-500">Order update</p><p className="text-sm font-bold text-slate-800">On its way!</p></div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-900/10 sm:p-7">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <span className="grid size-12 place-items-center rounded-2xl bg-blue-700 text-white"><Headphones size={23} /></span>
                <div className="flex-1"><p className="font-bold text-slate-900">ShopSathi support</p><p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><span className="size-2 rounded-full bg-emerald-500" /> Here to help</p></div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">বাংলা</span>
              </div>
              <div className="space-y-4 py-6">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-orange-500 px-4 py-3 text-sm leading-6 text-white">
                  Amar order ta kokhon ashbe?
                </div>
                <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
                  আপনার অর্ডারটি পথে আছে! আজকের মধ্যেই পৌঁছে যাবে। আর কিছু জানতে চান?
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-orange-500 px-4 py-3 text-sm leading-6 text-white">
                  Thanks, etai jante chaisilam 😊
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400">
                <span className="flex-1">Ask us anything…</span><span className="grid size-8 place-items-center rounded-full bg-blue-700 text-white"><ArrowRight size={16} /></span>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-5 hidden rounded-2xl bg-white px-4 py-3 shadow-xl shadow-blue-900/10 sm:flex sm:items-center sm:gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Zap size={20} /></span>
              <div><p className="text-xs text-slate-500">Helpful support</p><p className="text-sm font-bold text-slate-800">Anytime, anywhere</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">The support gap</p>
            <h2 className="mt-4 max-w-xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Great products deserve great conversations.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              Shoppers have questions before and after they buy. When answers are hard to find—or only available in one language—small doubts can become lost sales and frustrating experiences.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [MessageCircle, "The same questions, again and again", "Delivery, returns, product details—customers need clear answers."],
              [RotateCcw, "Support that never clocks out", "Shoppers may need help long after the working day is done."],
              [Globe2, "Language should not be a barrier", "People feel more confident when they can ask in their own words."],
              [Bot, "One helpful place to start", "Bring store information and customer questions closer together."],
            ].map(([Icon, title, description]) => (
              <article key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-white text-blue-700 shadow-sm"><Icon size={21} /></span>
                <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-24 bg-blue-950 px-5 py-20 text-white sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-300">Made for modern commerce</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Support that works for your shop and your shoppers.</h2>
            <p className="mt-5 leading-7 text-blue-100/75">A thoughtful foundation for faster, clearer, more welcoming customer conversations.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description, color }) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:bg-white/[0.1]">
                <span className={`grid size-12 place-items-center rounded-2xl ${color}`}><Icon size={23} /></span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-blue-100/75">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Simple by design</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">A clearer path to helpful support.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map(([number, title, description]) => (
              <article key={number} className="relative rounded-2xl border border-slate-100 bg-white p-7 shadow-lg shadow-slate-900/[0.03]">
                <span className="text-sm font-black tracking-widest text-orange-500">{number}</span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
                {number !== "03" && <ArrowRight className="absolute right-6 top-8 hidden text-blue-200 md:block" size={22} />}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-orange-50 px-5 py-16 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] bg-white p-7 shadow-sm sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">A familiar conversation feels better</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Bangla, English, and Banglish—your customers choose.</h2>
            <p className="mt-4 leading-7 text-slate-600">From “Where is my order?” to “Amar parcel kobe ashbe?”—make support feel natural and welcoming.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {["বাংলা", "English", "Banglish"].map((language) => (
              <span key={language} className="rounded-full border border-blue-100 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-800">{language}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-gradient-to-br from-blue-700 to-blue-950 px-7 py-14 text-center text-white sm:px-14">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/10 text-orange-300"><Sparkles size={26} /></span>
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Let’s make every customer feel at home.</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-blue-100">Start building a more helpful, more human support experience for your online shop.</p>
          <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-4 font-bold text-white transition hover:bg-orange-600">
            Get started with ShopSathi <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="font-extrabold text-slate-900">ShopSathi <span className="text-orange-500">AI</span></Link>
          <p>Thoughtful support for every shopping conversation.</p>
          <p>© {new Date().getFullYear()} ShopSathi AI</p>
        </div>
      </footer>
    </main>
  );
}
