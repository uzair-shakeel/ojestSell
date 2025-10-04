import React from "react";

const ConditionTab = ({ carCondition }) => {
  const translateCondition = (value) => {
    if (!value || typeof value !== "string") return value || "";
    const key = value.trim().toLowerCase();
    const map = {
      "very good": "Bardzo dobry",
      good: "Dobry",
      new: "Nowy",
    };
    return map[key] || value;
  };
  return (
    <div>
      {/* Condition Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-5 text-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full ">
          <p className="text-xs uppercase">Lakier i karoseria</p>{" "}
          <p className=" text-base font-meduim text-black ">
            {translateCondition(carCondition?.paintandBody)}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Wnętrze</p>{" "}
          <p className=" font-meduim text-black ">
            {translateCondition(carCondition?.interior)}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Podwozie I rama </p>{" "}
          <p className=" font-meduim text-black ">
            {translateCondition(carCondition?.frameandUnderbody)}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Mechaniczny</p>{" "}
          <p className=" font-meduim text-black ">
            {translateCondition(carCondition?.mechanical)}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Ogólny</p>{" "}
          <p className=" font-meduim text-black ">
          {translateCondition(carCondition?.overall)}

          </p>
        </div>
      </div>
    </div>
  );
};

export default ConditionTab;
