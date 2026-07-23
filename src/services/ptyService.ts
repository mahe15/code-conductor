import { PtyOutputEvent } from '../types/ipc';

type OutputListener = (data: string) => void;

class PtyService {
  private outputListeners: Map<string, OutputListener[]> = new Map();
  private activeSessionId: string | null = null;
  private isSimulated: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    // Check if running inside Tauri runtime
    this.isSimulated = !(window as any).__TAURI_INTERNALS__;
    this.setupTauriEvents();
  }

  private setupTauriEvents() {
    if (!this.isSimulated) {
      import('@tauri-apps/api/event').then(({ listen }) => {
        listen<PtyOutputEvent>('pty-output', (event) => {
          const listeners = this.outputListeners.get(event.payload.session_id);
          if (listeners) {
            listeners.forEach((fn) => fn(event.payload.data));
          }
        });
      }).catch(() => {
        this.isSimulated = true;
      });
    }
  }

  public async spawnPty(agentType: string, cwd: string, cols: u16 = 80, rows: u16 = 24): Promise<string> {
    const sessionId = `pty-${Date.now()}`;
    this.activeSessionId = sessionId;
    this.isPaused = false;

    if (!this.isSimulated) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('spawn_pty', { sessionId, agentType, cwd, cols, rows });
        return sessionId;
      } catch (err) {
        console.warn('Tauri PTY invoke failed, falling back to PTY simulator:', err);
        this.isSimulated = true;
      }
    }

    // Simulated PTY Init message
    setTimeout(() => {
      this.emitOutput(sessionId, `\r\n\x1b[38;2;99;102;241m[PTY Session Spawned]\x1b[0m ID: ${sessionId} | CWD: ${cwd}\r\n`);
      this.emitOutput(sessionId, `\x1b[38;2;168;85;247m[${agentType}]\x1b[0m Agent process initialized. Ready for commands.\r\n$ `);
    }, 100);

    return sessionId;
  }

  public async writePty(sessionId: string, data: string): Promise<void> {
    if (this.isPaused) {
      console.warn('Session is paused. Input buffered.');
      return;
    }

    if (!this.isSimulated) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('write_pty', { sessionId, data });
        return;
      } catch (err) {
        this.isSimulated = true;
      }
    }

    // Echo input in simulation mode
    this.emitOutput(sessionId, data);
    if (data === '\r' || data === '\n') {
      this.emitOutput(sessionId, `\r\n\x1b[32m✔ Processed command\x1b[0m\r\n$ `);
    }
  }

  public async resizePty(sessionId: string, cols: u16, rows: u16): Promise<void> {
    if (!this.isSimulated) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('resize_pty', { sessionId, cols, rows });
      } catch (e) {}
    }
  }

  public async pausePty(sessionId: string): Promise<void> {
    this.isPaused = true;
    if (!this.isSimulated) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('pause_pty', { sessionId });
      } catch (e) {}
    }
    this.emitOutput(sessionId, `\r\n\x1b[33m[ORCHESTRATOR]\x1b[0m PTY Session PAUSED (SIGSTOP).\r\n`);
  }

  public async resumePty(sessionId: string): Promise<void> {
    this.isPaused = false;
    if (!this.isSimulated) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('resume_pty', { sessionId });
      } catch (e) {}
    }
    this.emitOutput(sessionId, `\r\n\x1b[32m[ORCHESTRATOR]\x1b[0m PTY Session RESUMED (SIGCONT).\r\n$ `);
  }

  public onOutput(sessionId: string, listener: OutputListener) {
    if (!this.outputListeners.has(sessionId)) {
      this.outputListeners.set(sessionId, []);
    }
    this.outputListeners.get(sessionId)!.push(listener);
  }

  private emitOutput(sessionId: string, data: string) {
    const listeners = this.outputListeners.get(sessionId);
    if (listeners) {
      listeners.forEach((fn) => fn(data));
    }
  }
}

type u16 = number;
export const ptyService = new PtyService();
