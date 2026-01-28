import React from 'react';

const translateSellOption = (val) => {
  if (!val) return '';
  const key = String(val).trim().toLowerCase();
  const map = {
    'long term rental': 'Wynajem długoterminowy',
    'leasing': 'Leasing',
    'loan': 'Kredyt',
  };
  return map[key] || val;
};

const translateInvoiceOption = (val) => {
  if (!val) return '';
  const key = String(val).trim().toLowerCase();
  const map = {
    invoice: 'Faktura',
    'selling agreement': 'Umowa sprzedaży',
    'invoice vat 23%': 'Faktura VAT 23%',
    'invoice vat margin': 'Faktura VAT marża',
  };
  return map[key] || val;
};

const translateSellerType = (val) => {
  if (!val) return '';
  const key = String(val).trim().toLowerCase();
  const map = {
    company: 'Firma',
    private: 'Osoba prywatna',
  };
  return map[key] || val;
};

const FinancialTab = ({ financialInfo }) => {
  if (!financialInfo) return null;

  const sections = [
    {
      label: "OPCJE SPRZEDAŻY",
      value: financialInfo.sellOptions?.map(opt => translateSellOption(opt)).join(", ") || "-"
    },
    {
      label: "OPCJE FAKTURY",
      value: financialInfo.invoiceOptions?.map(opt => translateInvoiceOption(opt)).join(", ") || "-"
    },
    {
      label: "TYP SPRZEDAJĄCEGO",
      value: translateSellerType(financialInfo.sellerType) || "-"
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 sm:last:border-b"
          >
            <span className="text-[15px] sm:text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed">
              {section.label}
            </span>
            <span className="text-[15px] sm:text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed">
              {section.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialTab;
