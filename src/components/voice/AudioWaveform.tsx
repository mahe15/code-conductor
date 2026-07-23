import React from 'react';
import { Mic } from 'lucide-react';

interface AudioWaveformProps {
  isListening: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isListening }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      {/* Animated Glowing Mic Orb */}
      <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition ${
        isListening
          ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-2xl shadow-cyan-500/50 animate-pulse scale-110'
          : 'bg-slate-900 border border-slate-800'
      }`}>
        <Mic className={`w-10 h-10 ${isListening ? 'text-white' : 'text-slate-500'}`} />

        {/* Ambient Wave Rings */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" />
            <div className="absolute -inset-2 rounded-full border border-indigo-500/30 animate-pulse" />
          </>
        )}
      </div>

      <span className="text-xs font-mono text-slate-300">
        {isListening ? '🎙️ Ambient Voice Listener Active' : 'Voice Control Standby'}
      </span>
    </div>
  );
};
