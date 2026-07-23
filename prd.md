Project Idea: AI Coding Orchestrator

Vision

Build an open-source desktop application that sits between the user and
AI coding agents (Antigravity CLI). Instead of letting the
coding agent make assumptions, the orchestrator continuously understands
the project, asks intelligent follow-up questions, remembers decisions,
and guides the agent until the project is complete.

The goal is NOT to replace Antigravity. The goal is to make
them smarter by preventing wrong assumptions.

------------------------------------------------------------------------

Problem

Current AI coding agents often: - Assume frameworks and databases. -
Choose architecture without asking. - Forget earlier decisions. - Ask
too few questions. - Make expensive mistakes that require rework. - Lack
persistent project memory.

Example:

User: Build a social media app.

AI immediately chooses: - React - Firebase - Material UI

Maybe the user actually wanted: - Flutter - FastAPI - PostgreSQL

Hours of work may be wasted.

------------------------------------------------------------------------

Solution

The application becomes an AI Project Manager.

Flow:

User ↓

AI Orchestrator ↓

Claude Code / Codex CLI ↓

Code

The orchestrator never lets the coding agent guess important decisions.

------------------------------------------------------------------------

Core Features

1. Smart Follow-up Question Engine

Analyze every prompt.

Find missing information.

Ask only high-impact questions.

Examples: - Mobile or Web? - Flutter or React? - Firebase or Supabase? -
Authentication? - Offline support? - Admin panel? - Target users? - MVP
or Production?

Stop asking once confidence is high.

------------------------------------------------------------------------

2. Project Memory

Store every project decision.

Examples: Framework = Flutter Backend = FastAPI Database = PostgreSQL
Theme = Dark Cloud = AWS State Management = Riverpod

Never ask the same question twice.

------------------------------------------------------------------------

3. Live AI Controller

Instead of talking directly to Claude Code:

User → Orchestrator → Claude Code

The orchestrator: - launches the agent - streams output - pauses
execution - resumes execution - injects additional prompts - monitors
progress

Support initially: - Claude Code - Codex CLI

Future: - Gemini CLI - Aider - Roo Code

------------------------------------------------------------------------

4. Decision Detector

Continuously inspect AI output.

Example:

AI: “I’ll use Firebase Authentication.”

User never selected authentication.

Pause.

Ask: Should I use: - Firebase Auth - Cognito - Auth0 - Supabase Auth

Continue after answer.

------------------------------------------------------------------------

5. Voice Mode

User can leave the computer.

If a decision is needed:

Computer speaks: “Should buttons have rounded corners?”

User replies: “Rounded”

Continue automatically.

Components: - Speech to Text - Text to Speech

------------------------------------------------------------------------

6. Command Center

Commands: - /pause - /resume - /stop - /production - /simple -
/optimize - /test - /document - /commit - /undo

------------------------------------------------------------------------

7. Project Timeline

Show completed tasks.

Example: ✔ Authentication ✔ Database ✔ UI ⏳ Payments ⬜ Notifications
⬜ CI/CD

------------------------------------------------------------------------

8. Architecture Memory

Understand the project.

Example: Frontend: Flutter

Backend: FastAPI

Database: PostgreSQL

Cloud: AWS

Future prompts automatically use these.

------------------------------------------------------------------------

9. Risk Detector

Warn before dangerous actions.

Examples: - Delete migrations - Drop database - Force push - Delete
project files - Rewrite Git history

Require confirmation.

------------------------------------------------------------------------

10. Cost Awareness

Warn about expensive choices.

Example:

AI wants Kubernetes.

Current project: 500 users.

Suggestion: Docker Compose is sufficient.

------------------------------------------------------------------------

11. Git Integration

Track: - commits - branches - rollback - diffs - auto commit

------------------------------------------------------------------------

12. Session Replay

Replay an entire AI session: - prompts - questions - decisions - files
changed - timeline

------------------------------------------------------------------------

Architecture

Desktop App (Tauri + React)

Modules: - Chat UI - Question Engine - Memory Engine - AI Controller -
Voice Engine - Timeline Engine - Risk Engine - Plugin System

Database: SQLite

------------------------------------------------------------------------

Suggested Tech Stack

Desktop: - Tauri - React - TypeScript - Tailwind CSS - Zustand

Backend: - Rust (Tauri backend)

Database: - SQLite

Voice: - Whisper STT - Native TTS/OpenAI TTS

AI: - Claude Code CLI - Codex CLI

------------------------------------------------------------------------

MVP

1.  Desktop UI
2.  Claude Code integration
3.  Codex integration
4.  Question engine
5.  Memory
6.  Pause/resume
7.  Timeline

------------------------------------------------------------------------

Version 2

-   Voice mode
-   Git integration
-   Cost estimator
-   Risk detection
-   Plugin system
-   VS Code extension

------------------------------------------------------------------------

Version 3

-   Multi-agent collaboration
-   Local models
-   Team collaboration
-   Cloud sync
-   Analytics dashboard
-   Marketplace for plugins

------------------------------------------------------------------------

Biggest Technical Challenges

1.  Detecting assumptions made by the coding agent.
2.  Knowing when to interrupt.
3.  Avoiding unnecessary questions.
4.  Maintaining conversation context.
5.  Supporting multiple agents with a common interface.

------------------------------------------------------------------------

Long-Term Vision

Become the universal orchestration layer for AI coding agents.

Instead of replacing coding agents, coordinate them with intelligent
planning, memory, decision management, and human interaction.

Possible slogan:

“Stop AI from guessing. Make it ask.”
