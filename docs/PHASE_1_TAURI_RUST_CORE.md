# Phase 1: Application Foundation & Core Infrastructure

> **Focus**: Scaffolding Tauri 2.0 Desktop Application, Rust Backend Core, Embedded SQLite Database Engine, Typescript Frontend UI Shell, and IPC Event Bus Protocol.

---

## 1. Phase Architecture Overview

Phase 1 establishes the foundational desktop architecture. The application is built using **Tauri 2.0** with a **Rust** backend for system-level capabilities (process spawning, PTY management, SQLite data persistence) and a **React + TypeScript + Tailwind CSS** frontend for a high-performance, dark-mode user interface.

### Project Layout

```
/
├── src-tauri/                  # Rust Backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs
│       ├── lib.rs
│       ├── db/
│       │   ├── mod.rs
│       │   ├── schema.rs
│       │   └── migrations.rs
│       ├── models/
│       │   ├── mod.rs
│       │   ├── project.rs
│       │   └── session.rs
│       └── commands/
│           ├── mod.rs
│           └── project_commands.rs
├── src/                        # React Frontend
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── store/
│   │   ├── useProjectStore.ts
│   │   └── useUIStore.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainView.tsx
│   │   ├── terminal/
│   │   │   └── TerminalView.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       └── Modal.tsx
│   └── types/
│       └── ipc.ts
├── package.json
└── vite.config.ts
```

---

## 2. In-Depth Engineering Prompts for Phase 1

---

### Prompt 1.1: Project Scaffolding & Dependency Integration

```markdown
# TASK: Initialize Tauri 2.0 + React (TypeScript) + Tailwind CSS Workspace

## Objective
Initialize the base project structure for the AI Coding Orchestrator desktop application using Tauri v2, React 19/18, TypeScript, Tailwind CSS v4, and Zustand.

## Detailed Requirements

1. **Project Initialization**:
   - Create a Tauri 2.0 app named `ai-coding-orchestrator`.
   - Setup React with Vite and TypeScript template.
   - Configure Tailwind CSS v4 for modern styling (dark theme palette: Slate/Zinc 950 base, Indigo/Violet accents).

2. **Frontend Dependencies (`package.json`)**:
   - Add `@tauri-apps/api` (v2.x) and `@tauri-apps/plugin-shell`.
   - Add `@xterm/xterm` & `@xterm/addon-fit` & `@xterm/addon-webgl` for terminal UI rendering.
   - Add `zustand` for state management.
   - Add `lucide-react` for rich icons.
   - Add `clsx` and `tailwind-merge` for class name management.

3. **Backend Dependencies (`src-tauri/Cargo.toml`)**:
   - `tauri` (v2) with feature flags `["shell-open", "process-relaunch"]`.
   - `serde` and `serde_json` with `derive` features.
   - `rusqlite` with `bundled` feature (or `sqlx` with sqlite runtime).
   - `tokio` with `full` async features.
   - `anyhow` and `thiserror` for clean Rust error handling.
   - `log` and `env_logger`.

4. **Configuration**:
   - Update `src-tauri/tauri.conf.json` with app identity: `identifier: "com.orchestrator.app"`, `title: "AI Coding Orchestrator"`.
   - Configure main window options: `width: 1400`, `height: 900`, `resizable: true`, `decorations: true`, `transparent: false`, dark theme background `#090d16`.

## Expected Output Deliverables
- Fully working project folder with passing `npm run tauri dev`.
- `package.json` and `Cargo.toml` configured with zero version conflicts.
```

---

### Prompt 1.2: Embedded SQLite Database Engine & Migration Pipeline

```markdown
# TASK: Implement Rust SQLite Database Engine & Schema Migrations

## Objective
Build a robust, embedded SQLite storage system inside `src-tauri` to persist project configurations, decisions, sessions, and agent interaction histories.

## Detailed Requirements

1. **Database Connection Manager (`src-tauri/src/db/mod.rs`)**:
   - Implement thread-safe database connection pool or `Arc<Mutex<Connection>>` managed via Tauri state (`app.manage(...)`).
   - Auto-create SQLite database file in user application data directory (`$APP_DATA/orchestrator.db`).

2. **Schema & Migration Pipeline (`src-tauri/src/db/migrations.rs`)**:
   - Create table `projects`:
     - `id`: TEXT PRIMARY KEY (UUID v4)
     - `name`: TEXT NOT NULL
     - `path`: TEXT NOT NULL UNIQUE
     - `created_at`: INTEGER (unix timestamp)
     - `updated_at`: INTEGER
   - Create table `project_memory`:
     - `id`: TEXT PRIMARY KEY
     - `project_id`: TEXT FOREIGN KEY -> projects(id)
     - `key`: TEXT NOT NULL (e.g. "framework", "database", "auth")
     - `value`: TEXT NOT NULL (e.g. "Flutter", "PostgreSQL", "Supabase Auth")
     - `confidence_score`: REAL DEFAULT 1.0
     - `created_at`: INTEGER
   - Create table `sessions`:
     - `id`: TEXT PRIMARY KEY
     - `project_id`: TEXT FOREIGN KEY -> projects(id)
     - `agent_type`: TEXT NOT NULL (e.g. "claude-code", "codex-cli")
     - `status`: TEXT NOT NULL ("active", "paused", "completed", "terminated")
     - `started_at`: INTEGER
     - `ended_at`: INTEGER

