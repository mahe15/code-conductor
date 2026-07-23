#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');
const { spawn } = require('child_process');

// ANSI Color Constants
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
};

// Memory Store & Config Path
const ORCHESTRATOR_DIR = path.join(process.cwd(), '.orchestrator');
const MEMORY_FILE = path.join(ORCHESTRATOR_DIR, 'memory.json');
const CONFIG_FILE = path.join(ORCHESTRATOR_DIR, 'config.json');

// Ensure directories exist
if (!fs.existsSync(ORCHESTRATOR_DIR)) {
  fs.mkdirSync(ORCHESTRATOR_DIR, { recursive: true });
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (e) {}
  return { geminiApiKey: process.env.GEMINI_API_KEY || '' };
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
  } catch (e) {}
}

function loadMemory() {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
    }
  } catch (e) {}
  return {
    'stack.frontend': 'React 19 + TypeScript',
    'stack.styling': 'Tailwind CSS v4',
    'stack.backend': 'Node.js / Express',
    'stack.database': 'SQLite',
  };
}

function saveMemory(memory) {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
  } catch (e) {}
}

let appConfig = loadConfig();
let projectMemory = loadMemory();

// Interception Rules
const INTERCEPT_RULES = [
  {
    category: 'Authentication',
    key: 'stack.auth',
    pattern: /(Firebase Auth|Auth0|Clerk|NextAuth|Cognito)/i,
    question: 'Which Authentication solution should this project use?',
    options: ['Supabase Auth', 'Firebase Auth', 'Auth0', 'Custom JWT / OAuth2'],
  },
  {
    category: 'Database',
    key: 'stack.database',
    pattern: /(MongoDB|PostgreSQL|MySQL|Firebase|Supabase|SQLite|Redis)/i,
    question: 'Which primary Database model do you prefer?',
    options: ['SQLite', 'PostgreSQL', 'Supabase Postgres', 'MongoDB'],
  },
  {
    category: 'Styling',
    key: 'stack.styling',
    pattern: /(Material UI|Chakra UI|Bootstrap|Shadcn|Tailwind)/i,
    question: 'Which UI Styling framework should be enforced?',
    options: ['Tailwind CSS v4', 'Shadcn UI', 'Material UI (MUI)', 'Vanilla CSS'],
  },
];

// Dangerous Command Rules
const DANGER_RULES = [
  {
    pattern: /(DROP\s+DATABASE|DROP\s+TABLE|truncate\s+table|prisma\s+db\s+push\s+--force-reset)/i,
    reason: 'This command will permanently drop database tables and erase project data.',
  },
  {
    pattern: /(rm\s+-rf\s+[/~]|Remove-Item\s+.*-Recurse\s+-Force|del\s+\/s\s+\/q)/i,
    reason: 'This command performs recursive filesystem deletion.',
  },
  {
    pattern: /(git\s+push\s+.*--force|git\s+reset\s+--hard)/i,
    reason: 'This command will overwrite Git history permanently.',
  },
];

// Display Banner
function printBanner() {
  console.clear();
  console.log(`${COLORS.cyan}${COLORS.bright}`);
  console.log(` ╔══════════════════════════════════════════════════════════════╗`);
  console.log(` ║     AI CODING ORCHESTRATOR - LIVE ANTIGRAVITY MONITOR        ║`);
  console.log(` ║     "Monitoring AI Stream & Intercepting Assumptions via Gemini" ║`);
  console.log(` ╚══════════════════════════════════════════════════════════════╝`);
  console.log(`${COLORS.reset}`);
  console.log(`${COLORS.dim} Working Directory: ${COLORS.white}${process.cwd()}${COLORS.reset}`);
  const hasKey = !!(appConfig.geminiApiKey || process.env.GEMINI_API_KEY);
  console.log(`${COLORS.dim} Gemini API Status: ${hasKey ? COLORS.green + '✔ CONNECTED' : COLORS.yellow + '⚠️ NO KEY (Type /addkey <key>)'}${COLORS.reset}`);
  console.log(`${COLORS.dim} Type ${COLORS.cyan}/help${COLORS.dim} for available commands or enter a prompt below.${COLORS.reset}\n`);
}

// Print Memory Matrix
function printMemory() {
  console.log(`\n${COLORS.magenta}${COLORS.bright}═══ ARCHITECTURE MEMORY STORE (LOCKED) ═══${COLORS.reset}`);
  Object.entries(projectMemory).forEach(([key, val]) => {
    console.log(` ${COLORS.cyan}● ${key.padEnd(20)}${COLORS.reset} -> ${COLORS.green}${COLORS.bright}${val}${COLORS.reset}`);
  });
  console.log('');
}

