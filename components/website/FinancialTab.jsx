import React from 'react'

const FinancialTab = () => {
  return (
    <div>
    {/* Condition Sections */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-5 text-gray-700">
      <div className="grid grid-cols-2 sm:grid-cols-1 w-full ">
        <p className="text-xs uppercase">Sell Options </p>{" "}
        <p className=" text-base font-meduim text-black ">
        Long term rental ,Lease ,Financing ,Cash

        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
        <p className="text-xs uppercase">Invoice Options</p>{" "}
        <p className=" font-meduim text-black ">
        Invoice ,Invoice VAT ,Selling Agreement
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
        <p className="text-xs uppercase">Seller Type
        </p>{" "}
        <p className=" font-meduim text-black ">
          Private
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-1 w-full border border-blue-500 p-5 bg-white-500 rounded-md">
        <p className="text-xs uppercase text-blue-500">Price
        </p>{" "}
        <p className=" font-meduim text-blue-500  text-4xl">
          198.500$
        </p>
      </div>

    </div>
  </div>
  )
}

export default FinancialTab