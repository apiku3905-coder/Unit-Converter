import React, { useState } from 'react';
import { PRTProvider } from './context/PRTContext';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { CalculatorView } from './views/CalculatorView';
import { InstrumentsView } from './views/InstrumentsView';
import { InstrumentDetailView } from './views/InstrumentDetailView';
import { ResistanceCompensationView } from './views/ResistanceCompensationView';
import { PressureConverterView } from './views/PressureConverterView';
import { TorqueConverterView } from './views/TorqueConverterView';
import { ImpulseVoltmeterView } from './views/ImpulseVoltmeterView';
import { RotationSpeedView } from './views/RotationSpeedView';
import { BackEmfView } from './views/BackEmfView';
import { VoltageOutputConverterView } from './views/VoltageOutputConverterView';
import { Menu, X, ArrowLeft } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'home' : 'calculator';
    }
    return 'calculator';
  });

  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile && currentView === 'home') {
        setCurrentView('calculator');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentView]);

  const handleSelectInstrument = (id: string) => {
    setCurrentView(`instrument-${id}`);
  };

  const getViewTitle = (view: string) => {
    if (view === 'home') return '功能選單';
    if (view === 'calculator') return '白金電阻溫度計';
    if (view === 'instruments') return '標準件管理';
    if (view === 'resistance-compensation') return '電阻溫補計算';
    if (view === 'pressure-converter') return '壓力單位換算';
    if (view === 'torque-converter') return '扭力單位換算';
    if (view === 'impulse-voltmeter') return '衝擊電壓表調整';
    if (view === 'rotation-speed') return '轉速單位換算';
    if (view === 'back-emf') return '反電動勢(ke)換算';
    if (view === 'voltage-output') return 'Ω/V電壓輸出換算';
    if (view.startsWith('instrument-')) return '標準件詳情';
    return '校正換算工具';
  };

  const renderView = () => {
    if (currentView === 'home') {
      return <HomeView onSelectView={(view) => setCurrentView(view)} />;
    } else if (currentView === 'calculator') {
      return <CalculatorView onManageInstruments={() => setCurrentView('instruments')} />;
    } else if (currentView === 'instruments') {
      return <InstrumentsView onSelectInstrument={handleSelectInstrument} />;
    } else if (currentView === 'resistance-compensation') {
      return <ResistanceCompensationView />;
    } else if (currentView === 'pressure-converter') {
      return <PressureConverterView />;
    } else if (currentView === 'torque-converter') {
      return <TorqueConverterView />;
    } else if (currentView === 'impulse-voltmeter') {
      return <ImpulseVoltmeterView />;
    } else if (currentView === 'rotation-speed') {
      return <RotationSpeedView />;
    } else if (currentView === 'back-emf') {
      return <BackEmfView />;
    } else if (currentView === 'voltage-output') {
      return <VoltageOutputConverterView />;
    } else if (currentView.startsWith('instrument-')) {
      const id = currentView.split('instrument-')[1];
      return <InstrumentDetailView instrumentId={id} onBack={() => setCurrentView('instruments')} />;
    }
    return <div>View not found</div>;
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden relative">
      {/* Sidebar Wrapper (Only visible on desktop) */}
      <div className="hidden md:flex md:relative flex-shrink-0 h-full">
        <Sidebar
          currentView={currentView}
          onChangeView={(view) => {
            setCurrentView(view);
          }}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Header Bar (Only visible when not on home dashboard) */}
        {currentView !== 'home' && (
          <header className="md:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (currentView.startsWith('instrument-')) {
                    setCurrentView('instruments');
                  } else {
                    setCurrentView('home');
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <span className="font-bold text-slate-800 text-base">{getViewTitle(currentView)}</span>
            </div>
          </header>
        )}

        {renderView()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <PRTProvider>
      <AppContent />
    </PRTProvider>
  );
}


