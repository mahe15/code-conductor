import React from 'react';
import { TaskMilestone } from '../../types/ipc';
import { Clock, CheckCircle2, Loader2, Circle } from 'lucide-react';

const mockTasks: TaskMilestone[] = [
  { id: 't1', title: 'Project Scaffolding & Dependencies', category: 'UI', status: 'completed' },
  { id: 't2', title: 'SQLite Database Schema Initialization', category: 'Database', status: 'completed' },
  { id: 't3', title: 'Tauri IPC Bridge & Command Handlers', category: 'Database', status: 'completed' },
  { id: 't4', title: 'PTY Process Controller Spawner', category: 'UI', status: 'in_progress' },
  { id: 't5', title: 'Decision Interceptor Engine', category: 'Authentication', status: 'pending' },
  { id: 't6', title: 'Hands-Free Voice STT/TTS Engine', category: 'UI', status: 'pending' },
];

export const TimelineView: React.FC = () => {
  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>Live Project Task Timeline</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated task progress extracted from PTY stream events and Git commits.
        </p>
      </div>

      <div className="space-y-4">
        {mockTasks.map((task) => (
          <div 
            key={task.id}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {task.status === 'completed' && (
                <div className="p-2 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {task.status === 'in_progress' && (
                <div className="p-2 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 animate-spin">
                  <Loader2 className="w-4 h-4" />
                </div>
              )}
              {task.status === 'pending' && (
                <div className="p-2 rounded-full bg-slate-950 border border-slate-800 text-slate-600">
                  <Circle className="w-4 h-4" />
                </div>
              )}

              <div>
                <h3 className={`text-sm font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                  {task.title}
                </h3>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20 mt-1 inline-block">
                  {task.category}
                </span>
              </div>
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider">
              {task.status === 'completed' && <span className="text-emerald-400">Completed</span>}
              {task.status === 'in_progress' && <span className="text-indigo-400 animate-pulse">In Progress</span>}
              {task.status === 'pending' && <span className="text-slate-500">Pending</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
