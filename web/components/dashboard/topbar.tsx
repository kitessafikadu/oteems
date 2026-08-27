"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";
import { logout } from "@/lib/api/auth";

interface TopbarProps {
  user?: AuthUser | null;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  HR_USER: "HR User",
  DEPARTMENT_MANAGER: "Department Manager",
  EMPLOYEE: "Employee",
};

export function Topbar({ user }: TopbarProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user?.employee?.fullName || user?.username || "User";
  const email = user?.employee?.email || user?.username || "";
  const roleLabel = user?.role ? roleLabels[user.role] || user.role : "";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Ignore errors (token may already be expired)
    } finally {
      removeAccessToken();
      router.replace("/login");
    }
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-black/10 bg-white px-5 sm:px-8">
      <div>
        <p className="text-xs text-black/40">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <h1 className="mt-0.5 text-lg font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-colors hover:bg-black/[0.04]"
          aria-label="Notifications"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-[18px] w-[18px]"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
        </button>

        {/* Profile button and dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-oteems-black text-xs font-bold text-white"
            aria-label="Account"
            aria-expanded={isProfileOpen}
          >
            {initials}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-black/10 bg-white shadow-lg">
              {/* Profile info */}
              <div className="border-b border-black/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-oteems-black text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-black/45">{email}</p>
                  </div>
                </div>
                <div className="mt-3 inline-block rounded-full bg-black/[0.05] px-2 py-1 text-[10px] font-medium text-black/60">
                  {roleLabel}
                </div>
              </div>

              {/* Actions */}
              <div className="p-2 space-y-1">
                {/* Dedicated Profile button */}
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-black/60 transition-colors hover:bg-black/[0.04] hover:text-black"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-[18px] w-[18px]"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.5 1.5-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20h-2.12v-.4a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.5-1.5.06-.06A1.7 1.7 0 0 0 7.6 15a1.7 1.7 0 0 0-1.56-1.04H5.6v-2.12h.44A1.7 1.7 0 0 0 7.6 10.8a1.7 1.7 0 0 0-.34-1.88L7.2 8.86l1.5-1.5.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56V5.6h2.12v.6a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.5 1.5-.06.06A1.7 1.7 0 0 0 19.4 10.8a1.7 1.7 0 0 0 1.56 1.04h.44v2.12h-.44A1.7 1.7 0 0 0 19.4 15Z" />
                  </svg>
                  Profile
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg bg-oteems-red px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-oteems-red-dark"
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
