import { Calculator, Thermometer, Settings, Gauge, Wrench, Zap, RotateCw, Cpu, Activity } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const navItems = [
    { id: 'calculator', icon: Calculator, label: '溫阻換算器' },
    { id: 'instruments', icon: Thermometer, label: '標準件管理' },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-sky-50 to-blue-50/70 text-slate-800 flex flex-col h-full border-r border-sky-100">
      <div className="p-6 border-b border-sky-100">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 200 200" className="w-[60px] h-[60px] rounded shadow-sm shrink-0" xmlns="http://www.w3.org/2000/svg">
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
          <h1 className="text-lg font-bold tracking-tight text-slate-800">換算系統</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">功能導覽</p>

        <div className="mb-4">
          <div className="px-2 py-1 text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-slate-500" />
            白金電阻溫度
          </div>
          <div className="space-y-1 pl-5 border-l border-sky-200/80 ml-4">
            {navItems.map((item) => {
              const isActive = currentView === item.id || (currentView.startsWith('instrument-') && item.id === 'instruments');
              return (
                <button
                  key={item.id}
                  onClick={() => onChangeView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-100'
                      : 'text-slate-600 hover:bg-sky-100/80 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400' : 'bg-slate-400'}`}></span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <div className="px-2 py-1 text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            電阻溫補
          </div>
          <div className="space-y-1 pl-5 border-l border-sky-200/80 ml-4">
            <button
              onClick={() => onChangeView('resistance-compensation')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                currentView === 'resistance-compensation'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:bg-sky-100/80 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'resistance-compensation' ? 'bg-green-400' : 'bg-slate-400'}`}></span>
              溫補計算
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="px-2 py-1 text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-slate-500" />
            壓力單位
          </div>
          <div className="space-y-1 pl-5 border-l border-sky-200/80 ml-4">
            <button
              onClick={() => onChangeView('pressure-converter')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                currentView === 'pressure-converter'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:bg-sky-100/80 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'pressure-converter' ? 'bg-green-400' : 'bg-slate-400'}`}></span>
              單位換算
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="px-2 py-1 text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-500" />
            扭力單位
          </div>
          <div className="space-y-1 pl-5 border-l border-sky-200/80 ml-4">
            <button
              onClick={() => onChangeView('torque-converter')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                currentView === 'torque-converter'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:bg-sky-100/80 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'torque-converter' ? 'bg-green-400' : 'bg-slate-400'}`}></span>
              單位換算
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="px-2 py-1 text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-500" />
            衝擊電壓表調整
          </div>
          <div className="space-y-1 pl-5 border-l border-sky-200/80 ml-4">
            <button
              onClick={() => onChangeView('impulse-voltmeter')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                currentView === 'impulse-voltmeter'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:bg-sky-100/80 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'impulse-voltmeter' ? 'bg-green-400' : 'bg-slate-400'}`}></span>
              調整計算
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="px-2 py-1 text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-slate-500" />
            轉速單位
          </div>
          <div className="space-y-1 pl-5 border-l border-sky-200/80 ml-4">
            <button
              onClick={() => onChangeView('rotation-speed')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                currentView === 'rotation-speed'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:bg-sky-100/80 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'rotation-speed' ? 'bg-green-400' : 'bg-slate-400'}`}></span>
              單位換算
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="px-2 py-1 text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-500" />
            反電動勢
          </div>
          <div className="space-y-1 pl-5 border-l border-sky-200/80 ml-4">
            <button
              onClick={() => onChangeView('back-emf')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                currentView === 'back-emf'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:bg-sky-100/80 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'back-emf' ? 'bg-green-400' : 'bg-slate-400'}`}></span>
              常數計算與換算
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="px-2 py-1 text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500" />
            Ω/V
          </div>
          <div className="space-y-1 pl-5 border-l border-sky-200/80 ml-4">
            <button
              onClick={() => onChangeView('voltage-output')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                currentView === 'voltage-output'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:bg-sky-100/80 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'voltage-output' ? 'bg-green-400' : 'bg-slate-400'}`}></span>
              電壓輸出換算
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-sky-100 shrink-0">
        <div className="text-xs text-slate-400 px-2 mb-2">&copy; 2026 Metrology Lab</div>
      </div>
    </aside>
  );
}

