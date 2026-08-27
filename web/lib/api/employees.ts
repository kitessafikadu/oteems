import { api } from "@/lib/api";
import type {
  Employee,
  UpdateEmployeePayload,
  UpdateEmployeeStatusPayload,
} from "@/types/employee";

export function getEmployees() {
  return api<Employee[]>("/employees");
}

export function getEmployee(id: string) {
  return api<Employee>(`/employees/${id}`);
}

export function updateEmployee(id: string, payload: UpdateEmployeePayload) {
  return api<Employee>(`/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateEmployeeStatus(
  id: string,
  payload: UpdateEmployeeStatusPayload,
) {
  return api<Employee>(`/employees/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
