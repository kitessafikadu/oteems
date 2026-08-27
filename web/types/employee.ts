export type EmploymentStatus = "ACTIVE" | "INACTIVE" | "TERMINATED";

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
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  departmentId?: string;
};

export type UpdateEmployeeStatusPayload = {
  status: EmploymentStatus;
};
