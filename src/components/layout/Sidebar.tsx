import React from 'react';
import { useUIStore, ActiveTab } from '../../store/useUIStore';
import { 
  Terminal, 
  Cpu, 
  Clock, 
  ShieldAlert, 
  Mic, 
  Settings, 
  Layers 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'terminal', label: 'Terminal PTY', icon: Terminal },
    { id: 'memory', label: 'Architecture Memory', icon: Cpu },
    { id: 'timeline', label: 'Live Timeline', icon: Clock },
    { id: 'risk', label: 'Risk Guard', icon: ShieldAlert },
    { id: 'voice', label: 'Voice Control', icon: Mic },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0a0f1a] flex flex-col justify-between p-3 select-none">
      {/* Top Brand Logo */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-wide">Orchestrator</h1>
            <p className="text-[10px] text-indigo-400 font-medium">Stop AI Guessing</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom System Resource / Summary Widget */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-400 text-[11px]">
          <span>Decision Confidence</span>
          <span className="font-bold text-emerald-400">100%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full w-full" />
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          All architectural choices verified by memory.
        </p>
      </div>
    </aside>
  );
};
