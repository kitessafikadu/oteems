"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import {
  getLeaveRequests,
  getMyLeaveRequests,
  getDepartmentLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  submitLeaveRequest,
  resubmitLeaveRequest,
  cancelLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "@/lib/api/leave-requests";
import type {
  LeaveRequest,
  LeaveRequestStatus,
  CreateLeaveRequestPayload,
  LeaveType,
} from "@/types/leave-request";

const statusBadgeClasses: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-50 text-blue-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-600",
  CANCELLED: "bg-gray-50 text-gray-500",
};

const leaveTypeOptions: LeaveType[] = [
  "ANNUAL",
  "SICK",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "OTHER",
];

export default function LeavePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRequest, setNewRequest] = useState<CreateLeaveRequestPayload>({
    leaveType: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(
    null,
  );
  const [editForm, setEditForm] = useState<CreateLeaveRequestPayload>({
    leaveType: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    getMe()
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        removeAccessToken();
        router.replace("/login");
      });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetchRequests();
  }, [user]);

  async function fetchRequests() {
    setLoading(true);
    setError("");
    try {
      let data: LeaveRequest[];
      if (user!.role === "ADMIN" || user!.role === "HR_USER") {
        data = await getLeaveRequests();
      } else if (user!.role === "DEPARTMENT_MANAGER") {
        data = await getDepartmentLeaveRequests();
      } else {
        data = await getMyLeaveRequests();
      }
      setRequests(data);
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      if (error?.status === 401 || error?.status === 403) {
        removeAccessToken();
        router.replace("/login");
        return;
      }
      setError(error?.message || "Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = statusFilter
    ? requests.filter((req) => req.status === statusFilter)
    : requests;

  const isAdminOrHR = user?.role === "ADMIN" || user?.role === "HR_USER";
  const hasEmployeeLink = user?.employeeId != null;
  const canCreate = isAdminOrHR || hasEmployeeLink;

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    setError("");
    try {
      await createLeaveRequest(newRequest);
      setShowCreateModal(false);
      setNewRequest({
        leaveType: "ANNUAL",
        startDate: "",
        endDate: "",
        reason: "",
      });
      fetchRequests();
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      setCreateError(error?.message || "Failed to create request.");
    } finally {
      setCreating(false);
    }
  };

  const handleAction = async (action: string, id: string) => {
    setError("");
    try {
      switch (action) {
        case "submit":
          await submitLeaveRequest(id);
          break;
        case "resubmit":
          await resubmitLeaveRequest(id);
          break;
        case "cancel":
          await cancelLeaveRequest(id);
          break;
        case "approve":
          await approveLeaveRequest(id);
          break;
        case "reject":
          setRejectingId(id);
          setShowRejectModal(true);
          return;
      }
      fetchRequests();
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      setError(error?.message || `Failed to ${action} request.`);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      await rejectLeaveRequest(rejectingId, rejectReason.trim());
      setShowRejectModal(false);
      setRejectReason("");
      setRejectingId(null);
      fetchRequests();
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      setError(error?.message || "Failed to reject request.");
    } finally {
      setRejecting(false);
    }
  };

  const formatDateForInput = (dateStr?: string): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const handleOpenEdit = (req: LeaveRequest) => {
    setEditingRequest(req);
    setEditForm({
      leaveType: req.leaveType,
      startDate: formatDateForInput(req.startDate),
      endDate: formatDateForInput(req.endDate),
      reason: req.reason || "",
    });
    setShowEditModal(true);
    setEditError("");
    setError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    setUpdating(true);
    setEditError("");
    setError("");
    try {
      await updateLeaveRequest(editingRequest.id, editForm);
      setShowEditModal(false);
      setEditingRequest(null);
      fetchRequests();
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      setEditError(error?.message || "Failed to update request.");
    } finally {
      setUpdating(false);
    }
  };

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
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-oteems-red">
                  Leave
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                  Leave Requests
                </h2>
                <p className="mt-2 text-sm text-black/45">
                  {user.role === "DEPARTMENT_MANAGER"
                    ? "Manage leave requests in your department."
                    : user.role === "ADMIN" || user.role === "HR_USER"
                      ? "Overview of all leave requests."
                      : "Your personal leave requests."}
                </p>
              </div>
              {canCreate && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  disabled={!hasEmployeeLink && isAdminOrHR}
                  title={
                    !hasEmployeeLink && isAdminOrHR
                      ? "Your account is not linked to an employee. Please contact an administrator."
                      : ""
                  }
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-oteems-red px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-oteems-red-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-base leading-none">+</span>
                  New Request
                </button>
              )}
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="mb-5 flex items-center justify-between">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-oteems-red"
              >
                <option value="">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
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
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-black/40"
                      >
                        Loading requests…
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-black/40"
                      >
                        No leave requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="border-b border-black/5 hover:bg-black/[0.02]"
                      >
                        <td className="px-4 py-3 font-mono text-xs">
                          {req.requestNumber || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {req.employee?.fullName || req.employeeId}
                          {req.employee?.department?.name && (
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
                        <td className="px-4 py-3">{req.leaveDays ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${statusBadgeClasses[req.status] || "bg-black/5 text-black/60"}`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Employee / Request Owner Actions */}
                            {(user.role === "EMPLOYEE" ||
                              req.employeeId === user.employeeId) && (
                              <>
                                {req.status === "DRAFT" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAction("submit", req.id)
                                      }
                                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      Submit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(req)}
                                      className="text-xs font-semibold text-neutral-700 hover:text-black hover:underline"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAction("cancel", req.id)
                                      }
                                      className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}

                                {(req.status === "SUBMITTED" ||
                                  req.status === "PENDING") && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAction("cancel", req.id)
                                    }
                                    className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                                  >
                                    Cancel
                                  </button>
                                )}

                                {req.status === "REJECTED" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(req)}
                                      className="text-xs font-semibold text-neutral-700 hover:text-black hover:underline"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAction("resubmit", req.id)
                                      }
                                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      Resubmit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAction("cancel", req.id)
                                      }
                                      className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </>
                            )}

                            {/* Manager / Admin Review Actions */}
                            {user.role !== "EMPLOYEE" &&
                              req.employeeId !== user.employeeId &&
                              (req.status === "SUBMITTED" ||
                                req.status === "PENDING") && (
                                <>
                                  {(user.role === "ADMIN" ||
                                    (user.role === "HR_USER" &&
                                      req.employee?.user?.role !== "ADMIN" &&
                                      req.employee?.user?.role !== "HR_USER") ||
                                    (user.role === "DEPARTMENT_MANAGER" &&
                                      req.employee?.department?.name &&
                                      req.employee?.user?.role ===
                                        "EMPLOYEE")) && (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleAction("approve", req.id)
                                        }
                                        className="text-xs font-semibold text-green-600 hover:text-green-800 hover:underline"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleAction("reject", req.id)
                                        }
                                        className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </>
                              )}

                            {/* Empty indicator if no actions available */}
                            {(req.status === "APPROVED" ||
                              req.status === "CANCELLED") && (
                              <span className="text-xs text-black/30">—</span>
                            )}
                          </div>
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="text-lg font-bold">New Leave Request</h3>
            <p className="mt-1 text-sm text-black/45">
              Fill in the leave details.
            </p>

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold">
                  Leave Type
                </label>
                <select
                  value={newRequest.leaveType}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      leaveType: e.target.value as LeaveType,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                >
                  {leaveTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newRequest.startDate}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    required
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    required
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold">
                  Reason (optional)
                </label>
                <textarea
                  value={newRequest.reason}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-black/15 px-4 py-2 text-sm outline-none focus:border-oteems-red"
                  placeholder="Why are you taking leave?"
                />
              </div>

              {createError && (
                <p className="text-xs text-red-600">{createError}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/60 hover:bg-black/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-oteems-red px-4 py-2.5 text-xs font-semibold text-white hover:bg-oteems-red-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="text-lg font-bold">Reject Request</h3>
            <p className="mt-1 text-sm text-black/45">
              Provide a reason for rejection.
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold">Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-black/15 px-4 py-2 text-sm outline-none focus:border-oteems-red"
                placeholder="Enter rejection reason"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/60 hover:bg-black/[0.04]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={rejecting || !rejectReason.trim()}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rejecting ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">Edit Leave Request</h3>
            <p className="mt-1 text-sm text-black/45">
              Update leave request details (
              {editingRequest.requestNumber || "Draft"}).
            </p>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold">
                  Leave Type
                </label>
                <select
                  value={editForm.leaveType}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      leaveType: e.target.value as LeaveType,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                >
                  {leaveTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    required
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    required
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold">
                  Reason (optional)
                </label>
                <textarea
                  value={editForm.reason}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-black/15 px-4 py-2 text-sm outline-none focus:border-oteems-red"
                  placeholder="Why are you taking leave?"
                />
              </div>

              {editError && <p className="text-xs text-red-600">{editError}</p>}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRequest(null);
                  }}
                  className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-semibold text-black/60 hover:bg-black/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-oteems-red px-4 py-2.5 text-xs font-semibold text-white hover:bg-oteems-red-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
