"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Eye, EyeOff, Store } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    setServerError("");

    try {
      const result = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email,
        password: values.password,
        role: values.role,
      });

      if (result.error) {
        setServerError(result.error.message || "Unable to create your account. Please try again.");
        return;
      }

      const sessionResult = await authClient.getSession();
      if (sessionResult.error || !sessionResult.data) {
        setServerError(sessionResult.error?.message || "Your account was created, but the session could not be confirmed. Please log in.");
        return;
      }

      router.replace(
        sessionResult.data.user.role === "shop_owner" ? "/owner" : "/customer",
      );
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to create your account. Please try again.");
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
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-300">A warmer welcome starts here</p>
          <h1 className="mt-5 text-5xl font-black leading-tight">Make every customer conversation count.</h1>
          <p className="mt-5 text-lg leading-8 text-blue-100/75">Create your account and take the first step toward more helpful, multilingual shop support.</p>
        </div>
        <p className="text-sm text-blue-100/50">Support in Bangla, English, and Banglish.</p>
        <div className="absolute -bottom-40 -right-40 size-[30rem] rounded-full border-[70px] border-white/[0.04]" />
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="mt-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Get started</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Create your account</h2>
            <p className="mt-2 text-slate-600">A few details and you’re ready to go.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
            <fieldset>
              <legend className="mb-2 block text-sm font-semibold text-slate-700">
                I’m creating an account as
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    value="shop_owner"
                    className="mt-1 accent-blue-700"
                    {...register("role", { required: "Choose an account type." })}
                  />
                  <span>
                    <span className="block text-sm font-bold text-slate-900">Shop Owner</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      I run an online shop
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    value="customer"
                    className="mt-1 accent-blue-700"
                    {...register("role", { required: "Choose an account type." })}
                  />
                  <span>
                    <span className="block text-sm font-bold text-slate-900">Customer</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      I place orders online
                    </span>
                  </span>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1.5 text-sm text-red-600">{errors.role.message}</p>
              )}
            </fieldset>

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                {...register("name", {
                  required: "Name is required.",
                  minLength: { value: 2, message: "Name must be at least 2 characters." },
                  maxLength: { value: 80, message: "Name must be 80 characters or fewer." },
                })}
              />
              {errors.name && <p id="name-error" className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>}
            </div>

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
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-12 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  {...register("password", {
                    required: "Password is required.",
                    minLength: { value: 8, message: "Password must be at least 8 characters." },
                  })}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700">
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Type your password again"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-12 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  {...register("confirmPassword", {
                    required: "Please confirm your password.",
                    validate: (value) => value === watch("password") || "Passwords do not match.",
                  })}
                />
                <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700">
                  {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              {errors.confirmPassword && <p id="confirm-password-error" className="mt-1.5 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            {serverError && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">{serverError}</p>}

            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-orange-500 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-blue-700 hover:text-blue-900">Log in</Link>
          </p>
          <p className="mt-8 text-center text-xs leading-5 text-slate-400">Your account is securely managed by Better Auth.</p>
        </div>
      </section>
    </main>
  );
}
