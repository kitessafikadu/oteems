"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEmployee, updateEmployee } from "@/lib/api/employees";
import type { Employee } from "@/types/employee";
import { getMe } from "@/lib/api/auth";
import { getDepartments } from "@/lib/api/admin";
import type { Department } from "@/types/department";
import type { AuthUser } from "@/types/auth";
import { removeAccessToken } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function EditEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    position: "",
    departmentId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (id && user) {
      getEmployee(id as string)
        .then((emp) => {
          setForm({
            fullName: emp.fullName,
            phone: emp.phone || "",
            email: emp.email,
            position: emp.position || "",
            departmentId: emp.departmentId || "",
          });
          setLoading(false);
        })
        .catch((err: unknown) => {
          const error = err as { status?: number; message?: string };
          setError(error?.message || "Failed to load employee.");
          setLoading(false);
        });
    }
  }, [id, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateEmployee(id as string, form);
      router.replace(`/employees/${id}`);
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      setError(error?.message || "Failed to update employee.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
        <div className="text-sm text-black/50">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f7f7f7]">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-[-0.05em]">
              Edit Employee
            </h2>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
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
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-black/15 px-4 text-sm outline-none focus:border-oteems-red"
                  />
                </div>
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
              </div>

              <button
                type="submit"
                disabled={saving}
                className="h-12 w-full rounded-lg bg-oteems-red text-sm font-semibold text-white transition-colors hover:bg-oteems-red-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
