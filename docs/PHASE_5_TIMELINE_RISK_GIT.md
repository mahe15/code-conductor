# Phase 5: Live Project Timeline, Risk Engine & Git Integration

> **Focus**: Building the Live Project Task Timeline, Destructive Action Risk Guard (preventing database wipes, file deletions, force pushes), Infrastructure Cost Estimator, and native Git Integration.

---

## 1. Phase Architecture Overview

AI coding agents left unattended may execute destructive terminal commands (such as `rm -rf`, `drop database`, `git push --force`) or provision expensive cloud resources (such as multi-region Kubernetes clusters for a simple MVP). Phase 5 introduces a multi-layered **Safety & Observability Suite**:

1. **Risk Engine**: Intercepts command strings before execution and blocks dangerous operations until developer confirmation.
2. **Cost Estimator**: Evaluates architectural choices against user project scale and warns about excessive cost.
3. **Live Timeline**: Automatically extracts progress milestones from git logs and terminal output.
4. **Git Engine**: Tracks line diffs, active branches, and provides one-click rollbacks.

### Risk & Security Guard Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                      Agent Action / Command Stream                        │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           Rust Risk Inspector                             │
│  Inspects command against dangerous patterns:                             │
│  - Database: DROP DATABASE, DROP TABLE, prisma db push --force-reset      │
│  - Filesystem: rm -rf, Remove-Item -Recurse -Force, Format-Volume         │
│  - Git: git push --force, git reset --hard HEAD~N, git clean -fd          │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                         Dangerous Command Found? YES
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      CRITICAL RISK INTERCEPTOR PAUSE                      │
│  - Immediately suspend process (`SIGSTOP`)                                │
│  - Trigger Danger Confirmation Modal with Red Alert & Exact Command       │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Developer manual approval
                                      ▼
                   [ Execute Command ]  or  [ Deny Action ]
```

---

## 2. In-Depth Engineering Prompts for Phase 5

---

### Prompt 5.1: Live Project Timeline Engine & Task Milestone Tracker

```markdown
# TASK: Implement Live Project Timeline Engine & Task Parser

## Objective
Build a timeline module (`src-tauri/src/timeline/mod.rs`) and React component (`src/components/timeline/TimelineView.tsx`) to track completed, active, and upcoming project tasks.

## Detailed Requirements

1. **Task Model & SQLite Storage**:
   - Create table `project_tasks`:
     - `id`: TEXT PRIMARY KEY
     - `project_id`: TEXT FOREIGN KEY
     - `title`: TEXT NOT NULL (e.g. "Database Schema Setup")
     - `category`: TEXT (e.g. "Database", "Authentication", "UI", "Payments", "CI/CD")
     - `status`: TEXT NOT NULL ("completed", "in_progress", "pending")
     - `updated_at`: INTEGER

2. **Automated Progress Parser**:
   - Scan PTY stdout for completed milestones (e.g., `"✔ Authentication configured successfully"`, `"Migration completed"`, `"Tests passed"`).
   - Automatically update task statuses in SQLite and broadcast event `timeline-updated` to UI.

3. **Timeline UI View Component**:
   - Render vertical timeline with glowing status badges:
     - ✔ Completed (Green glow)
     - ⏳ In Progress (Indigo pulsing spinner)
     - ⬜ Pending (Gray border)
   - Category filtering pills (Database, Auth, UI, API, Deployment).
   - Manual "+ Add Task" and task status toggles.

## Expected Output Deliverables
- `TimelineView.tsx` component displaying active project progress.
- Automatic task status updates triggered by terminal stream events.
```

---

### Prompt 5.2: Destructive Action Risk Detector & Safety Interceptor

```markdown
# TASK: Implement Dangerous Action Risk Detector & Approval Guard

## Objective
Create a zero-latency command safety guard in Rust (`src-tauri/src/engine/risk_guard.rs`) that detects dangerous system commands before they execute in the PTY.

## Detailed Requirements

1. **Dangerous Command Rule Engine**:
   - Define severe risk rules:
     - **Database Destruction**: `/(DROP\s+DATABASE|DROP\s+TABLE|truncate\s+table|prisma\s+db\s+push\s+--force-reset|rails\s+db:drop)/i`
     - **File Destruction**: `/(rm\s+-rf\s+[/~]|Remove-Item\s+.*-Recurse\s+-Force|del\s+\/s\s+\/q)/i`
     - **Git History Erasure**: `/(git\s+push\s+.*--force|git\s+reset\s+--hard|git\s+clean\s+-f)/i`
     - **System Overwrite**: `/(dd\s+if=|mkfs|chmod\s+-R\s+777\s+\/)/i`

