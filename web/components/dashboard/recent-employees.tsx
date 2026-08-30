"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEmployees } from "@/lib/api/employees";
import type { Employee } from "@/types/employee";
import type { AuthUser } from "@/types/auth";
import { hasPermission } from "@/lib/rbac";

interface RecentEmployeesProps {
  user: AuthUser | null;
}

export function RecentEmployees({ user }: RecentEmployeesProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !hasPermission(user, "employees.view")) {
      return; // do not fetch for employees or unauthorized users
    }

    let cancelled = false;

    async function loadEmployees() {
      try {
        const data = await getEmployees();
        if (!cancelled) {
          // Show only the 5 most recent employees
          setEmployees(data.slice(0, 5));
          setError("");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as { status?: number; message?: string };
          setError(error?.message || "Failed to load recent employees.");
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
  }, [user]);

  // Hide for employees
  if (!user || !hasPermission(user, "employees.view")) {
    return null;
  }

  return (
    <section className="rounded-xl border border-black/10 bg-white">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold">Recent employees</h2>
          <p className="mt-1 text-xs text-black/40">
            {user.role === "DEPARTMENT_MANAGER"
              ? "Latest additions in your department"
              : "Recently added employees"}
          </p>
        </div>

        <Link
          href="/employees"
          className="text-xs font-semibold text-oteems-red hover:underline"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="px-5 py-6 text-center text-xs text-black/40">
          Loading employees…
        </div>
      ) : error ? (
        <div className="px-5 py-6 text-center text-xs text-red-600">
          {error}
        </div>
      ) : employees.length === 0 ? (
        <div className="px-5 py-6 text-center text-xs text-black/40">
          No employees found.
        </div>
      ) : (
        <div className="divide-y divide-black/5">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-xs font-bold">
                  {employee.fullName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {employee.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-black/40">
                    {employee.position || "—"}
                  </p>
                </div>
              </div>

              <div className="hidden text-xs text-black/40 md:block">
                {employee.department?.name || "—"}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    employee.status === "ACTIVE"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                />
                {employee.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
