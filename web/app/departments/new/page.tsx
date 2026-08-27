"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createDepartment } from "@/lib/api/admin";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function NewDepartmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then((currentUser) => {
        setUser(currentUser);
        if (currentUser.role !== "ADMIN" && currentUser.role !== "HR_USER") {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        removeAccessToken();
        router.replace("/login");
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createDepartment({ name });
      router.replace("/departments");
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      if (error?.status === 401 || error?.status === 403) {
        removeAccessToken();
        router.replace("/login");
        return;
      }
      setError(error?.message || "Failed to create department.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-md">
            <h2 className="text-3xl font-bold tracking-[-0.05em]">
              Add Department
            </h2>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold">
                  Department Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  placeholder="e.g., Finance"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-oteems-red text-sm font-semibold text-white transition-colors hover:bg-oteems-red-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Department"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
