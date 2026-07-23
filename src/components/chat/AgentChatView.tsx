import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useUIStore } from '../../store/useUIStore';
import { ptyService } from '../../services/ptyService';
import { PromptEnricherService } from '../../services/promptEnricher';
import { InterceptorEngine } from '../../services/interceptorEngine';
import { GeminiService } from '../../services/geminiService';
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
  Key, 
  CheckCircle2, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'orchestrator' | 'agent';
  text: string;
  timestamp: string;
}

export const AgentChatView: React.FC = () => {
  const { activeAgent, agentStatus, setAgentStatus, activeProject, memoryItems, setMemoryItem } = useProjectStore();
  const { triggerDecisionModal } = useUIStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<'chat' | 'terminal'>('chat');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [geminiKeyInput, setGeminiKeyInput] = useState<string>(GeminiService.getApiKey());
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
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
      text: `Hello! I am your AI Coding Orchestrator powered by **Gemini 2.5 Flash API** and **${activeAgent}**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'msg-2',
      sender: 'orchestrator',
      text: `All architectural decisions (React 19, TypeScript, Tailwind CSS v4, SQLite) are locked into project memory. Type **/addkey <key>** or click the key button to configure your Gemini API key.`,
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

  const handleSendMessage = async (rawInput: string) => {
    if (!sessionId) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Handle /addkey or /apikey slash command
    if (rawInput.startsWith('/addkey') || rawInput.startsWith('/apikey')) {
      const parts = rawInput.split(' ');
      const keyArg = parts.slice(1).join(' ').trim();
      if (keyArg) {
        GeminiService.setApiKey(keyArg);
        setGeminiKeyInput(keyArg);
        setMessages((prev) => [
          ...prev,
          { id: `usr-${Date.now()}`, sender: 'user', text: rawInput, timestamp: timeStr },
          { id: `sys-${Date.now()}`, sender: 'orchestrator', text: `✔ Gemini API Key saved successfully!`, timestamp: timeStr },
        ]);
      } else {
        setShowKeyModal(true);
      }
      return;
    }

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
    }

    // 4. Send to PTY & Query Gemini API
    setAgentStatus('running');
    const enriched = PromptEnricherService.enrichPrompt(rawInput, memoryItems);
    ptyService.writePty(sessionId, enriched + '\r');

    // Query Gemini 2.5 Flash API
    const responseText = await GeminiService.generateContent(rawInput, memoryItems);

    const agentMsg: ChatMessage = {
      id: `agent-${Date.now()}`,
      sender: 'orchestrator',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, agentMsg]);
    setAgentStatus('idle');
  };

  const handleSaveApiKey = () => {
    GeminiService.setApiKey(geminiKeyInput.trim());
    setShowKeyModal(false);
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
              <h2 className="font-bold text-sm text-slate-100">Gemini 2.5 Flash Orchestrator</h2>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/30">
                Gemini API Enabled
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Guarding architecture & preventing wrong assumptions</p>
          </div>
        </div>

        {/* View Mode Switcher & API Key Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-indigo-300 transition"
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>{GeminiService.getApiKey() ? 'API Key Configured' : 'Set Gemini API Key'}</span>
          </button>

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

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
              <Key className="w-5 h-5" />
              <span>Set Gemini API Key</span>
            </div>
            <p className="text-xs text-slate-300">
              Enter your Google Gemini API Key or type <strong className="text-indigo-400">/addkey &lt;key&gt;</strong> in prompt bar.
            </p>
            <input
              type="password"
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 space-y-2 text-xs leading-relaxed border ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-slate-100 shadow-xl shadow-indigo-600/10'
                    : 'bg-[#121929] border-slate-800 text-slate-200 shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pb-1 border-b border-slate-800/60">
                  <span className="font-semibold text-slate-300">
                    {msg.sender === 'user' ? 'Developer' : 'Gemini 2.5 Flash Orchestrator'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap font-sans text-sm">{msg.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex-1 p-4 bg-[#060a12] font-mono text-xs text-slate-200 overflow-y-auto space-y-1">
          {rawLogs.map((log, idx) => (
            <div key={idx} className="whitespace-pre-wrap leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Command Input Bar */}
      <div className="shrink-0">
        <CommandBar onSubmitPrompt={handleSendMessage} placeholder="Enter prompt or /addkey <key> to save Gemini API key..." />
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
