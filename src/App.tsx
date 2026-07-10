import React, { useState } from 'react';
import { PRTProvider } from './context/PRTContext';
import { Sidebar } from './components/Sidebar';
import { CalculatorView } from './views/CalculatorView';
import { InstrumentsView } from './views/InstrumentsView';
import { InstrumentDetailView } from './views/InstrumentDetailView';
import { ResistanceCompensationView } from './views/ResistanceCompensationView';
import { PressureConverterView } from './views/PressureConverterView';
import { TorqueConverterView } from './views/TorqueConverterView';
import { ImpulseVoltmeterView } from './views/ImpulseVoltmeterView';
import { Menu, X } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('calculator');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const handleSelectInstrument = (id: string) => {
    setCurrentView(`instrument-${id}`);
  };

  const getViewTitle = (view: string) => {
    if (view === 'calculator') return '電阻/溫度換算器';
    if (view === 'instruments') return '標準件管理';
    if (view === 'resistance-compensation') return '溫補計算';
    if (view === 'pressure-converter') return '壓力單位換算';
    if (view === 'torque-converter') return '扭力單位換算';
    if (view === 'impulse-voltmeter') return '調整計算';
    if (view.startsWith('instrument-')) return '標準件詳情';
    return '換算系統';
  };

  const renderView = () => {
    if (currentView === 'calculator') {
      return <CalculatorView />;
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
    } else if (currentView.startsWith('instrument-')) {
      const id = currentView.split('instrument-')[1];
      return <InstrumentDetailView instrumentId={id} onBack={() => setCurrentView('instruments')} />;
    }
    return <div>View not found</div>;
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden relative">
      {/* Mobile Backdrop overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Wrapper (Responsive sliding drawer on mobile, static on desktop) */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex flex-shrink-0 h-full`}>
        <Sidebar
          currentView={currentView}
          onChangeView={(view) => {
            setCurrentView(view);
            setIsMobileSidebarOpen(false);
          }}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Header Bar */}
        <header className="md:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-slate-800 text-base">{getViewTitle(currentView)}</span>
          </div>
        </header>

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

