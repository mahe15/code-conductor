# Phase 4: Architectural Memory Store & Command Center

> **Focus**: Persistent Architecture Memory (Architectural Decision Records / ADRs), project technical matrix visualization, and an interactive Slash Command Center (`/pause`, `/commit`, `/production`, `/simple`, `/optimize`, `/test`, `/undo`).

---

## 1. Phase Architecture Overview

The **Architectural Memory Store** maintains a single source of truth for all technical choices made in a project (Frameworks, Databases, Auth, CSS, State Management, Cloud Infrastructure). It ensures future AI prompts automatically respect previous decisions. The **Command Center** provides developers with power-user control over agent behavior through instant slash commands.

### Architecture Overview

```
┌───────────────────────────────────────────────────────────────────────────┐
│                      Command Center Bar (React UI)                        │
│   Input: "/production Make authentication enterprise-ready with OAuth"    │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼ (Parse Slash Command)
┌───────────────────────────────────────────────────────────────────────────┐
│                     Command Dispatcher (TypeScript / Rust)                │
│  - /pause      -> Sends SIGSTOP to PTY                                    │
│  - /commit     -> Triggers auto-git commit with AI generated msg        │
│  - /production -> Appends Security, Logging, and Error Handling Context   │
│  - /simple     -> Appends YAGNI / Minimal MVP Constraints Context         │
│  - /optimize   -> Appends Performance Optimization Directive              │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    SQLite Architecture Memory Sync                        │
│  - Reads/Writes `project_memory` & ADR (Architectural Decision Records)   │
│  - Enforces decisions across active AI Agent sessions                     │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. In-Depth Engineering Prompts for Phase 4

---

### Prompt 4.1: Architecture Memory Store & ADR Generator Engine

```markdown
# TASK: Implement Rust Architecture Memory Engine & ADR Exporter

## Objective
Build a memory management module in Rust (`src-tauri/src/memory/manager.rs`) that persists project decisions, constructs system context prompts, and generates Architectural Decision Records (`docs/adr/ADR-xxx.md`).

## Detailed Requirements

1. **Memory Key Schema**:
   - Supported standard decision keys:
     - `stack.frontend`: e.g. "React + TypeScript"
     - `stack.backend`: e.g. "FastAPI (Python)"
     - `stack.database`: e.g. "PostgreSQL"
     - `stack.auth`: e.g. "Supabase Auth"
     - `stack.styling`: e.g. "Tailwind CSS v4"
     - `architecture.pattern`: e.g. "Clean Architecture / Repository Pattern"
     - `deployment.target`: e.g. "Docker Compose on Hetzner"

2. **ADR (Architectural Decision Record) Exporter**:
   - Generate markdown files in the target project folder under `docs/adr/`:
     ```markdown
     # ADR-001: Selection of Supabase Auth for User Authentication
     
     ## Status
     Accepted
     
     ## Context
     The project requires secure multi-factor authentication with minimal backend maintenance.
     
     ## Decision
     Use Supabase Auth integrated with React frontend.
     
     ## Consequences
     - Eliminates custom auth maintenance.
     - Enforces PostgreSQL RLS rules.
     ```

3. **IPC Interface Functions**:
   - `get_all_memory_items(project_id: String) -> Result<Vec<MemoryItem>, String>`
   - `update_memory_item(project_id: String, key: String, value: String) -> Result<(), String>`
   - `export_adr_files(project_id: String) -> Result<Vec<String>, String>`

## Expected Output Deliverables
- `memory/manager.rs` module with ADR file generator.
- Integration tests verifying markdown ADR file creation.
```

---

### Prompt 4.2: Architecture Memory Dashboard Component

```markdown
# TASK: Build Interactive Architecture Memory UI Dashboard

## Objective
Create a visual matrix dashboard component (`src/components/memory/MemoryDashboard.tsx`) where developers can view, search, add, edit, or lock project architectural decisions.

## Detailed Requirements

1. **Matrix Layout Grid**:
   - Organize decisions by categories: **Frontend**, **Backend**, **Database & Storage**, **Authentication & Security**, **Cloud & DevOps**, **State & Libraries**.
   - Display each decision as a stylized Glass Card:
     - Category Icon (Lucide react icons).
     - Decision Key & Value badge.
     - Confidence score indicator (e.g. `100% Confirmed`).
     - Lock toggle (locked decisions cannot be overwritten by AI agents).
     - Edit/Delete buttons.

