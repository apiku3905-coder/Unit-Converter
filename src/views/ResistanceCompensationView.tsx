import React, { useState } from 'react';

export function ResistanceCompensationView() {
  const [standardResistance, setStandardResistance] = useState<string>('');
  const [compensationTemp, setCompensationTemp] = useState<string>('');
  const [actualTemp, setActualTemp] = useState<string>('');

  const standardResNum = parseFloat(standardResistance);
  const compTempNum = parseFloat(compensationTemp);
  const actTempNum = parseFloat(actualTemp);

  let result: number | null = null;
  if (!isNaN(standardResNum) && !isNaN(compTempNum) && !isNaN(actTempNum)) {
    // 補償電阻值 = 標準電阻 × (234.5 + 顧客補償溫度) / (234.5 + 顧客實際溫度)
    result = standardResNum * (234.5 + compTempNum) / (234.5 + actTempNum);
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <header className="hidden md:block mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">電阻溫補計算</h2>
        <p className="text-slate-500 mt-1">計算標準電阻在不同溫度下的補償值</p>
      </header>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">標準電阻 (Ω)</label>
              <input
                type="number"
                step="any"
                value={standardResistance}
                onChange={(e) => setStandardResistance(e.target.value)}
                placeholder="例如: 100"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">顧客補償溫度 (°C)</label>
                <input
                  type="number"
                  step="any"
                  value={compensationTemp}
                  onChange={(e) => setCompensationTemp(e.target.value)}
                  placeholder="例如: 20"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">顧客實際溫度 (°C)</label>
                <input
                  type="number"
                  step="any"
                  value={actualTemp}
                  onChange={(e) => setActualTemp(e.target.value)}
                  placeholder="例如: 25"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <label className="block text-sm font-semibold text-slate-700 mb-3">補償電阻值 (Ω)</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={result !== null && !isNaN(result) ? result.toFixed(5) : '---'}
                  className="w-full text-4xl font-mono p-4 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-6 border-t border-slate-100">
             <p className="text-xs text-slate-500 font-mono leading-relaxed">
               公式：標準電阻 × (234.5 + 顧客補償溫度) / (234.5 + 顧客實際溫度)
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
