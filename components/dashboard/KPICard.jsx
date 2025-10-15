"use client";

export default function KPICard({
  title,
  value,
  icon,
  gradient = "from-blue-500 to-indigo-600",
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-gray-700 bg-white dark:bg-black border border-gray-200 dark:border-gray-700`}
    >
      <div className="p-4 flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow`}
        >
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
          <span className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</span>
        </div>
      </div>
    </div>
  );
}

