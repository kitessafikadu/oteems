export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthUser = {
  id: string;
  username: string;
  role: string;
  employeeId: string | null;
  employee: unknown | null;
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
