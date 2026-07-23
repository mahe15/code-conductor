import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import '@xterm/xterm/css/xterm.css';
import { useProjectStore } from '../../store/useProjectStore';
import { ptyService } from '../../services/ptyService';
import { Terminal as TerminalIcon, Play, Pause, Trash2, Send, Cpu } from 'lucide-react';

export const TerminalView: React.FC = () => {
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { activeAgent, agentStatus, setAgentStatus, activeProject } = useProjectStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputPrompt, setInputPrompt] = useState('');

  useEffect(() => {
    if (!terminalContainerRef.current) return;

    // Initialize Xterm.js Terminal
    const term = new Terminal({
      theme: {
        background: '#060a12',
        foreground: '#f8fafc',
        cursor: '#6366f1',
        selectionBackground: '#334155',
        black: '#090d16',
        red: '#f43f5e',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#f8fafc',
      },
      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
      fontSize: 13,
      lineHeight: 1.3,
      cursorBlink: true,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalContainerRef.current);
    fitAddon.fit();

    // Try WebGL Addon for accelerated rendering
    try {
      const webglAddon = new WebglAddon();
      term.loadAddon(webglAddon);
    } catch (e) {
      console.warn('WebGL addon fallback to canvas:', e);
    }

    terminalInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    // Spawn PTY Session
    const cwd = activeProject?.path || '.';
    ptyService.spawnPty(activeAgent, cwd, term.cols, term.rows).then((sid) => {
      setSessionId(sid);
      ptyService.onOutput(sid, (data) => {
        term.write(data);
      });
    });

    // Handle user keystrokes in terminal canvas
    term.onData((data) => {
      if (sessionId) {
        ptyService.writePty(sessionId, data);
      }
    });

    // Handle Resize
    const handleResize = () => {
      if (fitAddonRef.current && terminalInstanceRef.current && sessionId) {
        fitAddonRef.current.fit();
        ptyService.resizePty(sessionId, term.cols, term.rows);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [activeAgent]);

  const handlePauseToggle = () => {
    if (!sessionId) return;
    if (agentStatus === 'running') {
      setAgentStatus('paused');
      ptyService.pausePty(sessionId);
    } else {
      setAgentStatus('running');
      ptyService.resumePty(sessionId);
    }
  };

  const handleClear = () => {
    terminalInstanceRef.current?.clear();
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || !sessionId) return;

    ptyService.writePty(sessionId, inputPrompt + '\r');
    setInputPrompt('');
  };

  return (
    <div className="h-full flex flex-col bg-[#080d17] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="h-10 bg-[#0d1424] border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
          <TerminalIcon className="w-4 h-4 text-indigo-400" />
          <span>Interactive PTY Stream ({activeAgent})</span>
          {sessionId && <span className="text-[10px] text-slate-500 font-mono">[{sessionId}]</span>}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePauseToggle}
            className={`px-2 py-1 rounded text-xs flex items-center space-x-1 border transition ${
              agentStatus === 'running'
                ? 'bg-amber-950/60 border-amber-500/30 text-amber-300 hover:bg-amber-900/80'
                : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/80'
            }`}
          >
            {agentStatus === 'running' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{agentStatus === 'running' ? 'Pause Process' : 'Resume Process'}</span>
          </button>
          <button
            onClick={handleClear}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Xterm.js Canvas Container */}
      <div 
        ref={terminalContainerRef} 
        className="flex-1 p-2 bg-[#060a12] overflow-hidden"
      />

      {/* Prompt Bar */}
      <form onSubmit={handleSendPrompt} className="p-3 bg-[#0d1424] border-t border-slate-800 flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-slate-500 text-xs font-mono px-2">
          <span className="text-indigo-400">$</span>
        </div>
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Send command to agent PTY..."
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
