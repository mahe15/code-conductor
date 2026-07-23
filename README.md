# AI Coding Orchestrator (Code Conductor)

> **Slogan**: *"Stop AI from guessing. Make it ask."*

An open-source desktop application that sits between developers and AI coding agents (Claude Code, Codex CLI, Aider). The Orchestrator continuously inspects terminal input and output streams, detects missing architectural specifications, locks project decisions into persistent memory, intercepts unconfirmed assumptions, and guards against destructive commands.

---

## 🌟 Core Features

- **Smart Follow-Up Question Engine**: Detects unconfirmed tech stack choices in real time and pops up high-impact clarification cards before AI agents make expensive wrong assumptions.
- **Persistent Architectural Memory**: Locks technical decisions (Frontend, Backend, Database, Auth, Styling, State Management) and exports Architectural Decision Records (`docs/adr/ADR-001.md`).
- **Live PTY Process Controller**: Cross-platform Pseudo-Terminal control powered by Rust (`portable-pty`) with signal-level process control (`SIGSTOP` pause / `SIGCONT` resume / `SIGKILL` terminate).
- **Command Center & Slash Directives**: Autocomplete prompt bar for power-user directives (`/production`, `/simple`, `/optimize`, `/test`, `/document`, `/commit`, `/undo`).
- **Destructive Command Risk Guard**: Red-alert approval modal intercepting dangerous operations (`DROP DATABASE`, `rm -rf`, `git push --force`).
- **Infrastructure Cost Estimator**: Cloud advisory engine warning about excessive infrastructure costs (e.g., Kubernetes vs single VPS/Docker).
- **Hands-Free Voice Mode**: Speech-to-Text (STT) audio capture & Text-to-Speech (TTS) synthesizer with an ambient audio visualizer orb.
- **Time-Machine Session Replayer**: Video-style timeline player scrubbing through past terminal sessions with speed controls (`1x`, `2x`, `4x`).
- **Extensible Plugin Manager**: Dynamic plugin loader (`plugin.json`) for custom AI agent adapters and rule manifests.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Zustand 5, Lucide React
- **Terminal Canvas**: `@xterm/xterm` with WebGL & Fit Addons
- **Desktop Runtime / Backend**: Tauri 2.0 (Rust)
- **Database Engine**: Embedded SQLite (`rusqlite`)
- **Process Orchestration**: `portable-pty` (Rust)

---

## ⚡ Slash Command Reference

| Slash Command | Description | Directive Injected |
|---|---|---|
| `/production` | Enforces enterprise readiness | Strict TypeScript types, input validation, structured error handling & rate limiting |
| `/simple` | Enforces minimal MVP mode | YAGNI principles, minimal code, zero over-engineering |
| `/optimize` | Triggers code optimization | Memory leak detection, database query optimization & bundle size reduction |
| `/test` | Triggers test suite generation | Complete unit & integration test coverage |
| `/document` | Triggers documentation writing | JSDoc/RustDoc comments, API specs & README updates |
| `/pause` | Pauses CLI process execution | Sends `SIGSTOP` signal to PTY process |
| `/resume` | Resumes CLI process execution | Sends `SIGCONT` signal to PTY process |
| `/commit` | Stages & commits changes | Automatic conventional git commit |
| `/undo` | Reverts recent changes | Git reset / stash rollback |

---

## 💻 Development & Build Setup

### Prerequisites
- **Node.js**: v20+ (`npm v10+`)
- **Rust Toolchain** *(Optional for desktop compilation)*: `rustup` & `cargo`

### Setup Commands

```bash
# 1. Install Dependencies
npm install

# 2. Start Web / Dev Server
npm run dev

# 3. Build Production Bundle
npm run build
```

---

## 📄 License
Open-Source MIT License.
