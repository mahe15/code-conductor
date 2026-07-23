# Code Conductor

Code Conductor is an AI-powered coding orchestrator and terminal workspace built with React, Vite, TypeScript, Tailwind CSS, and Tauri.

## Features

- **Integrated Terminal**: Powered by xterm.js with WebGL acceleration.
- **IPC & System Integration**: Fast Rust backend integration via Tauri.
- **Modern UI**: Styled with Tailwind CSS v4 and Lucide React icons.
- **State Management**: Scalable global state powered by Zustand.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend Desktop Runtime**: Tauri v2 (Rust)
- **Terminal**: xterm.js (with fit and webgl addons)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Rust](https://www.rust-lang.org/) & Tauri v2 prerequisites

### Installation

```bash
npm install
```

### Development

Run Vite dev server:
```bash
npm run dev
```

Run Tauri desktop app:
```bash
npm run tauri dev
```

### Build

```bash
npm run build
```
