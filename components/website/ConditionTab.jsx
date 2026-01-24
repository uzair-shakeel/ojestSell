import React from "react";

const ConditionTab = ({ carCondition }) => {
  const translateCondition = (value) => {
    if (!value || typeof value !== "string") return value || "-";
    const key = value.trim().toLowerCase();
    const map = {
      "very good": "Dobry", // As seen in screenshot "Dobry" for "Good" or similar
      good: "Dobry",
      normal: "Normal",
      excellent: "Doskonały",
      fair: "Umiarkowany",
      "like new": "Jak nowy",
      new: "Nowy",
    };
    return map[key] || value;
  };

  return (
    <div className="py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">LAKIER I KAROSERIA</p>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {translateCondition(carCondition?.paintandBody)}
            </p>
          </div>
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">PODWOZIE I RAMA</p>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {translateCondition(carCondition?.frameandUnderbody)}
            </p>
          </div>
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">OGÓLNY</p>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {translateCondition(carCondition?.overall)}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">WNĘTRZE</p>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {translateCondition(carCondition?.interior)}
            </p>
          </div>
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">MECHANICZNY</p>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {translateCondition(carCondition?.mechanical)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionTab;
