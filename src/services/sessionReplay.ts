export interface RecordedEvent {
  timestampMs: number;
  type: 'pty_output' | 'decision_made' | 'command';
  content: string;
}

export class SessionReplayService {
  private events: RecordedEvent[] = [
    { timestampMs: 0, type: 'pty_output', content: '\x1b[38;2;99;102;241m[Session Started]\x1b[0m AI Coding Orchestrator PTY Log\r\n' },
    { timestampMs: 1000, type: 'command', content: '$ Build social media SaaS app\r\n' },
    { timestampMs: 2500, type: 'decision_made', content: '\x1b[33m[DECISION INTERCEPTED]\x1b[0m Enforced Supabase Auth\r\n' },
    { timestampMs: 4000, type: 'pty_output', content: '\x1b[32m[SUCCESS]\x1b[0m Authentication and PostgreSQL models generated.\r\n' },
  ];

  public getEvents(): RecordedEvent[] {
    return this.events;
  }
}
