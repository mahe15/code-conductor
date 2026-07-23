import { MemoryItem } from '../types/ipc';

export class PromptEnricherService {
  public static enrichPrompt(userPrompt: string, memoryItems: MemoryItem[]): string {
    if (!memoryItems || memoryItems.length === 0) {
      return userPrompt;
    }

    const lockedChoices = memoryItems
      .map((item) => `- ${item.key}: ${item.value}`)
      .join('\n');

    const systemHeader = `[SYSTEM CONTEXT ENFORCEMENT]\n` +
      `Active Project Architecture Decisions (LOCKED):\n` +
      `${lockedChoices}\n` +
      `DO NOT ask about or deviate from these established choices. Respect all locked decisions.\n\n` +
      `[DEVELOPER PROMPT]\n`;

    return systemHeader + userPrompt;
  }
}
