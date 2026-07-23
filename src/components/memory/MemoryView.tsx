import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { Cpu, ShieldCheck, Lock, Plus, FileCode2, CheckCircle2 } from 'lucide-react';

export const MemoryView: React.FC = () => {
  const { memoryItems, setMemoryItem } = useProjectStore();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newValue) return;
    setMemoryItem(newKey, newValue);
    setNewKey('');
    setNewValue('');
    setIsAdding(false);
  };

  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>Architecture Memory Store</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Established project technical choices. AI coding agents will never guess or deviate from these locked decisions.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Decision</span>
          </button>
        </div>
      </div>

      {/* Manual Add Form */}
      {isAdding && (
        <form onSubmit={handleAddMemory} className="p-4 bg-slate-900 border border-indigo-500/30 rounded-xl space-y-3">
          <h3 className="text-xs font-semibold text-indigo-300">Lock New Architectural Choice</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Key (e.g. stack.auth)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <input
              type="text"
              placeholder="Value (e.g. Supabase Auth)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium"
            >
              Save & Lock Decision
            </button>
          </div>
        </form>
      )}

      {/* Memory Key-Value Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memoryItems.map((item) => (
          <div 
            key={item.id}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition space-y-3 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-indigo-400">{item.key}</span>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" />
                <span className="text-[10px] font-semibold uppercase">Locked</span>
              </div>
            </div>

            <div className="text-lg font-bold text-slate-100">
              {item.value}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
              <span>Confidence Score: 100%</span>
              <span className="flex items-center space-x-1 text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified Choice</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
