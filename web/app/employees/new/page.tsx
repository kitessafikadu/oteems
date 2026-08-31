"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUser, getDepartments } from "@/lib/api/admin";
import type { CreateUserPayload } from "@/lib/api/admin";
import type { Department } from "@/types/department";
import { getMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const POSITIONS = [
  "Software Engineer",
  "Senior Software Engineer",
  "Team Lead",
  "Project Manager",
  "Product Manager",
  "HR Officer",
  "Accountant",
  "Marketing Specialist",
  "Sales Representative",
  "Administrative Assistant",
  "Other",
];

export default function NewEmployeePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Separate state for position dropdown and custom input
  const [selectedPosition, setSelectedPosition] = useState("");
  const [customPosition, setCustomPosition] = useState("");

  const [form, setForm] = useState<CreateUserPayload>({
    username: "",
    password: "",
    role: "EMPLOYEE",
    fullName: "",
    email: "",
    phone: "",
    position: "",
    hireDate: "",
    departmentId: "",
  });

  useEffect(() => {
    getMe()
      .then((currentUser) => {
        setUser(currentUser);
        if (currentUser.role !== "ADMIN" && currentUser.role !== "HR_USER") {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        removeAccessToken();
        router.replace("/login");
      });

    getDepartments()
      .then((data: Department[]) => setDepartments(data))
      .catch(() => setError("Failed to load departments."));
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPosition(value);
    // Clear custom position when not "Other"
    if (value !== "Other") {
      setCustomPosition("");
    }
    // Update form.position directly for predefined positions
    setForm((prev) => ({
      ...prev,
      position: value === "Other" ? "" : value,
    }));
  };

  const handleCustomPositionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setCustomPosition(value);
    setForm((prev) => ({ ...prev, position: value }));
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password }));
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Ensure final position is set correctly
    const finalForm = {
      ...form,
      position:
        selectedPosition === "Other" ? customPosition : selectedPosition,
    };

    try {
      await createUser(finalForm);
      router.replace("/employees");
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      if (error?.status === 401 || error?.status === 403) {
        removeAccessToken();
        router.replace("/login");
        return;
      }
      setError(error?.message || "Failed to create employee.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-7">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-oteems-red">
                People
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em]">
                Add Employee
              </h2>
              <p className="mt-2 text-sm text-black/45">
                Create a new employee account and profile.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  />
                </div>

                {/* Position (Dropdown) */}
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Position
                  </label>
                  <select
                    name="position"
                    value={selectedPosition}
                    onChange={handlePositionChange}
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  >
                    <option value="">Select position</option>
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Position (conditionally rendered) */}
                {selectedPosition === "Other" && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold">
                      Specify Position
                    </label>
                    <input
                      type="text"
                      value={customPosition}
                      onChange={handleCustomPositionChange}
                      required
                      className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                      placeholder="Enter custom position"
                    />
                  </div>
                )}

                {/* Hire Date */}
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    name="hireDate"
                    value={form.hireDate}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Department
                  </label>
                  <select
                    name="departmentId"
                    value={form.departmentId}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Username */}
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  />
                </div>

                {/* Password with toggle and generate */}
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-lg border border-black/15 px-4 pr-20 text-sm outline-none focus:border-oteems-red"
                    />
                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-black/5 hover:text-black"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 3l18 18"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10.58 10.58a2 2 0 002.84 2.84"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.88 4.24A10.5 10.5 0 0112 4c5 0 8.5 4 9.5 8-1 2-4.5 6-9.5 6-1.7 0-3.2-.45-4.45-1.15"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                            />
                            <circle cx="12" cy="12" r="2.5" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="rounded-md px-2 py-1 text-[10px] font-semibold text-oteems-red transition-colors hover:bg-oteems-red/10"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="DEPARTMENT_MANAGER">
                      Department Manager
                    </option>
                    <option value="HR_USER">HR User</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-oteems-red text-sm font-semibold text-white transition-colors hover:bg-oteems-red-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating employee..." : "Create Employee"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
