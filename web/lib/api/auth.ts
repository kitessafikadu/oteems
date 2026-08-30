import { api } from "@/lib/api";
import { setAccessToken, removeAccessToken } from "@/lib/auth";
import type {
  AuthUser,
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  LoginResponse,
} from "@/types/auth";

const TOKEN_COOKIE_NAME = "oteems_access_token";
const TOKEN_MAX_AGE = 60 * 60 * 8;

function setTokenCookie(token: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_COOKIE_NAME}=${token}; path=/; max-age=${TOKEN_MAX_AGE}; samesite=lax`;
}

function removeTokenCookie() {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export async function login(payload: LoginPayload) {
  const response = await api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    authenticated: false,
  });

  if (response?.accessToken) {
    setTokenCookie(response.accessToken);
    setAccessToken(response.accessToken);
  }

  return response;
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

export async function logout() {
  try {
    await api<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  } finally {
    removeTokenCookie();
    removeAccessToken();
  }
}
