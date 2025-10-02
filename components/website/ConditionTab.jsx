import React from "react";

const ConditionTab = ({ carCondition }) => {
  return (
    <div>
      {/* Condition Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-5 text-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full ">
          <p className="text-xs uppercase">Condition (Paint & Body)</p>{" "}
          <p className=" text-base font-meduim text-black ">
            {carCondition?.paintandBody}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Condition (Interior)</p>{" "}
          <p className=" font-meduim text-black ">
            {carCondition?.interior}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Condition (Frame & Underbody)</p>{" "}
          <p className=" font-meduim text-black ">
            {carCondition?.frameandUnderbody}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Condition (Mechanical)</p>{" "}
          <p className=" font-meduim text-black ">
            {carCondition?.mechanical}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Condition (Overall)</p>{" "}
          <p className=" font-meduim text-black ">
          {carCondition?.overall}

          </p>
        </div>
      </div>
    </div>
  );
};

export default ConditionTab;
