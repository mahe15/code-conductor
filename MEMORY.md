# Architectural Memory & Technical Contract Registry

> **Purpose**: Single source of truth for established technical decisions, architectural patterns, database schemas, and IPC data contracts for the **AI Coding Orchestrator**.

---

## 🏛️ Locked Technology Stack Matrix

| Layer | Selected Technology | Status | Rationale |
|---|---|---|---|
| **Desktop Application Framework** | Tauri 2.0 (Rust backend) | `LOCKED` | Ultra-low memory footprint (~30MB vs 150MB+ Electron), native PTY & system process performance. |
| **Frontend Framework** | React 19 + TypeScript | `LOCKED` | Type safety, component modularity, fast rendering. |
| **Build Tooling & Bundler** | Vite 6 | `LOCKED` | Instant HMR development server and fast rollup production bundling. |
| **Styling & Design System** | Tailwind CSS v4 | `LOCKED` | Modern utility CSS, dark obsidian theme palette (`#090d16` base, `#101726` surface). |
| **State Management** | Zustand 5 | `LOCKED` | Lightweight, boilerplate-free global state management for project memory and UI tab states. |
| **Embedded Database** | SQLite (`rusqlite` bundled) | `LOCKED` | Zero-config, single-file ACID storage for project settings, decision memory, and session logs. |
| **Process Control & PTY** | `portable-pty` (Rust) | `LOCKED` | Cross-platform pseudo-terminal spawning (ConPTY on Windows, native PTY on macOS/Linux). |
| **Terminal Canvas** | `@xterm/xterm` + Addons | `LOCKED` | WebGL-accelerated high-performance ANSI terminal rendering with auto-fit layout. |

---

## 📋 Database Schema Definitions (SQLite)

### Table: `projects`
```sql
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
```

### Table: `project_memory`
```sql
CREATE TABLE IF NOT EXISTS project_memory (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    confidence_score REAL DEFAULT 1.0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### Table: `sessions`
```sql
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

---

## 🔌 IPC Interface Contracts (TypeScript <-> Rust)

- **`create_project(name, path)`** -> Creates new project record in SQLite.
- **`get_projects()`** -> Returns array of stored projects.
- **`get_project_memory(projectId)`** -> Fetches locked key-value memory items.
- **`set_project_memory(projectId, key, value)`** -> Persists new decision choice.
- **`spawn_pty(agentType, cwd, cols, rows)`** -> Spawns CLI subprocess in PTY.
- **`write_pty(sessionId, inputData)`** -> Sends stdin input bytes to PTY.
- **`resize_pty(sessionId, cols, rows)`** -> Resizes PTY terminal dimensions.
- **`pause_pty(sessionId)`** -> Sends SIGSTOP signal to pause execution.
- **`resume_pty(sessionId)`** -> Sends SIGCONT signal to resume execution.
