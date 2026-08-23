export default function Home() {
  return (
    <main className="min-h-screen bg-white px-8 py-16 text-black">
      <div className="mx-auto max-w-5xl">
        <div className="mt-12 flex gap-4">
          <button className="rounded-full px-6 py-3 font-medium bg-oteems-red text-white hover:bg-oteems-red-dark">
            Add Employee
          </button>

          <button className="rounded-full border border-gray-300 px-6 py-3 font-medium">
            View Employees
          </button>
        </div>
      </div>
    </main>
  );
}
