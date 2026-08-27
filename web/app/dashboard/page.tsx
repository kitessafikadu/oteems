"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { LeaveRequests } from "@/components/dashboard/leave-requests";
import { RecentEmployees } from "@/components/dashboard/recent-employees";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatCard } from "@/components/dashboard/stat-card";
import { Topbar } from "@/components/dashboard/topbar";

import { getMe } from "@/lib/api/auth";
import { getSummaryReport } from "@/lib/api/reports";
import type { AuthUser } from "@/types/auth";
import type { SummaryReport } from "@/types/report";
import { removeAccessToken } from "@/lib/auth";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getFirstName(fullName?: string, fallback?: string): string {
  if (!fullName) return fallback || "there";
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || fallback || "there";
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [currentUser, report] = await Promise.all([
          getMe(),
          getSummaryReport(),
        ]);

        setUser(currentUser);
        setSummary(report);
      } catch (err: unknown) {
        console.error("Dashboard load error:", err);

        const error = err as { status?: number; message?: string };

        if (error?.status === 401 || error?.status === 403) {
          removeAccessToken();
          router.replace("/login");
          return;
        }

        setError(error?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="flex flex-col items-center gap-4">
          <div
            role="status"
            aria-label="Loading"
            className="relative h-10 w-10"
          >
            <div className="absolute inset-0 rounded-full border-4 border-black/10" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-oteems-red" />
          </div>
          <p className="text-sm text-black/50">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!user || !summary) return null;

  const isAdmin = user.role === "ADMIN";
  const isHR = user.role === "HR_USER";
  const isDeptManager = user.role === "DEPARTMENT_MANAGER";
  const isEmployee = user.role === "EMPLOYEE";

  const canAddEmployee = isAdmin || isHR;
  const canManageDepartments = isAdmin;
  const canViewReports = isAdmin || isHR || isDeptManager;

  const greeting = getGreeting();
  const firstName = getFirstName(user.employee?.fullName, user.username);

  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      <Sidebar user={user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />

        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Mobile brand */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <Link
                href="/dashboard"
                className="text-xl font-black tracking-[-0.06em]"
              >
                OTEEMS<span className="text-oteems-red">.</span>
              </Link>

              <button
                type="button"
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium"
              >
                Menu
              </button>
            </div>

            {/* Welcome */}
            <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-oteems-red">
                  Overview
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                  {greeting}, {firstName}.
                </h2>

                <p className="mt-2 text-sm text-black/45">
                  {isDeptManager
                    ? "Here's what's happening in your department."
                    : "Here's what's happening across your organization."}
                </p>
              </div>

              {canAddEmployee && (
                <Link
                  href="/employees/new"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-oteems-red px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-oteems-red-dark"
                >
                  <span className="text-base leading-none">+</span>
                  Add employee
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total employees"
                value={String(summary.employees.total)}
              />
              <StatCard
                label="Departments"
                value={String(summary.departments.total)}
              />
              <StatCard
                label="On leave"
                value={String(summary.leave.onLeaveToday).padStart(2, "0")}
              />
              <StatCard
                label="Active employees"
                value={String(summary.employees.active)}
              />
            </div>

            {/* Main content */}
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
              <RecentEmployees />
              <LeaveRequests />
            </div>

            {/* Bottom section */}
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <div className="rounded-xl border border-black/10 bg-oteems-black p-6 text-white lg:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
                      Workforce
                    </p>

                    <h3 className="mt-2 text-xl font-bold tracking-tight">
                      Your workforce is growing.
                    </h3>

                    <p className="mt-2 max-w-md text-xs leading-5 text-white/45">
                      You currently have {summary.employees.total} employees
                      across {summary.departments.total} departments.
                    </p>
                  </div>

                  <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-oteems-red sm:flex">
                    ↗
                  </div>
                </div>

                <div className="mt-8 flex items-end gap-2">
                  {[35, 42, 38, 51, 57, 61, 68, 73, 78, 85, 91, 100].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t bg-white/20"
                        style={{ height: `${height}px` }}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/35">
                  Quick actions
                </p>

                <div className="mt-5 space-y-2">
                  {canAddEmployee && (
                    <Link
                      href="/employees/new"
                      className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 text-xs font-medium transition-colors hover:border-oteems-red hover:text-oteems-red"
                    >
                      Add employee
                      <span>+</span>
                    </Link>
                  )}

                  {canManageDepartments && (
                    <Link
                      href="/departments"
                      className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 text-xs font-medium transition-colors hover:border-oteems-red hover:text-oteems-red"
                    >
                      Manage departments
                      <span>→</span>
                    </Link>
                  )}

                  {canViewReports && (
                    <Link
                      href="/reports"
                      className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 text-xs font-medium transition-colors hover:border-oteems-red hover:text-oteems-red"
                    >
                      View reports
                      <span>→</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