3. **Data Access Objects (DAOs)**:
   - Provide clean async/sync Rust functions for CRUD operations on Projects and Project Memory items.
   - Implement structured error types using `thiserror`.

## Expected Output Deliverables
- `src-tauri/src/db/` directory containing database initialization, migrations, and model structs.
- Unit tests verifying database creation, insert, read, and cascade delete operations.
```

---

### Prompt 1.3: Tauri IPC Layer & Strongly-Typed Bridge

```markdown
# TASK: Build Strongly-Typed Tauri IPC Commands & Events Bridge

## Objective
Establish a clean IPC interface between Rust backend and React frontend for project management and application configuration.

## Detailed Requirements

1. **Rust IPC Command Definitions (`src-tauri/src/commands/project_commands.rs`)**:
   - `create_project(name: String, path: String) -> Result<Project, String>`
   - `get_projects() -> Result<Vec<Project>, String>`
   - `get_project_memory(project_id: String) -> Result<Vec<MemoryItem>, String>`
   - `set_project_memory(project_id: String, key: String, value: String) -> Result<MemoryItem, String>`
   - `delete_project(project_id: String) -> Result<(), String>`

2. **Register Commands in Tauri Lib (`src-tauri/src/lib.rs`)**:
   - Register all command functions in `tauri::Builder::default().invoke_handler(...)`.

3. **TypeScript Type Definitions (`src/types/ipc.ts`)**:
   - Create strict TypeScript interfaces matching Rust structs: `Project`, `MemoryItem`, `Session`.
   - Wrap `@tauri-apps/api/core` `invoke` calls into typed helper functions:
     - `api.createProject(name, path)`
     - `api.getProjects()`
     - `api.getProjectMemory(projectId)`

4. **Frontend Zustand Integration (`src/store/useProjectStore.ts`)**:
   - Create store to hold active project, list of projects, and current project decisions.
   - Actions to sync frontend state with Tauri IPC methods cleanly.

## Expected Output Deliverables
- Compiled Rust code with registered commands.
- `src/types/ipc.ts` and `src/store/useProjectStore.ts` fully connected to Tauri IPC.
```

---

### Prompt 1.4: Premium Desktop UI Shell & Layout Scaffold

```markdown
# TASK: Create Dark-Mode Desktop Interface Shell & Navigation Engine

## Objective
Build a visually stunning, glassmorphism dark-mode UI shell with a sidebar for project navigation, top header status bar, and central canvas area for terminal/timeline views.

## Detailed Requirements

1. **Design System & Aesthetics (`src/styles/globals.css`)**:
   - Deep obsidian/zinc dark theme (`#090d16` background, `#131927` card surface).
   - Crisp border highlights (`#1e293b`), glow effects for status indicators.
   - Typography: Clean sans-serif (Inter/Geist) with monospace (JetBrains Mono / Fira Code) for code & logs.

2. **Components Scaffold**:
   - `Header.tsx`:
     - Active project display with dropdown switcher.
     - Active AI Agent badge (e.g. `Claude Code CLI` / `Codex CLI`).
     - Session status pill (`Idle`, `Running`, `Paused - Awaiting Decision`).
     - Quick action buttons (New Project, Settings).
   - `Sidebar.tsx`:
     - Navigation tabs: `Terminal Orchestrator`, `Architecture Memory`, `Live Timeline`, `Risk & Danger Audit`, `Voice Control`.
     - System resource/cost summary widget.
   - `MainView.tsx`:
     - Tabbed container switching view based on active sidebar tab.
     - Glass card wrapping terminal and question drawer.

3. **UI State Management (`src/store/useUIStore.ts`)**:
   - Track active tab, drawer expansion, modal states, and notification overlays.

## Expected Output Deliverables
- Complete responsive UI layout running cleanly in Tauri dev window.
- Smooth transitions between views.
```

---

## 3. Phase 1 Verification Checklist

- [ ] `npm run tauri dev` builds without Rust or TypeScript errors.
- [ ] SQLite database creates `orchestrator.db` automatically on first start.
- [ ] IPC command test: Creating a project in the UI saves to SQLite and displays in the sidebar.
- [ ] UI shell displays pixel-perfect dark theme with active status indicators.
