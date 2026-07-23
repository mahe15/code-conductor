# AI Coding Orchestrator - Full Testing Guide

> **Project**: Code Conductor / AI Coding Orchestrator  
> **Slogan**: *"Stop AI from guessing. Make it ask."*

---

## 🎯 Testing Overview

The AI Coding Orchestrator can be tested in **two primary modes**:
1. **Interactive Terminal CLI Mode** (`npm run cli` / `node bin/cli.js`): Runs directly inside PowerShell, Command Prompt, or Git Bash terminal.
2. **AI Studio GUI Workspace Mode** (`npm run dev`): Runs inside your web browser / desktop window at `http://localhost:1420/`.

---

## 💻 Mode 1: Testing the Terminal CLI Application

Launch the interactive CLI tool in your terminal:

```bash
npm run cli
```

*(Alternatively: `node bin/cli.js` or `npx code-conductor`)*

### Test Scenario A: Assumption Interception Engine
1. Type a prompt containing an unconfirmed technology choice:
   ```text
   orchestrator> Build a user login system with Firebase Auth
   ```
2. **Expected Result**: The CLI automatically pauses execution and displays an interactive numbered choice menu:
   ```text
   [AI ASSUMPTION INTERCEPTED]
   Which Authentication solution should this project use?

     1) Supabase Auth
     2) Firebase Auth
     3) Auth0
     4) Custom JWT / OAuth2

   Select option [1-4]: 
   ```
3. Type `1` and press **Enter**.
4. **Result**: Choice is saved into `.orchestrator/memory.json` and execution resumes with the enforced decision.

---

### Test Scenario B: Dangerous Command Risk Guard
1. Type a destructive database or filesystem command:
   ```text
   orchestrator> DROP DATABASE production_db;
   ```
   *or*
   ```text
   orchestrator> rm -rf /
   ```
2. **Expected Result**: The CLI blocks execution with a bright red warning banner:
   ```text
   [DANGER ALERT] This command will permanently drop database tables and erase project data.
   Command: DROP DATABASE production_db;
   Type CONFIRM to execute: 
   ```
3. Press **Enter** without typing `CONFIRM`.
4. **Result**: Command is safely blocked (`✔ Command blocked and canceled.`).

---

### Test Scenario C: Slash Commands & Memory Inspection
Try entering the following slash commands in the terminal CLI:

- `/memory` -> Displays your project's locked architecture matrix.
- `/production` -> Injects enterprise production-readiness context directives.
- `/simple` -> Injects minimal MVP YAGNI context directives.
- `/help` -> Displays the CLI command reference menu.
- `/exit` -> Safely exits the CLI session.

---

## 🌐 Mode 2: Testing the Web / GUI Studio Interface

Launch the local development server:

```bash
npm run dev
```

Open your browser to: **`http://localhost:1420/`**

### Test Scenario A: AI Studio Chat Workspace
1. Select **AI Studio Workspace** from the left sidebar.
2. Click any of the **Quick Directive Chips** below the prompt bar (e.g. *"Build User Authentication"* or *"Setup PostgreSQL Database"*).
3. Type a custom prompt in the Command Bar and press **Send**.
4. Toggle between **AI Studio View** and **Raw PTY Logs** using the top-right view switcher.

---

### Test Scenario B: Interactive Interception Simulator
1. Click the **Simulate Interception** button in the top navigation header bar.
2. **Expected Result**: The glassmorphic **Smart Decision Drawer** pops up over the UI with choice cards:
   - *Supabase Auth*
   - *Firebase Auth*
   - *Auth0*
   - *Custom JWT*
3. Click **Supabase Auth** and click **Confirm & Inject Decision**.
4. **Result**: The decision is saved into the Architecture Memory store, injected into the agent stream, and process execution resumes.

---

### Test Scenario C: Architecture Memory & ADR Exporter
1. Click **Architecture Memory** in the left sidebar.
2. View locked decision cards (React 19, TypeScript, Tailwind v4, SQLite).
3. Click **Export ADRs**: Automatically generates and downloads markdown Architectural Decision Record files (`ADR-001-stack-frontend.md`, etc.).
4. Click **Copy AI Prompt**: Copies rendered `[SYSTEM CONTEXT ENFORCEMENT]` prompt context to your clipboard.

---

### Test Scenario D: Live Task Timeline & Risk Guard View
1. Click **Live Timeline**: View completed and in-progress project task milestones.
2. Click **Risk & Git Guard**: Inspect changed files and test the one-click **Rollback Last Commit** tool.

---

### Test Scenario E: Voice Control Studio & Session Replayer
1. Click **Voice Control Studio**:
   - Click **Test Speech Synthesizer** to test Text-to-Speech (TTS).
   - Click **Start Voice Listening** to test Speech-to-Text (STT) audio capture with the ambient glowing mic visualizer orb.
2. At the bottom of the Terminal view, test the **Time-Machine Session Replayer**:
   - Click **Play / Pause**.
   - Change speed to **2x** or **4x** to watch past terminal events scrub across the timeline.

---

## 🧪 Automated Verification & Build Commands

Run automated static type checks and production bundle builds:

```bash
# 1. Run TypeScript Type Checker (0 errors expected)
npx tsc --noEmit

# 2. Build Production Bundle
npm run build
```

---

## 🦀 Optional: Compiling Native Desktop Binary (Rust + Tauri)

To compile the native Windows desktop binary (`.exe` / `.msi`):
1. Install Rust toolchain: `winget install Rustlang.Rustup` (or download from [rustup.rs](https://rustup.rs/)).
2. Open a new terminal and run:
   ```bash
   npm run tauri dev
   ```
