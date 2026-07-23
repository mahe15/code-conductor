# 🧠 Code Conductor - Architecture & Project Memory

> **Active Project**: Code Conductor / AI Coding Orchestrator  
> **Repository**: `https://github.com/mahe15/code-conductor.git`

---

## 🔒 Locked Technology Matrix

- **Frontend**: React 19 + TypeScript 5.7
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **State Management**: Zustand 5
- **Terminal Canvas**: `@xterm/xterm` 5.5 + `@xterm/addon-fit` + `@xterm/addon-webgl`
- **CLI Engine**: Standalone Node.js Executable (`bin/cli.js`)
- **AI Model**: Google Gemini 2.5 Flash API (`gemini-2.5-flash`)
- **Local Database**: SQLite (`.orchestrator/memory.json`)
- **Native Desktop**: Tauri 2.0 (Rust)

---

## 🔑 Environment & Security Protocol

- `.env`: Stores local environment secrets (`GEMINI_API_KEY`, `VITE_GEMINI_API_KEY`). **Ignored by Git**.
- `.env.example`: Public template file.
- `.gitignore`: Explicitly blocks `.env`, `*.env`, and `.orchestrator/config.json`.

---

## ⚡ Slash Command Reference

- `/addkey <key>`: Save Google Gemini API Key
- `/apikey <key>`: Alias for `/addkey`
- `/memory`: Display locked architecture matrix
- `/production`: Enforce enterprise production readiness
- `/simple`: Enforce minimal YAGNI MVP mode
- `/commit`: Auto-stage and commit changes
- `/clear`: Clear terminal display
- `/exit`: Exit CLI session
