const requests = [
  {
    initials: "SM",
    name: "Sara Mohammed",
    type: "Annual leave",
    duration: "Aug 28 - Sep 02",
  },
  {
    initials: "YK",
    name: "Yonatan Kebede",
    type: "Sick leave",
    duration: "Aug 27 - Aug 28",
  },
  {
    initials: "FT",
    name: "Fitsum Tadesse",
    type: "Annual leave",
    duration: "Sep 04 - Sep 06",
  },
];

export function LeaveRequests() {
  return (
    <section className="rounded-xl border border-black/10 bg-white">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold">Leave requests</h2>
          <p className="mt-1 text-xs text-black/40">
            Requests waiting for approval
          </p>
        </div>

        <a
          href="/leave"
          className="text-xs font-semibold text-oteems-red hover:underline"
        >
          View all
        </a>
      </div>

      <div className="divide-y divide-black/5">
        {requests.map((request) => (
          <div key={request.name} className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-oteems-red-light text-xs font-bold text-oteems-red">
                {request.initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{request.name}</p>
                <p className="mt-1 text-[11px] text-black/40">
                  {request.type} · {request.duration}
                </p>
              </div>
            </div>

            <div className="mt-3 flex gap-2 pl-12">
              <button
                type="button"
                className="rounded-full bg-oteems-black px-3 py-1.5 text-[10px] font-medium text-white hover:bg-oteems-red"
              >
                Approve
              </button>

              <button
                type="button"
                className="rounded-full border border-black/10 px-3 py-1.5 text-[10px] font-medium hover:bg-black/[0.04]"
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
