import React, { useState } from 'react';
import { VoiceInputButton } from '../components/VoiceInputButton';

export function RotationSpeedView() {
  const [activeUnit, setActiveUnit] = useState<string>('rpm');
  const [inputValue, setInputValue] = useState<string>('');
  const [pulse, setPulse] = useState<string>('1');
  const [slots, setSlots] = useState<string>('36');

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

      <div className="max-w-4xl">
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
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="any"
                        min={isSetting ? "1" : undefined}
                        value={val}
                        onChange={onChangeHandler}
                        placeholder={isSetting ? "1" : `輸入 ${u.id}`}
                        className={`w-full bg-slate-50 border ${borderClass} rounded-lg text-lg px-4 pr-12 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow font-mono`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <VoiceInputButton
                          onResult={(val) => {
                            if (u.id === 'pulse') setPulse(val);
                            else if (u.id === 'slots') setSlots(val);
                            else handleInputChange(u.id, val);
                          }}
                        />
                      </div>
                    </div>
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
      </div>
    </div>
  );
}
