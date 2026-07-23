import { MemoryItem } from '../types/ipc';

export class AdrService {
  public static generateAdrMarkdown(item: MemoryItem, index: number): string {
    const numStr = String(index + 1).padStart(3, '0');
    return `# ADR-${numStr}: Selection of ${item.value} for ${item.key}\n\n` +
      `## Status\nAccepted\n\n` +
      `## Context\n` +
      `The project required an architectural decision for \`${item.key}\` to prevent AI agent assumptions.\n\n` +
      `## Decision\n` +
      `Use **${item.value}** for \`${item.key}\`.\n\n` +
      `## Consequences\n` +
      `- Enforces consistent project implementation.\n` +
      `- Locked into project memory store to guide future AI agent prompts.\n`;
  }

  public static exportAllAdrs(memoryItems: MemoryItem[]): { filename: string; content: string }[] {
    const records = memoryItems.map((item, idx) => {
      const numStr = String(idx + 1).padStart(3, '0');
      const cleanKey = item.key.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      return {
        filename: `ADR-${numStr}-${cleanKey}.md`,
        content: this.generateAdrMarkdown(item, idx),
      };
    });

    // Trigger browser file downloads for generated ADRs
    records.forEach((record) => {
      try {
        const blob = new Blob([record.content], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', record.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Browser blob download fallback:', e);
      }
    });

    return records;
  }
}
