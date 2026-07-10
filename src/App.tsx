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

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('calculator');

  const handleSelectInstrument = (id: string) => {
    setCurrentView(`instrument-${id}`);
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
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 flex flex-col overflow-y-auto">
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

