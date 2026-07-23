# AI Coding Orchestrator: Master Build Plan & Execution Strategy

> **Project Slogan**: *"Stop AI from guessing. Make it ask."*  
> **Target Architecture**: Tauri 2.0 (Rust) + React (TypeScript) + Vite + Tailwind CSS v4 + Zustand + SQLite (rusqlite/sqlx) + PTY (portable-pty) + Local/Remote LLM Guard Engine.

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

| Phase | Focus Area | Key Deliverables | Document File |
|---|---|---|---|
| **Phase 1** | App Foundation & Architecture | Tauri 2.0 + Rust + React setup, Tailwind v4 UI Shell, SQLite DB Layer, IPC Event Bus | [PHASE_1_TAURI_RUST_CORE.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_1_TAURI_RUST_CORE.md) |
| **Phase 2** | CLI Agent Orchestrator & PTY Engine | `portable-pty` Rust controller, terminal stream multiplexing, pause/resume process signal handler | [PHASE_2_CLI_ORCHESTRATOR_PTY.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_2_CLI_ORCHESTRATOR_PTY.md) |
| **Phase 3** | Decision Engine & Question Generator | Pattern-matching & LLM stream analysis, Assumption Interceptor, Clarification Modal, Prompt Enrichment | [PHASE_3_QUESTION_DECISION_ENGINE.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_3_QUESTION_DECISION_ENGINE.md) |
| **Phase 4** | Project Memory & Command Center | Architectural Decision Records (ADR) store, SQLite schema, `/pause`, `/commit`, `/production` Command Center | [PHASE_4_MEMORY_AND_COMMAND_CENTER.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_4_MEMORY_AND_COMMAND_CENTER.md) |
| **Phase 5** | Live Timeline, Git Guard & Risk Engine | Dangerous command interceptor (drop DB, delete files, force push), Git diff tracking, Cost Estimator | [PHASE_5_TIMELINE_RISK_GIT.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_5_TIMELINE_RISK_GIT.md) |
| **Phase 6** | Voice Engine & Session Replay | Speech-to-Text (Whisper API/local), Text-to-Speech (native/OpenAI), Time-Machine Session Replayer | [PHASE_6_VOICE_AND_SESSION_REPLAY.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_6_VOICE_AND_SESSION_REPLAY.md) |
| **Phase 7** | Plugin System, Testing & Packaging | Extensible Plugin System, E2E Test Suite, Cross-platform build pipeline (macOS, Windows, Linux) | [PHASE_7_PLUGINS_PACKAGING.md](file:///c:/Users/Mahendra%20desai/OneDrive/Desktop/sof/docs/PHASE_7_PLUGINS_PACKAGING.md) |

---

## How to Execute the Prompts

Each phase document contains ready-to-use, ultra-detailed prompts written specifically for AI software engineering agents (such as Antigravity, Claude Code, or Codex CLI).

1. **Sequential Execution**: Execute the prompts in numerical order (`Prompt 1.1` -> `Prompt 1.2` -> ... -> `Prompt 7.3`).
2. **Verification Gate**: Do not move to the next prompt until the verification criteria for the active prompt pass cleanly.
3. **Context Preservation**: Each prompt references the architecture files created in prior steps to ensure absolute continuity.
