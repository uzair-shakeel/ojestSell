"use client";
import { useState } from "react";

const SearchFilter = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    Make: "",
    model: "",
    yearFrom: "",
    yearTo: "",
    type: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    if (onSearch) onSearch(filters);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white p-5 shadow-md rounded-lg flex flex-col gap-4 items-start">
      {/* <h1 className=" text-2xl font-semibold text-blue-600">
        Find your next car
      </h1> */}
      <div className="w-full max-w-5xl mx-auto bg-white rounded-lg flex flex-wrap gap-4 items-center">
        {/* Make */}
        <input
          type="text"
          name="makeModel"
          placeholder="Make"
          value={filters.makeModel}
          onChange={handleChange}
          className="border border-gray-300 min-w-28 rounded-md p-2 w-full sm:w-auto flex-1"
        />
        {/*Model */}

        <input
          type="text"
          name="model"
          placeholder="Model"
          value={filters.model}
          onChange={handleChange}
          className="border border-gray-300 min-w-28 rounded-md p-2 w-full sm:w-auto flex-1"
        />

        {/* Year From */}
        <input
          type="number"
          name="yearFrom"
          placeholder="Year From"
          value={filters.yearFrom}
          onChange={handleChange}
          className="border border-gray-300 min-w-28 rounded-md p-2 w-24"
        />

        {/* Year To */}
        <input
          type="number"
          name="yearTo"
          placeholder="Year To"
          value={filters.yearTo}
          onChange={handleChange}
          className="border border-gray-300 min-w-28 rounded-md p-2 w-24"
        />

        <span className="text-gray-500">or</span>

        {/* Type */}
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="border border-gray-300 min-w-28 rounded-md p-2 w-full sm:w-auto flex-1"
        >
          <option value="">Select Type</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="truck">Truck</option>
          <option value="coupe">Coupe</option>
          <option value="convertible">Convertible</option>
        </select>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-blue-500 w-full text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
