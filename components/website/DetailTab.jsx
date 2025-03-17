'use client'
import React from "react";
import { useState } from "react";

const DetailTab = ({ description }) => {
    const [showMore, setShowMore] = useState(false);

  return (
    <div>
      <div>
        <p className="font-medium text-black uppercase">Description</p>
        <p className="text-gray-700"> 
          {showMore
            ? description +
              " The car has been kept in pristine condition with no modifications or restorations."
            : description.slice(0, 150)}
          <button
            className="text-blue-500 ml-2 underline"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "Show Less" : "Show More"}
          </button>
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-20 gap-y-5 mt-6 text-gray-700">
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Brand</p>{" "}
          <p className="font-medium text-black ">Fiat</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Model Type</p>
          <p className="font-medium text-black ">
            {" "}
            Croma Turbo i.e. - NO RESERVE
          </p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Year</p>{" "}
          <p className="font-medium text-black ">1993</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Located In</p>{" "}
          <p className="font-medium text-black ">Italy</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Mileage</p>{" "}
          <p className="font-medium text-black ">113,000 km</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Registration Papers</p>{" "}
          <p className="font-medium text-black "> With Italian registration</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Transmission</p>{" "}
          <p className="font-medium text-black "> Manual</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Fuel</p>{" "}
          <p className="font-medium text-black ">Petrol</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Color</p>{" "}
          <p className="font-medium text-black "> White</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Horse Power</p>{" "}
          <p className="font-medium text-black "> 150 HP</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Cubic Capacity</p>{" "}
          <p className="font-medium text-black "> 1995 cc</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Matching Numbers</p>{" "}
          <p className="font-medium text-black "> Yes</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Matching Colours</p>{" "}
          <p className="font-medium text-black "> Yes</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Service Book/History</p>{" "}
          <p className="font-medium text-black "> No</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Valid MOT</p>{" "}
          <p className="font-medium text-black "> No</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">COC (Certificate of Conformity)</p>{" "}
          <p className="font-medium text-black "> On request</p>
        </div>
      </div>
    </div>
  );
};

export default DetailTab;