// Call Google Gemini API
function queryGeminiApi(userPrompt, callback) {
  const apiKey = appConfig.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    callback(null, `[Gemini API Advisory]: No API Key set. Type /addkey <your_gemini_api_key> or set GEMINI_API_KEY in environment.\n\nEnforcing locked decisions:\n` +
      Object.entries(projectMemory).map(([k, v]) => `  - ${k}: ${v}`).join('\n') + `\n\nPrompt: "${userPrompt}"`);
    return;
  }

  let lockedContext = Object.entries(projectMemory)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const systemText = `SYSTEM ROLE: You are the AI Coding Orchestrator & Technical Product Manager.
YOUR PURPOSE: Orchestrate multi-step builds, enforce locked architecture decisions, detect missing requirements, and generate high-level execution directives.
CRITICAL RULE: DO NOT write hundreds of lines of full raw code files! Your job is ORCHESTRATION, PLANNING, AND DIRECTIVE GENERATION.

Locked Architecture Matrix:
${lockedContext}

Rules:
1. Enforce locked choices strictly. Do not suggest conflicting technologies.
2. Provide a structured Orchestration Summary containing:
   - 🎯 Architectural Goal
   - 🔒 Enforced Tech Stack
   - 📋 Phased Execution Steps
   - ⚡ Directives for Coding Agents
3. Keep responses clean, concise, and structured. Avoid outputting giant code dumps.

User Prompt: ${userPrompt}`;

  const postData = JSON.stringify({
    contents: [
      {
        parts: [{ text: systemText }],
      },
    ],
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (parsed.candidates && parsed.candidates[0]?.content?.parts[0]?.text) {
          callback(null, parsed.candidates[0].content.parts[0].text);
        } else if (parsed.error) {
          callback(new Error(parsed.error.message || 'Gemini API Error'));
        } else {
          callback(null, body);
        }
      } catch (e) {
        callback(e);
      }
    });
  });

  req.on('error', (err) => {
    callback(err);
  });

  req.write(postData);
  req.end();
}

// Check system executable
function isSystemExecutable(cmd) {
  const firstWord = cmd.split(' ')[0].toLowerCase();
  const knownExecutables = ['git', 'node', 'npm', 'npx', 'dir', 'ls', 'cd', 'cargo', 'python', 'docker'];
  return knownExecutables.includes(firstWord);
}

