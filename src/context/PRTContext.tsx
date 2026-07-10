import React, { createContext, useContext, useState, useEffect } from 'react';
import { Instrument, CalibrationRecord } from '../types';

interface PRTContextType {
  instruments: Instrument[];
  records: CalibrationRecord[];
  isLoading: boolean;
  addInstrument: (inst: Omit<Instrument, 'id' | 'createdAt'>) => Promise<void>;
  updateInstrument: (id: string, inst: Omit<Instrument, 'id' | 'createdAt'>) => Promise<void>;
  deleteInstrument: (id: string) => Promise<void>;
  addRecord: (record: Omit<CalibrationRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateRecord: (id: string, record: Omit<CalibrationRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
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
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [records, setRecords] = useState<CalibrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial data from Serverless API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const instRes = await fetch('/api/instruments');
        if (!instRes.ok) throw new Error('Failed to fetch instruments');
        const instData = await instRes.json();

        const recRes = await fetch('/api/records');
        if (!recRes.ok) throw new Error('Failed to fetch records');
        const recData = await recRes.json();

        setInstruments(instData || []);
        setRecords(recData || []);
      } catch (err) {
        console.error('Error fetching data from API, falling back to LocalStorage:', err);
        const savedInsts = localStorage.getItem('prt_instruments');
        const savedRecs = localStorage.getItem('prt_records');
        setInstruments(savedInsts ? JSON.parse(savedInsts) : DEFAULT_INSTRUMENTS);
        setRecords(savedRecs ? JSON.parse(savedRecs) : DEFAULT_RECORDS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Backup to local storage for quick offline fallback
  useEffect(() => {
    if (!isLoading && instruments.length > 0) {
      localStorage.setItem('prt_instruments', JSON.stringify(instruments));
    }
  }, [instruments, isLoading]);

  useEffect(() => {
    if (!isLoading && records.length > 0) {
      localStorage.setItem('prt_records', JSON.stringify(records));
    }
  }, [records, isLoading]);

  const addInstrument = async (inst: Omit<Instrument, 'id' | 'createdAt'>) => {
    const newInst: Instrument = {
      ...inst,
      id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    
    setInstruments(prev => [...prev, newInst]);

    try {
      const res = await fetch('/api/instruments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInst),
      });
      if (!res.ok) throw new Error('Failed to save');
    } catch (error) {
      console.error('Error adding instrument:', error);
      setInstruments(prev => prev.filter(i => i.id !== newInst.id));
    }
  };

  const updateInstrument = async (id: string, inst: Omit<Instrument, 'id' | 'createdAt'>) => {
    const prevInstruments = [...instruments];
    const updatedInst = { ...inst, id, createdAt: prevInstruments.find(i => i.id === id)?.createdAt || Date.now() };
    
    setInstruments(prev => prev.map(i => i.id === id ? updatedInst : i));

    try {
      const res = await fetch('/api/instruments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInst),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (error) {
      console.error('Error updating instrument:', error);
      setInstruments(prevInstruments);
    }
  };

  const deleteInstrument = async (id: string) => {
    const prevInstruments = [...instruments];
    const prevRecords = [...records];
    
    setInstruments(prev => prev.filter(i => i.id !== id));
    setRecords(prev => prev.filter(r => r.instrumentId !== id));

    try {
      const res = await fetch(`/api/instruments?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
    } catch (error) {
      console.error('Error deleting instrument:', error);
      setInstruments(prevInstruments);
      setRecords(prevRecords);
    }
  };

  const addRecord = async (record: Omit<CalibrationRecord, 'id' | 'createdAt'>) => {
    const newRecord: CalibrationRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    
    setRecords(prev => [...prev, newRecord]);

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      if (!res.ok) throw new Error('Failed to save record');
    } catch (error) {
      console.error('Error adding record:', error);
      setRecords(prev => prev.filter(r => r.id !== newRecord.id));
    }
  };

  const updateRecord = async (id: string, record: Omit<CalibrationRecord, 'id' | 'createdAt'>) => {
    const prevRecords = [...records];
    const updatedRec = { ...record, id, createdAt: prevRecords.find(r => r.id === id)?.createdAt || Date.now() };
    
    setRecords(prev => prev.map(r => r.id === id ? updatedRec : r));

    try {
      const res = await fetch('/api/records', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRec),
      });
      if (!res.ok) throw new Error('Failed to update record');
    } catch (error) {
      console.error('Error updating record:', error);
      setRecords(prevRecords);
    }
  };

  const deleteRecord = async (id: string) => {
    const prevRecords = [...records];
    
    setRecords(prev => prev.filter(r => r.id !== id));

    try {
      const res = await fetch(`/api/records?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete record');
    } catch (error) {
      console.error('Error deleting record:', error);
      setRecords(prevRecords);
    }
  };

  return (
    <PRTContext.Provider value={{
      instruments, records, isLoading,
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
