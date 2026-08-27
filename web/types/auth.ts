export type Department = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  employeeId: string;
  fullName: string;
  phone: string;
  email: string;
  position: string;
  hireDate: string;
  status: string;
  department: Department;
};

export type AuthUser = {
  id: string;
  username: string;
  role: string;
  employeeId: string | null;
  employee: Employee | null;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type MeResponse = AuthUser;

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  message: string;
};
export type LogoutResponse = {
  message: string;
};
