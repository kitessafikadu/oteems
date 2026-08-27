import { api } from "@/lib/api";

export function createReport(payload: unknown) {
  return api("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getReports() {
  return api("/reports");
}

export function getReport(id: string) {
  return api(`/reports/${id}`);
}

export function updateReport(id: string, payload: unknown) {
  return api(`/reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteReport(id: string) {
  return api<void>(`/reports/${id}`, {
    method: "DELETE",
  });
}
