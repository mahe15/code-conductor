import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { TerminalView } from './components/terminal/TerminalView';
import { MemoryView } from './components/memory/MemoryView';
import { TimelineView } from './components/timeline/TimelineView';
import { GitDiffViewer } from './components/git/GitDiffViewer';
import { VoiceControlBar } from './components/voice/VoiceControlBar';
import { SessionReplayer } from './components/replay/SessionReplayer';
import { PluginManager } from './components/plugins/PluginManager';
import { DecisionModal } from './components/decision/DecisionModal';
import { DangerModal } from './components/risk/DangerModal';
import { RiskAlert } from './services/riskGuard';
import { useUIStore } from './store/useUIStore';

export const App: React.FC = () => {
  const { activeTab } = useUIStore();
  const [activeDangerAlert, setActiveDangerAlert] = useState<RiskAlert | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Top Header */}
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main View Container */}
        <main className="flex-1 p-4 overflow-hidden bg-[#0a0f1a]/50">
          {activeTab === 'terminal' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex-1">
                <TerminalView />
              </div>
              {/* Embedded Session Replayer */}
              <div className="shrink-0">
                <SessionReplayer />
              </div>
            </div>
          )}
          {activeTab === 'memory' && <MemoryView />}
          {activeTab === 'timeline' && <TimelineView />}
          {activeTab === 'risk' && <GitDiffViewer />}
          {activeTab === 'voice' && <VoiceControlBar />}
          {activeTab === 'settings' && <PluginManager />}
        </main>
      </div>

      {/* Decision Interceptor Modal Overlay */}
      <DecisionModal />

      {/* Red Alert Danger Modal Overlay */}
      <DangerModal
        alert={activeDangerAlert}
        onApprove={() => setActiveDangerAlert(null)}
        onDeny={() => setActiveDangerAlert(null)}
      />
    </div>
  );
};

export default App;
