# Phase 6: Hands-Free Voice Mode & Time-Machine Session Replay

> **Focus**: Enabling hands-free voice interaction (Speech-to-Text STT & Text-to-Speech TTS) so developers can answer agent clarification questions away from the keyboard, and building a Time-Machine Session Replay engine to record and audit entire development runs.

---

## 1. Phase Architecture Overview

Phase 6 elevates developer productivity with two features:

1. **Voice Mode**: Integrates microphone input (STT via Whisper API/Local) and synthesized voice output (TTS via Web Speech API or OpenAI TTS). When the Decision Engine requires clarification while the developer is away from the screen, the Orchestrator speaks the question aloud and listens for spoken responses.
2. **Session Replay Engine**: Automatically records all PTY inputs, outputs, decisions, file modifications, and prompt injections into SQLite timeline logs, allowing step-by-step session playback and debugging.

### Voice Interaction Pipeline

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    Decision Engine Needs Clarification                    │
│    Question: "Which database do you prefer: PostgreSQL or MongoDB?"       │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       Text-to-Speech (TTS) Engine                         │
│  - Speaks aloud using System Voice / OpenAI TTS                           │
│  - Audio visualizer starts listening indicator                           │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Audio output plays
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       Speech-to-Text (STT) Listener                       │
│  - Record audio chunk from Microphone                                     │
│  - Transcribe voice audio via Whisper model ("Use PostgreSQL")            │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      Voice Decision Resolver Bridge                       │
│  - Save "PostgreSQL" to Project Memory                                    │
│  - Inject text decision into PTY stdin & Resume execution                 │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. In-Depth Engineering Prompts for Phase 6

---

### Prompt 6.1: Voice Engine Audio Capture & Speech-to-Text (STT) Service

```markdown
# TASK: Build Audio Capture & Speech-to-Text (STT) Transcriber

## Objective
Implement microphone audio recording in the browser/Tauri and a Whisper-based transcription pipeline in TypeScript/Rust (`src/services/voice/stt.ts`).

## Detailed Requirements

1. **Microphone Audio Recorder (`MediaRecorder` API)**:
   - Request microphone permissions (`navigator.mediaDevices.getUserMedia`).
   - Capture audio stream in WebM / WAV format with silence detection threshold.
   - Automatically stop recording after 2 seconds of silence.

2. **STT Transcription Pipeline**:
   - Provider 1: OpenAI Whisper API (`v1/audio/transcriptions`).
   - Provider 2: Local `whisper.cpp` / WebAssembly Whisper fallback for offline privacy.
   - Return clean string text payload: e.g., `"Use Supabase Auth"`.

3. **Audio State Hook (`useVoiceInput.ts`)**:
   - States: `Idle`, `Listening`, `Transcribing`, `Error`.
   - Returns functions `startListening()`, `stopListening()`, `transcriptText`.

## Expected Output Deliverables
- `stt.ts` service with automatic VAD (Voice Activity Detection) silence trimming.
- React hook `useVoiceInput.ts` for clean component state binding.
```

---

### Prompt 6.2: Text-to-Speech (TTS) Voice Prompting & Conversational Controller

```markdown
# TASK: Build Text-to-Speech (TTS) Engine & Voice Orchestrator

## Objective
Create a synthesized voice output manager (`src/services/voice/tts.ts`) to speak clarification questions aloud and drive hands-free Q&A loops.

## Detailed Requirements

1. **Speech Synthesizer (`tts.ts`)**:
   - Provider 1: Browser Native `window.speechSynthesis` API (Zero external dependencies).
   - Provider 2: OpenAI TTS API (`v1/audio/speech` with natural voices: `alloy`, `echo`, `fable`).
   - Configurable voice speed, pitch, and volume settings.

2. **Voice Loop Orchestrator (`VoiceOrchestrator.ts`)**:
   - When event `decision-required` triggers and Voice Mode is active:
     1. Formulate short voice script: *"Question: [Category]. [Question text]. Options are: [Option A], or [Option B]. What is your choice?"*
     2. Play audio using TTS synthesizer.
     3. Upon playback completion, automatically trigger STT listener.
     4. Match transcribed voice response against question options (Fuzzy string matching).
     5. If confident match found -> Confirm verbally: *"Selected [Choice]. Resuming agent."* and inject decision to PTY.
     6. If ambiguous response -> Ask to repeat: *"I didn't catch that. Please choose option A or option B."*

## Expected Output Deliverables
- `tts.ts` speech synthesis service.
- `VoiceOrchestrator.ts` managing the automated speech-listen-inject loop.
```

---

### Prompt 6.3: Hands-Free Voice Mode UI & Ambient Audio Visualizer

```markdown
# TASK: Build Hands-Free Voice Control UI & Audio Waveform Component

## Objective
Create an ambient Voice Control component (`src/components/voice/VoiceControlBar.tsx`) with a visual audio frequency waveform.

## Detailed Requirements

1. **Audio Visualizer Canvas (`AudioWaveform.tsx`)**:
   - Use Web Audio API `AudioContext` and `AnalyserNode`.
   - Render animated canvas frequency bars or glowing mic orb that reacts to user voice volume levels in real time.

2. **Voice Control Bar Widget (`VoiceControlBar.tsx`)**:
   - Toggle button: "Voice Mode Enabled / Disabled".
   - Status Indicator:
     - 🎙️ *"Listening for answer..."* (Pulsing Cyan glow)
     - 🔊 *"Speaking question..."* (Pulsing Violet glow)
     - ⚡ *"Processing response..."*
   - Hands-Free Mode Banner when developer steps away from keyboard.

## Expected Output Deliverables
- `VoiceControlBar.tsx` component integrated into the header bar.
- Smooth 60fps audio waveform canvas rendering during active microphone capture.
```

---

### Prompt 6.4: Time-Machine Session Recording & Replay Engine

```markdown
# TASK: Implement Session Replay Recorder & Time-Machine Player

## Objective
Build a session recording subsystem in Rust (`src-tauri/src/replay/mod.rs`) and a video-style playback component (`src/components/replay/SessionReplayer.tsx`).

## Detailed Requirements

1. **Session Storage Schema (SQLite)**:
   - Create table `session_events`:
     - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
     - `session_id`: TEXT FOREIGN KEY
     - `timestamp_ms`: INTEGER (relative to session start)
     - `event_type`: TEXT ("pty_output", "user_input", "decision_made", "command_executed")
     - `payload`: TEXT (JSON serialized data)

2. **Session Recording Engine**:
   - Log all incoming terminal stdout chunks with high-precision relative timestamps.
   - Record exact moments when questions were asked and answered.

3. **React Replay Viewer Component (`SessionReplayer.tsx`)**:
   - Video-style player controls: Play, Pause, Scrub Timeline Bar, Speed Selector (`1x`, `2x`, `4x`, `8x`).
   - Re-renders terminal stdout stream in real time into an isolated read-only Xterm.js canvas.
   - Marker flags along timeline bar indicating key decisions and commands.

## Expected Output Deliverables
- `replay/mod.rs` recording engine writing indexed events to SQLite.
- `SessionReplayer.tsx` component allowing step-by-step playback of past AI coding sessions.
```

---

## 3. Phase 6 Verification Checklist

- [ ] Microphone records developer audio cleanly and transcribes text accurately via Whisper.
- [ ] TTS engine speaks decision questions aloud with clear pronunciation.
- [ ] Hands-free voice loop successfully captures verbal answer, confirms selection, and resumes agent.
- [ ] Session recorder logs all PTY terminal events with accurate timestamps.
- [ ] Session Replay player scrubs smoothly through previous AI sessions with speed controls.
