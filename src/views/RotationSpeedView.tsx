import React, { useState } from 'react';
import { Zap, Sliders, ArrowRightLeft, AlertTriangle } from 'lucide-react';

export function RotationSpeedView() {
  const [activeUnit, setActiveUnit] = useState<string>('rpm');
  const [inputValue, setInputValue] = useState<string>('');
  const [pulse, setPulse] = useState<string>('1');
  const [slots, setSlots] = useState<string>('36');

  // 馬達控制與轉速換算狀態
  const [vMin, setVMin] = useState<string>('0');
  const [vMax, setVMax] = useState<string>('24');
  const [pidMin, setPidMin] = useState<string>('0');
  const [pidMax, setPidMax] = useState<string>('255');
  const [rpmMin, setRpmMin] = useState<string>('0');
  const [rpmMax, setRpmMax] = useState<string>('3000');

  const [controlActiveUnit, setControlActiveUnit] = useState<string>('ctrl_rpm');
  const [controlInputValue, setControlInputValue] = useState<string>('');

  const ppr = parseFloat(pulse) > 0 ? parseFloat(pulse) : 1;
  const numSlots = parseFloat(slots) > 0 ? parseFloat(slots) : 36;

  // Conversion rates relative to RPM
  // 1 unit = CONVERSION_RATES[unit] * RPM
  const CONVERSION_RATES = {
    rpm: 1,
    Hz: 1 / 60,
    pulse_hz: ppr / 60,
    slot_hz: numSlots / 60,
    'rad/s': (2 * Math.PI) / 60, // approx 0.104719755
    'deg/s': 6,
  };

  const handleInputChange = (unit: string, value: string) => {
    setActiveUnit(unit);
    setInputValue(value);
  };

  const getRpmValue = () => {
    if (!inputValue || isNaN(parseFloat(inputValue))) return null;
    const val = parseFloat(inputValue);
    const rate = CONVERSION_RATES[activeUnit as keyof typeof CONVERSION_RATES] || 1;
    return val / rate;
  };

  const rpmValue = getRpmValue();

  const getDisplayValue = (unit: string) => {
    if (unit === activeUnit) return inputValue;
    if (rpmValue === null) return '';

    const rate = CONVERSION_RATES[unit as keyof typeof CONVERSION_RATES] || 1;
    const val = rpmValue * rate;

    // Use toPrecision to avoid floating point issues
    return String(Number(val.toPrecision(10)));
  };

  // 馬達控制換算邏輯
  const getControlDisplayValue = (unit: string) => {
    if (unit === controlActiveUnit) return controlInputValue;
    if (!controlInputValue || isNaN(parseFloat(controlInputValue))) return '';

    const val = parseFloat(controlInputValue);
    const vm = parseFloat(vMin) || 0;
    const vx = parseFloat(vMax) !== parseFloat(vMin) ? parseFloat(vMax) : vm + 24;
    const pm = parseFloat(pidMin) || 0;
    const px = parseFloat(pidMax) !== parseFloat(pidMin) ? parseFloat(pidMax) : pm + 255;
    const rm = parseFloat(rpmMin) || 0;
    const rx = parseFloat(rpmMax) !== parseFloat(rpmMin) ? parseFloat(rpmMax) : rm + 3000;

    let t = 0;
    if (controlActiveUnit === 'ctrl_duty') {
      t = val / 100;
    } else if (controlActiveUnit === 'ctrl_volt') {
      t = vx - vm !== 0 ? (val - vm) / (vx - vm) : 0;
    } else if (controlActiveUnit === 'ctrl_pid') {
      t = px - pm !== 0 ? (val - pm) / (px - pm) : 0;
    } else if (controlActiveUnit === 'ctrl_rpm') {
      t = rx - rm !== 0 ? (val - rm) / (rx - rm) : 0;
    }

    let result = 0;
    if (unit === 'ctrl_duty') {
      result = t * 100;
    } else if (unit === 'ctrl_volt') {
      result = vm + t * (vx - vm);
    } else if (unit === 'ctrl_pid') {
      result = pm + t * (px - pm);
    } else if (unit === 'ctrl_rpm') {
      result = rm + t * (rx - rm);
    }

    // 回傳精簡之數字格式避免浮點誤差與過長顯示
    return String(Number(result.toPrecision(7)));
  };

  const getControlPercentage = () => {
    if (!controlInputValue || isNaN(parseFloat(controlInputValue))) return null;
    const val = parseFloat(controlInputValue);
    const vm = parseFloat(vMin) || 0;
    const vx = parseFloat(vMax) !== parseFloat(vMin) ? parseFloat(vMax) : vm + 24;
    const pm = parseFloat(pidMin) || 0;
    const px = parseFloat(pidMax) !== parseFloat(pidMin) ? parseFloat(pidMax) : pm + 255;
    const rm = parseFloat(rpmMin) || 0;
    const rx = parseFloat(rpmMax) !== parseFloat(rpmMin) ? parseFloat(rpmMax) : rm + 3000;

    let t = 0;
    if (controlActiveUnit === 'ctrl_duty') {
      t = val / 100;
    } else if (controlActiveUnit === 'ctrl_volt') {
      t = vx - vm !== 0 ? (val - vm) / (vx - vm) : 0;
    } else if (controlActiveUnit === 'ctrl_pid') {
      t = px - pm !== 0 ? (val - pm) / (px - pm) : 0;
    } else if (controlActiveUnit === 'ctrl_rpm') {
      t = rx - rm !== 0 ? (val - rm) / (rx - rm) : 0;
    }
    return t * 100;
  };

  const controlPercentage = getControlPercentage();
  const isControlOutOfRange = controlPercentage !== null && (controlPercentage < 0 || controlPercentage > 100);

  const units = [
    { id: 'rpm', label: '每分鐘轉數 (rpm)', desc: 'Revolutions Per Minute', type: 'unit' },
    { id: 'pulse', label: '脈波數 (Pulse)', desc: 'Pulses Per Revolution (PPR)', type: 'setting' },
    { id: 'pulse_hz', label: '脈波頻率 (Hz)', desc: 'Pulse Frequency (rpm × Pulse / 60)', type: 'unit' },
    { id: 'slots', label: '定子槽數 (Slots)', desc: 'Motor Stator Slots', type: 'setting' },
    { id: 'slot_hz', label: '定子槽通過頻率 (Hz)', desc: 'Stator Slot Passing Frequency (rpm × Slots / 60)', type: 'unit' },
    { id: 'Hz', label: '頻率 (Hz)', desc: 'Frequency', type: 'unit' },
    { id: 'rad/s', label: '角速度 (rad/s)', desc: 'Radians Per Second', type: 'unit' },
    { id: 'deg/s', label: '角速度 (deg/s)', desc: 'Degrees Per Second', type: 'unit' },
  ];

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <header className="hidden md:block mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">轉速單位換算</h2>
        <p className="text-slate-500 mt-1">輸入任意單位數值，自動換算其他轉速、角速度及馬達特徵頻率</p>
      </header>

      <div className="max-w-4xl space-y-6">
        {/* Unit Converter Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {units.map((u) => {
                const isSetting = u.type === 'setting';
                let val = '';
                let onChangeHandler;
                let borderClass = 'border-slate-200';

                if (u.id === 'pulse') {
                  val = pulse;
                  onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => setPulse(e.target.value);
                  borderClass = pulse && parseFloat(pulse) > 0 ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200';
                } else if (u.id === 'slots') {
                  val = slots;
                  onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => setSlots(e.target.value);
                  borderClass = slots && parseFloat(slots) > 0 ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200';
                } else {
                  val = getDisplayValue(u.id);
                  onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(u.id, e.target.value);
                  borderClass = activeUnit === u.id && inputValue ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200';
                }

                return (
                  <div key={u.id} className="">
                    <div className="flex justify-between items-baseline mb-2">
                      <label className="block text-sm font-semibold text-slate-700">{u.label}</label>
                      <span className="text-xs text-slate-400 font-normal">{u.desc}</span>
                    </div>
                    <input
                      type="number"
                      step="any"
                      min={isSetting ? "1" : undefined}
                      value={val}
                      onChange={onChangeHandler}
                      placeholder={isSetting ? "1" : `輸入 ${u.id}`}
                      className={`w-full bg-slate-50 border ${borderClass} rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow font-mono`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-slate-50 p-6 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-600 mb-2">換算公式與比例基準：</h4>
            <ul className="text-xs text-slate-500 font-mono space-y-1 list-disc pl-5">
              <li>1 Hz = 60 rpm (旋轉頻率)</li>
              <li>脈波頻率 (Hz) = rpm × 脈波數 (Pulse) / 60</li>
              <li>定子槽通過頻率 (Hz) = rpm × 定子槽數 (Slots) / 60</li>
              <li>1 rad/s = 60 / 2π ≈ 9.5493 rpm</li>
              <li>1 deg/s = 1/6 rpm (即 1 rpm = 6 deg/s)</li>
            </ul>
          </div>
        </div>

        {/* Motor Control & Speed Converter Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              馬達控制與轉速換算
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              設定電壓、PID 數值、與轉速的量程範圍，即可在波寬比 (Duty Cycle)、控制電壓、PID 值與轉速 (RPM) 之間進行線性雙向換算。
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Parameters Settings Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                控制量程參數設定
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                {/* Voltage Limits */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">電壓範圍 (V)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="any"
                      value={vMin}
                      onChange={(e) => setVMin(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 rounded text-sm px-2 py-1.5 font-mono outline-none focus:border-indigo-500"
                    />
                    <span className="text-slate-400 text-xs">~</span>
                    <input
                      type="number"
                      step="any"
                      value={vMax}
                      onChange={(e) => setVMax(e.target.value)}
                      placeholder="24"
                      className="w-full bg-white border border-slate-200 rounded text-sm px-2 py-1.5 font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {['5', '12', '24'].map(v => (
                      <button
                        key={v}
                        onClick={() => { setVMin('0'); setVMax(v); }}
                        className="text-[10px] bg-white hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors font-mono cursor-pointer"
                      >
                        {v}V
                      </button>
                    ))}
                  </div>
                </div>

                {/* PID Limits */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">PID 數值範圍</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="any"
                      value={pidMin}
                      onChange={(e) => setPidMin(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 rounded text-sm px-2 py-1.5 font-mono outline-none focus:border-indigo-500"
                    />
                    <span className="text-slate-400 text-xs">~</span>
                    <input
                      type="number"
                      step="any"
                      value={pidMax}
                      onChange={(e) => setPidMax(e.target.value)}
                      placeholder="255"
                      className="w-full bg-white border border-slate-200 rounded text-sm px-2 py-1.5 font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {['255', '1023', '4095'].map(p => (
                      <button
                        key={p}
                        onClick={() => { setPidMin('0'); setPidMax(p); }}
                        className="text-[10px] bg-white hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors font-mono cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RPM Limits */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">轉速範圍 (RPM)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="any"
                      value={rpmMin}
                      onChange={(e) => setRpmMin(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 rounded text-sm px-2 py-1.5 font-mono outline-none focus:border-indigo-500"
                    />
                    <span className="text-slate-400 text-xs">~</span>
                    <input
                      type="number"
                      step="any"
                      value={rpmMax}
                      onChange={(e) => setRpmMax(e.target.value)}
                      placeholder="3000"
                      className="w-full bg-white border border-slate-200 rounded text-sm px-2 py-1.5 font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {['1500', '3000', '6000'].map(r => (
                      <button
                        key={r}
                        onClick={() => { setRpmMin('0'); setRpmMax(r); }}
                        className="text-[10px] bg-white hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors font-mono cursor-pointer"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Value Conversion Inputs */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                雙向數值換算
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'ctrl_duty', label: '波寬比 (Duty Cycle)', unit: '%', desc: '0% ~ 100%' },
                  { id: 'ctrl_volt', label: '控制電壓 (Voltage)', unit: 'V', desc: `${vMin}V ~ ${vMax}V` },
                  { id: 'ctrl_pid', label: 'PID 數值 (PWM)', unit: '', desc: `${pidMin} ~ ${pidMax}` },
                  { id: 'ctrl_rpm', label: '馬達轉速 (RPM)', unit: 'rpm', desc: `${rpmMin} ~ ${rpmMax} rpm` },
                ].map((item) => {
                  const borderClass = controlActiveUnit === item.id && controlInputValue ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200';
                  return (
                    <div key={item.id} className="relative">
                      <div className="flex justify-between items-baseline mb-1">
                        <label className="block text-xs font-semibold text-slate-700">{item.label}</label>
                        <span className="text-[10px] text-slate-400 font-mono">{item.desc}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={getControlDisplayValue(item.id)}
                          onChange={(e) => {
                            setControlActiveUnit(item.id);
                            setControlInputValue(e.target.value);
                          }}
                          placeholder={`輸入 ${item.label}`}
                          className={`w-full bg-slate-50 border ${borderClass} rounded-lg text-base px-3 py-2.5 pr-10 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow font-mono`}
                        />
                        {item.unit && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">
                            {item.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Out of range alert */}
            {isControlOutOfRange && (
              <div className="text-xs text-amber-700 flex items-start gap-2 bg-amber-50 border border-amber-100 p-3 rounded-lg leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <span>
                  輸入數值已超出設定的量程範圍（百分比: {controlPercentage !== null ? controlPercentage.toFixed(1) : ''}%），換算結果將按線性外插法計算。
                </span>
              </div>
            )}

            {/* Visual Progress Bar */}
            {controlPercentage !== null && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="block text-xs font-semibold text-slate-400">目前量程分佈視覺化</span>
                <div className="relative pt-4 pb-2">
                  <div className="h-2 bg-slate-100 rounded-full w-full relative">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isControlOutOfRange ? 'bg-amber-400' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, controlPercentage))}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300"
                      style={{ left: `${Math.max(0, Math.min(100, controlPercentage))}%` }}
                    >
                      <div className="w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow flex items-center justify-center">
                        <div className={`w-1.5 h-1.5 rounded-full ${isControlOutOfRange ? 'bg-amber-500' : 'bg-indigo-600'}`} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
                    <span>0% ({vMin}V / {pidMin} / {rpmMin} rpm)</span>
                    <span className="font-bold text-slate-700">{controlPercentage.toFixed(2)}%</span>
                    <span>100% ({vMax}V / {pidMax} / {rpmMax} rpm)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-100 text-xs text-slate-500 leading-relaxed font-mono space-y-1">
            <h4 className="font-semibold text-slate-600 mb-1">線性映射關係式：</h4>
            <p>波寬比 (Duty Cycle) 0% ~ 100% 對應設定之電壓區間 V_min ~ V_max、PID 數值區間 PID_min ~ PID_max，以及轉速區間 RPM_min ~ RPM_max。</p>
            <p>公式：比率 t = (值 - 最小值) / (最大值 - 最小值)。其他變數即可依比率 t 線性還原。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

