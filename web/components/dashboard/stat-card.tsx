type StatCardProps = {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
};

export function StatCard({
  label,
  value,
  change,
  positive = true,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-black/45">{label}</p>

        <span
          className={`rounded-full px-2 py-1 text-[10px] font-medium ${
            positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {change}
        </span>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-[-0.04em]">{value}</p>
    </div>
  );
}
