import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { Terminal as TerminalIcon, Send, Play, Pause, Trash2, ShieldCheck, Zap } from 'lucide-react';

export const TerminalView: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { activeAgent, agentStatus, setAgentStatus, activeProject } = useProjectStore();
  const [inputPrompt, setInputPrompt] = useState('');
  const [logs, setLogs] = useState<string[]>([
    '\x1b[38;2;99;102;241m[AI Orchestrator v0.1.0 Initialized]\x1b[0m',
    `Connected to project: \x1b[32m${activeProject?.name}\x1b[0m (${activeProject?.path})`,
    `Active Agent PTY Adapter: \x1b[36m${activeAgent}\x1b[0m`,
    'Ready for developer prompt or slash commands (/production, /simple, /commit, /pause)...',
    '--------------------------------------------------------------------------------',
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    const userLine = `\x1b[38;2;59;130;246m[User Input]\x1b[0m > ${inputPrompt}`;
    setLogs((prev) => [...prev, userLine]);

    // Handle Slash Commands
    if (inputPrompt.startsWith('/')) {
      const command = inputPrompt.split(' ')[0].toLowerCase();
      if (command === '/pause') {
        setAgentStatus('paused');
        setLogs((prev) => [...prev, '\x1b[33m[ORCHESTRATOR SIGNAL]\x1b[0m Sent SIGSTOP to CLI agent process. Execution PAUSED.']);
      } else if (command === '/resume') {
        setAgentStatus('running');
        setLogs((prev) => [...prev, '\x1b[32m[ORCHESTRATOR SIGNAL]\x1b[0m Sent SIGCONT to CLI agent process. Execution RESUMED.']);
      } else if (command === '/production') {
        setLogs((prev) => [...prev, '\x1b[35m[DIRECTIVE INJECTED]\x1b[0m Applied Production-Ready Directive (Strict TypeScript, error handling, rate limiting).']);
      } else if (command === '/simple') {
        setLogs((prev) => [...prev, '\x1b[35m[DIRECTIVE INJECTED]\x1b[0m Applied Minimal MVP Directive (YAGNI, minimal code, zero over-engineering).']);
      } else if (command === '/commit') {
        setLogs((prev) => [...prev, '\x1b[32m[GIT AGENT]\x1b[0m Staged changed files and created conventional commit.']);
      }
    } else {
      // Simulate Agent Output
      setAgentStatus('running');
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          `\x1b[38;2;168;85;247m[${activeAgent}]\x1b[0m Analyzing request using project architecture context...`,
          `Enforcing architectural memory: \x1b[32mReact + TypeScript + Tailwind v4 + SQLite\x1b[0m`,
          `Executing command...`,
        ]);
      }, 500);
    }

    setInputPrompt('');
  };

  const clearTerminal = () => {
    setLogs(['Terminal output cleared.']);
  };

  return (
    <div className="h-full flex flex-col bg-[#080d17] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Terminal Top Bar */}
      <div className="h-10 bg-[#0d1424] border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <TerminalIcon className="w-4 h-4 text-indigo-400" />
          <span>PTY Stream Canvas ({activeAgent})</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={clearTerminal}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Logs */}
      <div 
        ref={terminalRef} 
        className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-200 space-y-1 bg-[#060a12]"
      >
        {logs.map((log, idx) => (
          <div key={idx} className="leading-relaxed whitespace-pre-wrap">
            {log}
          </div>
        ))}
      </div>

      {/* Input Prompt Bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#0d1424] border-t border-slate-800 flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-slate-500 text-xs font-mono px-2">
          <span className="text-indigo-400">$</span>
        </div>
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Enter prompt for AI agent or slash command (/production, /simple, /commit, /pause)..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition shadow-md shadow-indigo-600/20"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
