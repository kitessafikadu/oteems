"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getLeaveRequests,
  getMyLeaveRequests,
  getDepartmentLeaveRequests,
  updateLeaveRequest,
  submitLeaveRequest,
  resubmitLeaveRequest,
  cancelLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "@/lib/api/leave-requests";
import type {
  LeaveRequest,
  CreateLeaveRequestPayload,
  LeaveType,
} from "@/types/leave-request";
import type { AuthUser } from "@/types/auth";
import { hasPermission } from "@/lib/rbac";

interface LeaveRequestsProps {
  user: AuthUser | null;
}

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

export function LeaveRequests({ user }: LeaveRequestsProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user || !hasPermission(user, "leave.view")) return;

    let cancelled = false;

    async function fetchRequests() {
      try {
        let data: LeaveRequest[];
        if (user!.role === "EMPLOYEE") {
          data = await getMyLeaveRequests();
        } else if (user!.role === "DEPARTMENT_MANAGER") {
          data = await getDepartmentLeaveRequests();
        } else {
          data = await getLeaveRequests();
        }

        if (!cancelled) {
          setRequests(data.slice(0, 5));
          setError("");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const errObj = err as { status?: number; message?: string };
          setError(errObj?.message || "Failed to load leave requests.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRequests();

    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  if (!user || !hasPermission(user, "leave.view")) {
    return null;
  }

  const currentUser = user;

  const formatDateForInput = (dateStr?: string): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const handleAction = async (
    action: "submit" | "resubmit" | "cancel" | "approve",
    id: string,
  ) => {
    setActionLoadingId(id);
    setError("");
    setActionMessage("");

    try {
      switch (action) {
        case "submit":
          await submitLeaveRequest(id);
          setActionMessage("Leave request submitted successfully.");
          break;
        case "resubmit":
          await resubmitLeaveRequest(id);
          setActionMessage("Leave request resubmitted.");
          break;
        case "cancel":
          await cancelLeaveRequest(id);
          setActionMessage("Leave request cancelled.");
          break;
        case "approve":
          await approveLeaveRequest(id);
          setActionMessage("Leave request approved.");
          break;
      }
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      const errObj = err as { status?: number; message?: string };
      setError(errObj?.message || `Failed to ${action} leave request.`);
    } finally {
      setActionLoadingId(null);
    }
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
    setError("");
    setActionMessage("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    setUpdating(true);
    setError("");
    setActionMessage("");

    try {
      await updateLeaveRequest(editingRequest.id, editForm);
      setShowEditModal(false);
      setEditingRequest(null);
      setActionMessage("Leave request updated successfully.");
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      const errObj = err as { status?: number; message?: string };
      setError(errObj?.message || "Failed to update leave request.");
    } finally {
      setUpdating(false);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
    setShowRejectModal(true);
    setError("");
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !rejectReason.trim()) return;

    setRejecting(true);
    setError("");
    setActionMessage("");

    try {
      await rejectLeaveRequest(rejectingId, rejectReason.trim());
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason("");
      setActionMessage("Leave request rejected.");
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      const errObj = err as { status?: number; message?: string };
      setError(errObj?.message || "Failed to reject leave request.");
    } finally {
      setRejecting(false);
    }
  };

  const isEmployee = currentUser.role === "EMPLOYEE";
  const canApprove = hasPermission(currentUser, "leave.approve");
  const canReject = hasPermission(currentUser, "leave.reject");

  return (
    <section className="rounded-xl border border-black/10 bg-white">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold">Leave requests</h2>
          <p className="mt-1 text-xs text-black/40">
            {isEmployee
              ? "Your recent leave requests & quick actions"
              : "Recent leave requests"}
          </p>
        </div>

        <Link
          href="/leave-requests"
          className="text-xs font-semibold text-oteems-red hover:underline"
        >
          View all
        </Link>
      </div>

      {actionMessage && (
        <div className="border-b border-green-200 bg-green-50 px-5 py-2.5 text-xs text-green-700">
          {actionMessage}
        </div>
      )}

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-5 py-2.5 text-xs text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="px-5 py-6 text-center text-xs text-black/40">
          Loading leave requests…
        </div>
      ) : requests.length === 0 ? (
        <div className="px-5 py-8 text-center text-xs text-black/40">
          <p>No leave requests found.</p>
          {isEmployee && (
            <Link
              href="/leave-requests"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-oteems-red px-3 py-1.5 text-xs font-medium text-white transition hover:bg-oteems-red-dark"
            >
              + Create Request
            </Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-black/5">
          {requests.map((request) => {
            const isActing = actionLoadingId === request.id;
            const isOwner =
              isEmployee || request.employeeId === currentUser.employeeId;

            return (
              <div key={request.id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-oteems-red-light text-xs font-bold text-oteems-red">
                      {request.employee?.fullName
                        ? request.employee.fullName
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "—"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="truncate text-xs font-semibold">
                          {request.employee?.fullName || "You"}
                        </p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            statusBadgeClasses[request.status] ||
                            "bg-black/5 text-black/60"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-black/50">
                        <span className="font-medium text-black/70">
                          {request.leaveType}
                        </span>
                        {request.leaveDays ? ` (${request.leaveDays}d)` : ""} ·{" "}
                        {new Date(request.startDate).toLocaleDateString()} –{" "}
                        {new Date(request.endDate).toLocaleDateString()}
                      </p>

                      {request.reason && (
                        <p className="mt-1 text-[11px] text-black/60 italic truncate max-w-md">
                          &ldquo;{request.reason}&rdquo;
                        </p>
                      )}

                      {request.rejectionReason && (
                        <p className="mt-1 text-[11px] text-red-600">
                          Reason: {request.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    {/* Employee Actions */}
                    {isOwner && request.status === "DRAFT" && (
                      <>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleAction("submit", request.id)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isActing ? "..." : "Submit"}
                        </button>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleOpenEdit(request)}
                          className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-black/70 transition hover:bg-black/5 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleAction("cancel", request.id)}
                          className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-black/70 transition hover:bg-black/5 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {isOwner &&
                      (request.status === "SUBMITTED" ||
                        request.status === "PENDING") && (
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleAction("cancel", request.id)}
                          className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-black/70 transition hover:bg-black/5 disabled:opacity-50"
                        >
                          {isActing ? "..." : "Cancel"}
                        </button>
                      )}

                    {isOwner && request.status === "REJECTED" && (
                      <>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleOpenEdit(request)}
                          className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-black/70 transition hover:bg-black/5 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleAction("resubmit", request.id)}
                          className="rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-yellow-700 disabled:opacity-50"
                        >
                          {isActing ? "..." : "Resubmit"}
                        </button>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleAction("cancel", request.id)}
                          className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-black/70 transition hover:bg-black/5 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {/* Manager / Admin Actions */}
                    {!isEmployee &&
                      (canApprove || canReject) &&
                      (request.status === "SUBMITTED" ||
                        request.status === "PENDING") && (
                        <>
                          {canApprove && (
                            <button
                              type="button"
                              disabled={isActing}
                              onClick={() =>
                                handleAction("approve", request.id)
                              }
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                            >
                              {isActing ? "..." : "Approve"}
                            </button>
                          )}
                          {canReject && (
                            <button
                              type="button"
                              disabled={isActing}
                              onClick={() => openRejectModal(request.id)}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                        </>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-sm font-bold text-black">Edit Leave Request</h3>
            <p className="mt-1 text-xs text-black/60">
              Update leave request details (
              {editingRequest.requestNumber || "Draft"}).
            </p>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-black/70">
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
                  className="mt-1 w-full rounded-lg border border-black/15 p-2.5 text-xs outline-none focus:border-oteems-red"
                >
                  {leaveTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-black/70">
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
                    className="mt-1 w-full rounded-lg border border-black/15 p-2.5 text-xs outline-none focus:border-oteems-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black/70">
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
                    className="mt-1 w-full rounded-lg border border-black/15 p-2.5 text-xs outline-none focus:border-oteems-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-black/70">
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
                  className="mt-1 w-full rounded-lg border border-black/15 p-2.5 text-xs outline-none focus:border-oteems-red"
                  placeholder="Why are you taking leave?"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRequest(null);
                  }}
                  className="rounded-lg border border-black/15 px-3 py-2 text-xs font-medium text-black/70 hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-oteems-red px-4 py-2 text-xs font-semibold text-white transition hover:bg-oteems-red-dark disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-sm font-bold text-black">
              Reject Leave Request
            </h3>
            <p className="mt-1 text-xs text-black/60">
              Please provide a reason for rejecting this leave request.
            </p>

            <form onSubmit={handleConfirmReject} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="rejectReason"
                  className="block text-xs font-medium text-black/70"
                >
                  Reason
                </label>
                <textarea
                  id="rejectReason"
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Overlapping department leave, insufficient coverage..."
                  className="mt-1.5 w-full rounded-lg border border-black/15 p-2.5 text-xs outline-none focus:border-oteems-red"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="rounded-lg border border-black/15 px-3 py-2 text-xs font-medium text-black/70 hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting || !rejectReason.trim()}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {rejecting ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
