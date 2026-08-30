"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getLeaveRequests,
  getMyLeaveRequests,
  getDepartmentLeaveRequests,
} from "@/lib/api/leave-requests";
import type { LeaveRequest } from "@/types/leave-request";
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

export function LeaveRequests({ user }: LeaveRequestsProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !hasPermission(user, "leave.view")) return;

    const currentUser = user;
    let cancelled = false;

    async function loadRequests() {
      try {
        let data: LeaveRequest[];
        if (currentUser.role === "EMPLOYEE") {
          data = await getMyLeaveRequests();
        } else if (currentUser.role === "DEPARTMENT_MANAGER") {
          data = await getDepartmentLeaveRequests();
        } else {
          data = await getLeaveRequests();
        }

        if (!cancelled) {
          // Only show 5 most recent requests
          setRequests(data.slice(0, 5));
          setError("");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as { status?: number; message?: string };
          setError(error?.message || "Failed to load leave requests.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || !hasPermission(user, "leave.view")) {
    return null;
  }

  return (
    <section className="rounded-xl border border-black/10 bg-white">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold">Leave requests</h2>
          <p className="mt-1 text-xs text-black/40">
            {user.role === "EMPLOYEE"
              ? "Your recent leave requests"
              : "Recent leave requests"}
          </p>
        </div>

        <Link
          href="/leave"
          className="text-xs font-semibold text-oteems-red hover:underline"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="px-5 py-6 text-center text-xs text-black/40">
          Loading…
        </div>
      ) : error ? (
        <div className="px-5 py-6 text-center text-xs text-red-600">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="px-5 py-6 text-center text-xs text-black/40">
          No leave requests found.
        </div>
      ) : (
        <div className="divide-y divide-black/5">
          {requests.map((request) => (
            <div key={request.id} className="px-5 py-4">
              <div className="flex items-center gap-3">
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
                  <p className="truncate text-xs font-semibold">
                    {request.employee?.fullName || "You"}
                  </p>
                  <p className="mt-1 text-[11px] text-black/40">
                    {request.leaveType} ·{" "}
                    {new Date(request.startDate).toLocaleDateString()} -{" "}
                    {new Date(request.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 pl-12">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${
                    statusBadgeClasses[request.status] ||
                    "bg-black/5 text-black/60"
                  }`}
                >
                  {request.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
