import React, { useState } from 'react';
import { VoiceInputButton } from '../components/VoiceInputButton';

// Math Constants
const SQRT_2 = Math.sqrt(2);
const RAD_FACTOR = 104.719755; // 1 V*s/rad = 104.719755 V/krpm

type CalcMode = 'get_ke' | 'get_voltage';

export function BackEmfView() {
  // Mode Selection
  const [calcMode, setCalcMode] = useState<CalcMode>('get_ke');

  // Calculator Inputs (Ke unit is Vp / (rad/s))
  const [keInput, setKeInput] = useState<string>(''); 
  const [activeVoltUnit, setActiveVoltUnit] = useState<string>('vrms');
  const [voltValue, setVoltValue] = useState<string>('');
  
  // Speed inputs state
  const [activeSpeedUnit, setActiveSpeedUnit] = useState<string>('rpm');
  const [speedValue, setSpeedValue] = useState<string>('');
  const [pulse, setPulse] = useState<string>('1');

  // Unit Converter State (Section 2)
  const [activeKeUnit, setActiveKeUnit] = useState<string>('pk_rad');
  const [converterValue, setConverterValue] = useState<string>('');

  const ppr = parseFloat(pulse) > 0 ? parseFloat(pulse) : 1;

  // 1. Calculate values based on current Mode
  let vp: number | null = null;
  let vpp: number | null = null;
  let vrms: number | null = null;
  let vavg: number | null = null;

  let rpmVal: number | null = null;
  let hzVal: number | null = null;
  let radsVal: number | null = null;
  let pulseHzVal: number | null = null;

  let calc_pk_krpm: number | null = null;
  let calc_rms_krpm: number | null = null;
  let calc_pk_rad: number | null = null;
  let calc_rms_rad: number | null = null;
  let kv_rms: number | null = null;
  let kv_pk: number | null = null;

  // Helpers to get voltages from current voltValue/activeVoltUnit
  const getVoltValuesFromInput = () => {
    const val = parseFloat(voltValue);
    if (isNaN(val)) return { vp: null, vpp: null, vrms: null, vavg: null };

    let localVp = 0;
    switch (activeVoltUnit) {
      case 'vp':
        localVp = val;
        break;
      case 'vpp':
        localVp = val / 2;
        break;
      case 'vrms':
        localVp = val * SQRT_2;
        break;
      case 'vavg':
        localVp = (val * Math.PI) / 2;
        break;
      default:
        return { vp: null, vpp: null, vrms: null, vavg: null };
    }

    return {
      vp: localVp,
      vpp: localVp * 2,
      vrms: localVp / SQRT_2,
      vavg: (localVp * 2) / Math.PI,
    };
  };

  // Helpers to get speeds from current speedValue/activeSpeedUnit
  const getSpeedValuesFromInput = () => {
    const val = parseFloat(speedValue);
    if (isNaN(val) || val <= 0) return { rpm: null, hz: null, rads: null, pulse_hz: null };

    let localRpm = 0;
    switch (activeSpeedUnit) {
      case 'rpm':
        localRpm = val;
        break;
      case 'hz':
        localRpm = val * 60;
        break;
      case 'rads':
        localRpm = (val * 60) / (2 * Math.PI);
        break;
      case 'pulse_hz':
        localRpm = (val * 60) / ppr;
        break;
      default:
        return { rpm: null, hz: null, rads: null, pulse_hz: null };
    }

    return {
      rpm: localRpm,
      hz: localRpm / 60,
      rads: (localRpm * 2 * Math.PI) / 60,
      pulse_hz: (localRpm * ppr) / 60,
    };
  };

  const parsedKeInput = parseFloat(keInput);

  if (calcMode === 'get_ke') {
    // Mode 1: Input Voltages & Speeds -> Output Ke
    const vVals = getVoltValuesFromInput();
    const sVals = getSpeedValuesFromInput();

    vp = vVals.vp;
    vpp = vVals.vpp;
    vrms = vVals.vrms;
    vavg = vVals.vavg;

    rpmVal = sVals.rpm;
    hzVal = sVals.hz;
    radsVal = sVals.rads;
    pulseHzVal = sVals.pulse_hz;

    if (vp !== null && rpmVal !== null && rpmVal > 0 && radsVal !== null && vrms !== null) {
      calc_pk_rad = vp / radsVal; // Vp / (rad/s)
      calc_pk_krpm = calc_pk_rad * RAD_FACTOR;
      calc_rms_krpm = calc_pk_krpm / SQRT_2;
      calc_rms_rad = calc_pk_rad / SQRT_2;

      kv_rms = calc_rms_krpm > 0 ? 1000 / calc_rms_krpm : null;
      kv_pk = calc_pk_krpm > 0 ? 1000 / calc_pk_krpm : null;
    }
  } else if (calcMode === 'get_voltage') {
    // Mode 2: Input Ke (Vp/(rad/s)) & Speeds -> Output Voltages
    const sVals = getSpeedValuesFromInput();
    rpmVal = sVals.rpm;
    hzVal = sVals.hz;
    radsVal = sVals.rads;
    pulseHzVal = sVals.pulse_hz;

    if (!isNaN(parsedKeInput) && rpmVal !== null && rpmVal > 0 && radsVal !== null) {
      vp = parsedKeInput * radsVal; // Vp = Ke * omega
      vpp = vp * 2;
      vrms = vp / SQRT_2;
      vavg = (vp * 2) / Math.PI;

      calc_pk_rad = parsedKeInput;
      calc_pk_krpm = calc_pk_rad * RAD_FACTOR;
      calc_rms_krpm = calc_pk_krpm / SQRT_2;
      calc_rms_rad = calc_pk_rad / SQRT_2;

      kv_rms = calc_rms_krpm > 0 ? 1000 / calc_rms_krpm : null;
      kv_pk = calc_pk_krpm > 0 ? 1000 / calc_pk_krpm : null;
    }
  }

  // Display value helpers for input fields
  const getVoltDisplay = (unit: string) => {
    if (calcMode !== 'get_voltage' && unit === activeVoltUnit) return voltValue;
    const val = unit === 'vp' ? vp : unit === 'vpp' ? vpp : unit === 'vrms' ? vrms : vavg;
    return val !== null && !isNaN(val) ? String(Number(val.toPrecision(10))) : '';
  };

  const getSpeedDisplay = (unit: string) => {
    if (unit === activeSpeedUnit) return speedValue;
    const val = unit === 'rpm' ? rpmVal : unit === 'hz' ? hzVal : unit === 'pulse_hz' ? pulseHzVal : radsVal;
    return val !== null && !isNaN(val) ? String(Number(val.toPrecision(10))) : '';
  };

  const handleVoltChange = (unit: string, val: string) => {
    if (calcMode === 'get_voltage') return; 
    setActiveVoltUnit(unit);
    setVoltValue(val);
  };

  const handleSpeedChange = (unit: string, val: string) => {
    setActiveSpeedUnit(unit);
    setSpeedValue(val);
  };

  // 2. Direct Unit Converter calculations (using pk_rad as the internal base unit)
  const getBasePkRadValue = () => {
    if (!converterValue || isNaN(parseFloat(converterValue))) return null;
    const val = parseFloat(converterValue);

    switch (activeKeUnit) {
      case 'pk_rad':
        return val;
      case 'pk_krpm':
        return val / RAD_FACTOR;
      case 'rms_krpm':
        return (val * SQRT_2) / RAD_FACTOR;
      case 'rms_rad':
        return val * SQRT_2;
      default:
        return null;
    }
  };

  const basePkRad = getBasePkRadValue();

  const getKeDisplayValue = (unit: string) => {
    if (unit === activeKeUnit) return converterValue;
    if (basePkRad === null) return '';

    let val = 0;
    switch (unit) {
      case 'pk_rad':
        val = basePkRad;
        break;
      case 'pk_krpm':
        val = basePkRad * RAD_FACTOR;
        break;
      case 'rms_krpm':
        val = (basePkRad * RAD_FACTOR) / SQRT_2;
        break;
      case 'rms_rad':
        val = basePkRad / SQRT_2;
        break;
      default:
        return '';
    }

    return String(Number(val.toPrecision(10)));
  };

  const handleKeConverterChange = (unit: string, val: string) => {
    setActiveKeUnit(unit);
    setConverterValue(val);
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <header className="hidden md:block mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">反電動勢常數 (Ke) 計算與換算</h2>
        <p className="text-slate-500 mt-1">規劃量測參數進行 Ke 與 Kv 計算，或直接進行常數單位換算</p>
      </header>

      <div className="max-w-4xl space-y-8">
        {/* Section 1: Calculator Card */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">反電動勢量測值計算</h3>
            
            {/* Mode Selector Tabs */}
            <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium self-start md:self-auto">
              <button
                onClick={() => setCalcMode('get_ke')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  calcMode === 'get_ke' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                計算 Ke
              </button>
              <button
                onClick={() => setCalcMode('get_voltage')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  calcMode === 'get_voltage' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                計算電壓
              </button>
            </div>
          </div>
          
          <div className="p-6 md:p-8 space-y-6">
            
            {/* 1. TOP RESULT CARD (Conditional on Mode) */}
            {calcMode === 'get_ke' ? (
              // Mode 1 (get_ke): Calculated Ke card at the top
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
                <div className="flex justify-between items-baseline mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600">
                    反電動勢常數 Ke 計算結果 (Vp / (rad/s))
                  </label>
                  <span className="text-[10px] bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-700 font-medium">
                    計算結果
                  </span>
                </div>
                <div className="text-3xl font-mono font-bold text-indigo-700">
                  {calc_pk_rad !== null ? calc_pk_rad.toFixed(6) : '---'}
                </div>
              </div>
            ) : (
              // Mode 2 (get_voltage): Calculated Voltages card at the top (Vrms, Vp, Vpp, Vavg)
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
                <div className="flex justify-between items-baseline mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600">
                    電壓計算結果 (對角正弦波)
                  </label>
                  <span className="text-[10px] bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-700 font-medium">
                    計算結果
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="p-3 bg-white rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-400 block mb-1">有效電壓 Vrms (V)</span>
                    <span className="text-lg font-mono font-bold text-indigo-700">
                      {vrms !== null ? vrms.toFixed(5) : '---'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-400 block mb-1">峰值電壓 Vp (V)</span>
                    <span className="text-lg font-mono font-bold text-indigo-700">
                      {vp !== null ? vp.toFixed(5) : '---'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-400 block mb-1">峰對峰 Vp-p (V)</span>
                    <span className="text-lg font-mono font-bold text-indigo-700">
                      {vpp !== null ? vpp.toFixed(5) : '---'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-400 block mb-1">平均值 Vavg (V)</span>
                    <span className="text-lg font-mono font-bold text-indigo-700">
                      {vavg !== null ? vavg.toFixed(5) : '---'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. FORM GRID (Conditional on Mode) */}
            {calcMode === 'get_ke' ? (
              // ==================== MODE 1: CALCULATE KE ====================
              // Inputs order: Vrms, Vp, rpm, Pulse, pulse_hz, rads, Vpp, Vavg, hz
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. 有效值電壓 Vrms */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">有效值電壓 Vrms (V)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getVoltDisplay('vrms')}
                      onChange={(e) => handleVoltChange('vrms', e.target.value)}
                      placeholder="輸入 Vrms"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeVoltUnit === 'vrms' && voltValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleVoltChange('vrms', val)} />
                    </div>
                  </div>
                </div>

                {/* 2. 峰值電壓 Vp */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">峰值電壓 Vp (V)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getVoltDisplay('vp')}
                      onChange={(e) => handleVoltChange('vp', e.target.value)}
                      placeholder="輸入 Vp"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeVoltUnit === 'vp' && voltValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleVoltChange('vp', val)} />
                    </div>
                  </div>
                </div>

                {/* 3. 轉速 (rpm) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">轉速 (rpm)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getSpeedDisplay('rpm')}
                      onChange={(e) => handleSpeedChange('rpm', e.target.value)}
                      placeholder="輸入轉速"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeSpeedUnit === 'rpm' && speedValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleSpeedChange('rpm', val)} />
                    </div>
                  </div>
                </div>

                {/* 4. 脈波數 (Pulse) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">脈波數 (Pulse)</label>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                      PPR 設定
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="1"
                      className="w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => setPulse(val)} />
                    </div>
                  </div>
                </div>

                {/* 5. 脈波頻率 (Hz) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">脈波頻率 (Hz)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getSpeedDisplay('pulse_hz')}
                      onChange={(e) => handleSpeedChange('pulse_hz', e.target.value)}
                      placeholder="輸入脈波頻率"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeSpeedUnit === 'pulse_hz' && speedValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleSpeedChange('pulse_hz', val)} />
                    </div>
                  </div>
                </div>

                {/* 6. 角速度 (rad/s) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">角速度 (rad/s)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getSpeedDisplay('rads')}
                      onChange={(e) => handleSpeedChange('rads', e.target.value)}
                      placeholder="輸入角速度"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeSpeedUnit === 'rads' && speedValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleSpeedChange('rads', val)} />
                    </div>
                  </div>
                </div>

                {/* 7. 峰對峰值電壓 Vp-p */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">峰對峰值電壓 Vp-p (V)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getVoltDisplay('vpp')}
                      onChange={(e) => handleVoltChange('vpp', e.target.value)}
                      placeholder="輸入 Vp-p"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeVoltUnit === 'vpp' && voltValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleVoltChange('vpp', val)} />
                    </div>
                  </div>
                </div>

                {/* 8. 平均值電壓 Vavg */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">平均值電壓 Vavg (V)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getVoltDisplay('vavg')}
                      onChange={(e) => handleVoltChange('vavg', e.target.value)}
                      placeholder="輸入 Vavg"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeVoltUnit === 'vavg' && voltValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleVoltChange('vavg', val)} />
                    </div>
                  </div>
                </div>

                {/* 9. 頻率 (Hz) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:col-span-2">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">頻率 (Hz) (旋轉頻率)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getSpeedDisplay('hz')}
                      onChange={(e) => handleSpeedChange('hz', e.target.value)}
                      placeholder="輸入頻率"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeSpeedUnit === 'hz' && speedValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleSpeedChange('hz', val)} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // ==================== MODE 2: CALCULATE VOLTAGE ====================
              // Inputs order: Ke (Vp/(rad/s)), rpm, Pulse, pulse_hz, rads, hz
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Ke 輸入框 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      反電動勢常數 Ke (Vp / (rad/s))
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={keInput}
                      onChange={(e) => setKeInput(e.target.value)}
                      placeholder="請輸入 Ke 值"
                      className="w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => setKeInput(val)} />
                    </div>
                  </div>
                </div>

                {/* 2. 轉速 (rpm) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">轉速 (rpm)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getSpeedDisplay('rpm')}
                      onChange={(e) => handleSpeedChange('rpm', e.target.value)}
                      placeholder="輸入轉速"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeSpeedUnit === 'rpm' && speedValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleSpeedChange('rpm', val)} />
                    </div>
                  </div>
                </div>

                {/* 3. 脈波數 (Pulse) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">脈波數 (Pulse)</label>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                      PPR 設定
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="1"
                      className="w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => setPulse(val)} />
                    </div>
                  </div>
                </div>

                {/* 4. 脈波頻率 (Hz) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">脈波頻率 (Hz)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getSpeedDisplay('pulse_hz')}
                      onChange={(e) => handleSpeedChange('pulse_hz', e.target.value)}
                      placeholder="輸入脈波頻率"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeSpeedUnit === 'pulse_hz' && speedValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleSpeedChange('pulse_hz', val)} />
                    </div>
                  </div>
                </div>

                {/* 5. 角速度 (rad/s) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">角速度 (rad/s)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getSpeedDisplay('rads')}
                      onChange={(e) => handleSpeedChange('rads', e.target.value)}
                      placeholder="輸入角速度"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeSpeedUnit === 'rads' && speedValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleSpeedChange('rads', val)} />
                    </div>
                  </div>
                </div>

                {/* 6. 頻率 (Hz) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-semibold text-slate-700">頻率 (Hz) (旋轉頻率)</label>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={getSpeedDisplay('hz')}
                      onChange={(e) => handleSpeedChange('hz', e.target.value)}
                      placeholder="輸入頻率"
                      className={`w-full text-lg font-mono p-2.5 pr-12 rounded-lg outline-none border transition-all ${
                        activeSpeedUnit === 'hz' && speedValue
                          ? 'bg-white border-indigo-200 text-slate-900 focus:ring-2 focus:ring-indigo-500'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <VoiceInputButton onResult={(val) => handleSpeedChange('hz', val)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid (Bottom) */}
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                其他常數單位對照與馬達估算
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400 block mb-1">Vp / krpm</span>
                  <span className="text-lg font-mono font-bold text-slate-700">
                    {calc_pk_krpm !== null ? calc_pk_krpm.toFixed(5) : '---'}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400 block mb-1">Vrms / krpm</span>
                  <span className="text-lg font-mono font-bold text-slate-700">
                    {calc_rms_krpm !== null ? calc_rms_krpm.toFixed(5) : '---'}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400 block mb-1">Vrms / (rad/s)</span>
                  <span className="text-lg font-mono font-bold text-slate-700">
                    {calc_rms_rad !== null ? calc_rms_rad.toFixed(6) : '---'}
                  </span>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <span className="text-xs text-emerald-600 block mb-1">Kv_rms (RPM/V)</span>
                  <span className="text-lg font-mono font-bold text-emerald-700">
                    {kv_rms !== null ? kv_rms.toFixed(2) : '---'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Unit Converter */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">反電動勢單位對照換算</h3>
          </div>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vp / (rad/s)</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="any"
                    value={getKeDisplayValue('pk_rad')}
                    onChange={(e) => handleKeConverterChange('pk_rad', e.target.value)}
                    placeholder="輸入 Vp / (rad/s)"
                    className={`w-full bg-slate-50 border ${
                      activeKeUnit === 'pk_rad' && converterValue ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'
                    } rounded-lg text-lg px-4 pr-12 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <VoiceInputButton onResult={(val) => handleKeConverterChange('pk_rad', val)} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vp / krpm</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="any"
                    value={getKeDisplayValue('pk_krpm')}
                    onChange={(e) => handleKeConverterChange('pk_krpm', e.target.value)}
                    placeholder="輸入 Vp / krpm"
                    className={`w-full bg-slate-50 border ${
                      activeKeUnit === 'pk_krpm' && converterValue ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'
                    } rounded-lg text-lg px-4 pr-12 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <VoiceInputButton onResult={(val) => handleKeConverterChange('pk_krpm', val)} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vrms / krpm</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="any"
                    value={getKeDisplayValue('rms_krpm')}
                    onChange={(e) => handleKeConverterChange('rms_krpm', e.target.value)}
                    placeholder="輸入 Vrms / krpm"
                    className={`w-full bg-slate-50 border ${
                      activeKeUnit === 'rms_krpm' && converterValue ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'
                    } rounded-lg text-lg px-4 pr-12 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <VoiceInputButton onResult={(val) => handleKeConverterChange('rms_krpm', val)} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vrms / (rad/s)</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="any"
                    value={getKeDisplayValue('rms_rad')}
                    onChange={(e) => handleKeConverterChange('rms_rad', e.target.value)}
                    placeholder="輸入 Vrms / (rad/s)"
                    className={`w-full bg-slate-50 border ${
                      activeKeUnit === 'rms_rad' && converterValue ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200'
                    } rounded-lg text-lg px-4 pr-12 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <VoiceInputButton onResult={(val) => handleKeConverterChange('rms_rad', val)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-6 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-600 mb-2">換算基礎說明：</h4>
            <ul className="text-xs text-slate-500 font-mono space-y-1 list-disc pl-5">
              <li>1 krpm = 1000 rpm = 104.719755 rad/s</li>
              <li>Vp = Vrms × √2 (≈ 1.414) = Vavg × π/2 (≈ 1.571)</li>
              <li>Ke (Vp / (rad/s)) = Ke (Vp / krpm) / 104.719755</li>
              <li>Kv (RPM/V) = 1000 / Ke_rms_krpm</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
