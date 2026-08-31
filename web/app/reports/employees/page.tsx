"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { getEmployeeReport } from "@/lib/api/reports";
import type { EmployeeReport } from "@/types/report";
import { getDepartments } from "@/lib/api/admin";
import type { Department } from "@/types/department";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const statusBadgeClasses: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  INACTIVE: "bg-yellow-50 text-yellow-700",
  TERMINATED: "bg-red-50 text-red-600",
};

export default function EmployeeReportPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [report, setReport] = useState<EmployeeReport | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Load current user and departments
  useEffect(() => {
    getMe()
      .then((currentUser) => {
        setUser(currentUser);
        if (currentUser.role === "EMPLOYEE") {
          router.replace("/reports/my-summary");
        }
      })
      .catch(() => {
        removeAccessToken();
        router.replace("/login");
      });

    getDepartments()
      .then((data: Department[]) => setDepartments(data))
      .catch(() => setError("Failed to load departments."));
  }, [router]);

  // Load employee report when user or filters change
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadReport() {
      try {
        const data = await getEmployeeReport({
          status: statusFilter || undefined,
          departmentId: departmentFilter || undefined,
        });
        if (!cancelled) {
          setReport(data);
          setError("");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as { status?: number; message?: string };
          if (error?.status === 401 || error?.status === 403) {
            removeAccessToken();
            router.replace("/login");
            return;
          }
          setError(error?.message || "Failed to load employee report.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [user, statusFilter, departmentFilter, router]);

  if (!user) {
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
            <h2 className="text-3xl font-bold tracking-[-0.05em]">
              Employee Report
            </h2>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Total</p>
                <p className="mt-2 text-3xl font-bold">
                  {report?.summary.totalEmployees ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Active</p>
                <p className="mt-2 text-3xl font-bold">
                  {report?.summary.activeEmployees ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Inactive</p>
                <p className="mt-2 text-3xl font-bold">
                  {report?.summary.inactiveEmployees ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Terminated</p>
                <p className="mt-2 text-3xl font-bold">
                  {report?.summary.terminatedEmployees ?? 0}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
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

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-11 rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-oteems-red"
              >
                <option value="">All departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="mt-5 overflow-hidden rounded-xl border border-black/10 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-black/10 bg-black/[0.02]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-black/40"
                      >
                        Loading employees…
                      </td>
                    </tr>
                  ) : report?.employees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-black/40"
                      >
                        No employees found.
                      </td>
                    </tr>
                  ) : (
                    report?.employees.map((emp) => (
                      <tr key={emp.id} className="border-b border-black/5">
                        <td className="px-4 py-3 font-mono text-xs">
                          {emp.employeeId}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {emp.fullName}
                        </td>
                        <td className="px-4 py-3 text-black/60">{emp.email}</td>
                        <td className="px-4 py-3">
                          {emp.department?.name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${statusBadgeClasses[emp.status] || "bg-black/5 text-black/60"}`}
                          >
                            {emp.status}
                          </span>
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
