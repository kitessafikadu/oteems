import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const routePermissions: Record<string, string[]> = {
  "/employees": ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER"],
  "/employees/new": ["ADMIN", "HR_USER"],
  "/departments": ["ADMIN", "HR_USER"],
  "/reports": ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER"],
  "/reports/my-summary": ["EMPLOYEE", "ADMIN", "HR_USER", "DEPARTMENT_MANAGER"],
  "/leave": ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER", "EMPLOYEE"],
  "/leave-requests": ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER", "EMPLOYEE"],
};

interface JwtPayload {
  sub?: string;
  username?: string;
  role?: string;
  employeeId?: string | null;
  [key: string]: unknown;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(decoded);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as JwtPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("oteems_access_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.role !== "string") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const path = request.nextUrl.pathname;
  const allowedRoles = routePermissions[path];
  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employees/:path*",
    "/departments/:path*",
    "/reports/:path*",
    "/leave/:path*",
    "/leave-requests/:path*",
  ],
};
