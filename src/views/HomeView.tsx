import React from 'react';
import {
  Thermometer,
  Settings,
  Gauge,
  Wrench,
  Zap,
  RotateCw,
  Cpu,
  Activity,
} from 'lucide-react';

interface HomeViewProps {
  onSelectView: (view: string) => void;
}

export function HomeView({ onSelectView }: HomeViewProps) {
  const categories = [
    {
      id: 'calculator',
      title: '白金電阻溫度計',
      desc: '電阻與溫度(ITS-90/CVD)即時互轉及修正',
      icon: Thermometer,
      badge: '溫度',
      color: 'from-sky-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'resistance-compensation',
      title: '電阻溫補',
      desc: '標準電阻於不同環境溫度下的補償計算',
      icon: Settings,
      badge: '電阻',
      color: 'from-purple-500 to-indigo-600',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'pressure-converter',
      title: '壓力單位',
      desc: 'Pa, kPa, MPa, bar, kg/cm² 等單位多向換算',
      icon: Gauge,
      badge: '壓力',
      color: 'from-teal-500 to-emerald-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'torque-converter',
      title: '扭力單位',
      desc: '砝碼臂長換算扭力及常用扭力單位換算',
      icon: Wrench,
      badge: '扭力',
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'impulse-voltmeter',
      title: '衝擊電壓表調整',
      desc: '衝擊電壓滿量程(F.S)調整值計算',
      icon: Zap,
      badge: '電學',
      color: 'from-red-500 to-rose-600',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
    {
      id: 'rotation-speed',
      title: '轉速',
      desc: 'rpm, rps, Hz, deg/s, rad/s 單位即時換算',
      icon: RotateCw,
      badge: '轉速',
      color: 'from-cyan-500 to-cyan-700',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      id: 'back-emf',
      title: '反電動勢(ke)',
      desc: '馬達反電動勢常數 Ke 換算及 Kv 計算',
      icon: Cpu,
      badge: '馬達',
      color: 'from-fuchsia-500 to-pink-600',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      id: 'voltage-output',
      title: 'Ω/V電壓輸出換算',
      desc: '分壓箱與電表靈敏度之內阻與負載誤差換算',
      icon: Activity,
      badge: '電學',
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="flex-1 bg-[#f8fafc] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Brand Header */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <svg viewBox="0 0 200 200" className="w-[60px] h-[60px] rounded shadow-md shrink-0" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="150" fill="#0080ff" />
            <rect y="150" width="200" height="50" fill="#0a0a0a" />
            <text x="100" y="186" fill="white" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="900" fontSize="36" textAnchor="middle" letterSpacing="1">CHUYI</text>
            <g stroke="white" strokeWidth="28" fill="none">
              <circle cx="70" cy="75" r="32" />
              <circle cx="130" cy="75" r="32" />
            </g>
            <rect x="0" y="63" width="55" height="24" fill="#0080ff" />
            <rect x="145" y="63" width="55" height="24" fill="#0080ff" />
          </svg>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">換算系統</h1>
            <p className="text-slate-400 text-xs mt-1 font-sans">Metrology & Calibration Converter Hub</p>
          </div>
        </div>

        {/* Function Cards Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-5 pt-2">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectView(cat.id)}
                className="group relative flex flex-col items-center justify-center p-4 sm:p-5 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 text-center outline-none cursor-pointer hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Visual indicator bar */}
                <div className={`absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b ${cat.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                
                {/* Icon Container */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${cat.bgColor} ${cat.textColor} rounded-lg flex items-center justify-center shrink-0 mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Text Content */}
                <div className="space-y-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="font-semibold text-slate-800 text-sm sm:text-base leading-tight group-hover:text-indigo-600 transition-colors">
                      {cat.title}
                    </span>
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">
                      {cat.badge}
                    </span>
                  </div>
                  <p className="hidden sm:block text-xs text-slate-400 leading-normal pt-1">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Lab Footer */}
        <div className="text-center text-slate-400 text-xs pt-8 border-t border-slate-100 font-sans">
          &copy; 2026 CHUYI Metrology Lab. All rights reserved.
        </div>
      </div>
    </div>
  );
}
