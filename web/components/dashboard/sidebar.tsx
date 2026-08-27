"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";
import { logout } from "@/lib/api/auth";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
    roles: ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER", "EMPLOYEE"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Employees",
    href: "/employees",
    roles: ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Departments",
    href: "/departments",
    roles: ["ADMIN", "HR_USER"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 21V9h6v12" />
        <path d="M9 6h6" />
      </svg>
    ),
  },
  {
    label: "Leave",
    href: "/leave",
    roles: ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER", "EMPLOYEE"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "Reports",
    href: "/reports",
    roles: ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 3-4 3 2 5-7" />
      </svg>
    ),
  },
];

const secondaryNavigation = [
  {
    label: "Settings",
    href: "/settings",
    roles: ["ADMIN", "HR_USER", "DEPARTMENT_MANAGER", "EMPLOYEE"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.5 1.5-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20h-2.12v-.4a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.5-1.5.06-.06A1.7 1.7 0 0 0 7.6 15a1.7 1.7 0 0 0-1.56-1.04H5.6v-2.12h.44A1.7 1.7 0 0 0 7.6 10.8a1.7 1.7 0 0 0-.34-1.88L7.2 8.86l1.5-1.5.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56V5.6h2.12v.6a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.5 1.5-.06.06A1.7 1.7 0 0 0 19.4 10.8a1.7 1.7 0 0 0 1.56 1.04h.44v2.12h-.44A1.7 1.7 0 0 0 19.4 15Z" />
      </svg>
    ),
  },
];

// Helper to map role to display label
const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  HR_USER: "HR User",
  DEPARTMENT_MANAGER: "Department Manager",
  EMPLOYEE: "Employee",
};

interface SidebarProps {
  user?: AuthUser | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const userRole = user?.role;
  const displayName = user?.employee?.fullName || user?.username || "User";
  const roleLabel = userRole ? roleLabels[userRole] || userRole : "";

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole)),
  );

  const filteredSecondaryNavigation = secondaryNavigation.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole)),
  );

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Ignore errors (token may already be expired)
    } finally {
      // Always clear token and redirect
      removeAccessToken();
      router.replace("/login");
    }
  };

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-black/10 bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-black/10 px-7">
        <Link
          href="/dashboard"
          className="text-2xl font-black tracking-[-0.06em]"
        >
          OTEEMS<span className="text-oteems-red">.</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-6">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30">
          Workspace
        </p>

        <nav className="mt-3 space-y-1">
          {filteredNavigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-oteems-red text-white"
                    : "text-black/55 hover:bg-black/[0.04] hover:text-black"
                }`}
              >
                <span className="h-[18px] w-[18px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <p className="mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30">
          Account
        </p>

        <nav className="mt-3 space-y-1">
          {filteredSecondaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-black/55 transition-colors hover:bg-black/[0.04] hover:text-black"
            >
              <span className="h-[18px] w-[18px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-black/10 p-4">
        {/* Profile card */}
        <div className="flex items-center gap-3 rounded-xl bg-black/[0.03] p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-oteems-black text-xs font-bold text-white">
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{displayName}</p>
            <p className="truncate text-[10px] text-black/40">{roleLabel}</p>
          </div>
        </div>

        {/* Logout button – full width, red, icon + text */}
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-oteems-red px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-oteems-red-dark"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-[18px] w-[18px]"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>
    </aside>
  );
}
