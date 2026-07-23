import React, { useState, useEffect } from 'react';
import { SessionReplayService, RecordedEvent } from '../../services/sessionReplay';
import { Play, Pause, RotateCcw, FastForward, Film } from 'lucide-react';

export const SessionReplayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState(0);
  const service = new SessionReplayService();
  const events = service.getEvents();

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, events.length]);

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-200">
          <Film className="w-4 h-4 text-violet-400" />
          <span>Time-Machine Session Replayer</span>
        </div>

        {/* Player Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setCurrentStep(0)}
            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] text-indigo-300"
          >
            <option value={1}>1x Speed</option>
            <option value={2}>2x Speed</option>
            <option value={4}>4x Speed</option>
          </select>
        </div>
      </div>

      {/* Scrub Bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 relative">
        <div
          className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-200"
          style={{ width: `${((currentStep + 1) / events.length) * 100}%` }}
        />
      </div>

      {/* Replay Stream Box */}
      <div className="p-3 bg-[#060a12] rounded-lg border border-slate-800/80 text-slate-300 space-y-1">
        {events.slice(0, currentStep + 1).map((ev, idx) => (
          <div key={idx} className="whitespace-pre-wrap leading-relaxed">
            {ev.content}
          </div>
        ))}
      </div>
    </div>
  );
};
