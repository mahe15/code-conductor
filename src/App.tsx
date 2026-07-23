import React from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { TerminalView } from './components/terminal/TerminalView';
import { MemoryView } from './components/memory/MemoryView';
import { TimelineView } from './components/timeline/TimelineView';
import { DecisionModal } from './components/decision/DecisionModal';
import { useUIStore } from './store/useUIStore';

export const App: React.FC = () => {
  const { activeTab } = useUIStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Top Navigation Header */}
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main View Area */}
        <main className="flex-1 p-4 overflow-hidden bg-[#0a0f1a]/50">
          {activeTab === 'terminal' && <TerminalView />}
          {activeTab === 'memory' && <MemoryView />}
          {activeTab === 'timeline' && <TimelineView />}
          {activeTab === 'risk' && (
            <div className="h-full flex items-center justify-center text-slate-400 font-mono text-xs">
              [Risk Guard Module Active: Zero Dangerous Commands Intercepted]
            </div>
          )}
          {activeTab === 'voice' && (
            <div className="h-full flex items-center justify-center text-slate-400 font-mono text-xs">
              [Voice Control Module Active: Listening for Speech Input]
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="h-full flex items-center justify-center text-slate-400 font-mono text-xs">
              [Orchestrator System Configuration & Plugins]
            </div>
          )}
        </main>
      </div>

      {/* Decision Interception Modal Overlay */}
      <DecisionModal />
    </div>
  );
};

export default App;
