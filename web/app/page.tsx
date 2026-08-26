import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Employee Management",
    description:
      "Keep employee profiles, employment details, and organizational information in one place.",
  },
  {
    number: "02",
    title: "Departments",
    description:
      "Organize your workforce by department and maintain a clear organizational structure.",
  },
  {
    number: "03",
    title: "Leave Management",
    description:
      "Simplify leave requests, approvals, and employee leave tracking.",
  },
  {
    number: "04",
    title: "Reports",
    description:
      "Turn employee data into useful reports for better HR decisions.",
  },
];

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
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-oteems-black">
      {/* Navigation */}
      <header className="border-b border-black/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black tracking-[-0.05em]">
            OTEEMS<span className="text-oteems-red">.</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-oteems-red"
            >
              Features
            </a>
            <a
              href="#about"
              className="transition-colors hover:text-oteems-red"
            >
              About
            </a>
            <a
              href="#contact"
              className="transition-colors hover:text-oteems-red"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-4 py-2.5 text-sm font-medium transition-colors hover:text-oteems-red sm:block"
            >
              Sign in
            </Link>

            <Link
              href="/dashboard"
              className="rounded-full bg-oteems-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-oteems-red"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-8xl">
              Your people.
              <br />
              <span className="text-oteems-red">One system.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">
              OTEEMS helps organizations manage employees, departments, leave,
              and workforce data from one simple and powerful platform.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="rounded-full bg-oteems-red px-7 py-3.5 text-sm font-medium text-white transition-all hover:bg-oteems-red-dark hover:shadow-lg"
              >
                Get started
              </Link>

              <a
                href="#features"
                className="rounded-full border border-black/15 px-7 py-3.5 text-sm font-medium transition-all hover:border-black/30 hover:bg-black/[0.03]"
              >
                Explore features
              </a>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="relative mx-auto mt-20 max-w-6xl">
            <div className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-oteems-red/10 blur-3xl" />

            <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#f7f7f7] shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
              {/* Browser bar */}
              <div className="flex h-11 items-center gap-1.5 border-b border-black/10 bg-white px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-black/10" />

                <div className="mx-auto hidden rounded-md bg-black/[0.04] px-20 py-1 text-[10px] text-black/30 sm:block">
                  app.oteems.com/dashboard
                </div>
              </div>

              {/* Dashboard */}
              <div className="grid min-h-[480px] grid-cols-1 md:grid-cols-[190px_1fr]">
                {/* Sidebar */}
                <aside className="hidden border-r border-black/10 bg-white p-5 md:block">
                  <div className="mb-10 text-lg font-black tracking-[-0.05em]">
                    OTEEMS<span className="text-oteems-red">.</span>
                  </div>

                  <div className="space-y-1">
                    {[
                      "Overview",
                      "Employees",
                      "Departments",
                      "Leave",
                      "Reports",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-lg px-3 py-2.5 text-xs font-medium ${
                          index === 0
                            ? "bg-oteems-red text-white"
                            : "text-black/50"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-20 border-t border-black/10 pt-5">
                    <div className="text-[10px] uppercase tracking-wider text-black/30">
                      Workspace
                    </div>
                    <div className="mt-3 text-xs font-medium">
                      OTech Engineering
                    </div>
                  </div>
                </aside>

                {/* Main dashboard */}
                <div className="p-5 sm:p-7">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-black/40">
                        Overview
                      </p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight">
                        Good morning.
                      </h2>
                    </div>

                    <div className="hidden rounded-full border border-black/10 bg-white px-3 py-2 text-[10px] sm:block">
                      Aug 26, 2026
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                      ["128", "Employees"],
                      ["12", "Departments"],
                      ["08", "On leave"],
                      ["96%", "Attendance"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-black/10 bg-white p-4"
                      >
                        <div className="text-xl font-bold tracking-tight">
                          {value}
                        </div>
                        <div className="mt-1 text-[10px] text-black/40">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Employee table */}
                  <div className="mt-5 rounded-xl border border-black/10 bg-white">
                    <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
                      <div>
                        <h3 className="text-xs font-bold">Recent employees</h3>
                        <p className="mt-0.5 text-[10px] text-black/40">
                          Latest additions to your workforce
                        </p>
                      </div>

                      <span className="text-[10px] font-medium text-oteems-red">
                        View all
                      </span>
                    </div>

                    <div className="divide-y divide-black/5">
                      {employees.map((employee) => (
                        <div
                          key={employee.name}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-[9px] font-bold">
                              {employee.initials}
                            </div>

                            <div>
                              <div className="text-[11px] font-semibold">
                                {employee.name}
                              </div>
                              <div className="text-[9px] text-black/40">
                                {employee.role}
                              </div>
                            </div>
                          </div>

                          <div className="hidden text-[9px] text-black/40 sm:block">
                            {employee.department}
                          </div>

                          <div className="flex items-center gap-1.5 text-[9px] font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            {employee.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature intro */}
      <section id="features" className="border-t border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-oteems-red">
                Everything in one place
              </p>

              <h2 className="mt-5 max-w-lg text-4xl font-bold leading-[1] tracking-[-0.05em] sm:text-5xl">
                Built around your people.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-6 text-black/55">
                Stop managing employee information across spreadsheets and
                disconnected systems. OTEEMS gives your organization a
                centralized workspace for everyday employee operations.
              </p>
            </div>

            <div className="grid border-t border-black/10 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.number}
                  className="border-b border-black/10 py-8 sm:px-6 sm:nth-[2n+1]:border-r"
                >
                  <span className="text-xs font-medium text-oteems-red">
                    {feature.number}
                  </span>

                  <h3 className="mt-5 text-xl font-bold tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="mt-3 max-w-xs text-sm leading-6 text-black/50">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About / CTA */}
      <section id="about" className="bg-oteems-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-oteems-red">
              OTEEMS
            </p>

            <h2 className="mt-6 text-4xl font-bold leading-[1] tracking-[-0.05em] sm:text-6xl">
              Less administration.
              <br />
              More focus on people.
            </h2>

            <p className="mt-7 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
              Give HR teams and managers the tools they need to keep employee
              operations organized, transparent, and efficient.
            </p>

            <Link
              href="/dashboard"
              className="mt-9 inline-flex rounded-full bg-oteems-red px-7 py-3.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black"
            >
              Start using OTEEMS
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-white/10 bg-oteems-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="text-base font-black tracking-[-0.05em] text-white">
            OTEEMS<span className="text-oteems-red">.</span>
          </div>

          <p>Employee Management System for OTech Engineering</p>

          <p>© 2026 OTEEMS</p>
        </div>
      </footer>
    </main>
  );
}
