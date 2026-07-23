import React, { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { TextToSpeechService } from '../../services/voice/tts';
import { SpeechToTextService } from '../../services/voice/stt';
import { AudioWaveform } from './AudioWaveform';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';

export const VoiceControlBar: React.FC = () => {
  const { isVoiceModeActive, setVoiceModeActive } = useUIStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleTestSpeech = () => {
    TextToSpeechService.speak('AI Coding Orchestrator Voice Mode active. Please state your architectural preference.');
  };

  const handleListenToggle = () => {
    const stt = new SpeechToTextService();
    if (!isListening) {
      setIsListening(true);
      stt.startListening(
        (text) => {
          setTranscript(text);
          setIsListening(false);
        },
        () => setIsListening(false)
      );
    } else {
      stt.stopListening();
      setIsListening(false);
    }
  };

  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Mic className="w-5 h-5 text-cyan-400" />
            <span>Hands-Free Voice Control Suite</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Answer agent clarification questions using spoken voice commands away from your keyboard.
          </p>
        </div>

        <button
          onClick={handleTestSpeech}
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
        >
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span>Test Speech Synthesizer</span>
        </button>
      </div>

      {/* Main Voice Orb Visualizer */}
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center space-y-4">
        <AudioWaveform isListening={isListening} />

        <button
          onClick={handleListenToggle}
          className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isListening ? 'Stop Listening' : 'Start Voice Listening'}</span>
        </button>

        {transcript && (
          <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 text-xs text-cyan-300 font-mono">
            Captured Voice: "{transcript}"
          </div>
        )}
      </div>
    </div>
  );
};
