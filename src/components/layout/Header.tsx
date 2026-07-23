import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useUIStore } from '../../store/useUIStore';
import { 
  FolderGit2, 
  Terminal, 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  Cpu, 
  Plus, 
  Sparkles 
} from 'lucide-react';

export const Header: React.FC = () => {
  const { activeProject, activeAgent, agentStatus, setAgentStatus, setActiveAgent } = useProjectStore();
  const { isVoiceModeActive, setVoiceModeActive, triggerDecisionModal } = useUIStore();

  const handleSimulateAssumption = () => {
    triggerDecisionModal({
      session_id: 'sess-123',
      category: 'Authentication',
      detected_assumption: 'Firebase Authentication',
      suggested_options: ['Supabase Auth', 'Firebase Auth', 'Auth0', 'Custom JWT'],
      question_prompt: 'AI Agent is about to configure Firebase Auth. Which authentication solution should this project use?',
    });
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0c121e]/80 backdrop-blur-md px-4 flex items-center justify-between z-20">
      {/* Left: Project Selector & Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-sm">
          <FolderGit2 className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">{activeProject?.name || 'No Project'}</span>
          <span className="text-xs text-slate-500 font-mono">({activeProject?.path})</span>
        </div>

        {/* Active Agent Badge */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-300">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Agent:</span>
          <select 
            value={activeAgent}
            onChange={(e) => setActiveAgent(e.target.value as any)}
            className="bg-transparent font-medium focus:outline-none cursor-pointer text-indigo-200"
          >
            <option value="claude-code" className="bg-slate-900 text-slate-200">Claude Code CLI</option>
            <option value="codex-cli" className="bg-slate-900 text-slate-200">Codex CLI</option>
            <option value="aider" className="bg-slate-900 text-slate-200">Aider</option>
            <option value="generic" className="bg-slate-900 text-slate-200">Generic Shell</option>
          </select>
        </div>
      </div>

      {/* Center: Agent Control Status */}
      <div className="flex items-center space-x-3">
        {/* Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border bg-slate-900/90 border-slate-800">
          <span className={`w-2 h-2 rounded-full ${
            agentStatus === 'running' ? 'bg-emerald-400 animate-pulse' :
            agentStatus === 'paused' ? 'bg-amber-400 animate-ping' : 'bg-slate-500'
          }`} />
          <span className="uppercase tracking-wider text-[10px] text-slate-400 font-semibold">
            Status: <span className="text-slate-200">{agentStatus}</span>
          </span>
        </div>

        {/* Process Action Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {agentStatus !== 'running' ? (
            <button 
              onClick={() => setAgentStatus('running')}
              className="p-1.5 rounded hover:bg-emerald-950/80 text-emerald-400 transition"
              title="Start / Resume Agent"
            >
              <Play className="w-4 h-4 fill-emerald-400/20" />
            </button>
          ) : (
            <button 
              onClick={() => setAgentStatus('paused')}
              className="p-1.5 rounded hover:bg-amber-950/80 text-amber-400 transition"
              title="Pause Agent (SIGSTOP)"
            >
              <Pause className="w-4 h-4 fill-amber-400/20" />
            </button>
          )}
          <button 
            onClick={() => setAgentStatus('idle')}
            className="p-1.5 rounded hover:bg-rose-950/80 text-rose-400 transition"
            title="Kill Agent Process"
          >
            <Square className="w-4 h-4 fill-rose-400/20" />
          </button>
        </div>
      </div>

      {/* Right: Tools & Demo Trigger */}
      <div className="flex items-center space-x-3">
        {/* Test Assumption Detector Demo */}
        <button
          onClick={handleSimulateAssumption}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-lg shadow-indigo-600/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulate Interception</span>
        </button>

        {/* Voice Mode Toggle */}
        <button
          onClick={() => setVoiceModeActive(!isVoiceModeActive)}
          className={`p-2 rounded-lg border transition ${
            isVoiceModeActive 
              ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/20 animate-pulse' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={isVoiceModeActive ? 'Voice Mode Active' : 'Enable Hands-Free Voice Mode'}
        >
          {isVoiceModeActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
