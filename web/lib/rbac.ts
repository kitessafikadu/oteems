import type { AuthUser } from "@/types/auth";

export type Permission =
  | "dashboard.view"
  | "employees.view"
  | "employees.add"
  | "employees.edit"
  | "employees.status"
  | "departments.view"
  | "departments.add"
  | "departments.edit"
  | "departments.manager"
  | "leave.view"
  | "leave.create"
  | "leave.submit"
  | "leave.resubmit"
  | "leave.cancel"
  | "leave.approve"
  | "leave.reject"
  | "reports.view"
  | "reports.my"
  | "settings.view";

const rolePermissions: Record<string, Permission[]> = {
  ADMIN: [
    "dashboard.view",
    "employees.view",
    "employees.add",
    "employees.edit",
    "employees.status",
    "departments.view",
    "departments.add",
    "departments.edit",
    "departments.manager",
    "leave.view",
    "leave.create",
    "leave.submit",
    "leave.resubmit",
    "leave.cancel",
    "leave.approve",
    "leave.reject",
    "reports.view",
    "reports.my",
    "settings.view",
  ],

  HR_USER: [
    "dashboard.view",
    "employees.view",
    "employees.add",
    "employees.edit",
    "employees.status",
    "departments.view",
    "departments.add",
    "departments.edit",
    "departments.manager",
    "leave.view",
    "leave.create",
    "leave.submit",
    "leave.resubmit",
    "leave.cancel",
    "leave.approve",
    "leave.reject",
    "reports.view",
    "reports.my",
    "settings.view",
  ],

  DEPARTMENT_MANAGER: [
    "dashboard.view",
    "employees.view",
    "leave.view",
    "leave.create",
    "leave.submit",
    "leave.resubmit",
    "leave.cancel",
    "leave.approve",
    "leave.reject",
    "reports.view",
    "reports.my",
    "settings.view",
  ],

  EMPLOYEE: [
    "dashboard.view",
    "leave.view",
    "leave.create",
    "leave.submit",
    "leave.resubmit",
    "leave.cancel",
    "reports.my",
    "settings.view",
  ],
};

export function hasPermission(
  user: AuthUser | null | undefined,
  permission: Permission,
): boolean {
  if (!user) return false;
  const permissions = rolePermissions[user.role];
  return permissions?.includes(permission) ?? false;
}
