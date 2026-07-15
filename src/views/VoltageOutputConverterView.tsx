import React, { useState, useEffect } from 'react';
import { Thermometer, Zap, Info, ShieldAlert } from 'lucide-react';

interface RangeConfig {
  min: number;
  max: number;
  label: string;
}

const RANGES: Record<string, RangeConfig> = {
  '-20~80': { min: -20, max: 80, label: '-20 ~ 80 °C' },
  '0~100': { min: 0, max: 100, label: '0 ~ 100 °C' },
  '0~150': { min: 0, max: 150, label: '0 ~ 150 °C' },
  '-50~50': { min: -50, max: 50, label: '-50 ~ 50 °C' },
  '0~50': { min: 0, max: 50, label: '0 ~ 50 °C' },
};

export function VoltageOutputConverterView() {
  const [selectedRange, setSelectedRange] = useState<string>('0~100');
  const [actualTemp, setActualTemp] = useState<string>('');
  const [voltageResult, setVoltageResult] = useState<number | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);
  const [isOutOfRange, setIsOutOfRange] = useState<boolean>(false);

  const rangeInfo = RANGES[selectedRange] || RANGES['0~100'];

  useEffect(() => {
    if (actualTemp === '' || isNaN(parseFloat(actualTemp))) {
      setVoltageResult(null);
      setPercentage(null);
      setIsOutOfRange(false);
      return;
    }

    const t = parseFloat(actualTemp);
    const { min, max } = rangeInfo;

    // Check if input temp is out of the specified range
    if (t < min || t > max) {
      setIsOutOfRange(true);
    } else {
      setIsOutOfRange(false);
    }

    // V = Vmin + (Vmax - Vmin) * (T - Tmin) / (Tmax - Tmin)
    // Here Vmin = 1V, Vmax = 5V, so V = 1 + 4 * (T - Tmin) / (Tmax - Tmin)
    const ratio = (t - min) / (max - min);
    const voltage = 1 + 4 * ratio;
    const pct = ratio * 100;

    setVoltageResult(voltage);
    setPercentage(pct);
  }, [actualTemp, selectedRange, rangeInfo]);

  // Handle preset clicks for quick testing
  const handlePresetTemp = (temp: number) => {
    setActualTemp(String(temp));
  };

  // Safe clamped percentage for the visual bar (0% - 100%)
  const clampedPercentage = percentage !== null ? Math.max(0, Math.min(100, percentage)) : 0;

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <header className="hidden md:block mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ω/V電壓輸出換算</h2>
        <p className="text-slate-500 mt-1">依據選定之溫度範圍與實際溫度，換算為對應之 1 ~ 5 V 標準類比電壓輸出</p>
      </header>

      <div className="max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Inputs */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-indigo-500" />
                溫度參數輸入
              </h3>

              {/* Temperature Range Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  溫度範圍 Range (°C)
                </label>
                <select
                  value={selectedRange}
                  onChange={(e) => {
                    setSelectedRange(e.target.value);
                    // Clear or reset temp if desired, here we keep it and let useEffect recalculate
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                >
                  {Object.keys(RANGES).map((key) => (
                    <option key={key} value={key}>
                      {RANGES[key].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actual Temperature Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  實際溫度 Actual Temperature (°C)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={actualTemp}
                    onChange={(e) => setActualTemp(e.target.value)}
                    placeholder={`輸入介於 ${rangeInfo.min} ~ ${rangeInfo.max} 之間`}
                    className={`w-full bg-slate-50 border rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
                      isOutOfRange 
                        ? 'border-amber-300 bg-amber-50/20' 
                        : 'border-slate-200'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    °C
                  </span>
                </div>
                
                {/* Out of Range warning */}
                {isOutOfRange && (
                  <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>輸入溫度超出所選範圍，電壓計算結果將超出 1 ~ 5 V。</span>
                  </div>
                )}
              </div>

              {/* Preset Buttons */}
              <div className="pt-2">
                <span className="block text-xs text-slate-400 mb-2">快速測試溫度點</span>
                <div className="flex flex-wrap gap-2">
                  {[-20, -10, 0, 12, 19, 24, 27, 35, 50].map((temp) => {
                    const isInside = temp >= rangeInfo.min && temp <= rangeInfo.max;
                    return (
                      <button
                        key={temp}
                        onClick={() => handlePresetTemp(temp)}
                        title={isInside ? `套用 ${temp} °C` : `套用 ${temp} °C (超出目前量程範圍)`}
                        className={`px-3 py-1 text-xs rounded font-mono transition-colors cursor-pointer border ${
                          isInside
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-dashed border-slate-200'
                        }`}
                      >
                        {temp}°C
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Read-only Voltage Range */}
            <div className="mt-8 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                輸出電壓範圍 (不可更改)
              </label>
              <input
                type="text"
                readOnly
                value="1 ~ 5 V"
                className="w-full bg-slate-100 border border-slate-200 rounded-lg text-md px-4 py-2.5 text-slate-500 font-semibold cursor-not-allowed outline-none"
              />
            </div>
          </section>

          {/* Right Column: Results & Visualization */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                輸出計算結果
              </h3>

              <div className="space-y-4">
                {/* Result Voltage Display */}
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                  <span className="text-xs text-indigo-500 font-semibold block mb-1">對應輸出電壓</span>
                  <span className={`text-4xl font-mono font-black ${isOutOfRange ? 'text-amber-600' : 'text-indigo-700'}`}>
                    {voltageResult !== null ? `${voltageResult.toFixed(4)} V` : '---'}
                  </span>
                </div>

                {/* Percentage Display */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-400 block mb-1">量程佔比</span>
                    <span className="text-md font-mono font-bold text-slate-700">
                      {percentage !== null ? `${percentage.toFixed(2)} %` : '---'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-400 block mb-1">電壓輸出跨距</span>
                    <span className="text-md font-mono font-bold text-slate-700">4.0 V</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Progress Scale Bar */}
            <div className="mt-8 space-y-4">
              <span className="block text-xs font-semibold text-slate-400">量程分佈視覺化</span>
              <div className="relative pt-4 pb-2">
                {/* Scale Bar background */}
                <div className="h-3 bg-slate-100 rounded-full w-full relative">
                  {/* Filled Range bar */}
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOutOfRange ? 'bg-amber-400' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${clampedPercentage}%` }}
                  />
                  
                  {/* Active Indicator Pin */}
                  {percentage !== null && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300"
                      style={{ left: `${clampedPercentage}%` }}
                    >
                      <div className="w-5 h-5 bg-white border-2 border-indigo-600 rounded-full shadow-md flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${isOutOfRange ? 'bg-amber-500' : 'bg-indigo-600'}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Scale Labels */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
                  <div className="text-left">
                    <span className="block font-bold text-slate-600">{rangeInfo.min} °C</span>
                    <span>1.0 V</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-slate-600">
                      {percentage !== null ? `${parseFloat(actualTemp).toFixed(1)} °C` : '中點'}
                    </span>
                    <span>{voltageResult !== null ? `${voltageResult.toFixed(2)} V` : '3.0 V'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-slate-600">{rangeInfo.max} °C</span>
                    <span>5.0 V</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Formulas Help Card */}
        <section className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            換算公式說明
          </h4>
          <div className="text-xs text-slate-500 font-mono space-y-2 leading-relaxed">
            <p>
              本換算器模擬工業溫度傳送器（Temperature Transmitter）之訊號轉換邏輯。當溫度感測器量測溫度時，傳送器會將溫度範圍線性對應地轉換為 1 ~ 5 V 直流電壓輸出。
            </p>
            <p>
              **計算公式**：<br />
              &nbsp;&nbsp;&nbsp;&nbsp;V = Vmin + (Vmax - Vmin) × (T - Tmin) / (Tmax - Tmin)<br />
              代入本系統條件（Vmin = 1 V, Vmax = 5 V）：<br />
              &nbsp;&nbsp;&nbsp;&nbsp;V = 1 + 4 × (實際溫度 - Tmin) / (Tmax - Tmin)
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
