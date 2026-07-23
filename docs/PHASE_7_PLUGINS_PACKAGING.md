# Phase 7: Plugin Engine, E2E Testing & Production Distribution

> **Focus**: Designing an extensible Plugin System for custom agents and rules, setting up End-to-End (E2E) automated testing pipelines, optimizing runtime performance, and building cross-platform production release bundles (Windows, macOS, Linux) with auto-updater support.

---

## 1. Phase Architecture Overview

Phase 7 prepares the Orchestrator for open-source community expansion and production deployment:

1. **Plugin System**: Allows third-party developers to register custom CLI agent adapters (e.g. Aider, Roo Code, custom internal scripts), custom assumption detection regexes, and custom slash commands via JavaScript or Lua plugin manifests.
2. **Comprehensive Test Suite**: End-to-end frontend tests using Playwright/Vitest and Rust backend integration tests using `cargo test`.
3. **Distribution Pipeline**: Packaging native binaries for Windows (`.msi`, `.exe`), macOS (`.dmg`, `.app`), and Linux (`.AppImage`, `.deb`) with signed updater manifests.

---

## 2. In-Depth Engineering Prompts for Phase 7

---

### Prompt 7.1: Extensible Plugin Engine & Plugin Manifest Runtime

```markdown
# TASK: Build Open-Source Plugin Engine & Extension Runtime

## Objective
Implement a dynamic plugin loader module in Rust (`src-tauri/src/plugins/loader.rs`) that loads user-defined plugins from `~/.orchestrator/plugins/`.

## Detailed Requirements

1. **Plugin Manifest Schema (`plugin.json`)**:
   ```json
   {
     "id": "my-custom-agent-plugin",
     "name": "Custom Coding Agent Adapter",
     "version": "1.0.0",
     "description": "Adds support for internal custom CLI agent",
     "agent": {
       "name": "Internal Agent",
       "binary": "internal-ai-cli",
       "args": ["--mode", "interactive"]
     },
     "interceptors": [
       {
         "category": "database",
         "pattern": "Configuring Redis Cluster",
         "question": "Should Redis be deployed in Cluster mode or Standalone?",
         "options": ["Standalone", "Sentinel Cluster", "ElastiCache"]
       }
     ],
     "commands": [
       {
         "name": "deploy-staging",
         "directive": "[DIRECTIVE: STAGING DEPLOYMENT]\nTarget staging environment."
       }
     ]
   }
   ```

2. **Rust Plugin Manager (`loader.rs`)**:
   - Discover and load all `plugin.json` files on startup.
   - Dynamically register custom agent adapters into the `AgentAdapterRegistry`.
   - Register plugin-provided regex interceptors into the `AssumptionInterceptor`.
   - Register custom slash commands into the `CommandCenter`.

3. **Plugin Settings UI View (`src/components/plugins/PluginManager.tsx`)**:
   - List installed plugins with toggle enable/disable switches.
   - "Install Plugin from Folder / URL" button.

## Expected Output Deliverables
- Dynamic plugin loader module in Rust with validation for plugin manifests.
- UI `PluginManager.tsx` view for managing active plugins.
```

---

### Prompt 7.2: Comprehensive End-to-End (E2E) & Integration Test Suite

```markdown
# TASK: Implement E2E Testing Suite & Integration Tests

## Objective
Establish a complete automated testing pipeline covering Rust backend modules, IPC commands, PTY streams, and React UI workflows.

## Detailed Requirements

1. **Rust Integration Tests (`src-tauri/tests/`)**:
   - `test_db_migrations.rs`: Test SQLite schema creation, cascading deletes, and concurrent reads.
   - `test_pty_spawner.rs`: Test PTY spawn, pause (`SIGSTOP`), resume (`SIGCONT`), and termination signals.
   - `test_risk_interceptor.rs`: Test detection of dangerous command strings (`DROP DATABASE`, `rm -rf`).

2. **Frontend Component & Store Tests (`src/__tests__/`)**:
   - `useProjectStore.test.ts`: Test project state mutations and memory syncing.
   - `DecisionModal.test.tsx`: Test rendering decision cards and resolving decisions.
   - `CommandBar.test.tsx`: Test slash command parsing and directive generation.

3. **Tauri E2E Testing with Playwright (`e2e/app.spec.ts`)**:
   - Set up Playwright to launch Tauri application binary.
   - Automated user workflow test:
     1. Launch app.
     2. Create new project "TestApp".
     3. Start simulated PTY session.
     4. Verify decision popup appears on assumption trigger.
     5. Click decision card and verify PTY receives response.

## Expected Output Deliverables
- Passing `cargo test` suite in `src-tauri`.
- Passing `npm run test` (Vitest) and `npm run test:e2e` (Playwright) suites.
```

