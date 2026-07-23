export interface RiskAlert {
  isDangerous: boolean;
  command: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reason: string;
}

const DANGEROUS_PATTERNS = [
  {
    pattern: /(DROP\s+DATABASE|DROP\s+TABLE|truncate\s+table|prisma\s+db\s+push\s+--force-reset|rails\s+db:drop)/i,
    level: 'CRITICAL' as const,
    reason: 'This command will permanently drop database tables and erase project data.',
  },
  {
    pattern: /(rm\s+-rf\s+[/~]|Remove-Item\s+.*-Recurse\s+-Force|del\s+\/s\s+\/q)/i,
    level: 'CRITICAL' as const,
    reason: 'This command performs recursive filesystem deletion and will erase project files.',
  },
  {
    pattern: /(git\s+push\s+.*--force|git\s+reset\s+--hard|git\s+clean\s+-f)/i,
    level: 'HIGH' as const,
    reason: 'This command will overwrite Git history or un-staged commits permanently.',
  },
];

export class RiskGuardService {
  public static inspectCommand(command: string): RiskAlert {
    for (const rule of DANGEROUS_PATTERNS) {
      if (rule.pattern.test(command)) {
        return {
          isDangerous: true,
          command,
          riskLevel: rule.level,
          reason: rule.reason,
        };
      }
    }
    return {
      isDangerous: false,
      command,
      riskLevel: 'MEDIUM',
      reason: '',
    };
  }
}
