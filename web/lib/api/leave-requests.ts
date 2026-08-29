import { api } from "@/lib/api";
import type {
  CreateLeaveRequestPayload,
  LeaveRequest,
  UpdateLeaveRequestPayload,
} from "@/types/leave-request";

export function createLeaveRequest(payload: CreateLeaveRequestPayload) {
  return api<LeaveRequest>("/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getLeaveRequests() {
  return api<LeaveRequest[]>("/requests");
}

export function getMyLeaveRequests() {
  return api<LeaveRequest[]>("/requests/my");
}

export function getDepartmentLeaveRequests() {
  return api<LeaveRequest[]>("/requests/department");
}

export function getLeaveRequest(id: string) {
  return api<LeaveRequest>(`/requests/${id}`);
}

export function updateLeaveRequest(
  id: string,
  payload: UpdateLeaveRequestPayload,
) {
  return api<LeaveRequest>(`/requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function submitLeaveRequest(id: string) {
  return api<LeaveRequest>(`/requests/${id}/submit`, {
    method: "PATCH",
  });
}

export function resubmitLeaveRequest(id: string) {
  return api<LeaveRequest>(`/requests/${id}/resubmit`, {
    method: "PATCH",
  });
}

export function cancelLeaveRequest(id: string) {
  return api<LeaveRequest>(`/requests/${id}/cancel`, {
    method: "PATCH",
  });
}

export function approveLeaveRequest(id: string) {
  return api<LeaveRequest>(`/requests/${id}/approve`, {
    method: "PATCH",
  });
}

// Updated to accept a rejection reason
export function rejectLeaveRequest(id: string, reason: string) {
  return api<LeaveRequest>(`/requests/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ rejectionReason: reason }),
  });
}

export function getLeaveRequestHistory(id: string) {
  return api(`/requests/${id}/history`);
}
