"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Eye, EyeOff, Store } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    setServerError("");

    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        setServerError(result.error.message || "Unable to sign in. Check your details and try again.");
        return;
      }

      const sessionResult = await authClient.getSession();
      if (sessionResult.error || !sessionResult.data) {
        setServerError(sessionResult.error?.message || "Signed in, but your session could not be confirmed. Please try again.");
        return;
      }

      router.replace(
        sessionResult.data.user.role === "shop_owner" ? "/owner" : "/customer",
      );
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-blue-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 font-extrabold">
          <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-orange-300"><Store size={22} /></span>
          <span className="text-xl">ShopSathi <span className="text-orange-300">AI</span></span>
        </Link>
        <div className="relative z-10 max-w-lg pb-12">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-300">Welcome back</p>
          <h1 className="mt-5 text-5xl font-black leading-tight">Let’s make support feel more human.</h1>
          <p className="mt-5 text-lg leading-8 text-blue-100/75">Pick up where you left off and keep building a better experience for your shoppers.</p>
        </div>
        <p className="text-sm text-blue-100/50">Support in Bangla, English, and Banglish.</p>
        <div className="absolute -bottom-40 -right-40 size-[30rem] rounded-full border-[70px] border-white/[0.04]" />
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="mt-10">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Your shop is waiting</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Log in to ShopSathi</h2>
            <p className="mt-2 text-slate-600">Enter your details to continue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                {...register("email", {
                  required: "Email is required.",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." },
                })}
              />
              {errors.email && <p id="email-error" className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-12 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  {...register("password", { required: "Password is required." })}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700">
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {serverError && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">
            New to ShopSathi?{" "}
            <Link href="/signup" className="font-bold text-blue-700 hover:text-blue-900">Create an account</Link>
          </p>
          <p className="mt-10 text-center text-xs leading-5 text-slate-400">Your account is securely managed by Better Auth.</p>
        </div>
      </section>
    </main>
  );
}
