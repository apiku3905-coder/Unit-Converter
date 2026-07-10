import React, { useState, useEffect } from 'react';
import { usePRT } from '../context/PRTContext';
import { calculateResistance, calculateTemperature } from '../lib/calculator';
import { ArrowRightLeft, FileWarning } from 'lucide-react';

export function CalculatorView() {
  const { instruments, records, isLoading } = usePRT();
  const [selectedInstId, setSelectedInstId] = useState<string>(instruments[0]?.id || '');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  
  const [calcMode, setCalcMode] = useState<'T_TO_R' | 'R_TO_T'>('T_TO_R');
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  // Set default instrument when loaded
  useEffect(() => {
    if (!selectedInstId && instruments.length > 0) {
      setSelectedInstId(instruments[0].id);
    }
  }, [instruments, selectedInstId]);

  // Update selected year when instrument changes
  useEffect(() => {
    if (selectedInstId) {
      const instRecords = records.filter(r => r.instrumentId === selectedInstId);
      if (instRecords.length > 0) {
        // Select latest year
        const latestYear = Math.max(...instRecords.map(r => r.year));
        setSelectedYear(latestYear);
      } else {
        setSelectedYear('');
      }
    }
  }, [selectedInstId, records]);

  const activeRecord = records.find(
    r => r.instrumentId === selectedInstId && r.year === selectedYear
  );

  useEffect(() => {
    if (!inputValue || isNaN(Number(inputValue)) || !activeRecord) {
      setResult(null);
      return;
    }

    const val = Number(inputValue);
    let res: number;

    if (calcMode === 'T_TO_R') {
      res = calculateResistance(val, activeRecord);
    } else {
      res = calculateTemperature(val, activeRecord);
    }
    
    setResult(res);
  }, [inputValue, calcMode, activeRecord]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-[400px] p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">正在從雲端載入資料...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium">電阻/溫度換算器</h2>
        </div>
      </header>
      
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">標準件選擇</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">標準件儀器</label>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {instruments.length === 0 && <option value="">無標準件</option>}
                  {instruments.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.serialNumber})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">追溯年份</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  disabled={!selectedInstId}
                >
                  <option value="">選擇年份...</option>
                  {records
                    .filter(r => r.instrumentId === selectedInstId)
                    .sort((a, b) => b.year - a.year)
                    .map(r => (
                      <option key={r.id} value={r.year}>{r.year} (報告: {r.reportNumber}{r.reportNumber2 ? ` / ${r.reportNumber2}` : ''})</option>
                    ))}
                </select>
              </div>
            </div>
          </section>

          {!activeRecord ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FileWarning className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">請先選擇標準件與對應的追溯年份</p>
            </div>
          ) : (
            <>
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">即時換算</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">
                      輸入 {calcMode === 'T_TO_R' ? '溫度 (°C)' : '電阻 (Ω)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="0.000"
                        className="w-full text-4xl font-mono p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium font-sans italic">
                        {calcMode === 'T_TO_R' ? '°C' : 'Ω'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center items-center h-full pt-6">
                    <button 
                      onClick={() => {
                        setCalcMode(calcMode === 'T_TO_R' ? 'R_TO_T' : 'T_TO_R');
                        if (result !== null && !isNaN(result)) {
                          setInputValue(calcMode === 'T_TO_R' ? result.toFixed(5) : result.toFixed(3));
                        }
                      }}
                      className="w-10 h-10 bg-slate-100 hover:bg-indigo-100 rounded-full flex items-center justify-center transition-colors group cursor-pointer border border-transparent hover:border-indigo-200"
                      title="切換換算方向"
                    >
                      <ArrowRightLeft className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">
                      計算結果 {calcMode === 'T_TO_R' ? '電阻 (Ω)' : '溫度 (°C)'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={result !== null && !isNaN(result) ? (calcMode === 'T_TO_R' ? result.toFixed(5) : result.toFixed(3)) : '---'}
                        className="w-full text-4xl font-mono p-4 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 text-lg font-medium font-sans italic">
                        {calcMode === 'T_TO_R' ? 'Ω' : '°C'}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">作用中參數 ({activeRecord.year})</h3>
                </div>
                <div className="space-y-4">
                  {/* 第一行：報告編號 (正溫)、截距、X變數1、X變數2 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">報告編號 (正溫)</span>
                      <span className="text-lg font-mono font-semibold truncate">{activeRecord.reportNumber}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">截距</span>
                      <span className="text-lg font-mono font-semibold">{activeRecord.interceptPos ?? activeRecord.offset}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">X變數1</span>
                      <span className="text-lg font-mono font-semibold">{activeRecord.x1Pos ?? activeRecord.slope}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">X變數2</span>
                      <span className="text-lg font-mono font-semibold">{activeRecord.x2Pos ?? 0}</span>
                    </div>
                  </div>

                  {/* 第二行(若有才顯示)：報告編號 (負溫)、截距、X變數1、X變數2 */}
                  {activeRecord.reportNumberNeg && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-slate-50 rounded border border-slate-100">
                        <span className="text-xs text-slate-400 block mb-1">報告編號 (負溫)</span>
                        <span className="text-lg font-mono font-semibold truncate">{activeRecord.reportNumberNeg}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-100">
                        <span className="text-xs text-slate-400 block mb-1">截距</span>
                        <span className="text-lg font-mono font-semibold">{activeRecord.interceptNeg}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-100">
                        <span className="text-xs text-slate-400 block mb-1">X變數1</span>
                        <span className="text-lg font-mono font-semibold">{activeRecord.x1Neg}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-100">
                        <span className="text-xs text-slate-400 block mb-1">X變數2</span>
                        <span className="text-lg font-mono font-semibold">{activeRecord.x2Neg}</span>
                      </div>
                    </div>
                  )}

                  {/* 第三行(若沒有第二行，則此行為第二行)：R0、A 係數、B 係數、C 係數 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">R0 (Ω)</span>
                      <span className="text-lg font-mono font-semibold">{activeRecord.r0}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">A 係數</span>
                      <span className="text-lg font-mono font-semibold">{activeRecord.a.toExponential(4)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">B 係數</span>
                      <span className="text-lg font-mono font-semibold">{activeRecord.b.toExponential(4)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">C 係數</span>
                      <span className="text-lg font-mono font-semibold">{activeRecord.c.toExponential(4)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                    電阻轉正溫: ROUND((SQRT(A^2-(4×B×(1-R/R0)))-A)/(2×B), 3)<br />
                    負溫轉電阻: R0×(1+A×T+B×T^2+C×T^3*(T-100))
                  </p>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
