import React from "react";

const ConditionTab = ({ carCondition }) => {
  const translateCondition = (value) => {
    if (!value || typeof value !== "string") return value || "-";
    const key = value.trim().toLowerCase();
    const map = {
      "very good": "Bardzo Dobry",
      good: "Dobry",
      normal: "Normalny",
      excellent: "Doskonały",
      fair: "Umiarkowany",
      "like new": "Jak nowy",
      new: "Nowy",
    };
    return map[key] || value;
  };

  const sections = [
    { label: "LAKIER I KAROSERIA", value: carCondition?.paintandBody },
    { label: "PODWOZIE I RAMA", value: carCondition?.frameandUnderbody },
    { label: "WNĘTRZE", value: carCondition?.interior },
    { label: "MECHANICZNY", value: carCondition?.mechanical },
    { label: "STAN OGÓLNY", value: carCondition?.overall },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 sm:last:border-b"
          >
            <span className="text-[15px] sm:text-[16px]  text-gray-700 dark:text-gray-300 leading-relaxed">
              {section.label}
            </span>
            <span className="text-[15px] sm:text-[16px] font-medium text-gray-500 dark:text-gray-400 capitalize">
              {translateCondition(section.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConditionTab;