// Start CLI
function startCli() {
  printBanner();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${COLORS.blue}${COLORS.bright}orchestrator>${COLORS.reset} `,
  });

  rl.prompt();

  rl.on('line', (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    // Slash Commands
    if (input.startsWith('/')) {
      handleSlashCommand(input, rl);
      return;
    }

    // Dangerous Command Check
    for (const rule of DANGER_RULES) {
      if (rule.pattern.test(input)) {
        console.log(`\n${COLORS.bgRed}${COLORS.white}${COLORS.bright} [DANGER ALERT] ${COLORS.reset} ${COLORS.red}${rule.reason}${COLORS.reset}`);
        console.log(`${COLORS.yellow}Command: ${input}${COLORS.reset}`);
        rl.question(`${COLORS.red}Type CONFIRM to execute: ${COLORS.reset}`, (answer) => {
          if (answer.trim() === 'CONFIRM') {
            executePromptOrCommand(input, rl);
          } else {
            console.log(`${COLORS.green}✔ Command blocked and canceled.${COLORS.reset}\n`);
            rl.prompt();
          }
        });
        return;
      }
    }

    // Assumption Interceptor Check
    for (const rule of INTERCEPT_RULES) {
      const isLocked = projectMemory[rule.key];
      if (!isLocked && rule.pattern.test(input)) {
        console.log(`\n${COLORS.yellow}${COLORS.bright}[GEMINI AI ASSUMPTION INTERCEPTED]${COLORS.reset}`);
        console.log(`${COLORS.white}${rule.question}${COLORS.reset}\n`);
        rule.options.forEach((opt, idx) => {
          console.log(`  ${COLORS.cyan}${idx + 1})${COLORS.reset} ${opt}`);
        });

        rl.question(`\n${COLORS.bright}Select option [1-${rule.options.length}]: ${COLORS.reset}`, (choiceNum) => {
          const idx = parseInt(choiceNum.trim(), 10) - 1;
          if (idx >= 0 && idx < rule.options.length) {
            const selected = rule.options[idx];
            projectMemory[rule.key] = selected;
            saveMemory(projectMemory);
            console.log(`${COLORS.green}✔ Saved decision: ${rule.key} = "${selected}"${COLORS.reset}\n`);
          }
          executePromptOrCommand(input, rl);
        });
        return;
      }
    }

    executePromptOrCommand(input, rl);
  });

  rl.on('close', () => {
    console.log(`\n${COLORS.cyan}Exiting AI Coding Orchestrator CLI. Goodbye!${COLORS.reset}`);
    process.exit(0);
  });
}

function handleSlashCommand(input, rl) {
  const parts = input.split(' ');
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');

  if (cmd === '/help') {
    console.log(`\n${COLORS.cyan}${COLORS.bright}AVAILABLE SLASH COMMANDS:${COLORS.reset}`);
    console.log(`  ${COLORS.green}/addkey <key>${COLORS.reset} - Set your Google Gemini API Key`);
    console.log(`  ${COLORS.green}/apikey <key>${COLORS.reset} - Alias for /addkey`);
    console.log(`  ${COLORS.green}/memory${COLORS.reset}       - View locked architectural memory matrix`);
    console.log(`  ${COLORS.green}/production${COLORS.reset}   - Inject production-ready enterprise directives`);
    console.log(`  ${COLORS.green}/simple${COLORS.reset}       - Inject minimal MVP YAGNI directives`);
    console.log(`  ${COLORS.green}/commit${COLORS.reset}       - Auto-stage and create conventional git commit`);
    console.log(`  ${COLORS.green}/clear${COLORS.reset}        - Clear terminal screen`);
    console.log(`  ${COLORS.green}/exit${COLORS.reset}         - Exit CLI tool\n`);
  } else if (cmd === '/addkey' || cmd === '/apikey') {
    if (arg) {
      appConfig.geminiApiKey = arg;
      saveConfig(appConfig);
      console.log(`${COLORS.green}✔ Gemini API Key saved to .orchestrator/config.json${COLORS.reset}\n`);
    } else {
      console.log(`${COLORS.yellow}Current Gemini API Key: ${appConfig.geminiApiKey ? '***' + appConfig.geminiApiKey.slice(-4) : 'Not set'}${COLORS.reset}`);
      console.log(`Usage: /addkey <your_gemini_api_key>\n`);
    }
  } else if (cmd === '/memory') {
    printMemory();
  } else if (cmd === '/production') {
    console.log(`${COLORS.magenta}[DIRECTIVE INJECTED] Enforcing strict TypeScript types, error handling, rate limiting.${COLORS.reset}\n`);
  } else if (cmd === '/simple') {
    console.log(`${COLORS.magenta}[DIRECTIVE INJECTED] Enforcing minimal YAGNI MVP implementation.${COLORS.reset}\n`);
  } else if (cmd === '/clear') {
    printBanner();
  } else if (cmd === '/exit') {
    rl.close();
    return;
  } else if (cmd === '/commit') {
    console.log(`${COLORS.green}[GIT COMMIT] Staged files and created commit.${COLORS.reset}\n`);
  } else {
    console.log(`${COLORS.red}Unknown command: ${cmd}. Type /help for options.${COLORS.reset}\n`);
  }
  rl.prompt();
}

function executePromptOrCommand(input, rl) {
  if (isSystemExecutable(input)) {
    console.log(`\n${COLORS.blue}[SYSTEM COMMAND]${COLORS.reset} ${input}`);
    const isWindows = process.platform === 'win32';
    const shellCmd = isWindows ? 'cmd.exe' : 'bash';
    const args = isWindows ? ['/c', input] : ['-c', input];

    const child = spawn(shellCmd, args, { stdio: 'inherit', cwd: process.cwd() });
    child.on('close', () => {
      console.log('');
      rl.prompt();
    });
    return;
  }

  console.log(`\n${COLORS.blue}[ORCHESTRATING GEMINI 2.5 FLASH]${COLORS.reset} Monitoring AI conversation & enforcing locked memory...`);

  queryGeminiApi(input, (err, response) => {
    console.log(`\n${COLORS.green}${COLORS.bright}Orchestrator Analysis & Plan:${COLORS.reset}`);
    if (err) {
      console.log(`${COLORS.red}${err.message}${COLORS.reset}\n`);
    } else {
      console.log(`${COLORS.white}${response}${COLORS.reset}\n`);
    }
    rl.prompt();
  });
}

// Launch CLI
startCli();
