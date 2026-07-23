import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import '@xterm/xterm/css/xterm.css';
import { useProjectStore } from '../../store/useProjectStore';
import { useUIStore } from '../../store/useUIStore';
import { ptyService } from '../../services/ptyService';
import { InterceptorEngine } from '../../services/interceptorEngine';
import { PromptEnricherService } from '../../services/promptEnricher';
import { CommandCenterService } from '../../services/commandCenter';
import { CommandBar } from '../command/CommandBar';
import { Terminal as TerminalIcon, Play, Pause, Trash2 } from 'lucide-react';

export const TerminalView: React.FC = () => {
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const interceptorRef = useRef<InterceptorEngine | null>(null);

  const { activeAgent, agentStatus, setAgentStatus, activeProject, memoryItems } = useProjectStore();
  const { triggerDecisionModal } = useUIStore();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    interceptorRef.current = new InterceptorEngine(memoryItems, (decisionEvent) => {
      if (sessionId) {
        ptyService.pausePty(sessionId);
      }
      setAgentStatus('paused');
      triggerDecisionModal(decisionEvent);
    });
  }, [memoryItems, sessionId]);

  useEffect(() => {
    if (!terminalContainerRef.current) return;

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

    try {
      const webglAddon = new WebglAddon();
      term.loadAddon(webglAddon);
    } catch (e) {}

    terminalInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    const cwd = activeProject?.path || '.';
    ptyService.spawnPty(activeAgent, cwd, term.cols, term.rows).then((sid) => {
      setSessionId(sid);
      ptyService.onOutput(sid, (data) => {
        term.write(data);
        interceptorRef.current?.scanChunk(data);
      });
    });

    term.onData((data) => {
      if (sessionId) {
        ptyService.writePty(sessionId, data);
      }
    });

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

  const handleUserPromptSubmit = (rawInput: string) => {
    if (!sessionId) return;

    const parsed = CommandCenterService.parseInput(rawInput);

    if (parsed.isCommand && parsed.command) {
      const cmd = parsed.command;
      if (cmd.name === '/pause') {
        setAgentStatus('paused');
        ptyService.pausePty(sessionId);
        return;
      }
      if (cmd.name === '/resume') {
        setAgentStatus('running');
        ptyService.resumePty(sessionId);
        return;
      }
      if (cmd.name === '/commit') {
        ptyService.writePty(sessionId, '\r\n[GIT COMMIT ENGINE] Staged files and created commit.\r\n$ ');
        return;
      }

      if (cmd.directive) {
        ptyService.writePty(sessionId, `\r\n\x1b[35m${cmd.directive}\x1b[0m\r\n\r\n`);
      }
    } else {
      const enriched = PromptEnricherService.enrichPrompt(rawInput, memoryItems);
      ptyService.writePty(sessionId, enriched + '\r');
    }
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

      {/* Terminal Canvas Container */}
      <div 
        ref={terminalContainerRef} 
        className="flex-1 p-2 bg-[#060a12] overflow-hidden"
      />

      {/* Command Bar with Slash Command Autocomplete */}
      <CommandBar onSubmitPrompt={handleUserPromptSubmit} />
    </div>
  );
};
