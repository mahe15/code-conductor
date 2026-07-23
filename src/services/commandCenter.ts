export interface SlashCommand {
  name: string;
  description: string;
  directive?: string;
  isAction?: boolean;
}

export const SUPPORTED_SLASH_COMMANDS: SlashCommand[] = [
  {
    name: '/production',
    description: 'Enforce enterprise production readiness (strict TS types, error logging, rate limiting)',
    directive: '[DIRECTIVE: PRODUCTION-READY MODE]\nBuild with strict TypeScript types, input validation, structured error handling, rate limiting, and comprehensive log instrumentation. Do not use mock data.',
  },
  {
    name: '/simple',
    description: 'Enforce minimal MVP mode (YAGNI, minimal code, zero over-engineering)',
    directive: '[DIRECTIVE: MINIMAL MVP MODE]\nKeep code minimal, clear, and focused strictly on basic functionality. Follow YAGNI principles. Avoid adding speculative abstractions or extra microservices.',
  },
  {
    name: '/optimize',
    description: 'Command agent to perform memory, render, and database query optimizations',
    directive: '[DIRECTIVE: PERFORMANCE OPTIMIZATION]\nAnalyze code for memory leaks, redundant database queries, large bundle sizes, and un-memoized re-renders. Apply high-performance patterns.',
  },
  {
    name: '/test',
    description: 'Command agent to generate a full unit and integration test suite',
    directive: '[DIRECTIVE: TEST SUITE GENERATION]\nWrite complete unit and integration tests covering edge cases, async error handling, and API contracts. Ensure test suite passes 100%.',
  },
  {
    name: '/document',
    description: 'Command agent to document code and write README & API specs',
    directive: '[DIRECTIVE: DOCUMENTATION]\nWrite comprehensive JSDoc/RustDoc comments, update README.md, and document API contracts with clear examples.',
  },
  {
    name: '/pause',
    description: 'Pause active CLI agent process (SIGSTOP)',
    isAction: true,
  },
  {
    name: '/resume',
    description: 'Resume active CLI agent process (SIGCONT)',
    isAction: true,
  },
  {
    name: '/commit',
    description: 'Auto-stage files and create an AI-generated conventional git commit',
    isAction: true,
  },
  {
    name: '/undo',
    description: 'Revert recent changes via git reset / stash',
    isAction: true,
  },
];

export class CommandCenterService {
  public static parseInput(input: string): { isCommand: boolean; command?: SlashCommand; rawText: string } {
    const trimmed = input.trim();
    if (!trimmed.startsWith('/')) {
      return { isCommand: false, rawText: input };
    }

    const commandName = trimmed.split(' ')[0].toLowerCase();
    const match = SUPPORTED_SLASH_COMMANDS.find((c) => c.name.toLowerCase() === commandName);

    if (match) {
      return { isCommand: true, command: match, rawText: input };
    }

    return { isCommand: false, rawText: input };
  }
}
