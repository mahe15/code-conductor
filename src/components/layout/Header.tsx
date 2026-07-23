import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useUIStore } from '../../store/useUIStore';
import { 
  FolderGit2, 
  Bot, 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  Sparkles, 
  Layers, 
  Cpu 
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
    <header className="h-16 border-b border-slate-800/80 bg-[#0c121e]/90 backdrop-blur-xl px-5 flex items-center justify-between z-20 shadow-lg">
      {/* Left: Project Selector & Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-inner">
          <FolderGit2 className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">{activeProject?.name || 'Code Conductor'}</span>
          <span className="text-[10px] text-slate-500 font-mono hidden md:inline">({activeProject?.path})</span>
        </div>

        {/* Active Agent Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-300">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span className="font-medium text-slate-300">Agent:</span>
          <select 
            value={activeAgent}
            onChange={(e) => setActiveAgent(e.target.value as any)}
            className="bg-transparent font-semibold focus:outline-none cursor-pointer text-indigo-200"
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
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium border bg-slate-900/90 border-slate-800 shadow-md">
          <span className={`w-2.5 h-2.5 rounded-full ${
            agentStatus === 'running' ? 'bg-emerald-400 animate-pulse' :
            agentStatus === 'paused' ? 'bg-amber-400 animate-ping' : 'bg-slate-500'
          }`} />
          <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold">
            Status: <span className="text-slate-200">{agentStatus}</span>
          </span>
        </div>

        {/* Process Action Controls */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
          {agentStatus !== 'running' ? (
            <button 
              onClick={() => setAgentStatus('running')}
              className="p-1.5 rounded-lg hover:bg-emerald-950/80 text-emerald-400 transition"
              title="Start / Resume Execution"
            >
              <Play className="w-4 h-4 fill-emerald-400/20" />
            </button>
          ) : (
            <button 
              onClick={() => setAgentStatus('paused')}
              className="p-1.5 rounded-lg hover:bg-amber-950/80 text-amber-400 transition"
              title="Pause Agent (SIGSTOP)"
            >
              <Pause className="w-4 h-4 fill-amber-400/20" />
            </button>
          )}
          <button 
            onClick={() => setAgentStatus('idle')}
            className="p-1.5 rounded-lg hover:bg-rose-950/80 text-rose-400 transition"
            title="Terminate Process"
          >
            <Square className="w-4 h-4 fill-rose-400/20" />
          </button>
        </div>
      </div>

      {/* Right: Demo Trigger & Voice Toggle */}
      <div className="flex items-center space-x-3">
        {/* Interception Simulation Trigger */}
        <button
          onClick={handleSimulateAssumption}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-lg shadow-indigo-600/30"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulate Interception</span>
        </button>

        {/* Voice Mode Toggle */}
        <button
          onClick={() => setVoiceModeActive(!isVoiceModeActive)}
          className={`p-2 rounded-xl border transition ${
            isVoiceModeActive 
              ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/20 animate-pulse' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={isVoiceModeActive ? 'Voice Mode Active' : 'Enable Voice Mode'}
        >
          {isVoiceModeActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
