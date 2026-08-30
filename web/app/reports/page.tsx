"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const reportCards = [
  {
    title: "Summary",
    description:
      "Organisation-wide overview of employees, departments, and leave.",
    href: "/reports/summary",
    roles: ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER"],
  },
  {
    title: "Employees",
    description: "Detailed employee statistics and records.",
    href: "/reports/employees",
    roles: ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER"],
  },
  {
    title: "Leave Requests",
    description: "All leave requests with filters and status breakdown.",
    href: "/reports/leave-requests",
    roles: ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER"],
  },
];

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

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
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-black/50">Loading…</div>
      </div>
    );
  }

  const visibleCards = reportCards.filter((card) =>
    card.roles.includes(user.role),
  );

  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-oteems-red">
                Insights
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                Reports
              </h2>
              <p className="mt-2 text-sm text-black/45">
                Explore your organisation&apos;s data.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-xl border border-black/10 bg-white p-6 transition-all hover:border-oteems-red/50 hover:shadow-md"
                >
                  <h3 className="text-lg font-bold tracking-tight group-hover:text-oteems-red">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-black/50">
                    {card.description}
                  </p>
                  <span className="mt-4 inline-block text-xs font-medium text-oteems-red">
                    View report →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
