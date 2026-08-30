"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { getMySummaryReport } from "@/lib/api/reports";
import type { MySummaryReport } from "@/types/report";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function MySummaryPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [summary, setSummary] = useState<MySummaryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then((currentUser) => {
        setUser(currentUser);
        if (currentUser.role !== "EMPLOYEE") {
          router.replace("/reports");
        }
      })
      .catch(() => {
        removeAccessToken();
        router.replace("/login");
      });
  }, [router]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadMySummary() {
      try {
        const data = await getMySummaryReport();
        if (!cancelled) {
          setSummary(data);
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
          setError(error?.message || "Failed to load your report.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMySummary();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-black/50">Loading your report…</div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-red-600">
          {error || "Report not found."}
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
          <div className="mx-auto max-w-5xl">
            <div className="mb-7">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-oteems-red">
                My Reports
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                Leave Summary
              </h2>
              <p className="mt-2 text-sm text-black/45">
                Your personal leave statistics.
              </p>
            </div>

            {/* Leave stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Pending</p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.leave.pending}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Approved</p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.leave.approved}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Rejected</p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.leave.rejected}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-5">
                <p className="text-xs text-black/45">Cancelled</p>
                <p className="mt-2 text-3xl font-bold">
                  {summary.leave.cancelled}
                </p>
              </div>
            </div>

            {/* Recent requests */}
            {summary.recentRequests?.length > 0 ? (
              <div className="mt-8">
                <h3 className="text-lg font-bold tracking-tight">
                  Recent Requests
                </h3>
                <div className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-black/10 bg-black/[0.02]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Request #</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.recentRequests.map((req, index) => (
                        <tr key={index} className="border-b border-black/5">
                          <td className="px-4 py-3 font-mono text-xs">
                            {req.requestNumber}
                          </td>
                          <td className="px-4 py-3">{req.leaveType}</td>
                          <td className="px-4 py-3">
                            <span className="inline-block rounded-full px-2 py-1 text-[10px] font-medium bg-black/5 text-black/60">
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="mt-8 text-sm text-black/45">
                No recent leave requests.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
