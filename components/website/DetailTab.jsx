'use client'
import React from "react";
import { useState } from "react";

const DetailTab = ({ cardetails }) => {
    const [showMore, setShowMore] = useState(false);
    const fullText = cardetails?.description || "";
    const words = fullText.trim() ? fullText.trim().split(/\s+/) : [];
    const shouldTruncate = words.length > 30;
    const previewText = shouldTruncate ? words.slice(0, 30).join(" ") + "..." : fullText;

  return (
    <div>
      <div>
        <p className="font-medium text-black uppercase">Description</p>
        <p className="text-gray-700">
          {showMore ? fullText : previewText}
          {shouldTruncate && (
            <button
              className="text-blue-500 ml-2 underline"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "Show Less" : "Show More"}
            </button>
          )}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-20 gap-y-5 mt-6 text-gray-700">
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Marka</p>{" "}
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
          <p className="text-xs uppercase">Rok</p>{" "}
          <p className="font-medium text-black ">{cardetails.year}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Lokalizacja</p>{" "}
          <p className="font-medium text-black ">{cardetails.country}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Przebieg</p>{" "}
          <p className="font-medium text-black ">{cardetails.mileage}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Skrzynia Biegów</p>{" "}
          <p className="font-medium text-black ">{cardetails.transmission}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Paliwo</p>{" "}
          <p className="font-medium text-black ">{cardetails.fuel}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Kolor</p>{" "}
          <p className="font-medium text-black ">{cardetails.color}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Konie Mechaniczne</p>{" "}
          <p className="font-medium text-black ">{cardetails.horsepower}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Silnik</p>{" "}
          <p className="font-medium text-black ">{cardetails.engine}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Stan</p>{" "}
          <p className="font-medium text-black ">{cardetails.condition}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Historia Serwisowa</p>{" "}
          <p className="font-medium text-black ">{cardetails.serviceHistory}</p>
        </div>
        <div className="grid sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Bezwypadkowość</p>{" "}
          <p className="font-medium text-black ">{cardetails.accidentHistory}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailTab;
