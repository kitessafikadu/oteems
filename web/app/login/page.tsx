"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/lib/api/auth";
import { useUser } from "@/components/user-provider";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: userLoading, setUser } = useUser();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, userLoading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login({
        username,
        password,
      });

      if (response?.user) {
        setUser(response.user);
      }

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Invalid username or password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-oteems-black">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Side */}
        <section className="relative hidden overflow-hidden bg-oteems-black lg:flex">
          <div className="absolute inset-0">
            <div className="absolute left-[-10%] top-[15%] h-80 w-80 rounded-full bg-oteems-red/20 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-5%] h-96 w-96 rounded-full bg-oteems-red/10 blur-3xl" />
          </div>

          <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
            <Link
              href="/"
              className="text-2xl font-black tracking-[-0.06em] text-white"
            >
              OTEEMS<span className="text-oteems-red">.</span>
            </Link>

            <div className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-oteems-red">
                Employee Management
              </p>

              <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white xl:text-7xl">
                Your people.
                <br />
                One system.
              </h1>

              <p className="mt-7 max-w-md text-sm leading-6 text-white/45">
                Manage your workforce, departments, leave requests, and employee
                information from one centralized platform.
              </p>
            </div>

            <p className="text-xs text-white/30">OTech Engineering · OTEEMS</p>
          </div>
        </section>

        {/* Right Side */}
        <section className="flex min-h-screen flex-col">
          {/* Mobile Logo */}
          <div className="flex items-center p-6 lg:hidden">
            <Link href="/" className="text-xl font-black tracking-[-0.06em]">
              OTEEMS<span className="text-oteems-red">.</span>
            </Link>
          </div>

          {/* Login Form */}
          <div className="flex flex-1 items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="mb-10">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-oteems-red">
                  Welcome back
                </p>

                <h2 className="mt-3 text-4xl font-bold tracking-[-0.05em]">
                  Sign in
                </h2>

                <p className="mt-3 text-sm text-black/45">
                  Enter your account details to continue.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-xs font-semibold"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                    className="h-12 w-full rounded-lg border border-black/15 bg-white px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-oteems-red"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="h-12 w-full rounded-lg border border-black/15 bg-white px-4 pr-12 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-oteems-red"
                    />

                    {/* Show / Hide Password */}
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-black/5 hover:text-black"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3l18 18"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.58 10.58a2 2 0 002.84 2.84"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.88 4.24A10.5 10.5 0 0112 4c5 0 8.5 4 9.5 8-1 2-4.5 6-9.5 6-1.7 0-3.2-.45-4.45-1.15"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                          />
                          <circle cx="12" cy="12" r="2.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
                  >
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-lg bg-oteems-red text-sm font-semibold text-white transition-colors hover:bg-oteems-red-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-black/35">
                OTEEMS · Employee Management System
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