---

### Prompt 7.3: Performance & Memory Optimization Suite

```markdown
# TASK: Perform Runtime Performance Tuning & Resource Footprint Optimization

## Objective
Optimize SQLite database queries, terminal stream rendering performance, and Rust/Tauri memory utilization.

## Detailed Requirements

1. **SQLite Optimization (`src-tauri/src/db/mod.rs`)**:
   - Enable WAL (Write-Ahead Logging) mode (`PRAGMA journal_mode = WAL;`).
   - Enable foreign keys (`PRAGMA foreign_keys = ON;`).
   - Set synchronous mode to NORMAL (`PRAGMA synchronous = NORMAL;`).
   - Add database indexes on `project_memory(project_id, key)` and `session_events(session_id, timestamp_ms)`.

2. **Terminal Rendering Optimization (`TerminalView.tsx`)**:
   - Throttle terminal output writes using requestAnimationFrame buffer batching to prevent UI thread lockup during high-volume stdout bursts.
   - Enable `@xterm/addon-webgl` for GPU-accelerated terminal canvas rendering.

3. **Memory Footprint Audit**:
   - Ensure child PTY threads are properly joined and cleaned up on session termination (zero zombie processes).
   - Cap maximum sliding window stream buffer size at 50,000 characters.

## Expected Output Deliverables
- Optimized Rust database initialization and terminal renderer code.
- Verification report confirming CPU usage < 2% during idle and memory footprint < 120MB.
```

---

### Prompt 7.4: Cross-Platform Build Pipeline & Auto-Updater Integration

```markdown
# TASK: Setup Production Build Script & Tauri Auto-Updater

## Objective
Configure cross-platform build targets in GitHub Actions (`.github/workflows/release.yml`) and Tauri Auto-Updater for automated distribution.

## Detailed Requirements

1. **Tauri Bundle Configuration (`src-tauri/tauri.conf.json`)**:
   - Configure bundle targets:
     - Windows: `msi`, `nsis` (executable installer).
     - macOS: `dmg`, `app` (Universal binary for Intel & Apple Silicon).
     - Linux: `appimage`, `deb`.
   - Setup app icons (`icons/32x32.png`, `icons/128x128.png`, `icons/icon.icns`, `icons/icon.ico`).

2. **Auto-Updater Integration**:
   - Add `@tauri-apps/plugin-updater`.
   - Configure updater endpoints in `tauri.conf.json`:
     `"updater": { "pubkey": "...", "endpoints": ["https://releases.orchestrator.app/update/{{target}}/{{current_version}}"] }`

3. **GitHub Actions CI/CD Release Pipeline (`.github/workflows/release.yml`)**:
   - Matrix build strategy: `ubuntu-latest`, `macos-latest`, `windows-latest`.
   - Steps:
     1. Checkout repository & setup Node.js + Rust toolchain.
     2. Install Linux dependencies (`libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`).
     3. Run tests (`cargo test` & `npm run test`).
     4. Build release bundle (`npm run tauri build`).
     5. Upload build artifacts to GitHub Release.

## Expected Output Deliverables
- GitHub Actions release workflow ready for production tags.
- Verified release build scripts producing native installers for Windows, macOS, and Linux.
```

---

## 3. Phase 7 Verification Checklist

- [ ] Plugin loader successfully parses custom `plugin.json` files and registers custom agent adapters.
- [ ] Automated integration test suite (`cargo test` & Playwright) passes 100% cleanly.
- [ ] App maintains < 120MB RAM footprint and high-speed WebGL terminal rendering.
- [ ] `npm run tauri build` succeeds and produces clean installation binaries (`.msi`, `.dmg`, `.AppImage`).
