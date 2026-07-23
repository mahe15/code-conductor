import { MemoryItem } from '../types/ipc';

export interface AdrRecord {
  id: string;
  title: string;
  status: 'Accepted' | 'Proposed' | 'Superseded';
  context: string;
  decision: string;
  consequences: string[];
}

export class AdrService {
  public static generateAdrMarkdown(item: MemoryItem, index: number): string {
    const numStr = String(index + 1).padStart(3, '0');
    return `# ADR-${numStr}: Choice of ${item.value} for ${item.key}\n\n` +
      `## Status\nAccepted\n\n` +
      `## Context\n` +
      `The project required an architectural specification for \`${item.key}\` to prevent AI agent assumptions.\n\n` +
      `## Decision\n` +
      `Use **${item.value}** for \`${item.key}\`.\n\n` +
      `## Consequences\n` +
      `- Enforces consistent project implementation.\n` +
      `- Locked into project memory store to guide future AI agent prompts.\n`;
  }

  public static exportAllAdrs(memoryItems: MemoryItem[]): { filename: string; content: string }[] {
    return memoryItems.map((item, idx) => {
      const numStr = String(idx + 1).padStart(3, '0');
      const cleanKey = item.key.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      return {
        filename: `docs/adr/ADR-${numStr}-${cleanKey}.md`,
        content: this.generateAdrMarkdown(item, idx),
      };
    });
  }
}
