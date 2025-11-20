import React from 'react';

const translateSellOption = (val) => {
  if (!val) return '';
  const key = String(val).trim().toLowerCase();
  const map = {
    'long term rental': 'Wynajem długoterminowy',
  };
  return map[key] || val;
};

const translateInvoiceOption = (val) => {
  if (!val) return '';
  const key = String(val).trim().toLowerCase();
  const map = {
    invoice: 'Faktura',
    'selling agreement': 'Umowa sprzedaży',
  };
  return map[key] || val;
};

const translateSellerType = (val) => {
  if (!val) return '';
  const key = String(val).trim().toLowerCase();
  const map = {
    company: 'Firma',
    private: 'Sprzedawca prywatny',
  };
  return map[key] || val;
};

const FinancialTab = ({ financialInfo }) => {
  return (
    <div>
      {/* Condition Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-5 text-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Opcje sprzedaży</p>
          <ul className="text-base font-medium text-black dark:text-white list-disc sm:ms-5">
            {/* Render each option in sellOptions as a list item */}
            {financialInfo.sellOptions.map((option, index) => (
              <li key={index}>{translateSellOption(option)}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Opcje faktury</p>
          <ul className="font-medium text-black dark:text-white list-disc sm:ms-5">
            {/* Render each option in invoiceOptions as a list item */}
            {financialInfo.invoiceOptions.map((option, index) => (
              <li key={index}>{translateInvoiceOption(option)}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 w-full">
          <p className="text-xs uppercase">Typ sprzedającego</p>
          <p className="font-medium text-black dark:text-white">{translateSellerType(financialInfo.sellerType)}</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialTab;
