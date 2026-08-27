"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getDepartment,
  assignDepartmentManager,
  removeDepartmentManager,
  getUsers,
} from "@/lib/api/admin";
import type { Department } from "@/types/department";
import type { AuthUser } from "@/types/auth";
import { getMe } from "@/lib/api/auth";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function DepartmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Manager modal state
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [managerCandidates, setManagerCandidates] = useState<AuthUser[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [updatingManager, setUpdatingManager] = useState(false);

  useEffect(() => {
    getMe()
      .then((currentUser) => {
        setUser(currentUser);
        if (currentUser.role !== "ADMIN" && currentUser.role !== "HR_USER") {
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
      getDepartment(id as string)
        .then((data) => {
          setDepartment(data);
          setSelectedManagerId(data.managerId || "");
        })
        .catch((err: unknown) => {
          const error = err as { status?: number; message?: string };
          if (error?.status === 401 || error?.status === 403) {
            removeAccessToken();
            router.replace("/login");
            return;
          }
          setError(error?.message || "Failed to load department.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, user, router]);

  const openManagerModal = async () => {
    // Fetch all users to choose a manager (or filter by role DEPARTMENT_MANAGER if backend supports)
    try {
      const users = await getUsers();
      // Filter only those who are employees or department managers (not admins/hr maybe)
      const filtered = users.filter(
        (u) => u.role === "EMPLOYEE" || u.role === "DEPARTMENT_MANAGER",
      );
      setManagerCandidates(filtered);
      setShowManagerModal(true);
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      setError(error?.message || "Failed to load users.");
    }
  };

  const handleAssignManager = async () => {
    if (!selectedManagerId || !department) return;
    setUpdatingManager(true);
    try {
      const updated = await assignDepartmentManager(department.id, {
        managerId: selectedManagerId,
      });
      setDepartment(updated);
      setShowManagerModal(false);
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      setError(error?.message || "Failed to assign manager.");
    } finally {
      setUpdatingManager(false);
    }
  };

  const handleRemoveManager = async () => {
    if (!department) return;
    setUpdatingManager(true);
    try {
      const updated = await removeDepartmentManager(department.id);
      setDepartment(updated);
      setSelectedManagerId("");
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      setError(error?.message || "Failed to remove manager.");
    } finally {
      setUpdatingManager(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-black/50">Loading department…</div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-red-600">
          {error || "Department not found."}
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
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-oteems-red">
                  Department
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em]">
                  {department.name}
                </h2>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/departments/${department.id}/edit`}
                  className="rounded-lg bg-oteems-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-black"
                >
                  Edit
                </Link>
                <button
                  onClick={openManagerModal}
                  className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/60 hover:border-oteems-red hover:text-oteems-red"
                >
                  Manage Manager
                </button>
              </div>
            </div>

            {/* Department Info */}
            <div className="rounded-xl border border-black/10 bg-white p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-black/45">Name</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {department.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">Manager</dt>
                  <dd className="mt-1 text-sm">
                    {department.manager ? (
                      <span>{department.manager.fullName}</span>
                    ) : (
                      "No manager assigned"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">
                    Employees
                  </dt>
                  <dd className="mt-1 text-sm">
                    {department.employeeCount ??
                      department.employees?.length ??
                      0}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Employees List */}
            {department.employees && (
              <div className="mt-6">
                <h3 className="text-lg font-bold tracking-tight">Employees</h3>
                <div className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-black/10 bg-black/[0.02]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">ID</th>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {department.employees.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-black/40"
                          >
                            No employees in this department.
                          </td>
                        </tr>
                      ) : (
                        department.employees.map((emp) => (
                          <tr key={emp.id} className="border-b border-black/5">
                            <td className="px-4 py-3 font-mono text-xs">
                              {emp.employeeId}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {emp.fullName}
                            </td>
                            <td className="px-4 py-3 text-black/60">
                              {emp.email}
                            </td>
                            <td className="px-4 py-3">{emp.position || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Manager Modal */}
      {showManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="text-lg font-bold">Manage Manager</h3>
            <p className="mt-1 text-sm text-black/45">
              Assign or remove the department manager.
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold">
                Select Manager
              </label>
              <select
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
                className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
              >
                <option value="">No manager</option>
                {managerCandidates.map((u) => (
                  <option key={u.id} value={u.employeeId || u.id}>
                    {u.employee?.fullName || u.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowManagerModal(false)}
                className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/60 hover:bg-black/[0.04]"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignManager}
                disabled={updatingManager}
                className="rounded-lg bg-oteems-red px-4 py-2.5 text-xs font-semibold text-white hover:bg-oteems-red-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingManager ? "Saving..." : "Assign Manager"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
