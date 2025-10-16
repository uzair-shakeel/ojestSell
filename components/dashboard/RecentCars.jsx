"use client";

export default function RecentCars({ cars = [] }) {
  const items = Array.isArray(cars) ? cars.slice(-5).reverse() : [];

  const getStatusClasses = (status) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 ring-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 ring-amber-200";
      case "rejected":
        return "bg-rose-100 text-rose-700 ring-rose-200";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-200";
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800800800800800800800 shadow rounded-xl ring-1 ring-black/5 dark:ring-gray-700 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
          Recent cars
        </h3>
      </div>
      <div className="divide-y">
        {items.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            No cars yet
          </div>
        )}
        {items.map((car) => {
          const img = car?.images?.[0] || "/images/placeholder-car.jpg";
          const title =
            car?.title ||
            `${car?.make || ""} ${car?.model || ""}`.trim() ||
            "Untitled";
          const status = car?.status || "Pending";
          return (
            <div
              key={car?._id || car?.id || title}
              className="py-3 flex items-center gap-3"
            >
              <img
                src={img}
                alt={title}
                className="w-12 h-12 rounded-md object-cover ring-1 ring-black/5"
              />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium text-gray-900 dark:text-white transition-colors duration-300">
                  {title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-300">
                  {car?.year || ""} {car?.trim || ""}
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-md ring-1 ${getStatusClasses(
                  status
                )}`}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
