import { MemoryItem } from '../types/ipc';

export class GeminiService {
  private static apiKey: string = '';

  public static setApiKey(key: string) {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('GEMINI_API_KEY', key);
    }
  }

  public static getApiKey(): string {
    if (this.apiKey) return this.apiKey;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('GEMINI_API_KEY') || '';
    }
    return '';
  }

  public static async generateContent(prompt: string, memoryItems: MemoryItem[]): Promise<string> {
    const key = this.getApiKey();
    if (!key) {
      return `[GEMINI API WARNING]: GEMINI_API_KEY is not configured.\nType /addkey <key> or click the Key button to set your API Key.\n\nLocked Architecture Decisions:\n` +
        memoryItems.map((m) => `- ${m.key}: ${m.value}`).join('\n');
    }

    const lockedContext = memoryItems
      .map((m) => `- ${m.key}: ${m.value}`)
      .join('\n');

    const systemPrompt = `SYSTEM ROLE: You are the AI Coding Orchestrator & Technical Product Manager.
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

User Prompt: ${prompt}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: systemPrompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      if (data.error) {
        return `[Gemini API Error]: ${data.error.message || 'Failed to generate response'}`;
      }
    } catch (err: any) {
      return `[Gemini API Network Error]: ${err.message}`;
    }

    return 'No response returned from Gemini API.';
  }
}
