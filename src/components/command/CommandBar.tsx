import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_SLASH_COMMANDS, SlashCommand } from '../../services/commandCenter';
import { Terminal, Send, Sparkles, Command } from 'lucide-react';

interface CommandBarProps {
  onSubmitPrompt: (text: string) => void;
  placeholder?: string;
}

export const CommandBar: React.FC<CommandBarProps> = ({ onSubmitPrompt, placeholder }) => {
  const [input, setInput] = useState('');
  const [showPopover, setShowPopover] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (input.startsWith('/')) {
      const query = input.toLowerCase();
      const matches = SUPPORTED_SLASH_COMMANDS.filter((c) => c.name.toLowerCase().includes(query));
      setFilteredCommands(matches);
      setShowPopover(matches.length > 0);
      setSelectedIndex(0);
    } else {
      setShowPopover(false);
    }
  }, [input]);

  const handleSelectCommand = (cmd: SlashCommand) => {
    setInput(cmd.name + ' ');
    setShowPopover(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showPopover) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelectCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowPopover(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmitPrompt(input);
    setInput('');
    setShowPopover(false);
  };

  return (
    <div className="relative w-full">
      {/* Autocomplete Popover Overlay */}
      {showPopover && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-[#0d1424] border border-indigo-500/30 rounded-xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-indigo-400 flex items-center space-x-1">
            <Command className="w-3 h-3" />
            <span>Slash Command Suggestions</span>
          </div>
          {filteredCommands.map((cmd, idx) => (
            <button
              key={cmd.name}
              type="button"
              onClick={() => handleSelectCommand(cmd)}
              className={`w-full px-3 py-2 text-left flex flex-col transition border-b border-slate-800/40 ${
                idx === selectedIndex ? 'bg-indigo-600/30 text-white' : 'hover:bg-slate-800/50 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-300">{cmd.name}</span>
                {cmd.isAction && <span className="text-[9px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">Action</span>}
              </div>
              <span className="text-[11px] text-slate-400 truncate">{cmd.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#0d1424] border-t border-slate-800 flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-slate-500 text-xs font-mono px-2">
          <span className="text-indigo-400">$</span>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type prompt or / to trigger slash commands (/production, /simple, /commit)..."}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition shadow-md shadow-indigo-600/20"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
