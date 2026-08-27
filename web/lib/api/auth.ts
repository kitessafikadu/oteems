import { api } from "@/lib/api";
import type {
  AuthUser,
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  LoginResponse,
} from "@/types/auth";

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
  return api<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}
