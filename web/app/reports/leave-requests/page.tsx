"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { getLeaveReport } from "@/lib/api/reports";
import type { LeaveReport } from "@/types/report";
import { getDepartments } from "@/lib/api/admin";
import type { Department } from "@/types/department";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const statusBadgeClasses: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-50 text-blue-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-600",
  CANCELLED: "bg-gray-50 text-gray-500",
};

const leaveTypeOptions = [
  "ANNUAL",
  "SICK",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "OTHER",
];

export default function LeaveRequestsReportPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [report, setReport] = useState<LeaveReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [leaveType, setLeaveType] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("");

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

  // Load leave report when filters change
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadReport() {
      try {
        const data = await getLeaveReport({
          leaveType: leaveType || undefined,
          departmentId: departmentId || undefined,
          status: status || undefined,
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
          setError(error?.message || "Failed to load leave report.");
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
  }, [user, leaveType, departmentId, status, router]);

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
              Leave Requests Report
            </h2>

            {/* Summary Cards */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Total Requests</p>
                <p className="mt-2 text-3xl font-bold">
                  {report?.summary.totalRequests ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Approved</p>
                <p className="mt-2 text-3xl font-bold">
                  {report?.summary.approvedRequests ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Pending</p>
                <p className="mt-2 text-3xl font-bold">
                  {report?.summary.submittedRequests ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Total Leave Days</p>
                <p className="mt-2 text-3xl font-bold">
                  {report?.summary.totalLeaveDays ?? 0}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="h-11 rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-oteems-red"
                >
                  <option value="">All Types</option>
                  {leaveTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="h-11 rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-oteems-red"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-11 rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-oteems-red"
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Table */}
            <div className="mt-5 overflow-hidden rounded-xl border border-black/10 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-black/10 bg-black/[0.02]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Request #</th>
                    <th className="px-4 py-3 font-semibold">Employee</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Start</th>
                    <th className="px-4 py-3 font-semibold">End</th>
                    <th className="px-4 py-3 font-semibold">Days</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-black/40"
                      >
                        Loading leave report…
                      </td>
                    </tr>
                  ) : report?.requests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-black/40"
                      >
                        No leave requests found.
                      </td>
                    </tr>
                  ) : (
                    report?.requests.map((req) => (
                      <tr key={req.id} className="border-b border-black/5">
                        <td className="px-4 py-3 font-mono text-xs">
                          {req.requestNumber}
                        </td>
                        <td className="px-4 py-3">
                          {req.employee.fullName}
                          {req.employee.department?.name && (
                            <span className="text-black/40">
                              {" "}
                              ({req.employee.department.name})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{req.leaveType}</td>
                        <td className="px-4 py-3">
                          {new Date(req.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(req.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{req.leaveDays}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${statusBadgeClasses[req.status] || "bg-black/5 text-black/60"}`}
                          >
                            {req.status}
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
