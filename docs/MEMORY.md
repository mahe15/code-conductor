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
