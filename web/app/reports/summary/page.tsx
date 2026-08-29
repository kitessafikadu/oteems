"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { getSummaryReport } from "@/lib/api/reports";
import type { SummaryReport } from "@/types/report";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function SummaryReportPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    getSummaryReport()
      .then(setSummary)
      .catch((err: unknown) => {
        const error = err as { status?: number; message?: string };
        if (error?.status === 401 || error?.status === 403) {
          removeAccessToken();
          router.replace("/login");
          return;
        }
        setError(error?.message || "Failed to load summary.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-black/50">Loading summary…</div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-red-600">
          {error || "Summary not found."}
        </div>
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
              Summary Report
            </h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Total Employees</p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.employees.total}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Active</p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.employees.active}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Inactive</p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.employees.inactive}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Departments</p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.departments.total}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Pending Leaves</p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.leave.pending}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Approved Leaves</p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.leave.approved}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">On Leave Today</p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.leave.onLeaveToday}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
