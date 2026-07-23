import React from 'react';
import { CostWarning } from '../../services/costEstimator';
import { DollarSign, Zap, CheckCircle2 } from 'lucide-react';

interface CostWarningWidgetProps {
  warning: CostWarning;
  onApplyAlternative: (alternative: string) => void;
}

export const CostWarningWidget: React.FC<CostWarningWidgetProps> = ({ warning, onApplyAlternative }) => {
  if (!warning.hasWarning) return null;

  return (
    <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-3">
      <div className="flex items-center space-x-2 text-xs font-semibold text-amber-300">
        <DollarSign className="w-4 h-4 text-amber-400" />
        <span>Cost-Awareness Advisory</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Proposed Infra</span>
          <div className="font-semibold text-slate-200 mt-1">{warning.proposedTech}</div>
          <div className="text-amber-400 font-mono mt-1">{warning.estimatedMonthlyCost}</div>
        </div>

        <div className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-500/30">
          <span className="text-[10px] text-emerald-400 uppercase font-bold">Budget Alternative</span>
          <div className="font-semibold text-slate-200 mt-1">{warning.recommendedAlternative}</div>
          <div className="text-emerald-400 font-mono mt-1">{warning.recommendedCost}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-emerald-300 font-medium">{warning.savingsMessage}</span>
        <button
          onClick={() => onApplyAlternative(warning.recommendedAlternative)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Enforce Budget Infra</span>
        </button>
      </div>
    </div>
  );
};
