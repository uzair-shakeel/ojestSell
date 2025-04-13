'use client'
import React from "react";
import { useState } from "react";

const DetailTab = ({ cardetails }) => {
    const [showMore, setShowMore] = useState(false);

  return (
    <div>
      <div>
        <p className="font-medium text-black uppercase">{cardetails.description}</p>
        <p className="text-gray-700"> 
          {showMore
            ? cardetails.description +
              " The car has been kept in pristine condition with no modifications or restorations."
            : cardetails.description.slice(0, 150)}
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
          <p className="text-xs uppercase">Make</p>{" "}
          <p className="font-medium text-black ">{cardetails.make}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Model</p>
          <p className="font-medium text-black ">
            {" "}
            {cardetails.model}
          </p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Year</p>{" "}
          <p className="font-medium text-black ">{cardetails.year}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Located In</p>{" "}
          <p className="font-medium text-black ">{cardetails.country}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Mileage</p>{" "}
          <p className="font-medium text-black ">{cardetails.mileage}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Transmission</p>{" "}
          <p className="font-medium text-black ">{cardetails.transmission}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Fuel</p>{" "}
          <p className="font-medium text-black ">{cardetails.fuel}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Color</p>{" "}
          <p className="font-medium text-black ">{cardetails.color}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Horse Power</p>{" "}
          <p className="font-medium text-black ">{cardetails.horsepower}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Engine</p>{" "}
          <p className="font-medium text-black ">{cardetails.engine}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Condition</p>{" "}
          <p className="font-medium text-black ">{cardetails.condition}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Service Book/History</p>{" "}
          <p className="font-medium text-black ">{cardetails.serviceHistory}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Accident History</p>{" "}
          <p className="font-medium text-black ">{cardetails.accidentHistory}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailTab;
