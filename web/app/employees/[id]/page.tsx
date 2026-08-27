"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEmployee } from "@/lib/api/employees";
import type { Employee } from "@/types/employee";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import Link from "next/link";

const statusBadgeClasses: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  INACTIVE: "bg-yellow-50 text-yellow-700",
  TERMINATED: "bg-red-50 text-red-600",
};

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then((currentUser) => {
        setUser(currentUser);
        if (
          currentUser.role !== "ADMIN" &&
          currentUser.role !== "HR_USER" &&
          currentUser.role !== "DEPARTMENT_MANAGER"
        ) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        removeAccessToken();
        router.replace("/login");
      });
  }, [router]);

  useEffect(() => {
    if (id && user) {
      getEmployee(id as string)
        .then(setEmployee)
        .catch((err: unknown) => {
          const error = err as { status?: number; message?: string };
          if (error?.status === 401 || error?.status === 403) {
            removeAccessToken();
            router.replace("/login");
            return;
          }
          setError(error?.message || "Failed to load employee.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, user, router]);

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-black/50">Loading…</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-red-600">
          {error || "Employee not found."}
        </div>
      </div>
    );
  }

  const canEdit = user.role === "ADMIN" || user.role === "HR_USER";

  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-oteems-red">
                  Employee
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em]">
                  {employee.fullName}
                </h2>
              </div>
              <Link
                href="/employees"
                className="text-xs font-medium text-oteems-red hover:underline"
              >
                Back to list
              </Link>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-black/45">
                    Employee ID
                  </dt>
                  <dd className="mt-1 text-sm font-medium">
                    {employee.employeeId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">
                    Full Name
                  </dt>
                  <dd className="mt-1 text-sm font-medium">
                    {employee.fullName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">Email</dt>
                  <dd className="mt-1 text-sm">{employee.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">Phone</dt>
                  <dd className="mt-1 text-sm">{employee.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">
                    Position
                  </dt>
                  <dd className="mt-1 text-sm">{employee.position || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">
                    Hire Date
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(employee.hireDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">
                    Department
                  </dt>
                  <dd className="mt-1 text-sm">
                    {employee.department?.name || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${statusBadgeClasses[employee.status]}`}
                    >
                      {employee.status}
                    </span>
                  </dd>
                </div>
                {employee.user && (
                  <>
                    <div>
                      <dt className="text-xs font-medium text-black/45">
                        Username
                      </dt>
                      <dd className="mt-1 text-sm">{employee.user.username}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-black/45">
                        Role
                      </dt>
                      <dd className="mt-1 text-sm">{employee.user.role}</dd>
                    </div>
                  </>
                )}
              </dl>

              {canEdit && (
                <div className="mt-6 flex gap-3">
                  <Link
                    href={`/employees/${employee.id}/edit`}
                    className="rounded-lg bg-oteems-black px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-black"
                  >
                    Edit Employee
                  </Link>
                  <Link
                    href={`/employees/${employee.id}/status`}
                    className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/60 transition-colors hover:border-oteems-red hover:text-oteems-red"
                  >
                    Change Status
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
