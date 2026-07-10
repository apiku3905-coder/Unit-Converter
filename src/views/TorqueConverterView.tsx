import React, { useState } from 'react';

export function TorqueConverterView() {
  const [weight, setWeight] = useState<string>('');
  const [arm, setArm] = useState<string>('');

  const [torqueMode, setTorqueMode] = useState<'from_inputs' | 'from_torque'>('from_inputs');
  const [activeTorqueUnit, setActiveTorqueUnit] = useState<'kgf_cm' | 'kgf_m' | 'n_m'>('kgf_cm');
  const [torqueValue, setTorqueValue] = useState<string>('');

  const handleWeightChange = (val: string) => {
    setWeight(val);
    setTorqueMode('from_inputs');
  };

  const handleArmChange = (val: string) => {
    setArm(val);
    setTorqueMode('from_inputs');
  };

  const handleTorqueChange = (unit: 'kgf_cm' | 'kgf_m' | 'n_m', val: string) => {
    setActiveTorqueUnit(unit);
    setTorqueValue(val);
    setTorqueMode('from_torque');
  };

  let calculated_kgf_cm: number | null = null;
  let calculated_kgf_m: number | null = null;
  let calculated_n_m: number | null = null;

  if (torqueMode === 'from_inputs') {
    const w = parseFloat(weight);
    const a = parseFloat(arm);
    if (!isNaN(w) && !isNaN(a)) {
      calculated_kgf_cm = w * a * 0.1;
      calculated_kgf_m = w * a * 0.001;
      calculated_n_m = w * a * 0.001 * 9.80665;
    }
  } else {
    const t = parseFloat(torqueValue);
    if (!isNaN(t)) {
      if (activeTorqueUnit === 'kgf_cm') {
        calculated_kgf_cm = t;
        calculated_kgf_m = t * 0.01;
        calculated_n_m = t * 0.0980665;
      } else if (activeTorqueUnit === 'kgf_m') {
        calculated_kgf_cm = t * 100;
        calculated_kgf_m = t;
        calculated_n_m = t * 9.80665;
      } else if (activeTorqueUnit === 'n_m') {
        calculated_kgf_cm = t / 0.0980665;
        calculated_kgf_m = t / 9.80665;
        calculated_n_m = t;
      }
    }
  }

  const getDisplayValue = (unit: 'kgf_cm' | 'kgf_m' | 'n_m') => {
    if (torqueMode === 'from_torque' && activeTorqueUnit === unit) {
      return torqueValue;
    }
    let val: number | null = null;
    if (unit === 'kgf_cm') val = calculated_kgf_cm;
    else if (unit === 'kgf_m') val = calculated_kgf_m;
    else if (unit === 'n_m') val = calculated_n_m;
    
    return val !== null ? String(Number(val.toPrecision(12))) : '';
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">扭力單位換算</h2>
        <p className="text-slate-500 mt-1">輸入砝碼與扭力臂換算，或直接輸入扭力值進行單位換算</p>
      </header>

      <div className="max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            
            {/* 第一行：砝碼(kg)、扭力臂(mm) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">砝碼 (kg)</label>
                <input
                  type="number"
                  step="any"
                  value={weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder="例如: 10"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">扭力臂 (mm)</label>
                <input
                  type="number"
                  step="any"
                  value={arm}
                  onChange={(e) => handleArmChange(e.target.value)}
                  placeholder="例如: 100"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                />
              </div>
            </div>

            {/* 第二行：扭力(kgf·cm)、扭力(kgf·m)、扭力(N·m) */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">扭力結果</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">扭力 (kgf·cm)</label>
                  <input
                    type="number"
                    step="any"
                    value={getDisplayValue('kgf_cm')}
                    onChange={(e) => handleTorqueChange('kgf_cm', e.target.value)}
                    placeholder="輸入 kgf·cm"
                    className={`w-full text-xl md:text-2xl font-mono p-4 rounded-lg outline-none transition-shadow border ${torqueMode === 'from_torque' && activeTorqueUnit === 'kgf_cm' ? 'bg-white border-indigo-400 ring-1 ring-indigo-400 text-slate-900' : 'bg-indigo-50 border-indigo-200 text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">扭力 (kgf·m)</label>
                  <input
                    type="number"
                    step="any"
                    value={getDisplayValue('kgf_m')}
                    onChange={(e) => handleTorqueChange('kgf_m', e.target.value)}
                    placeholder="輸入 kgf·m"
                    className={`w-full text-xl md:text-2xl font-mono p-4 rounded-lg outline-none transition-shadow border ${torqueMode === 'from_torque' && activeTorqueUnit === 'kgf_m' ? 'bg-white border-indigo-400 ring-1 ring-indigo-400 text-slate-900' : 'bg-indigo-50 border-indigo-200 text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">扭力 (N·m)</label>
                  <input
                    type="number"
                    step="any"
                    value={getDisplayValue('n_m')}
                    onChange={(e) => handleTorqueChange('n_m', e.target.value)}
                    placeholder="輸入 N·m"
                    className={`w-full text-xl md:text-2xl font-mono p-4 rounded-lg outline-none transition-shadow border ${torqueMode === 'from_torque' && activeTorqueUnit === 'n_m' ? 'bg-white border-indigo-400 ring-1 ring-indigo-400 text-slate-900' : 'bg-indigo-50 border-indigo-200 text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:text-slate-900'}`}
                  />
                </div>
              </div>
            </div>

          </div>
          <div className="bg-slate-50 p-6 border-t border-slate-100">
             <p className="text-xs text-slate-500 font-mono leading-relaxed">
               公式：<br/>
               kgf·cm = 砝碼(kg) × 扭力臂(mm) × 0.1<br/>
               kgf·m = 砝碼(kg) × 扭力臂(mm) × 0.001<br/>
               N·m = 砝碼(kg) × 扭力臂(mm) × 0.001 × 9.80665
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
