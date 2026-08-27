"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDepartments } from "@/lib/api/admin";
import type { Department } from "@/types/department";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function DepartmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (user) {
      getDepartments()
        .then((data: Department[]) => setDepartments(data))
        .catch((err: unknown) => {
          const error = err as { status?: number; message?: string };
          if (error?.status === 401 || error?.status === 403) {
            removeAccessToken();
            router.replace("/login");
            return;
          }
          setError(error?.message || "Failed to load departments.");
        })
        .finally(() => setLoading(false));
    }
  }, [user, router]);

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-black/50">Loading departments…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-oteems-red">
                  Organization
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                  Departments
                </h2>
                <p className="mt-2 text-sm text-black/45">
                  Manage your organization&apos;s departments.
                </p>
              </div>
              <Link
                href="/departments/new"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-oteems-red px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-oteems-red-dark"
              >
                <span className="text-base leading-none">+</span>
                Add department
              </Link>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-black/10 bg-black/[0.02]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Manager</th>
                    <th className="px-4 py-3 font-semibold">Employees</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-black/40"
                      >
                        No departments found.
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept) => (
                      <tr
                        key={dept.id}
                        className="border-b border-black/5 transition-colors hover:bg-black/[0.02]"
                      >
                        <td className="px-4 py-3 font-medium">{dept.name}</td>
                        <td className="px-4 py-3 text-black/60">
                          {dept.manager?.fullName || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {dept.employeeCount ?? dept.employees?.length ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/departments/${dept.id}`}
                            className="text-xs font-medium text-oteems-red hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
