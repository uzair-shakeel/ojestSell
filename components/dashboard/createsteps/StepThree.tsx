"use client";
import { useState } from "react";

export default function StepThree({ nextStep, prevStep, updateFormData, formData }) {
  // Polish label -> English enum value mapping expected by backend
  const CONDITION_OPTS = [
    { label: "Nowy", value: "New" },
    { label: "Bardzo Dobry", value: "Very Good" },
    { label: "Dobry", value: "Good" },
    { label: "Normalny", value: "Normal" },
    { label: "Zły", value: "Bad" },
  ];
  const plToEn: Record<string, string> = {
    "Nowy": "New",
    "Bardzo Dobry": "Very Good",
    "Dobry": "Good",
    "Normalny": "Normal",
    "Zły": "Bad",
  };

  const normalize = (v: string) => (plToEn[v] ? plToEn[v] : v || "");

  const [localData, setLocalData] = useState({
    // Ensure ENGLISH values are stored
    interior: normalize(formData.condition.interior),
    mechanical: normalize(formData.condition.mechanical),
    paintandBody: normalize(formData.condition.paintandBody),
    frameandUnderbody: normalize(formData.condition.frameandUnderbody),
    overall: normalize(formData.condition.overall),
  });

  const [warranties, setWarranties] = useState<any[]>(formData.warranties || []);

  const handleNext = () => {
    updateFormData({ condition: localData, warranties });
    nextStep();
  };

  const isNewCar = formData.conditionType === "New";

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Krok 4: Stan Auta</h2>
      <div className="grid grid-cols-2 gap-4">
        {!isNewCar && (
          <>
            {/* Condition Interior */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-gray-700 mb-1">Stan Wnętrza</label>
              <select
                className="border p-3 w-full rounded h-12"
                value={localData.interior}
                onChange={(e) => setLocalData({ ...localData, interior: e.target.value })}
              >
                <option value="">Wybierz Stan Wnętrza</option>
                {CONDITION_OPTS.map((opt, index) => (
                  <option key={index} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Mechanical */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-gray-700 mb-1">Stan Mechaniczny</label>
              <select
                className="border p-3 w-full rounded h-12"
                value={localData.mechanical}
                onChange={(e) => setLocalData({ ...localData, mechanical: e.target.value })}
              >
                <option value="">Wybierz Stan Mechaniczny</option>
                {CONDITION_OPTS.map((opt, index) => (
                  <option key={index} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Paint & Body */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-gray-700 mb-1">Stan Lakieru i Karoserii</label>
              <select
                className="border p-3 w-full rounded h-12"
                value={localData.paintandBody}
                onChange={(e) => setLocalData({ ...localData, paintandBody: e.target.value })}
              >
                <option value="">Wybierz Stan Lakieru i Karoserii</option>
                {CONDITION_OPTS.map((opt, index) => (
                  <option key={index} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Frame & Underbody */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-gray-700 mb-1">Stan Ramy i Podwozia</label>
              <select
                className="border p-3 w-full rounded h-12"
                value={localData.frameandUnderbody}
                onChange={(e) =>
                  setLocalData({ ...localData, frameandUnderbody: e.target.value })
                }
              >
                <option value="">Wybierz Stan Ramy i Podwozia</option>
                {CONDITION_OPTS.map((opt, index) => (
                  <option key={index} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Overall */}
            <div className="col-span-2">
              <label className="block text-gray-700 mb-1">Stan Ogólny</label>
              <select
                className="border p-3 w-full rounded h-12"
                value={localData.overall}
                onChange={(e) => setLocalData({ ...localData, overall: e.target.value })}
              >
                <option value="">Wybierz Stan Ogólny</option>
                {CONDITION_OPTS.map((opt, index) => (
                  <option key={index} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {/* Warranty configuration for new cars */}
        {(isNewCar || localData.overall === "New") && (
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-2">Gwarancja (dla nowych aut)</h3>
            <p className="text-sm text-gray-600 mb-3">
              Dodaj jedną lub więcej opcji gwarancji. Każda opcja to dodatkowa cena
              doliczana do podstawowej ceny samochodu.
            </p>
            <div className="space-y-3">
              {warranties.map((w, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start border border-gray-200 rounded p-3"
                >
                  <div>
                    <label className="block text-gray-700 mb-1">Lata</label>
                    <select
                      className="border p-2 w-full rounded h-10"
                      value={w.years || ""}
                      onChange={(e) => {
                        const years = e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined;
                        const next = [...warranties];
                        next[index] = { ...next[index], years };
                        setWarranties(next);
                      }}
                    >
                      <option value="">Wybierz liczbę lat</option>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Przebieg (km)</label>
                    <input
                      type="number"
                      min={0}
                      className="border p-2 w-full rounded h-10"
                      value={w.mileageLimit || ""}
                      onChange={(e) => {
                        const mileageLimit = e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined;
                        const next = [...warranties];
                        next[index] = { ...next[index], mileageLimit };
                        setWarranties(next);
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const next = warranties.filter((_, i) => i !== index);
                        setWarranties(next);
                      }}
                      className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                    >
                      Usuń
                    </button>
                  </div>
                  <div className="md:col-span-4 col-span-1">
                    <label className="block text-gray-700 mb-1">Opis</label>
                    <textarea
                      className="border p-2 w-full rounded min-h-[60px]"
                      value={w.description || ""}
                      onChange={(e) => {
                        const description = e.target.value;
                        const next = [...warranties];
                        next[index] = { ...next[index], description };
                        setWarranties(next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setWarranties([
                  ...warranties,
                  { years: undefined, mileageLimit: undefined, description: "" },
                ])
              }
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Dodaj gwarancję
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}