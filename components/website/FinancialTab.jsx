import React from 'react';

const FinancialTab = ({ financialInfo }) => {
  return (
    <div>
      {/* Condition Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-5 text-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Sell Options</p>
          <ul className="text-base font-medium text-black list-disc sm:ms-5">
            {/* Render each option in sellOptions as a list item */}
            {financialInfo.sellOptions.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Invoice Options</p>
          <ul className="font-medium text-black list-disc sm:ms-5">
            {/* Render each option in invoiceOptions as a list item */}
            {financialInfo.invoiceOptions.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Seller Type</p>
          <p className="font-medium text-black">{financialInfo.sellerType}</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialTab;
