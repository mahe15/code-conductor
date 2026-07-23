# Phase 2: CLI Agent Orchestrator & PTY Process Controller

> **Focus**: Spawning and controlling CLI AI agents (Claude Code, Codex CLI) via cross-platform Pseudo-Terminals (PTY), streaming live stdout/stderr to Xterm.js, sending interactive input, and providing signal-level pause/resume control.

---

## 1. Phase Architecture Overview

To act as a proxy layer without modifying the underlying CLI tools, the Orchestrator runs CLI agents inside a Rust-managed **Pseudo-Terminal (PTY)** session using `portable-pty`. This enables standard terminal behavior (color output, interactive prompts, cursor control) while capturing raw streams for real-time analysis by the Orchestrator's Decision Engine.

### PTY Control Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        React Frontend (Xterm.js)                        │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ Interactive Terminal Canvas (Renders ANSI stream & takes input) │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────▲────────────────────────────────────┘
                      Tauri Events   │   Tauri IPC Commands
                  ("pty-output")     │   ("send_pty_input", "pause_pty")
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                        Rust PTY Manager Module                          │
│  ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────────┐  │
│  │ portable-pty    │   │ Async Stream     │   │ Process Signal       │  │
│  │ Spawn Controller│──>│ Reader Thread    │──>│ Controller           │  │
│  └─────────────────┘   └──────────────────┘   │ (SIGSTOP / SIGCONT)  │  │
│                                               └──────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ stdio / PTY slave
                                     ▼
                      ┌─────────────────────────────┐
                      │ Target CLI Agent (Claude /  │
                      │ Codex / Aider / Gemini)     │
                      └─────────────────────────────┘
```

---

## 2. In-Depth Engineering Prompts for Phase 2

---

### Prompt 2.1: Rust PTY Process Controller Core (`portable-pty`)

```markdown
# TASK: Build Cross-Platform Rust PTY Process Spawner & Controller

## Objective
Implement a thread-safe PTY Manager module in Rust (`src-tauri/src/pty/`) using `portable-pty` to spawn, resize, send keystrokes to, pause, resume, and terminate CLI agent processes.

## Detailed Requirements

1. **Cargo Dependencies (`Cargo.toml`)**:
   - Add `portable-pty = "0.8"` (or latest compatible).
   - Add `parking_lot` for fast lock primitives.

2. **PTY Manager Struct (`src-tauri/src/pty/manager.rs`)**:
   - Define `PtySession`:
     - `id`: String (UUID)
     - `master`: Box<dyn MasterPty + Send>
     - `child`: Box<dyn Child + Send + Sync>
     - `writer`: Box<dyn std::io::Write + Send>
     - `is_paused`: Arc<AtomicBool>
   - Implement `PtyManager` as shared Tauri state (`Arc<Mutex<HashMap<String, PtySession>>>`).

3. **Core API Functions**:
   - `spawn_session(command: String, args: Vec<String>, cwd: String, cols: u16, rows: u16) -> Result<String>`:
     - Configure PTY system (Native PTY on macOS/Linux, ConPTY on Windows).
     - Spawn process in specified directory with inherited environment variables.
   - `write_input(session_id: &str, data: &[u8]) -> Result<()>`:
     - Write keystrokes or string input directly to PTY writer.
   - `resize_pty(session_id: &str, cols: u16, rows: u16) -> Result<()>`:
     - Resize terminal dimensions on window resize events.
   - `pause_session(session_id: &str) -> Result<()>`:
     - Send `SIGSTOP` on Unix or suspend process threads on Windows.
     - Set `is_paused` flag to true.
   - `resume_session(session_id: &str) -> Result<()>`:
     - Send `SIGCONT` on Unix or resume threads on Windows.
     - Set `is_paused` flag to false.
   - `kill_session(session_id: &str) -> Result<()>`:
     - Terminate child process and clean up master PTY resources.

## Expected Output Deliverables
- `src-tauri/src/pty/` module fully implemented with cross-platform conditional compilation (`#[cfg(target_os = "windows")]` / `#[cfg(unix)]`).
- Rust unit tests verifying process spawning and termination.
```

---

### Prompt 2.2: Terminal I/O Stream Parser & Tauri Event Emitter

```markdown
# TASK: Stream PTY Output to Tauri Frontend with ANSI Processing

## Objective
Create an asynchronous stdout/stderr reader loop that reads bytes from the PTY slave, converts them to UTF-8/ANSI streams, emits Tauri window events, and routes raw chunks to the Decision Engine.

## Detailed Requirements

1. **Async Reader Loop (`src-tauri/src/pty/reader.rs`)**:
   - When a PTY session spawns, spawn a dedicated background thread or Tokio task.
   - Read chunks from `master.try_clone_reader()`.
   - Convert buffer chunks into UTF-8 strings cleanly (handling split multi-byte UTF-8 sequences using `vte` parser or `strip_ansi` helpers).

