import { api } from "@/lib/api";
import type {
  Report,
  CreateReportPayload,
  UpdateReportPayload,
  SummaryReport,
  EmployeeReport,
  LeaveReport,
  LeaveByTypeReport,
  LeaveByDepartmentReport,
  MySummaryReport,
} from "@/types/report";

export function createReport(payload: CreateReportPayload) {
  return api<Report>("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getReports() {
  return api<Report[]>("/reports");
}

export function getReport(id: string) {
  return api<Report>(`/reports/${id}`);
}

export function updateReport(id: string, payload: UpdateReportPayload) {
  return api<Report>(`/reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteReport(id: string) {
  return api<void>(`/reports/${id}`, {
    method: "DELETE",
  });
}

export function getSummaryReport() {
  return api<SummaryReport>("/reports/summary");
}

export function getEmployeeReport(params?: {
  departmentId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const query = new URLSearchParams();
  if (params?.departmentId) query.set("departmentId", params.departmentId);
  if (params?.status) query.set("status", params.status);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  const qs = query.toString();
  return api<EmployeeReport>(`/reports/employees${qs ? `?${qs}` : ""}`);
}

export function getLeaveReport(params?: {
  departmentId?: string;
  leaveType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const query = new URLSearchParams();
  if (params?.departmentId) query.set("departmentId", params.departmentId);
  if (params?.leaveType) query.set("leaveType", params.leaveType);
  if (params?.status) query.set("status", params.status);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  const qs = query.toString();
  return api<LeaveReport>(`/reports/leaves${qs ? `?${qs}` : ""}`);
}

export function getLeavesByType(params?: {
  departmentId?: string;
  leaveType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const query = new URLSearchParams();
  if (params?.departmentId) query.set("departmentId", params.departmentId);
  if (params?.leaveType) query.set("leaveType", params.leaveType);
  if (params?.status) query.set("status", params.status);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  const qs = query.toString();
  return api<LeaveByTypeReport>(`/reports/leaves/by-type${qs ? `?${qs}` : ""}`);
}

export function getLeavesByDepartment(params?: {
  departmentId?: string;
  leaveType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const query = new URLSearchParams();
  if (params?.departmentId) query.set("departmentId", params.departmentId);
  if (params?.leaveType) query.set("leaveType", params.leaveType);
  if (params?.status) query.set("status", params.status);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  const qs = query.toString();
  return api<LeaveByDepartmentReport>(
    `/reports/leaves/by-department${qs ? `?${qs}` : ""}`,
  );
}

export function getMySummaryReport() {
  return api<MySummaryReport>("/reports/my-summary");
}
