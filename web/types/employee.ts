export type Employee = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
};

export type UpdateEmployeePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  departmentId?: string;
};

export type UpdateEmployeeStatusPayload = {
  status: string;
};
