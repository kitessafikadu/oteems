"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEmployee, updateEmployeeStatus } from "@/lib/api/employees";
import type { Employee, EmploymentStatus } from "@/types/employee";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const statusBadgeClasses: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  INACTIVE: "bg-yellow-50 text-yellow-700",
  TERMINATED: "bg-red-50 text-red-600",
};

const leaveStatusBadgeClasses: Record<string, string> = {
  DRAFT: "bg-gray-50 text-gray-600",
  SUBMITTED: "bg-blue-50 text-blue-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-600",
  CANCELLED: "bg-gray-50 text-gray-500",
};

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<EmploymentStatus>("ACTIVE");
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
        .then((data) => {
          setEmployee(data);
          setSelectedStatus(data.status as EmploymentStatus);
        })
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

  const handleStatusUpdate = async () => {
    if (!employee) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateEmployeeStatus(employee.id, {
        status: selectedStatus,
      });
      setEmployee((prev) =>
        prev ? { ...prev, status: updated.status } : prev,
      );
      setShowStatusModal(false);
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      if (error?.status === 401 || error?.status === 403) {
        removeAccessToken();
        router.replace("/login");
        return;
      }
      setError(error?.message || "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

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
          <div className="mx-auto max-w-5xl">
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

            {/* Employee info */}
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
                    {employee.hireDate
                      ? new Date(employee.hireDate).toLocaleDateString()
                      : "—"}
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
                      className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${
                        statusBadgeClasses[employee.status]
                      }`}
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
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/60 transition-colors hover:border-oteems-red hover:text-oteems-red"
                  >
                    Change Status
                  </button>
                </div>
              )}
            </div>

            {/* Leave Requests */}
            {employee.leaveRequests && employee.leaveRequests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold tracking-tight">
                  Leave Requests
                </h3>
                <div className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-black/10 bg-black/[0.02]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Request #</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Start</th>
                        <th className="px-4 py-3 font-semibold">End</th>
                        <th className="px-4 py-3 font-semibold">Days</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employee.leaveRequests.map((req) => (
                        <tr key={req.id} className="border-b border-black/5">
                          <td className="px-4 py-3 font-mono text-xs">
                            {req.requestNumber}
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
                              className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${
                                leaveStatusBadgeClasses[req.status] ||
                                "bg-black/5 text-black/60"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="text-lg font-bold">Change Employee Status</h3>
            <p className="mt-1 text-sm text-black/45">
              Update status for {employee.fullName}
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as EmploymentStatus)
                }
                className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/60 hover:bg-black/[0.04]"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus}
                className="rounded-lg bg-oteems-red px-4 py-2.5 text-xs font-semibold text-white hover:bg-oteems-red-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingStatus ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
