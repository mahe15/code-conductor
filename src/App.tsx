import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AgentChatView } from './components/chat/AgentChatView';
import { MemoryView } from './components/memory/MemoryView';
import { TimelineView } from './components/timeline/TimelineView';
import { GitDiffViewer } from './components/git/GitDiffViewer';
import { VoiceControlBar } from './components/voice/VoiceControlBar';
import { PluginManager } from './components/plugins/PluginManager';
import { DecisionModal } from './components/decision/DecisionModal';
import { useUIStore } from './store/useUIStore';

export const App: React.FC = () => {
  const { activeTab } = useUIStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Canvas */}
        <main className="flex-1 p-4 overflow-hidden bg-[#0a0f1a]/50">
          {activeTab === 'terminal' && <AgentChatView />}
          {activeTab === 'memory' && <MemoryView />}
          {activeTab === 'timeline' && <TimelineView />}
          {activeTab === 'risk' && <GitDiffViewer />}
          {activeTab === 'voice' && <VoiceControlBar />}
          {activeTab === 'settings' && <PluginManager />}
        </main>
      </div>

      {/* Decision Modal Overlay */}
      <DecisionModal />
    </div>
  );
};

export default App;
