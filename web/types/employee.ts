export type EmploymentStatus = "ACTIVE" | "INACTIVE" | "TERMINATED";
import type { LeaveRequest } from "./leave-request";

export type Employee = {
  id: string;
  employeeId: string;
  fullName: string;
  phone: string;
  email: string;
  position: string;
  hireDate: string;
  status: EmploymentStatus;
  departmentId: string;
  leaveRequests?: LeaveRequest[];

  department: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    username: string;
    role: string;
    isActive: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type EmployeeListResponse = Employee[]; // the API returns an array

export type UpdateEmployeePayload = {
  fullName?: string;
  phone?: string;
  email?: string;
  position?: string;
  departmentId?: string;
};

export type UpdateEmployeeStatusPayload = {
  status: EmploymentStatus;
};
