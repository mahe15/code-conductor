export interface Project {
  id: string;
  name: string;
  path: string;
  created_at: number;
  updated_at: number;
}

export interface MemoryItem {
  id: string;
  project_id: string;
  key: string;
  value: string;
  confidence_score: number;
  created_at: number;
}

export interface Session {
  id: string;
  project_id: string;
  agent_type: 'claude-code' | 'codex-cli' | 'aider' | 'generic';
  status: 'active' | 'paused' | 'completed' | 'terminated';
  started_at: number;
  ended_at?: number;
}

export interface DecisionRequiredEvent {
  session_id: string;
  category: string;
  detected_assumption: string;
  suggested_options: string[];
  question_prompt: string;
}

export interface PtyOutputEvent {
  session_id: string;
  data: string;
}

export interface TaskMilestone {
  id: string;
  title: string;
  category: 'Database' | 'Authentication' | 'UI' | 'Payments' | 'CI/CD';
  status: 'completed' | 'in_progress' | 'pending';
}
