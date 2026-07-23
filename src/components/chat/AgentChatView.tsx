import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useUIStore } from '../../store/useUIStore';
import { ptyService } from '../../services/ptyService';
import { PromptEnricherService } from '../../services/promptEnricher';
import { InterceptorEngine } from '../../services/interceptorEngine';
import { CommandBar } from '../command/CommandBar';
import { CostWarningWidget } from '../cost/CostWarningWidget';
import { CostEstimatorService, CostWarning } from '../../services/costEstimator';
import { RiskGuardService, RiskAlert } from '../../services/riskGuard';
import { DangerModal } from '../risk/DangerModal';
import { 
  Bot, 
  User, 
  Sparkles, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Play, 
  Pause, 
  RotateCcw 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'orchestrator' | 'agent';
  text: string;
  timestamp: string;
  codeBlock?: string;
  isDecision?: boolean;
}

export const AgentChatView: React.FC = () => {
  const { activeAgent, agentStatus, setAgentStatus, activeProject, memoryItems, setMemoryItem } = useProjectStore();
  const { triggerDecisionModal } = useUIStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<'chat' | 'terminal'>('chat');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeDangerAlert, setActiveDangerAlert] = useState<RiskAlert | null>(null);
  const [activeCostWarning, setActiveCostWarning] = useState<CostWarning>({
    hasWarning: false,
    proposedTech: '',
    estimatedMonthlyCost: '',
    recommendedAlternative: '',
    recommendedCost: '',
    savingsMessage: '',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'orchestrator',
      text: `Hello! I am your AI Coding Orchestrator. I coordinate **${activeAgent}** for project **${activeProject?.name || 'Code Conductor'}**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'msg-2',
      sender: 'orchestrator',
      text: `All architectural decisions (React 19, TypeScript, Tailwind CSS v4, SQLite) are locked into memory. I will prevent the AI from guessing or making unverified assumptions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [rawLogs, setRawLogs] = useState<string[]>([
    '[AI Orchestrator PTY Log Stream Initialized]',
    `Project: ${activeProject?.name} (${activeProject?.path})`,
    `Agent Adapter: ${activeAgent}`,
  ]);

  useEffect(() => {
    const cwd = activeProject?.path || '.';
    ptyService.spawnPty(activeAgent, cwd).then((sid) => {
      setSessionId(sid);
      ptyService.onOutput(sid, (data) => {
        setRawLogs((prev) => [...prev, data]);
      });
    });
  }, [activeAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (rawInput: string) => {
    if (!sessionId) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: rawInput,
      timestamp: timeStr,
    };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Risk Check
    const riskCheck = RiskGuardService.inspectCommand(rawInput);
    if (riskCheck.isDangerous) {
      ptyService.pausePty(sessionId);
      setAgentStatus('paused');
      setActiveDangerAlert(riskCheck);
      return;
    }

    // 3. Cost Warning Check
    const costCheck = CostEstimatorService.evaluateArchitectureCost(rawInput);
    if (costCheck.hasWarning) {
      setActiveCostWarning(costCheck);
    } else {
      setActiveCostWarning({ hasWarning: false, proposedTech: '', estimatedMonthlyCost: '', recommendedAlternative: '', recommendedCost: '', savingsMessage: '' });
    }

    // 4. Send to PTY
    setAgentStatus('running');
    const enriched = PromptEnricherService.enrichPrompt(rawInput, memoryItems);
    ptyService.writePty(sessionId, enriched + '\r');

    // 5. Simulate Orchestrator AI Response
    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'orchestrator',
        text: `Executing task with **${activeAgent}**. Enforcing locked project decisions: **React + TypeScript + Tailwind v4 + SQLite**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeBlock: `// Enforced Architecture Context\nconst config = {\n  framework: "React 19",\n  styling: "Tailwind CSS v4",\n  database: "SQLite",\n  orchestration: "Antigravity PTY"\n};`,
      };
      setMessages((prev) => [...prev, agentMsg]);
      setAgentStatus('idle');
    }, 800);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="h-full flex flex-col bg-[#090d16] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Top Studio Bar */}
      <div className="h-14 bg-[#0d1424]/90 border-b border-slate-800/80 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm text-slate-100">{activeAgent}</h2>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/30">
                Orchestrated Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Guarding architecture & preventing wrong assumptions</p>
          </div>
        </div>

        {/* View Mode Switcher (Studio vs PTY Console) */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('chat')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                viewMode === 'chat'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Studio</span>
            </button>
            <button
              onClick={() => setViewMode('terminal')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                viewMode === 'terminal'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Raw PTY Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cost Advisory Alert */}
      {activeCostWarning.hasWarning && (
        <div className="p-3 bg-amber-950/60 border-b border-amber-500/40">
          <CostWarningWidget
            warning={activeCostWarning}
            onApplyAlternative={(alt) => {
              setMemoryItem('deployment.infra', alt);
              handleSendMessage(`Enforce budget-friendly infrastructure: "${alt}"`);
              setActiveCostWarning({ hasWarning: false, proposedTech: '', estimatedMonthlyCost: '', recommendedAlternative: '', recommendedCost: '', savingsMessage: '' });
            }}
          />
        </div>
      )}

      {/* Main Chat Canvas */}
      {viewMode === 'chat' ? (
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-[#090d16] to-[#0d1424]/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3.5 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Card */}
              <div
                className={`max-w-2xl rounded-2xl p-4 space-y-2 text-xs leading-relaxed border ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-slate-100 shadow-xl shadow-indigo-600/10'
                    : 'bg-[#121929] border-slate-800 text-slate-200 shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pb-1 border-b border-slate-800/60">
                  <span className="font-semibold text-slate-300">
                    {msg.sender === 'user' ? 'Developer' : 'AI Orchestrator'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap font-sans text-sm">{msg.text}</div>

                {/* Code Block if present */}
                {msg.codeBlock && (
                  <div className="mt-2 rounded-xl bg-slate-950 p-3 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                    <pre>{msg.codeBlock}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        /* Raw Terminal Logs Mode */
        <div className="flex-1 p-4 bg-[#060a12] font-mono text-xs text-slate-200 overflow-y-auto space-y-1">
          {rawLogs.map((log, idx) => (
            <div key={idx} className="whitespace-pre-wrap leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Quick Suggestion Chips */}
      <div className="px-5 py-2 bg-[#0a0f1a] border-t border-slate-800/60 flex items-center space-x-2 overflow-x-auto">
        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Quick Directives:</span>
        {[
          'Build User Authentication',
          'Setup PostgreSQL Database',
          'Add Tailwind v4 Component',
          'Export ADR Records',
          'Run Security Audit',
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => handleQuickPrompt(chip)}
            className="px-3 py-1 bg-slate-900 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/40 text-slate-300 text-xs rounded-full shrink-0 transition"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Command Input Bar */}
      <div className="shrink-0">
        <CommandBar onSubmitPrompt={handleSendMessage} placeholder="Describe feature or slash command (/production, /simple, /commit)..." />
      </div>

      {/* Danger Modal */}
      <DangerModal
        alert={activeDangerAlert}
        onApprove={() => {
          if (sessionId && activeDangerAlert) {
            ptyService.writePty(sessionId, `[AUTHORIZED]: ${activeDangerAlert.command}\r`);
            ptyService.resumePty(sessionId);
            setAgentStatus('running');
          }
          setActiveDangerAlert(null);
        }}
        onDeny={() => {
          if (sessionId) {
            ptyService.resumePty(sessionId);
            setAgentStatus('running');
          }
          setActiveDangerAlert(null);
        }}
      />
    </div>
  );
};
