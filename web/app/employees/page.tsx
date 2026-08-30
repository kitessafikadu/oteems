"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getEmployees } from "@/lib/api/employees";
import type { Employee } from "@/types/employee";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { hasPermission } from "@/lib/rbac";

const statusBadgeClasses: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  INACTIVE: "bg-yellow-50 text-yellow-700",
  TERMINATED: "bg-red-50 text-red-600",
};

export default function EmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Filter employees client-side
  const filteredEmployees = allEmployees.filter((employee) => {
    const matchesSearch =
      !search ||
      employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || employee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Load current user and check permission
  useEffect(() => {
    getMe()
      .then((currentUser) => {
        setUser(currentUser);
        if (!hasPermission(currentUser, "employees.view")) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        removeAccessToken();
        router.replace("/login");
      });
  }, [router]);

  // Load employees when user is available
  useEffect(() => {
    if (!user || !hasPermission(user, "employees.view")) return;

    let cancelled = false;

    async function loadEmployees() {
      try {
        const data = await getEmployees();
        if (!cancelled) {
          setAllEmployees(data);
          setError("");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          console.error("Failed to load employees:", err);
          const error = err as { status?: number; message?: string };
          if (error?.status === 401 || error?.status === 403) {
            removeAccessToken();
            router.replace("/login");
            return;
          }
          setError(error?.message || "Failed to load employees.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  if (!user || !hasPermission(user, "employees.view")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-black/50">Loading…</div>
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
                  People
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                  Employees
                </h2>
                <p className="mt-2 text-sm text-black/45">
                  Manage your organization&apos;s workforce.
                </p>
              </div>
              {hasPermission(user, "employees.add") && (
                <Link
                  href="/employees/new"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-oteems-red px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-oteems-red-dark"
                >
                  <span className="text-base leading-none">+</span>
                  Add employee
                </Link>
              )}
            </div>

            {/* Search and filter (client-side) */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full gap-2 sm:max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or ID..."
                  className="h-11 w-full rounded-lg border border-black/15 bg-white px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-oteems-red"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-oteems-red"
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-black/10 bg-black/[0.02]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Position</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-black/40"
                      >
                        Loading employees…
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-black/40"
                      >
                        No employees found.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-b border-black/5 transition-colors hover:bg-black/[0.02]"
                      >
                        <td className="px-4 py-3 font-mono text-xs">
                          {employee.employeeId}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {employee.fullName}
                        </td>
                        <td className="px-4 py-3 text-black/60">
                          {employee.email}
                        </td>
                        <td className="px-4 py-3 text-black/60">
                          {employee.phone || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {employee.position || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {employee.department?.name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${
                              statusBadgeClasses[employee.status] ||
                              "bg-black/5 text-black/60"
                            }`}
                          >
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/employees/${employee.id}`}
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
