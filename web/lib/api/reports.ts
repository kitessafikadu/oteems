// lib/api/reports.ts
import { api } from "@/lib/api";
import type {
  Report,
  CreateReportPayload,
  UpdateReportPayload,
  SummaryReport,
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