2. **Tauri Event Dispatch**:
   - Emit event `pty-output` to frontend:
     ```json
     {
       "session_id": "session-uuid",
       "data": "raw string with ANSI escape codes"
     }
     ```
   - Emit event `pty-exit` when child process finishes:
     ```json
     {
       "session_id": "session-uuid",
       "exit_code": 0
     }
     ```

3. **Stream Duplication for Decision Engine Pipeline**:
   - Implement an internal mpsc channel (`tokio::sync::mpsc::channel`) that forwards every output chunk to the Assumption Interceptor module (Phase 3).

## Expected Output Deliverables
- Non-blocking reader implementation that streams data with zero noticeable latency.
- Graceful handling of process termination and reader buffer flushing.
```

---

### Prompt 2.3: Xterm.js Frontend Terminal Component

```markdown
# TASK: Build Interactive Terminal UI Component using Xterm.js

## Objective
Create a React component using `@xterm/xterm` that mounts a full-featured terminal canvas, renders incoming `pty-output` events, handles user keystrokes, and supports automatic resizing.

## Detailed Requirements

1. **Xterm.js Component (`src/components/terminal/TerminalView.tsx`)**:
   - Initialize `Terminal` instance on mount:
     - Theme: Match application dark mode (`background: "#090d16"`, `foreground: "#f8fafc"`, `cursor: "#6366f1"`).
     - Font family: `"JetBrains Mono", "Fira Code", monospace`.
     - Load addons: `@xterm/addon-fit` for auto-sizing, `@xterm/addon-webgl` for fast rendering.

2. **Event Binding & Data Flow**:
   - Listen for `pty-output` Tauri event using `@tauri-apps/api/event` `listen()`. Write data to `terminal.write(event.payload.data)`.
   - Intercept terminal user input via `terminal.onData((data) => { invoke("send_pty_input", { sessionId, data }); })`.
   - Attach Window `resize` observer: call `fitAddon.fit()` and trigger `resize_pty` IPC command.

3. **Terminal Controls Bar**:
   - Add status bar above terminal canvas:
     - Connected session info (e.g. `Claude Code CLI PID 12435`).
     - Quick control buttons: Pause Agent (`SIGSTOP`), Resume Agent (`SIGCONT`), Kill Process (`SIGKILL`), Clear Screen.

## Expected Output Deliverables
- `TerminalView.tsx` component integrated into the main canvas.
- Fully functional interactive terminal displaying color ANSI output from local commands (`ls`, `git status`, `claude`).
```

---

### Prompt 2.4: Agent Abstraction & CLI Command Adapter Layer

```markdown
# TASK: Create CLI Agent Adapter Framework

## Objective
Build a pluggable adapter interface in Rust and TypeScript to support launching and controlling diverse AI coding agents with standard CLI configurations.

## Detailed Requirements

1. **Agent Adapter Trait (`src-tauri/src/agents/mod.rs`)**:
   - Define trait `CliAgentAdapter`:
     - `name(&self) -> &'static str`
     - `binary_name(&self) -> &'static str`
     - `build_spawn_args(&self, user_prompt: &str, options: &AgentOptions) -> Vec<String>`
     - `detect_prompt_ready_pattern(&self) -> Regex`
     - `detect_question_pattern(&self) -> Regex`

2. **Implement Supported Adapters**:
   - **Claude Code Adapter (`ClaudeCodeAdapter`)**:
     - Binary: `claude`
     - Flags: `--dangerously-skip-permissions` (optional toggle), `--print`
   - **Codex CLI Adapter (`CodexAdapter`)**:
     - Binary: `codex`
   - **Generic CLI Adapter (`GenericAdapter`)**:
     - Standard fallback for any interactive CLI shell (`bash`, `zsh`, `powershell`).

3. **Tauri Command Integrations**:
   - `start_agent_session(agent_type: String, project_path: String, initial_prompt: String) -> Result<String, String>`

## Expected Output Deliverables
- Modular agent adapter folder `src-tauri/src/agents/` allowing easy addition of future AI tools.
- Verification tests for CLI command line argument generation.
```

---

## 3. Phase 2 Verification Checklist

- [ ] Rust PTY session successfully launches target CLI process (`claude`, `bash`, or `powershell`).
- [ ] Terminal UI renders ANSI color codes, tables, and spinner animations correctly.
- [ ] User typing in Xterm.js sends input to PTY and receives output back in real time.
- [ ] Pause button sends pause signal (`is_paused: true`), stopping CLI process output immediately; Resume button restarts execution seamlessly.
