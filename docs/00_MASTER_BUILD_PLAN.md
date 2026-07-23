# AI Coding Orchestrator: Master Build Plan & Execution Strategy

> **Project Slogan**: *"Stop AI from guessing. Make it ask."*  
> **Target Architecture**: Tauri 2.0 (Rust) + React (TypeScript) + Vite + Tailwind CSS v4 + Zustand + SQLite (rusqlite/sqlx) + PTY (portable-pty) + Local/Remote LLM Guard Engine.

---

## 📌 Project Tracking & Documentation Engine

- **Project Progress Matrix**: **[PROGRESS.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/PROGRESS.md)**
- **Architectural Memory Registry**: **[MEMORY.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/MEMORY.md)**

---

## Executive Summary & System Architecture

The **AI Coding Orchestrator** acts as an intelligent intermediary proxy between the developer and CLI-based AI coding agents (such as Claude Code, Codex CLI, Aider, and Gemini CLI). Instead of granting AI agents unrestricted execution freedom where they often make unverified architectural assumptions, the Orchestrator inspects agent input and output streams, detects missing parameters or unconfirmed choices, asks high-impact clarifying questions, manages project memory, guards against destructive commands, and maintains a complete live project state.

### High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             TAURI DESKTOP WINDOW                                 │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                      React + TypeScript Frontend UI                       │   │
│   │  ┌──────────────┐ ┌───────────────┐ ┌──────────────┐ ┌────────────────┐ │   │
│   │  │ Interactive  │ │ Follow-Up     │ │ Command      │ │ Live Project   │ │   │
│   │  │ Terminal UI  │ │ Question Modal│ │ Center       │ │ Timeline       │ │   │
│   │  └──────────────┘ └───────────────┘ └──────────────┘ └────────────────┘ │   │
│   └──────────────────────────────────────────────────────────────────────────┘   │
│                                      ▲ IPC Bridge                                │
│                                      ▼ (Events & Commands)                       │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                         Rust Backend Engine                              │   │
│   │  ┌──────────────┐ ┌───────────────┐ ┌──────────────┐ ┌────────────────┐ │   │
│   │  │ PTY Process  │ │ Stream Parser │ │ LLM Decision │ │ SQLite Memory  │ │   │
│   │  │ Manager     │ │ & Risk Guard  │ │ Interceptor  │ │ Store          │ │   │
│   │  └──────────────┘ └───────────────┘ └──────────────┘ └────────────────┘ │   │
│   └──────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼ (PTY Spawn / stdio)
                       ┌───────────────────────────────┐
                       │ CLI AI Agent (Claude / Codex) │
                       └───────────────────────────────┘
```

---

## Phase Breakdown Roadmap

| Phase | Focus Area | Key Deliverables | Status | Document File |
|---|---|---|---|---|
| **Phase 1** | App Foundation & Architecture | Tauri 2.0 + Rust + React setup, Tailwind v4 UI Shell, SQLite DB Layer, IPC Event Bus | `COMPLETED` | [PHASE_1_TAURI_RUST_CORE.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_1_TAURI_RUST_CORE.md) |
| **Phase 2** | CLI Agent Orchestrator & PTY Engine | `portable-pty` Rust controller, Xterm.js canvas, terminal stream multiplexing, pause/resume process signal handler | `COMPLETED` | [PHASE_2_CLI_ORCHESTRATOR_PTY.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_2_CLI_ORCHESTRATOR_PTY.md) |
| **Phase 3** | Decision Engine & Question Generator | Pattern-matching & LLM stream analysis, Assumption Interceptor, Clarification Modal, Prompt Enrichment | `PLANNED` | [PHASE_3_QUESTION_DECISION_ENGINE.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_3_QUESTION_DECISION_ENGINE.md) |
| **Phase 4** | Project Memory & Command Center | Architectural Decision Records (ADR) store, SQLite schema, `/pause`, `/commit`, `/production` Command Center | `PLANNED` | [PHASE_4_MEMORY_AND_COMMAND_CENTER.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_4_MEMORY_AND_COMMAND_CENTER.md) |
| **Phase 5** | Live Timeline, Git Guard & Risk Engine | Dangerous command interceptor (drop DB, delete files, force push), Git diff tracking, Cost Estimator | `PLANNED` | [PHASE_5_TIMELINE_RISK_GIT.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_5_TIMELINE_RISK_GIT.md) |
| **Phase 6** | Voice Engine & Session Replay | Speech-to-Text (Whisper API/local), Text-to-Speech (native/OpenAI), Time-Machine Session Replayer | `PLANNED` | [PHASE_6_VOICE_AND_SESSION_REPLAY.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_6_VOICE_AND_SESSION_REPLAY.md) |
| **Phase 7** | Plugin System, Testing & Packaging | Extensible Plugin System, E2E Test Suite, Cross-platform build pipeline (macOS, Windows, Linux) | `PLANNED` | [PHASE_7_PLUGINS_PACKAGING.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_7_PLUGINS_PACKAGING.md) |