2. **Manual Decision Add Modal**:
   - Button "+ Add Architectural Choice".
   - Form fields: Category, Tech Stack/Tool Name, Rationale.
   - On save: Persist to SQLite and update memory context immediately.

3. **Export & Sync Tools**:
   - "Export ADRs" button: Triggers Rust markdown ADR file generation.
   - "Copy AI System Prompt" button: Copies the rendered system context block to clipboard.

## Expected Output Deliverables
- Fully responsive `MemoryDashboard.tsx` view embedded into the main navigation sidebar.
- Smooth CRUD operations syncing with Rust SQLite backend.
```

---

### Prompt 4.3: Command Center Parser & Slash Command Dispatcher

```markdown
# TASK: Build Command Center Input Engine & Slash Command Parser

## Objective
Create a command parser service (`src/services/commandCenter.ts`) that intercepts `/` commands entered in the prompt bar and routes them to dedicated execution handlers.

## Detailed Requirements

1. **Supported Slash Commands**:
   - `/pause`: Immediately send pause signal (`SIGSTOP`) to active agent.
   - `/resume`: Send resume signal (`SIGCONT`) to paused agent.
   - `/stop` or `/kill`: Gracefully terminate child process.
   - `/production`: Inject strict enterprise directives (error logging, security, validation).
   - `/simple`: Inject YAGNI/KISS directive (no over-engineering, minimal code).
   - `/optimize`: Inject performance optimization instructions.
   - `/test`: Command agent to generate full test suite (unit + integration).
   - `/document`: Command agent to document code and write README/API specs.
   - `/commit`: Trigger git commit with AI-generated commit message.
   - `/undo`: Revert recent AI changes using Git stash/reset.

2. **Parser Interface**:
   ```typescript
   export interface ParsedCommand {
     isCommand: boolean;
     commandName: string | null;
     args: string;
     rawInput: string;
   }
   
   export function parseCommand(input: String): ParsedCommand;
   ```

3. **Command Bar UI (`src/components/command/CommandBar.tsx`)**:
   - Input prompt bar with auto-complete dropdown popover when user types `/`.
   - Displays command badges with hover descriptions.

## Expected Output Deliverables
- `CommandBar.tsx` with fuzzy autocomplete for slash commands.
- Command parser module with unit tests for parameter extraction.
```

---

### Prompt 4.4: Command Execution Handlers (/production, /simple, /commit, /undo)

```markdown
# TASK: Implement Command Execution Handlers & Directives

## Objective
Build specific execution logic for high-impact slash commands to inject context directives or trigger system operations.

## Detailed Requirements

1. **Directive Injectors**:
   - **/production Handler**:
     Appends context:
     `"[DIRECTIVE: PRODUCTION-READY MODE]\nBuild with strict TypeScript types, input validation, structured error handling, rate limiting, and comprehensive log instrumentation. Do not use mock data."`
   - **/simple Handler**:
     Appends context:
     `"[DIRECTIVE: MINIMAL MVP MODE]\nKeep code minimal, clear, and focused strictly on basic functionality. Follow YAGNI principles. Avoid adding speculative abstractions or extra microservices."`
   - **/optimize Handler**:
     Appends context:
     `"[DIRECTIVE: PERFORMANCE OPTIMIZATION]\nAnalyze code for memory leaks, redundant database queries, large bundle sizes, and un-memoized re-renders."`

2. **System Action Handlers**:
   - **/commit Handler**:
     - Call Rust Git helper to stage changes (`git add .`).
     - Prompt LLM/Agent to generate concise conventional commit message.
     - Execute `git commit -m "..."`.
   - **/undo Handler**:
     - Call Rust Git helper to execute `git reset --hard HEAD~1` or `git stash pop` after user confirmation dialog.

## Expected Output Deliverables
- Fully functioning slash command pipeline connecting UI Command Bar to PTY stdin and Rust Git primitives.
```

---

## 3. Phase 4 Verification Checklist

- [ ] Architectural decisions are correctly saved in SQLite and displayed on the Memory Matrix UI.
- [ ] Clicking "Export ADRs" generates clean markdown ADR files in `docs/adr/`.
- [ ] Typing `/` in the prompt bar opens an interactive command suggestion popover.
- [ ] `/production` and `/simple` append clear architectural directives to the active agent prompt.
- [ ] `/commit` automatically stages files and creates a git commit.
