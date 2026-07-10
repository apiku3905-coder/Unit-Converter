import React, { useState } from 'react';

export function ImpulseVoltmeterView() {
  const [beforeFS, setBeforeFS] = useState<string>('');
  const [beforeRead, setBeforeRead] = useState<string>('');
  const [standard, setStandard] = useState<string>('');

  const beforeFSNum = parseFloat(beforeFS);
  const beforeReadNum = parseFloat(beforeRead);
  const standardNum = parseFloat(standard);

  let afterFS: number | null = null;
  if (!isNaN(beforeFSNum) && !isNaN(beforeReadNum) && !isNaN(standardNum) && beforeReadNum !== 0) {
    // 假設公式為: 調整前F.S × (標準值 / 衝擊電壓值)
    afterFS = beforeFSNum * standardNum / beforeReadNum;
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <header className="hidden md:block mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">衝擊電壓表調整</h2>
        <p className="text-slate-500 mt-1">計算調整後的衝擊電壓表 F.S 值</p>
      </header>

      <div className="max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">調整前</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">衝擊電壓表 F.S (V)</label>
                  <input
                    type="number"
                    step="any"
                    value={beforeFS}
                    onChange={(e) => setBeforeFS(e.target.value)}
                    placeholder="例如: 1000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">衝擊電壓值 (V)</label>
                  <input
                    type="number"
                    step="any"
                    value={beforeRead}
                    onChange={(e) => setBeforeRead(e.target.value)}
                    placeholder="例如: 990"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">標準值 (V)</label>
                  <input
                    type="number"
                    step="any"
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    placeholder="例如: 1000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">調整後</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">衝擊電壓表 F.S (V)</label>
                  <input
                    type="text"
                    readOnly
                    value={afterFS !== null ? Number(afterFS.toPrecision(12)) : '---'}
                    className="w-full text-xl md:text-2xl font-mono p-4 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>

          </div>
          <div className="bg-slate-50 p-6 border-t border-slate-100">
             <p className="text-xs text-slate-500 font-mono leading-relaxed">
               預設公式：調整後 F.S = 調整前 F.S × (標準值 / 衝擊電壓值)
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
