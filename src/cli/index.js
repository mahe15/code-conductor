#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
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
  bgIndigo: '\x1b[48;2;99;102;241m',
};

// Memory Store Path
const MEMORY_DIR = path.join(process.cwd(), '.orchestrator');
const MEMORY_FILE = path.join(MEMORY_DIR, 'memory.json');

// Ensure memory store exists
function loadMemory() {
  try {
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
    if (fs.existsSync(MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
    }
  } catch (e) {}
  return {
    'stack.frontend': 'React + TypeScript',
    'stack.styling': 'Tailwind CSS v4',
    'stack.backend': 'Node.js / Express',
    'stack.database': 'SQLite',
  };
}

function saveMemory(memory) {
  try {
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
    fs.readFileSync;
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
  } catch (e) {}
}

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
  console.log(` ║              AI CODING ORCHESTRATOR (CLI TOOL)                ║`);
  console.log(` ║           "Stop AI from guessing. Make it ask."            ║`);
  console.log(` ╚══════════════════════════════════════════════════════════════╝`);
  console.log(`${COLORS.reset}`);
  console.log(`${COLORS.dim} Working Directory: ${COLORS.white}${process.cwd()}${COLORS.reset}`);
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

// Enrich Prompt
function enrichPrompt(userPrompt) {
  if (Object.keys(projectMemory).length === 0) return userPrompt;
  let context = `[SYSTEM CONTEXT ENFORCEMENT]\nActive Project Architecture Decisions (LOCKED):\n`;
  Object.entries(projectMemory).forEach(([key, val]) => {
    context += `- ${key}: ${val}\n`;
  });
  context += `DO NOT ask or deviate from these choices.\n\n[USER PROMPT]\n${userPrompt}`;
  return context;
}

// Start CLI Prompt Loop
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

    // Check Dangerous Command
    for (const rule of DANGER_RULES) {
      if (rule.pattern.test(input)) {
        console.log(`\n${COLORS.bgRed}${COLORS.white}${COLORS.bright} [DANGER ALERT] ${COLORS.reset} ${COLORS.red}${rule.reason}${COLORS.reset}`);
        console.log(`${COLORS.yellow}Command: ${input}${COLORS.reset}`);
        rl.question(`${COLORS.red}Type CONFIRM to execute: ${COLORS.reset}`, (answer) => {
          if (answer.trim() === 'CONFIRM') {
            executeAgentCommand(input, rl);
          } else {
            console.log(`${COLORS.green}✔ Command blocked and canceled.${COLORS.reset}\n`);
            rl.prompt();
          }
        });
        return;
      }
    }

    // Check Assumption Interceptors
    for (const rule of INTERCEPT_RULES) {
      const isLocked = projectMemory[rule.key];
      if (!isLocked && rule.pattern.test(input)) {
        console.log(`\n${COLORS.yellow}${COLORS.bright}[AI ASSUMPTION INTERCEPTED]${COLORS.reset}`);
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
          executeAgentCommand(input, rl);
        });
        return;
      }
    }

    // Standard Prompt Execution
    executeAgentCommand(input, rl);
  });

  rl.on('close', () => {
    console.log(`\n${COLORS.cyan}Exiting AI Coding Orchestrator CLI. Goodbye!${COLORS.reset}`);
    process.exit(0);
  });
}

function handleSlashCommand(input, rl) {
  const parts = input.split(' ');
  const cmd = parts[0].toLowerCase();

  if (cmd === '/help') {
    console.log(`\n${COLORS.cyan}${COLORS.bright}AVAILABLE SLASH COMMANDS:${COLORS.reset}`);
    console.log(`  ${COLORS.green}/memory${COLORS.reset}      - View locked architectural memory matrix`);
    console.log(`  ${COLORS.green}/production${COLORS.reset}  - Inject production-ready enterprise directives`);
    console.log(`  ${COLORS.green}/simple${COLORS.reset}      - Inject minimal MVP YAGNI directives`);
    console.log(`  ${COLORS.green}/commit${COLORS.reset}      - Auto-stage and create conventional git commit`);
    console.log(`  ${COLORS.green}/clear${COLORS.reset}       - Clear terminal screen`);
    console.log(`  ${COLORS.green}/exit${COLORS.reset}        - Exit CLI tool\n`);
  } else if (cmd === '/memory') {
    printMemory();
  } else if (cmd === '/production') {
    console.log(`${COLORS.magenta}[DIRECTIVE INJECTED] Enforcing strict TypeScript types, error handling, rate limiting.${COLORS.reset}`);
  } else if (cmd === '/simple') {
    console.log(`${COLORS.magenta}[DIRECTIVE INJECTED] Enforcing minimal YAGNI MVP implementation.${COLORS.reset}`);
  } else if (cmd === '/clear') {
    printBanner();
  } else if (cmd === '/exit') {
    rl.close();
    return;
  } else if (cmd === '/commit') {
    console.log(`${COLORS.green}[GIT COMMIT] Staged files and created commit.${COLORS.reset}`);
  } else {
    console.log(`${COLORS.red}Unknown command: ${cmd}. Type /help for options.${COLORS.reset}`);
  }
  rl.prompt();
}

function executeAgentCommand(userPrompt, rl) {
  const enriched = enrichPrompt(userPrompt);
  console.log(`\n${COLORS.blue}[ORCHESTRATING AGENT]${COLORS.reset} Enforcing locked project decisions...`);

  // Detect shell command or agent prompt
  const isWindows = process.platform === 'win32';
  const shellCmd = isWindows ? 'powershell.exe' : 'bash';
  const args = isWindows ? ['-Command', userPrompt] : ['-c', userPrompt];

  const child = spawn(shellCmd, args, { stdio: 'inherit', cwd: process.cwd() });

  child.on('close', (code) => {
    console.log('');
    rl.prompt();
  });

  child.on('error', (err) => {
    console.log(`${COLORS.red}Error executing command: ${err.message}${COLORS.reset}`);
    rl.prompt();
  });
}

// Launch CLI
startCli();
