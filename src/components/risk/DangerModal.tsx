import React, { useState } from 'react';
import { RiskAlert } from '../../services/riskGuard';
import { AlertTriangle, ShieldAlert, XCircle, CheckCircle2 } from 'lucide-react';

interface DangerModalProps {
  alert: RiskAlert | null;
  onApprove: () => void;
  onDeny: () => void;
}

export const DangerModal: React.FC<DangerModalProps> = ({ alert, onApprove, onDeny }) => {
  const [confirmInput, setConfirmInput] = useState('');

  if (!alert || !alert.isDangerous) return null;

  const requiresTyping = alert.riskLevel === 'CRITICAL';
  const isApprovedDisabled = requiresTyping && confirmInput.trim() !== 'CONFIRM';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#18080a] border-2 border-rose-600 rounded-2xl p-6 shadow-2xl space-y-6 glow-rose animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 animate-bounce" />
          <div>
            <h2 className="font-bold text-sm text-rose-100">CRITICAL SAFETY INTERCEPTOR</h2>
            <p className="text-[11px] text-rose-300">Dangerous Terminal Command Detected</p>
          </div>
        </div>

        {/* Reason & Command Box */}
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {alert.reason}
          </p>

          <div className="p-3 bg-slate-950 rounded-xl border border-rose-950/60 font-mono text-xs text-rose-400 break-all">
            $ {alert.command}
          </div>
        </div>

        {/* Confirmation Input if Critical */}
        {requiresTyping && (
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Type <strong className="text-rose-400">CONFIRM</strong> to authorize execution:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="CONFIRM"
              className="w-full bg-slate-950 border border-rose-900/60 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end items-center space-x-3 pt-4 border-t border-rose-950/80">
          <button
            onClick={onDeny}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>Block & Cancel Command</span>
          </button>
          <button
            disabled={isApprovedDisabled}
            onClick={onApprove}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
              isApprovedDisabled
                ? 'bg-rose-950 text-rose-700 cursor-not-allowed border border-rose-900/40'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 cursor-pointer'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Authorize Execution</span>
          </button>
        </div>
      </div>
    </div>
  );
};
