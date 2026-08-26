"use client";

export function Topbar() {
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
        </p>{" "}
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

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-oteems-black text-xs font-bold text-white"
          aria-label="Account"
        >
          KF
        </button>
      </div>
    </header>
  );
}
