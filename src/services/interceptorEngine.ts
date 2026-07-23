import { DecisionRequiredEvent, MemoryItem } from '../types/ipc';

export interface InterceptionRule {
  category: string;
  keyName: string;
  pattern: RegExp;
  questionPrompt: string;
  suggestedOptions: string[];
}

const DEFAULT_INTERCEPT_RULES: InterceptionRule[] = [
  {
    category: 'Authentication',
    keyName: 'stack.auth',
    pattern: /(I will use|Setting up|Installing|Choosing|Configuring)\s+(Firebase Auth|Auth0|Clerk|NextAuth|Cognito)/i,
    questionPrompt: 'AI Agent is about to configure Authentication. Which auth solution should this project use?',
    suggestedOptions: ['Supabase Auth', 'Firebase Auth', 'Auth0', 'Custom JWT / OAuth2'],
  },
  {
    category: 'Database',
    keyName: 'stack.database',
    pattern: /(Connecting to|Installing|Configuring|Setting up)\s+(MongoDB|PostgreSQL|MySQL|Firebase|Supabase|SQLite|Redis)/i,
    questionPrompt: 'AI Agent is about to set up a database. Which primary database model do you prefer?',
    suggestedOptions: ['SQLite', 'PostgreSQL', 'Supabase Postgres', 'MongoDB'],
  },
  {
    category: 'Styling',
    keyName: 'stack.styling',
    pattern: /(Scaffolding|Installing|Using|Adding)\s+(Material UI|Chakra UI|Bootstrap|Shadcn|Tailwind)/i,
    questionPrompt: 'AI Agent is choosing a UI Styling library. Which design framework should be used?',
    suggestedOptions: ['Tailwind CSS v4', 'Shadcn UI', 'Material UI (MUI)', 'Vanilla CSS'],
  },
  {
    category: 'State Management',
    keyName: 'stack.state',
    pattern: /(Adding|Installing|Configuring)\s+(Redux|Zustand|MobX|Riverpod|Provider|Recoil)/i,
    questionPrompt: 'Which State Management solution should be enforced across this project?',
    suggestedOptions: ['Zustand', 'Redux Toolkit', 'React Context API', 'Jotai'],
  },
  {
    category: 'Cloud & Hosting',
    keyName: 'stack.cloud',
    pattern: /(Deploying to|Configuring|Setting up)\s+(AWS|Vercel|Netlify|Docker|Kubernetes)/i,
    questionPrompt: 'Which Deployment & Hosting environment is targeted for this application?',
    suggestedOptions: ['Vercel / Netlify', 'Single VPS (Hetzner/DigitalOcean)', 'Docker Compose', 'AWS Elastic Beanstalk'],
  },
];

export class InterceptorEngine {
  private recentBuffer: string = '';
  private memoryItems: MemoryItem[] = [];
  private onDecisionRequired?: (event: DecisionRequiredEvent) => void;
  private triggeredCategories: Set<string> = new Set();

  constructor(memoryItems: MemoryItem[], onDecisionRequired?: (event: DecisionRequiredEvent) => void) {
    this.memoryItems = memoryItems;
    this.onDecisionRequired = onDecisionRequired;
  }

  public updateMemoryItems(memoryItems: MemoryItem[]) {
    this.memoryItems = memoryItems;
  }

  public scanChunk(data: string) {
    this.recentBuffer = (this.recentBuffer + data).slice(-2000); // Maintain last 2000 chars

    for (const rule of DEFAULT_INTERCEPT_RULES) {
      // Skip if this category is already locked in memory
      const isAlreadyLocked = this.memoryItems.some(
        (m) => m.key.toLowerCase() === rule.keyName.toLowerCase() || m.key.toLowerCase().endsWith(rule.category.toLowerCase())
      );

      if (isAlreadyLocked || this.triggeredCategories.has(rule.category)) {
        continue;
      }

      const match = rule.pattern.exec(this.recentBuffer);
      if (match) {
        const detectedAssumption = match[2] || match[0];
        this.triggeredCategories.add(rule.category);

        if (this.onDecisionRequired) {
          this.onDecisionRequired({
            session_id: 'active-session',
            category: rule.category,
            detected_assumption: detectedAssumption,
            suggested_options: rule.suggestedOptions,
            question_prompt: rule.questionPrompt,
          });
        }
        break; // Trigger one decision at a time
      }
    }
  }

  public reset() {
    this.recentBuffer = '';
    this.triggeredCategories.clear();
  }
}
