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
            <p className="text-base font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wide">LAKIER I KAROSERIA</p>
            <p className="text-base text-gray-500 dark:text-gray-400">
              {translateCondition(carCondition?.paintandBody)}
            </p>
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wide">PODWOZIE I RAMA</p>
            <p className="text-base text-gray-500 dark:text-gray-400">
              {translateCondition(carCondition?.frameandUnderbody)}
            </p>
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wide">OGÓLNY</p>
            <p className="text-base text-gray-500 dark:text-gray-400">
              {translateCondition(carCondition?.overall)}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wide">WNĘTRZE</p>
            <p className="text-base text-gray-500 dark:text-gray-400">
              {translateCondition(carCondition?.interior)}
            </p>
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wide">MECHANICZNY</p>
            <p className="text-base text-gray-500 dark:text-gray-400">
              {translateCondition(carCondition?.mechanical)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionTab;
