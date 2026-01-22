'use client'
import React from "react";
import { useState } from "react";

const DetailTab = ({ cardetails }) => {
  const [showMore, setShowMore] = useState(false);
  const fullText = cardetails?.description || "";
  const words = fullText.trim() ? fullText.trim().split(/\s+/) : [];
  const shouldTruncate = words.length > 30;
  const previewText = shouldTruncate ? words.slice(0, 30).join(" ") + "..." : fullText;

  const translateYesNo = (val) => {
    if (typeof val === "boolean") return val ? "Tak" : "Nie";
    if (!val) return "";
    const s = String(val).trim().toLowerCase();
    if (s === "yes" || s === "true") return "Tak";
    if (s === "no" || s === "false") return "Nie";
    return val;
  };

  const translateTransmission = (val) => {
    if (!val) return "";
    const key = String(val).trim().toLowerCase();
    const map = {
      manual: "Manual",
      automatic: "Automat",
      "semi-automatic": "Półautomatyczna",
      normal: "Normalna",
    };
    return map[key] || val;
  };

  const translateFuel = (val) => {
    if (!val) return "";
    const key = String(val).trim().toLowerCase();
    const map = {
      petrol: "Benzyna",
      gasoline: "Benzyna",
      diesel: "Diesel",
      hybrid: "Hybrydowy",
      electric: "Elektryczny",
      ev: "Elektryczny",
      lpg: "LPG",
      cng: "CNG",
    };
    return map[key] || val;
  };

  const translateCondition = (val) => {
    if (!val) return "";
    const key = String(val).trim().toLowerCase();
    const map = {
      used: "Używany",
      new: "Nowy",
      "like new": "Jak nowy",
      excellent: "Doskonały",
      good: "Dobry",
      fair: "Umiarkowany"
    };
    return map[key] || val;
  };

  const toBoolean = (val) => {
    if (typeof val === "boolean") return val;
    if (val === null || val === undefined) return null;
    const s = String(val).trim().toLowerCase();
    if (s === "yes" || s === "true") return true;
    if (s === "no" || s === "false") return false;
    return null;
  };

  // For label "Bezwypadkowość" (accident-free): invert accidentHistory value
  const translateAccidentFree = (accidentHistoryVal) => {
    const b = toBoolean(accidentHistoryVal);
    if (b === null) return translateYesNo(accidentHistoryVal);
    // accidentHistory: true => had accidents => NOT accident-free => "Nie"
    // accidentHistory: false => no accidents => accident-free => "Tak"
    return b ? "Nie" : "Tak";
  };

  return (
    <div>
      <p className="font-medium text-black dark:text-white uppercase transition-colors duration-300">Opis</p>
      <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
        {showMore ? fullText : previewText}
        {shouldTruncate && (
          <button
            className="text-blue-500 dark:text-blue-400 ml-2 underline transition-colors duration-300"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "Pokaż mniej" : "Pokaż więcej"}
          </button>
        )}
      </p>
    </div>
  );
};
export default DetailTab;
