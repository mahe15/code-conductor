import React, { useState } from 'react';
import { GitBranch, GitCommit, RotateCcw, FileText, Check } from 'lucide-react';

interface ChangedFile {
  path: string;
  additions: number;
  deletions: number;
  status: 'modified' | 'added' | 'deleted';
}

const mockFiles: ChangedFile[] = [
  { path: 'src/services/riskGuard.ts', additions: 45, deletions: 0, status: 'added' },
  { path: 'src/components/terminal/TerminalView.tsx', additions: 18, deletions: 4, status: 'modified' },
  { path: 'src-tauri/src/pty/manager.rs', additions: 120, deletions: 10, status: 'modified' },
];

export const GitDiffViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ChangedFile>(mockFiles[0]);
  const [isRollbackDone, setIsRollbackDone] = useState(false);

  const handleRollback = () => {
    setIsRollbackDone(true);
    setTimeout(() => setIsRollbackDone(false), 2000);
  };

  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <span>Git Diff & Change Tracking</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track line additions, deletions, modified files, and perform one-click rollbacks.
          </p>
        </div>

        <button
          onClick={handleRollback}
          className="flex items-center space-x-1.5 px-3 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-lg transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isRollbackDone ? 'Reverted to HEAD~1!' : 'Rollback Last Commit'}</span>
        </button>
      </div>

      {/* Main Diff Grid */}
      <div className="grid grid-cols-3 gap-4 h-[500px]">
        {/* Changed Files Selector List */}
        <div className="col-span-1 bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2 overflow-y-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Changed Files ({mockFiles.length})</span>
          {mockFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                selectedFile.path === file.path
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-mono truncate">{file.path}</span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] font-mono shrink-0">
                <span className="text-emerald-400">+{file.additions}</span>
                <span className="text-rose-400">-{file.deletions}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Visual Line Diff View */}
        <div className="col-span-2 bg-[#060a12] border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-1 text-slate-200">
          <div className="text-slate-500 pb-2 border-b border-slate-800 text-[11px]">
            Viewing Diff: <span className="text-indigo-400">{selectedFile.path}</span>
          </div>
          <div className="text-emerald-400 bg-emerald-950/40 p-1.5 rounded">+ export class RiskGuardService &#123;</div>
          <div className="text-emerald-400 bg-emerald-950/40 p-1.5 rounded">+   public static inspectCommand(command: string) &#123; ... &#125;</div>
          <div className="text-slate-400 p-1.5">    // Existing function code...</div>
          <div className="text-rose-400 bg-rose-950/40 p-1.5 rounded">-   // Old un-inspected command execution</div>
        </div>
      </div>
    </div>
  );
};
