import React, { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useProjectStore } from '../../store/useProjectStore';
import { Sparkles, ShieldAlert, Check, ArrowRight } from 'lucide-react';

export const DecisionModal: React.FC = () => {
  const { isDecisionModalOpen, setDecisionModalOpen, activeDecisionEvent } = useUIStore();
  const { setMemoryItem, setAgentStatus } = useProjectStore();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');

  if (!isDecisionModalOpen || !activeDecisionEvent) return null;

  const handleResolveChoice = (option: string) => {
    const finalChoice = option === 'Other' ? customInput : option;
    if (!finalChoice) return;

    // Save decision to Project Memory
    setMemoryItem(`stack.${activeDecisionEvent.category.toLowerCase()}`, finalChoice);
    
    // Set Agent to Running state
    setAgentStatus('running');

    // Close Modal
    setDecisionModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0f172a] border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-6 glow-indigo animate-in fade-in zoom-in duration-200">
        {/* Warning Banner */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">AI Assumption Intercepted: </span>
            <span>AI agent was about to assume <strong className="text-white underline">{activeDecisionEvent.detected_assumption}</strong>.</span>
          </div>
        </div>

        {/* Question Header */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>High-Impact Clarification Question</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            {activeDecisionEvent.question_prompt}
          </h2>
        </div>

        {/* Option Cards */}
        <div className="grid grid-cols-2 gap-3">
          {activeDecisionEvent.suggested_options.map((option: string) => {
            const isSelected = selectedOption === option;
            return (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex justify-between items-center w-full mb-2">
                  <span className="font-semibold text-sm">{option}</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">Lock decision into project memory</span>
              </button>
            );
          })}
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end items-center space-x-3 pt-4 border-t border-slate-800">
          <button
            disabled={!selectedOption}
            onClick={() => handleResolveChoice(selectedOption)}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
              selectedOption
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Confirm & Inject Decision</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
