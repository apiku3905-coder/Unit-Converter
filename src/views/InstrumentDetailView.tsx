import React, { useState } from 'react';
import { usePRT } from '../context/PRTContext';
import { CalibrationRecord } from '../types';
import { ArrowLeft, Plus, History } from 'lucide-react';

interface InstrumentDetailViewProps {
  instrumentId: string;
  onBack: () => void;
}

export function InstrumentDetailView({ instrumentId, onBack }: InstrumentDetailViewProps) {
  const { instruments, records, addRecord, updateRecord, deleteRecord, deleteInstrument } = usePRT();
  const instrument = instruments.find(i => i.id === instrumentId);
  const instRecords = records.filter(r => r.instrumentId === instrumentId).sort((a, b) => b.year - a.year);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const defaultFormData: Record<string, string> = {
    year: new Date().getFullYear().toString(),
    reportNumber: '',
    interceptPos: '0',
    x1Pos: '1',
    x2Pos: '0',
    reportNumberNeg: '',
    interceptNeg: '0',
    x1Neg: '1',
    x2Neg: '0',
    r0: '100',
    a: '3.9083e-3',
    b: '-5.775e-7',
    c: '-4.183e-12',
  };
  const [formData, setFormData] = useState<Record<string, string>>(defaultFormData);

  if (!instrument) return <div>Instrument not found</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      instrumentId,
      year: Number(formData.year),
      reportNumber: formData.reportNumber || '',
      interceptPos: Number(formData.interceptPos),
      x1Pos: Number(formData.x1Pos),
      x2Pos: Number(formData.x2Pos),
      reportNumberNeg: formData.reportNumberNeg || '',
      interceptNeg: Number(formData.interceptNeg || 0),
      x1Neg: Number(formData.x1Neg || 1),
      x2Neg: Number(formData.x2Neg || 0),
      r0: Number(formData.r0),
      a: Number(formData.a),
      b: Number(formData.b),
      c: Number(formData.c),
    };
    
    if (editingRecordId) {
      updateRecord(editingRecordId, data);
    } else {
      addRecord(data);
    }
    
    setIsFormOpen(false);
    setEditingRecordId(null);
  };

  const handleEdit = (record: CalibrationRecord) => {
    setFormData({
      year: record.year.toString(),
      reportNumber: record.reportNumber,
      interceptPos: (record.interceptPos ?? record.offset ?? 0).toString(),
      x1Pos: (record.x1Pos ?? record.slope ?? 1).toString(),
      x2Pos: (record.x2Pos ?? 0).toString(),
      reportNumberNeg: record.reportNumberNeg || '',
      interceptNeg: (record.interceptNeg ?? 0).toString(),
      x1Neg: (record.x1Neg ?? 1).toString(),
      x2Neg: (record.x2Neg ?? 0).toString(),
      r0: record.r0.toString(),
      a: record.a.toString(),
      b: record.b.toString(),
      c: record.c.toString(),
    });
    setEditingRecordId(record.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteInst = () => {
    deleteInstrument(instrumentId);
    onBack();
  };

  return (
    <div className="flex flex-col h-full">
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">確定刪除此標準件？</h3>
            <p className="text-slate-500 text-sm mb-6">此操作無法復原，並會同時刪除所有相關的歷史追溯紀錄。</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleDeleteInst}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingRecordId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">確定刪除此紀錄？</h3>
            <p className="text-slate-500 text-sm mb-6">此操作無法復原。</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeletingRecordId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  deleteRecord(deletingRecordId);
                  setDeletingRecordId(null);
                }}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-medium">{instrument.name} <span className="text-slate-400 text-sm font-normal">/ {instrument.model}</span></h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 font-medium">序號：{instrument.serialNumber}</span>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-1.5 bg-red-50 text-red-600 rounded shadow-sm border border-red-100 hover:bg-red-100 text-sm font-medium transition-colors"
          >
            刪除標準件
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">歷史追溯紀錄</h3>
            <button
              onClick={() => {
                if (!isFormOpen || editingRecordId) {
                  setFormData(defaultFormData);
                  setEditingRecordId(null);
                  setIsFormOpen(true);
                } else {
                  setIsFormOpen(false);
                }
              }}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新增紀錄
            </button>
          </div>

          {isFormOpen && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">{editingRecordId ? '編輯' : '新增'}追溯紀錄</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="col-span-1 md:col-span-4">
                    <label className="block text-xs font-semibold text-slate-400 mb-2">年份</label>
                    <input required type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full md:w-1/4 bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  
                  {/* 第二行：報告編號(正溫)、截距、X變數1、X變數2 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">報告編號(正溫)</label>
                    <input required type="text" value={formData.reportNumber} onChange={e => setFormData({...formData, reportNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">截距</label>
                    <input required type="text" value={formData.interceptPos} onChange={e => setFormData({...formData, interceptPos: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">X變數1</label>
                    <input required type="text" value={formData.x1Pos} onChange={e => setFormData({...formData, x1Pos: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">X變數2</label>
                    <input required type="text" value={formData.x2Pos} onChange={e => setFormData({...formData, x2Pos: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>

                  {/* 第三行：報告編號(負溫)、截距、X變數1、X變數2 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">報告編號(負溫)</label>
                    <input type="text" value={formData.reportNumberNeg} onChange={e => setFormData({...formData, reportNumberNeg: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">截距(負溫)</label>
                    <input type="text" value={formData.interceptNeg} onChange={e => setFormData({...formData, interceptNeg: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">X變數1(負溫)</label>
                    <input type="text" value={formData.x1Neg} onChange={e => setFormData({...formData, x1Neg: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">X變數2(負溫)</label>
                    <input type="text" value={formData.x2Neg} onChange={e => setFormData({...formData, x2Neg: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>

                  {/* 第四行：R0、A、B、C */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">R0 (Ω)</label>
                    <input required type="text" value={formData.r0} onChange={e => setFormData({...formData, r0: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">A 係數</label>
                    <input required type="text" value={formData.a} onChange={e => setFormData({...formData, a: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">B 係數</label>
                    <input required type="text" value={formData.b} onChange={e => setFormData({...formData, b: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">C 係數</label>
                    <input required type="text" value={formData.c} onChange={e => setFormData({...formData, c: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => { setIsFormOpen(false); setEditingRecordId(null); }} className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors">取消</button>
                  <button type="submit" className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm transition-colors">儲存紀錄</button>
                </div>
              </form>
            </section>
          )}

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">歷史紀錄日誌</h3>
              <div className="flex gap-2">
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-medium">{instRecords.length} 筆紀錄</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6 pt-0">
              {instRecords.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-500">找不到追溯紀錄。</div>
              ) : (
                <div className="space-y-4">
                  {instRecords.map(record => (
                    <div key={record.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 relative group">
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(record)}
                          className="text-indigo-600 text-xs font-bold px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                        >
                          編輯
                        </button>
                        <button 
                          onClick={() => setDeletingRecordId(record.id)}
                          className="text-red-500 text-xs font-bold px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors"
                        >
                          刪除
                        </button>
                      </div>
                      
                      <div className="text-sm font-semibold text-slate-900 mb-2">年份：{record.year}</div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono text-slate-600 mb-2">
                        <div><span className="text-slate-400 text-xs block font-sans">報告編號(正溫)</span>{record.reportNumber}</div>
                        <div><span className="text-slate-400 text-xs block font-sans">截距</span>{record.interceptPos ?? record.offset}</div>
                        <div><span className="text-slate-400 text-xs block font-sans">X變數1</span>{record.x1Pos ?? record.slope}</div>
                        <div><span className="text-slate-400 text-xs block font-sans">X變數2</span>{record.x2Pos ?? 0}</div>
                      </div>
                      
                      {record.reportNumberNeg && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono text-slate-600 mb-2">
                          <div><span className="text-slate-400 text-xs block font-sans">報告編號(負溫)</span>{record.reportNumberNeg}</div>
                          <div><span className="text-slate-400 text-xs block font-sans">截距</span>{record.interceptNeg}</div>
                          <div><span className="text-slate-400 text-xs block font-sans">X變數1</span>{record.x1Neg}</div>
                          <div><span className="text-slate-400 text-xs block font-sans">X變數2</span>{record.x2Neg}</div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono text-slate-600 border-t border-slate-200 pt-3 mt-3">
                        <div><span className="text-slate-400 text-xs block font-sans">R0 (Ω)</span>{record.r0}</div>
                        <div><span className="text-slate-400 text-xs block font-sans">A 係數</span>{record.a.toExponential(4)}</div>
                        <div><span className="text-slate-400 text-xs block font-sans">B 係數</span>{record.b.toExponential(4)}</div>
                        <div><span className="text-slate-400 text-xs block font-sans">C 係數</span>{record.c.toExponential(4)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
