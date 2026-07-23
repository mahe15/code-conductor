# 🚀 Code Conductor - AI Coding Orchestrator

> **Slogan**: *"Stop AI from guessing. Make it ask."*  
> **Repository**: [github.com/mahe15/code-conductor](https://github.com/mahe15/code-conductor)

Code Conductor is an **AI-Native Coding Orchestrator & Technical Product Manager** built with React 19, TypeScript, Vite 6, Tailwind CSS v4, Zustand 5, `@xterm/xterm`, Node.js CLI Engine, and Tauri 2.0 (Rust). It intercepts unverified AI assumptions, guards against destructive commands, enforces locked architecture decisions, monitors live subagent transcripts with **Google Gemini 2.5 Flash API**, and exports standardized Architectural Decision Records (ADRs).

---

## 🌟 Key Features

1. **Interactive Terminal CLI (`npm run cli` / `node bin/cli.js` / `npx code-conductor`)**:
   - Standalone CLI application that runs directly in PowerShell, Command Prompt, or Git Bash.
   - Live colorized ANSI prompt (`orchestrator>`) with slash command support and system command routing.

2. **Google Gemini 2.5 Flash Integration**:
   - Powered by `gemini-2.5-flash` API for ultra-fast, intelligent orchestration planning without outputting giant 500-line unrequested code dumps.
   - Slash command `/addkey <your_gemini_api_key>` (or `/apikey <key>`) to set and persist your API key.

3. **Antigravity Live Conversation Stream Monitor**:
   - Continuously monitors PTY logs and subagent transcripts.
   - Detects unconfirmed tech choices (Prisma, Auth0, MongoDB, Chakra UI) and automatically triggers interactive clarification questions before coding begins.

4. **Architecture Memory Store & Decision Locker**:
   - Locks core technology choices (Frontend, Backend, Database, Auth, Styling) in `.orchestrator/memory.json`.
   - Exports standardized markdown Architectural Decision Records (ADRs) with 1-click browser downloads.

5. **Risk Guard & Destructive Command Interceptor**:
   - Detects dangerous commands (`DROP DATABASE`, `rm -rf /`, `git push --force`).
   - Blocks process execution and requires typing `CONFIRM` before proceeding.

6. **Infrastructure Cost Advisor**:
   - Warns against expensive cloud databases (MongoDB Atlas, Managed Postgres) and recommends zero-cost alternatives (SQLite, Supabase Free Tier).

7. **Voice Control Studio & Time-Machine Session Replayer**:
   - Integrated Text-to-Speech (TTS) and Speech-to-Text (STT) audio visualizer.
   - Time-machine terminal replay controls (`1x`, `2x`, `4x` scrub speed).

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/mahe15/code-conductor.git
cd code-conductor
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` to add your Gemini API key:
```env
GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere
VITE_GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere
```

---

## 💻 Running the Application

### Mode A: Terminal CLI Application
```bash
npm run cli
```
*(Or: `node bin/cli.js` or `npx code-conductor`)*

### Mode B: AI Studio Web Interface
```bash
npm run dev
```
Open **`http://localhost:1420/`** in your browser.

---

## 🎮 Slash Command Reference

| Command | Description |
| :--- | :--- |
| `/addkey <key>` | Set your Google Gemini API Key (`/addkey AIzaSy...`) |
| `/apikey <key>` | Alias for `/addkey` |
| `/memory` | Display locked architecture matrix table |
| `/production` | Enforce enterprise production-readiness directives |
| `/simple` | Enforce minimal YAGNI MVP directives |
| `/commit` | Auto-stage and create conventional git commit |
| `/clear` | Clear terminal / CLI screen |
| `/exit` | Exit CLI tool session |

---

## 🧪 Testing & Verification

```bash
# 1. Run TypeScript Type Checker (0 errors)
npx tsc --noEmit

# 2. Build Production Bundle
npm run build
```

See [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) for full scenario-by-scenario testing instructions.

---

## 📄 License
MIT License. Created for AI-driven software orchestration.
