const employees = [
  {
    initials: "AB",
    name: "Abebe Bekele",
    role: "Software Engineer",
    department: "Engineering",
    status: "Active",
  },
  {
    initials: "MH",
    name: "Mekdes Haile",
    role: "Product Designer",
    department: "Design",
    status: "Active",
  },
  {
    initials: "DA",
    name: "Dawit Alemu",
    role: "HR Manager",
    department: "Human Resources",
    status: "Active",
  },
  {
    initials: "NA",
    name: "Natan Ayele",
    role: "Accountant",
    department: "Finance",
    status: "Active",
  },
];

export function RecentEmployees() {
  return (
    <section className="rounded-xl border border-black/10 bg-white">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold">Recent employees</h2>
          <p className="mt-1 text-xs text-black/40">Recently added employees</p>
        </div>

        <a
          href="/employees"
          className="text-xs font-semibold text-oteems-red hover:underline"
        >
          View all
        </a>
      </div>

      <div className="divide-y divide-black/5">
        {employees.map((employee) => (
          <div
            key={employee.name}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-xs font-bold">
                {employee.initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {employee.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-black/40">
                  {employee.role}
                </p>
              </div>
            </div>

            <div className="hidden text-xs text-black/40 md:block">
              {employee.department}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {employee.status}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
