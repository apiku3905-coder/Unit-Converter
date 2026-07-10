import React, { useState } from 'react';

const CONVERSION_RATES = {
  Pa: 1,
  kPa: 0.001,
  MPa: 0.000001,
  mmAq: 0.101972,
  mmHg: 0.00750064,
  bar: 0.00001,
  'kg/cm²': 0.0000101972,
};

export function PressureConverterView() {
  const [activeUnit, setActiveUnit] = useState<string>('Pa');
  const [inputValue, setInputValue] = useState<string>('');

  const handleInputChange = (unit: string, value: string) => {
    setActiveUnit(unit);
    setInputValue(value);
  };

  const getPaValue = () => {
    if (!inputValue || isNaN(parseFloat(inputValue))) return null;
    const val = parseFloat(inputValue);
    return val / CONVERSION_RATES[activeUnit as keyof typeof CONVERSION_RATES];
  };

  const paValue = getPaValue();

  const getDisplayValue = (unit: string) => {
    if (unit === activeUnit) return inputValue;
    if (paValue === null) return '';
    
    const rate = CONVERSION_RATES[unit as keyof typeof CONVERSION_RATES];
    const val = paValue * rate;
    
    return String(Number(val.toPrecision(12)));
  };

  const units = [
    { id: 'Pa', label: 'Pa' },
    { id: 'kPa', label: 'kPa' },
    { id: 'MPa', label: 'MPa' },
    { id: 'mmAq', label: 'mmAq' },
    { id: 'mmHg', label: 'mmHg' },
    { id: 'bar', label: 'bar' },
    { id: 'kg/cm²', label: 'kg/cm²' },
  ];

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <header className="hidden md:block mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">壓力單位換算</h2>
        <p className="text-slate-500 mt-1">輸入任意單位數值，自動換算其他壓力單位</p>
      </header>

      <div className="max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {units.map((u) => (
                <div key={u.id} className={u.id === 'Pa' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{u.label}</label>
                  <input
                    type="number"
                    step="any"
                    value={getDisplayValue(u.id)}
                    onChange={(e) => handleInputChange(u.id, e.target.value)}
                    placeholder={`輸入 ${u.label}`}
                    className={`w-full bg-slate-50 border ${activeUnit === u.id && inputValue ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'} rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow font-mono`}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-50 p-6 border-t border-slate-100">
             <p className="text-xs text-slate-500 font-mono leading-relaxed">
               換算比例基準：<br/>
               1 Pa = 0.001 kPa = 0.000001 MPa = 0.101972 mmAq = 0.00750064 mmHg = 0.00001 bar = 0.0000101972 kg/cm²
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
