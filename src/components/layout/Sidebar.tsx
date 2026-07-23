import React from 'react';
import { useUIStore, ActiveTab } from '../../store/useUIStore';
import { 
  Bot, 
  Cpu, 
  Clock, 
  ShieldAlert, 
  Mic, 
  Settings, 
  Layers, 
  Sparkles,
  GitBranch
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'terminal', label: 'AI Studio Workspace', icon: Bot },
    { id: 'memory', label: 'Architecture Memory', icon: Cpu },
    { id: 'timeline', label: 'Live Timeline', icon: Clock },
    { id: 'risk', label: 'Risk & Git Guard', icon: GitBranch },
    { id: 'voice', label: 'Voice Control Studio', icon: Mic },
    { id: 'settings', label: 'Plugins & Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0a0f1a] flex flex-col justify-between p-4 select-none">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-wide">Orchestrator</h1>
            <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Code Conductor</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">Studio Modules</span>
          <nav className="space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-white border border-indigo-500/40 shadow-lg shadow-indigo-600/10'
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
      </div>

      {/* Decision Confidence Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-400 text-[11px]">
          <span className="font-medium">Decision Confidence</span>
          <span className="font-bold text-emerald-400">100% Verified</span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full w-full" />
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          AI Agent assumptions are intercepted & locked in memory.
        </p>
      </div>
    </aside>
  );
};
