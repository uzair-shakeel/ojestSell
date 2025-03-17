import React from "react";

const ConditionTab = () => {
  return (
    <div>
      {/* Condition Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-5 text-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full ">
          <p className="text-xs uppercase">Condition (Paint & Body)</p>{" "}
          <p className=" text-base font-meduim text-black ">
            Excellent no missing, broken, or damaged parts that require
            replacement
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Condition (Interior)</p>{" "}
          <p className=" font-meduim text-black ">
            Excellent no missing, broken, or damaged parts that require
            replacement
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Condition (Frame & Underbody)</p>{" "}
          <p className=" font-meduim text-black ">
            Excellent frame/structure is in perfect condition, no rust or
            damages
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Condition (Mechanical)</p>{" "}
          <p className=" font-meduim text-black ">
            Excellent mechanically sound, no work to be done, no leaks, no
            service needed
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Condition (Overall)</p>{" "}
          <p className=" font-meduim text-black ">
            Excellent condition : excellent and original condition
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConditionTab;
