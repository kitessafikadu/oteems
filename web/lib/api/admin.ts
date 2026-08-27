import { api } from "@/lib/api";

export function createUser(payload: unknown) {
  return api("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getUsers() {
  return api("/admin/users");
}

export function getUser(id: string) {
  return api(`/admin/users/${id}`);
}

export function updateUser(id: string, payload: unknown) {
  return api(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deactivateUser(id: string) {
  return api(`/admin/users/${id}/deactivate`, {
    method: "PATCH",
  });
}

export function createDepartment(payload: unknown) {
  return api("/admin/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getDepartments() {
  return api("/admin/departments");
}

export function getDepartment(id: string) {
  return api(`/admin/departments/${id}`);
}

export function updateDepartment(id: string, payload: unknown) {
  return api(`/admin/departments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function assignDepartmentManager(
  departmentId: string,
  payload: unknown,
) {
  return api(`/admin/departments/${departmentId}/manager`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function removeDepartmentManager(departmentId: string) {
  return api(`/admin/departments/${departmentId}/manager`, {
    method: "DELETE",
  });
}
