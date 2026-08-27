import { api } from "@/lib/api";
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  LogoutResponse,
} from "@/types/auth";
import type { Department } from "@/types/department";

// ============================================================
// AUTH FUNCTIONS
// ============================================================

export function login(payload: LoginPayload) {
  return api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    authenticated: false,
  });
}

export function getMe() {
  return api<AuthUser>("/auth/me");
}

export function changePassword(payload: ChangePasswordPayload) {
  return api<ChangePasswordResponse>("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return api<LogoutResponse>("/auth/logout", {
    method: "POST",
  });
}

// ============================================================
// ADMIN – USER MANAGEMENT
// ============================================================

export type UserStatus = "ACTIVE" | "INACTIVE" | "TERMINATED";

export type CreateUserPayload = {
  username: string;
  password: string;
  role: "ADMIN" | "HR_USER" | "DEPARTMENT_MANAGER" | "EMPLOYEE";
  fullName: string;
  email: string;
  phone?: string;
  position?: string;
  hireDate?: string;
  departmentId?: string;
};

export function createUser(payload: CreateUserPayload) {
  return api<AuthUser>("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getUsers() {
  return api<AuthUser[]>("/admin/users");
}

export function getUser(id: string) {
  return api<AuthUser>(`/admin/users/${id}`);
}

export function updateUser(id: string, payload: Partial<CreateUserPayload>) {
  return api<AuthUser>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateUserStatus(id: string, status: UserStatus) {
  return api<AuthUser>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deactivateUser(id: string) {
  return updateUserStatus(id, "INACTIVE");
}

// ============================================================
// ADMIN – DEPARTMENT MANAGEMENT
// ============================================================

export type CreateDepartmentPayload = {
  name: string;
  managerId?: string | null;
};

export function createDepartment(payload: CreateDepartmentPayload) {
  return api<Department>("/admin/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getDepartments() {
  return api<Department[]>("/admin/departments");
}

export function getDepartment(id: string) {
  return api<Department>(`/admin/departments/${id}`);
}

export function updateDepartment(
  id: string,
  payload: Partial<CreateDepartmentPayload>,
) {
  return api<Department>(`/admin/departments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function assignDepartmentManager(
  departmentId: string,
  payload: { managerId: string },
) {
  return api<Department>(`/admin/departments/${departmentId}/manager`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function removeDepartmentManager(departmentId: string) {
  return api<Department>(`/admin/departments/${departmentId}/manager`, {
    method: "DELETE",
  });
}
