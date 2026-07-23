# Phase 3: AI Decision Engine & Smart Follow-Up Question Generator

> **Focus**: Intercepting AI agent stream output, detecting unconfirmed technical assumptions (frameworks, databases, auth, hosting), automatically pausing execution, asking high-impact clarifying questions, and injecting user decisions back into the prompt stream.

---

## 1. Phase Architecture Overview

The core objective of the Orchestrator is preventing expensive AI rework caused by unverified assumptions. The **Decision Engine** runs a lightweight local or remote LLM stream evaluator in parallel with the PTY output stream. When the engine detects that the AI agent is about to make an architectural choice without prior user consent (or when the user prompt lacks crucial specifications), it instantly triggers a **PTY Pause**, presents a structured **Question Drawer**, captures the user's explicit preference, saves it to Project Memory, and resumes execution with an injected directive.

### Interception & Question Flow

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       PTY Output Stream (Rust)                            │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼ (Raw stream chunk buffer)
┌───────────────────────────────────────────────────────────────────────────┐
│                   Assumption Interceptor Engine                           │
│  - Pattern Matcher (Regex heuristics for choices: "I will use...", "Setting up...")│
│  - LLM Analyzer (Fast classification: Is agent assuming technology?)     │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                         Choice Detected? YES
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           AGENT PAUSE TRIGGER                             │
│  - Send SIGSTOP to PTY Process                                            │
│  - Emit Tauri event `decision-required` with options                      │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                   React UI: Smart Question Modal                          │
│  - Shows question: "Which Auth provider do you prefer?"                   │
│  - Options: [ Firebase Auth ] [ Supabase Auth ] [ Auth0 ] [ Custom JWT ]  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ User selects option
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        DECISION RESUME PROTOCOL                           │
│  1. Save choice to SQLite Project Memory ("auth_provider" = "Supabase")    │
│  2. Inject user choice into PTY stdin ("Use Supabase Auth as requested.") │
│  3. Send SIGCONT to PTY Process to continue execution                     │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. In-Depth Engineering Prompts for Phase 3

---

### Prompt 3.1: Stream Inspection Engine & Regex/Heuristic Interceptor

```markdown
# TASK: Build High-Speed Stream Inspection & Assumption Interceptor Engine

## Objective
Create a Rust module (`src-tauri/src/engine/interceptor.rs`) that evaluates stdout chunks in real-time to flag unconfirmed technical choices.

## Detailed Requirements

1. **Pattern Matching Rule Set**:
   - Define configurable detection heuristics for common AI framework/library assumptions:
     - **Authentication**: `/(I will use|Setting up|Installing|Choosing)\s+(Firebase Auth|Auth0|Clerk|NextAuth|Cognito)/i`
     - **Database**: `/(Configuring|Connecting to|Installing)\s+(MongoDB|PostgreSQL|MySQL|Firebase|Supabase|SQLite|Redis)/i`
     - **Frontend Stack**: `/(Scaffolding|Initializing|Using)\s+(Tailwind|Material UI|Chakra|Bootstrap|Shadcn)/i`
     - **State Management**: `/(Adding|Installing)\s+(Redux|Zustand|MobX|Riverpod|Provider|Recoil)/i`
     - **Cloud/Hosting**: `/(Deploying to|Configuring|Setting up)\s+(AWS|Vercel|Netlify|Docker|Kubernetes)/i`

2. **Stream Buffer Window Evaluator**:
   - Maintain a sliding window buffer of recent terminal output (last 1000 characters).
   - When a pattern matches, trigger an async evaluation request to verify if this decision exists in `ProjectMemory`.
   - If key exists in `ProjectMemory` -> DO NOT interrupt (already decided).
   - If key is missing from `ProjectMemory` -> Trigger `DecisionRequiredEvent`.

3. **Event Payload Struct**:
   ```rust
   pub struct DecisionRequiredEvent {
       pub session_id: String,
       pub category: String, // e.g. "authentication", "database"
       pub detected_assumption: String, // e.g. "Firebase Auth"
       pub suggested_options: Vec<String>,
       pub question_prompt: String,
   }
   ```

## Expected Output Deliverables
- `interceptor.rs` module with zero-copy string scanning for minimal latency overhead.
- Unit test suite verifying detection of key tech stack assumption phrases.
```

---

### Prompt 3.2: LLM Decision Engine Middleware & Prompt Enrichment Service

