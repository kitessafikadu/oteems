import Link from "next/link";

import { LeaveRequests } from "@/components/dashboard/leave-requests";
import { RecentEmployees } from "@/components/dashboard/recent-employees";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatCard } from "@/components/dashboard/stat-card";
import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

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
                  Good evening, Kitessa.
                </h2>

                <p className="mt-2 text-sm text-black/45">
                  Here&apos;s what&apos;s happening across your organization.
                </p>
              </div>

              <Link
                href="/employees/new"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-oteems-red px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-oteems-red-dark"
              >
                <span className="text-base leading-none">+</span>
                Add employee
              </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total employees" value="128" change="+8.2%" />

              <StatCard label="Departments" value="12" change="+1" />

              <StatCard
                label="On leave"
                value="08"
                change="-12.5%"
                positive={false}
              />

              <StatCard label="Attendance" value="96.4%" change="+2.4%" />
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
                      You currently have 128 employees across 12 departments.
                      Keep your employee data organized as your organization
                      grows.
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
                  <Link
                    href="/employees/new"
                    className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 text-xs font-medium transition-colors hover:border-oteems-red hover:text-oteems-red"
                  >
                    Add employee
                    <span>+</span>
                  </Link>

                  <Link
                    href="/departments"
                    className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 text-xs font-medium transition-colors hover:border-oteems-red hover:text-oteems-red"
                  >
                    Manage departments
                    <span>→</span>
                  </Link>

                  <Link
                    href="/reports"
                    className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 text-xs font-medium transition-colors hover:border-oteems-red hover:text-oteems-red"
                  >
                    View reports
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