2. **Interception Protocol**:
   - Intercept command string before writing to PTY master writer.
   - If dangerous match found:
     - DO NOT send command to PTY stdin.
     - Suspend process execution (`SIGSTOP`).
     - Send `risk-alert-required` event to Tauri frontend containing:
       - `command`: Full raw dangerous command.
       - `risk_level`: "CRITICAL" / "HIGH".
       - `reason`: Description of risk (e.g., *"This command will permanently delete database migrations"*).

3. **Frontend Danger Confirmation Modal (`src/components/risk/DangerModal.tsx`)**:
   - High-visibility red backdrop modal with pulse effect.
   - Requires explicit confirmation (Developer must click *"Approve Execution"* or type `"CONFIRM"` for extreme actions).
   - If Denied: Send cancellation signal to PTY stdin (`\x03` CTRL+C) and resume process.

## Expected Output Deliverables
- `risk_guard.rs` module with comprehensive regular expression matcher.
- Red-alert `DangerModal.tsx` component with approval/denial controls.
```

---

### Prompt 5.3: Architecture Cost Estimator & Cloud Resource Guard

```markdown
# TASK: Build Architecture Cost Estimator & Over-Engineering Guard

## Objective
Implement an advisory cost analysis engine (`src-tauri/src/engine/cost_estimator.rs`) that alerts developers when an AI agent proposes expensive cloud infrastructure beyond project scale requirements.

## Detailed Requirements

1. **Cost Threshold Evaluator**:
   - Compare proposed infrastructure against target scale stored in project memory:
     - If Project Scale = "MVP / Early Stage" (< 5,000 monthly users):
       - Flag proposed: **Kubernetes (EKS/GKE)** -> Estimated cost: `$150+ / month`. Suggestion: *"Docker Compose or Single VPS (Hetzner/DigitalOcean) is sufficient ($5-$20/mo)."*
       - Flag proposed: **Multi-region DynamoDB / Aurora Global** -> Estimated cost: `$200+ / month`. Suggestion: *"Single instance PostgreSQL / Supabase is sufficient."*
       - Flag proposed: **Enterprise ElasticSearch Cluster** -> Estimated cost: `$100+ / month`. Suggestion: *"SQLite FTS5 or PostgreSQL pgvector is sufficient."*

2. **Cost Warning UI Widget (`src/components/cost/CostWarningWidget.tsx`)**:
   - Render warning card in terminal view when high-cost architecture is detected:
     - Estimated Monthly Infrastructure Cost comparison (Proposed vs Recommended).
     - Single-click action: *"Apply Budget-Friendly Alternative"* (injects prompt directive).

## Expected Output Deliverables
- `cost_estimator.rs` logic module with pre-loaded cloud cost database estimates.
- `CostWarningWidget.tsx` component with cost saving recommendation toggles.
```

---

### Prompt 5.4: Git Integration Module & Visual Diff Viewer UI

```markdown
# TASK: Build Native Git Manager & Visual Code Diff Viewer

## Objective
Create a Git integration module in Rust (`src-tauri/src/git/mod.rs`) using `git2` crate or `git` CLI, along with a React diff viewer component (`src/components/git/GitDiffViewer.tsx`).

## Detailed Requirements

1. **Rust Git Helper API**:
   - `get_git_status(path: &str) -> Result<GitStatus, String>`: Returns modified, staged, untracked files count and active branch name.
   - `get_file_diff(path: &str, file_path: &str) -> Result<String, String>`: Returns unified diff string for specified file.
   - `create_snapshot(path: &str, message: &str) -> Result<String, String>`: Creates auto-stash or temporary git commit before major AI agent operations.
   - `rollback_snapshot(path: &str, commit_hash: &str) -> Result<(), String>`: Reverts repository to snapshot state.

2. **React Diff Viewer Component (`GitDiffViewer.tsx`)**:
   - Render side-by-side or inline code diffs using `@monaco-editor/react` or `react-diff-viewer-continued`.
   - File tree selector showing changed files list with green additions (`+`) and red deletions (`-`).
   - One-click "Rollback File" and "Stage File" buttons.

## Expected Output Deliverables
- `git/mod.rs` module with clean wrapper around repository operations.
- Interactive `GitDiffViewer.tsx` component accessible via header toolbar.
```

---

## 3. Phase 5 Verification Checklist

- [ ] Live Timeline component accurately updates task statuses as milestones pass.
- [ ] Risk guard intercepts dangerous commands (`DROP DATABASE`, `rm -rf`, `git push --force`) and pauses PTY process instantly.
- [ ] Red-alert `DangerModal.tsx` presents exact command and requires developer approval before proceeding.
- [ ] Cost estimator displays budget warnings when high-cost cloud resources are suggested.
- [ ] Git Diff Viewer displays modified files and line-by-line diffs cleanly.