```markdown
# TASK: Build LLM Prompt Analyzer & Enrichment Service

## Objective
Implement an LLM Middleware service in Rust (`src-tauri/src/engine/llm.rs`) using local (Ollama/llama.cpp) or remote (OpenAI/Anthropic API) models to pre-analyze initial user prompts, ask initial follow-up questions, and enrich prompts with stored memory.

## Detailed Requirements

1. **LLM Provider Abstraction**:
   - Create trait `LlmProvider`:
     - `analyze_prompt(prompt: &str, project_memory: &[MemoryItem]) -> Result<PromptAnalysis>`
     - `generate_followup_questions(prompt: &str) -> Result<Vec<FollowupQuestion>>`

2. **Initial Prompt Analyzer (`PromptAnalysis`)**:
   - When a user submits an initial prompt (e.g., *"Build a SaaS dashboard"*):
     - Identify missing high-impact project attributes:
       - Frontend Framework (React, Vue, Svelte, Flutter)
       - Backend Language/Framework (Node.js, FastAPI, Go, Rust)
       - Database Type (Relational, Document, In-Memory)
       - Authentication Requirement (Yes/No, Provider)
     - Calculate overall **Prompt Confidence Score** (0.0 to 1.0).

3. **Prompt Enrichment Engine**:
   - Automatically append active Project Memory decisions to outgoing AI prompts before sending them to the PTY agent:
     ```text
     [SYSTEM CONTEXT ENFORCEMENT]
     Active Project Architecture Decisions:
     - Framework: React (TypeScript)
     - Styling: Tailwind CSS v4
     - Database: PostgreSQL
     - Auth: Supabase Auth
     DO NOT ask or deviate from these established choices.
     
     [USER PROMPT]
     <User's original prompt>
     ```

## Expected Output Deliverables
- `llm.rs` module supporting configurable API endpoints (OpenAI, Anthropic, or Local Ollama).
- Prompt enrichment engine that appends project architectural context automatically.
```

---

### Prompt 3.3: High-Impact Question Generator & Confidence Evaluator

```markdown
# TASK: Build Question Generator & Confidence Score Evaluator

## Objective
Create an intelligent question generator that limits user friction by asking only high-impact questions and stopping questions once decision confidence exceeds threshold (e.g. >= 0.85).

## Detailed Requirements

1. **Question Impact Ranking**:
   - Rank decisions by impact factor:
     - **Tier 1 (Critical - Ask Immediately)**: App Type (Mobile vs Web), Primary Tech Stack, Database Model, Authentication.
     - **Tier 2 (Secondary - Ask only if relevant)**: UI Component Library, State Management tool, Deployment Target.
     - **Tier 3 (Low - Let Agent decide)**: Code formatting rules, minor utility libraries.

2. **Confidence Evaluator**:
   - Maintain project confidence score based on saved memory keys:
     - Baseline score = `0.0`.
     - Stored Tier 1 key = `+0.25` each.
     - Stored Tier 2 key = `+0.10` each.
   - When confidence score reaches `>= 0.85`, auto-approve minor decision points and stop prompting the user for low-tier choices.

3. **Question Formats**:
   - Multiple Choice (Single selection radio/card).
   - Multi-Select Checkboxes.
   - Custom Write-in input option.

## Expected Output Deliverables
- `question_engine.rs` module delivering structured JSON payloads for frontend rendering.
- Logic test suite verifying confidence score calculations.
```

---

### Prompt 3.4: Interactive Decision Modal & Agent Injection Protocol

```markdown
# TASK: Build Frontend Smart Decision Modal & Injection Bridge

## Objective
Create a high-priority, animated popup drawer in the React UI that alerts the user when an AI agent assumption is intercepted, displays visual choice cards, and sends the choice back to the PTY.

## Detailed Requirements

1. **Decision Drawer Component (`src/components/decision/DecisionModal.tsx`)**:
   - Render slide-over or modal when `decision-required` Tauri event triggers.
   - Play subtle attention sound / pulse animation.
   - Display:
     - Warning banner: *"AI Agent was about to assume: Firebase Auth"*.
     - High-impact question: *"Which Authentication solution should this project use?"*.
     - Visual Option Cards (with icons, pros/cons breakdown).
     - Custom text input fallback ("Other...").

2. **User Selection Handler**:
   - On selection:
     - Call IPC `set_project_memory(projectId, category, selectedValue)`.
     - Call IPC `resolve_decision_and_resume(sessionId, selectedValue)`.
     - Close modal with smooth transition.

3. **Rust Injection Bridge (`resolve_decision_and_resume`)**:
   - Write formatted instruction to PTY stdin:
     `"\n[DEVELOPER DECISION]: Use " + selectedValue + " for " + category + ". Proceed with implementation.\n"`
   - Call `resume_session(sessionId)` (sends `SIGCONT` to process).

## Expected Output Deliverables
- Fully styled `DecisionModal.tsx` component with keyboard navigation support (Enter / 1-4 key shortcuts).
- End-to-end integration test verifying process pause -> modal display -> option click -> process resume flow.
```

---

## 3. Phase 3 Verification Checklist

- [ ] Stream interceptor catches tech stack assumptions in simulated terminal output strings.
- [ ] PTY process pauses immediately (`SIGSTOP`) when an assumption is flagged.
- [ ] Smart Decision Modal displays interactive cards with clear option choices.
- [ ] User choice persists in SQLite database `project_memory` table.
- [ ] Choice is injected into CLI stdin and execution resumes seamlessly without agent error.
