import { create } from 'zustand';
import { Project, MemoryItem } from '../types/ipc';

interface ProjectState {
  activeProject: Project | null;
  projects: Project[];
  memoryItems: MemoryItem[];
  activeAgent: 'claude-code' | 'codex-cli' | 'aider' | 'generic';
  agentStatus: 'idle' | 'running' | 'paused' | 'terminated';

  setActiveProject: (project: Project) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (name: string, path: string) => void;
  setMemoryItems: (items: MemoryItem[]) => void;
  setMemoryItem: (key: string, value: string) => void;
  setActiveAgent: (agent: 'claude-code' | 'codex-cli' | 'aider' | 'generic') => void;
  setAgentStatus: (status: 'idle' | 'running' | 'paused' | 'terminated') => void;
}

const defaultProject: Project = {
  id: 'proj-1',
  name: 'AI Coding Orchestrator',
  path: 'c:/Users/Mahendra desai/OneDrive/Desktop/sof',
  created_at: Date.now(),
  updated_at: Date.now(),
};

const defaultMemoryItems: MemoryItem[] = [
  { id: 'm1', project_id: 'proj-1', key: 'stack.frontend', value: 'React + TypeScript', confidence_score: 1.0, created_at: Date.now() },
  { id: 'm2', project_id: 'proj-1', key: 'stack.styling', value: 'Tailwind CSS v4', confidence_score: 1.0, created_at: Date.now() },
  { id: 'm3', project_id: 'proj-1', key: 'stack.backend', value: 'Tauri 2.0 (Rust)', confidence_score: 1.0, created_at: Date.now() },
  { id: 'm4', project_id: 'proj-1', key: 'stack.database', value: 'SQLite', confidence_score: 1.0, created_at: Date.now() },
];

export const useProjectStore = create<ProjectState>((set) => ({
  activeProject: defaultProject,
  projects: [defaultProject],
  memoryItems: defaultMemoryItems,
  activeAgent: 'claude-code',
  agentStatus: 'idle',

  setActiveProject: (project) => set({ activeProject: project }),
  setProjects: (projects) => set({ projects }),
  addProject: (name, path) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      path,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    set((state) => ({
      projects: [...state.projects, newProj],
      activeProject: newProj,
    }));
  },
  setMemoryItems: (items) => set({ memoryItems: items }),
  setMemoryItem: (key, value) => {
    set((state) => {
      const existing = state.memoryItems.find((m) => m.key === key);
      if (existing) {
        return {
          memoryItems: state.memoryItems.map((m) =>
            m.key === key ? { ...m, value, updated_at: Date.now() } : m
          ),
        };
      } else {
        const newItem: MemoryItem = {
          id: `m-${Date.now()}`,
          project_id: state.activeProject?.id || 'proj-1',
          key,
          value,
          confidence_score: 1.0,
          created_at: Date.now(),
        };
        return { memoryItems: [...state.memoryItems, newItem] };
      }
    });
  },
  setActiveAgent: (agent) => set({ activeAgent: agent }),
  setAgentStatus: (status) => set({ agentStatus: status }),
}));
