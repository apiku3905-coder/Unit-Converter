import React, { createContext, useContext, useState, useEffect } from 'react';
import { Instrument, CalibrationRecord } from '../types';

interface PRTContextType {
  instruments: Instrument[];
  records: CalibrationRecord[];
  addInstrument: (inst: Omit<Instrument, 'id' | 'createdAt'>) => void;
  updateInstrument: (id: string, inst: Omit<Instrument, 'id' | 'createdAt'>) => void;
  deleteInstrument: (id: string) => void;
  addRecord: (record: Omit<CalibrationRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, record: Omit<CalibrationRecord, 'id' | 'createdAt'>) => void;
  deleteRecord: (id: string) => void;
}

const PRTContext = createContext<PRTContextType | undefined>(undefined);

const DEFAULT_INSTRUMENTS: Instrument[] = [
  {
    id: 'inst-1',
    name: '標準白金電阻溫度計 (Pt100)',
    model: 'Fluke 5609',
    serialNumber: 'SN-98765',
    createdAt: Date.now(),
  },
  {
    id: 'inst-2',
    name: '一級標準白金電阻溫度計 (Pt25)',
    model: 'Fluke 5699',
    serialNumber: 'SN-SPRT-001',
    createdAt: Date.now(),
  }
];

const DEFAULT_RECORDS: CalibrationRecord[] = [
  {
    id: 'rec-1',
    instrumentId: 'inst-1',
    year: 2026,
    reportNumber: 'CAL-2026-001',
    interceptPos: 0,
    x1Pos: 1,
    x2Pos: 0,
    reportNumberNeg: '',
    interceptNeg: 0,
    x1Neg: 1,
    x2Neg: 0,
    r0: 100.000,
    a: 3.9083e-3,
    b: -5.775e-7,
    c: -4.183e-12,
    createdAt: Date.now(),
  },
  {
    id: 'rec-2',
    instrumentId: 'inst-1',
    year: 2025,
    reportNumber: 'CAL-2025-088',
    interceptPos: 0.0150,
    x1Pos: 0.9998,
    x2Pos: 0,
    reportNumberNeg: 'CAL-2025-088-NEG',
    interceptNeg: 0.02,
    x1Neg: 0.9995,
    x2Neg: 0,
    r0: 99.998,
    a: 3.9083e-3,
    b: -5.775e-7,
    c: -4.183e-12,
    createdAt: Date.now() - 31536000000,
  },
  {
    id: 'rec-3',
    instrumentId: 'inst-2',
    year: 2026,
    reportNumber: 'NML-2026-SPRT',
    interceptPos: 0,
    x1Pos: 1,
    x2Pos: 0,
    reportNumberNeg: '',
    interceptNeg: 0,
    x1Neg: 1,
    x2Neg: 0,
    r0: 25.5012,
    a: 3.9083e-3,
    b: -5.775e-7,
    c: -4.183e-12,
    createdAt: Date.now(),
  }
];

export const PRTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instruments, setInstruments] = useState<Instrument[]>(() => {
    const saved = localStorage.getItem('prt_instruments');
    return saved ? JSON.parse(saved) : DEFAULT_INSTRUMENTS;
  });

  const [records, setRecords] = useState<CalibrationRecord[]>(() => {
    const saved = localStorage.getItem('prt_records');
    return saved ? JSON.parse(saved) : DEFAULT_RECORDS;
  });

  useEffect(() => {
    localStorage.setItem('prt_instruments', JSON.stringify(instruments));
  }, [instruments]);

  useEffect(() => {
    localStorage.setItem('prt_records', JSON.stringify(records));
  }, [records]);

  const addInstrument = (inst: Omit<Instrument, 'id' | 'createdAt'>) => {
    const newInst: Instrument = {
      ...inst,
      id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    setInstruments([...instruments, newInst]);
  };

  const updateInstrument = (id: string, inst: Omit<Instrument, 'id' | 'createdAt'>) => {
    setInstruments(instruments.map(i => i.id === id ? { ...i, ...inst } : i));
  };

  const deleteInstrument = (id: string) => {
    setInstruments(instruments.filter(i => i.id !== id));
    setRecords(records.filter(r => r.instrumentId !== id)); // Cascade delete
  };

  const addRecord = (record: Omit<CalibrationRecord, 'id' | 'createdAt'>) => {
    const newRecord: CalibrationRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    setRecords([...records, newRecord]);
  };

  const updateRecord = (id: string, record: Omit<CalibrationRecord, 'id' | 'createdAt'>) => {
    setRecords(records.map(r => r.id === id ? { ...r, ...record } : r));
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  return (
    <PRTContext.Provider value={{
      instruments, records,
      addInstrument, updateInstrument, deleteInstrument,
      addRecord, updateRecord, deleteRecord
    }}>
      {children}
    </PRTContext.Provider>
  );
};

export const usePRT = () => {
  const context = useContext(PRTContext);
  if (context === undefined) {
    throw new Error('usePRT must be used within a PRTProvider');
  }
  return context;
};
