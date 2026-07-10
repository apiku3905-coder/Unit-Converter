import React, { useState } from 'react';
import { usePRT } from '../context/PRTContext';
import { Plus, Thermometer, ChevronRight } from 'lucide-react';

interface InstrumentsViewProps {
  onSelectInstrument: (id: string) => void;
}

export function InstrumentsView({ onSelectInstrument }: InstrumentsViewProps) {
  const { instruments, addInstrument } = usePRT();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', model: '', serialNumber: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInstrument(formData);
    setFormData({ name: '', model: '', serialNumber: '' });
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium">儀器 <span className="text-slate-400 text-sm font-normal">/ 標準件管理</span></h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增標準件
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {isAdding && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">新增儀器</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">名稱</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="例如：標準白金電阻"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">廠牌/型號</label>
                    <input
                      required
                      type="text"
                      value={formData.model}
                      onChange={e => setFormData({...formData, model: e.target.value})}
                      placeholder="例如：Fluke 5609"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">序號</label>
                    <input
                      required
                      type="text"
                      value={formData.serialNumber}
                      onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                      placeholder="例如：SN-12345"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors">取消</button>
                  <button type="submit" className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm transition-colors">儲存儀器</button>
                </div>
              </form>
            </section>
          )}

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">已註冊標準件</h3>
              <div className="flex gap-2">
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-medium">共 {instruments.length} 件</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              {instruments.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-500">尚未註冊任何儀器。</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <tbody className="text-sm divide-y divide-slate-50 font-mono">
                    {instruments.map(inst => (
                      <tr 
                        key={inst.id}
                        onClick={() => onSelectInstrument(inst.id)}
                        className="h-16 hover:bg-slate-50 group cursor-pointer transition-colors"
                      >
                        <td className="px-6 font-semibold font-sans text-slate-900 flex items-center gap-4 h-16">
                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center">
                            <Thermometer className="w-4 h-4" />
                          </div>
                          {inst.name}
                        </td>
                        <td className="px-4 text-slate-500">{inst.model}</td>
                        <td className="px-4 text-slate-500">序號：{inst.serialNumber}</td>
                        <td className="px-4 text-right">
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
