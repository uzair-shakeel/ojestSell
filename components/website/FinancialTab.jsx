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
    <div className="py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
        <div className="space-y-2">
          <p className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wide">Opcje sprzedaży</p>
          <ul className="text-base text-gray-500 dark:text-gray-400 list-disc ml-5">
            {financialInfo.sellOptions.map((option, index) => (
              <li key={index}>{translateSellOption(option)}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wide">Opcje faktury</p>
          <ul className="text-base text-gray-500 dark:text-gray-400 list-disc ml-5">
            {financialInfo.invoiceOptions.map((option, index) => (
              <li key={index}>{translateInvoiceOption(option)}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wide">Typ sprzedającego</p>
          <p className="text-base text-gray-500 dark:text-gray-400">{translateSellerType(financialInfo.sellerType)}</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialTab;
