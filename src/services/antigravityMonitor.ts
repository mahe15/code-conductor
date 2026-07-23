import { GeminiService } from './geminiService';
import { MemoryItem } from '../types/ipc';

export interface InterceptedQuestion {
  detectedPhrase: string;
  category: string;
  question: string;
  options: string[];
}

export class AntigravityMonitorService {
  private static slidingBuffer: string[] = [];
  private static isEvaluating: boolean = false;

  public static async monitorLogChunk(
    chunk: string,
    memoryItems: MemoryItem[],
    onQuestionTriggered: (q: InterceptedQuestion) => void
  ) {
    this.slidingBuffer.push(chunk);
    if (this.slidingBuffer.length > 20) {
      this.slidingBuffer.shift();
    }

    const fullText = this.slidingBuffer.join('\n');

    // Quick regex scan for potential tech assumptions
    const techPatterns = /(install|using|setup|configure)\s+(prisma|mongodb|firebase|auth0|clerk|chakra|material-ui|bootstrap|redux|graphql)/i;
    if (techPatterns.test(fullText) && !this.isEvaluating) {
      this.isEvaluating = true;
      try {
        const question = await this.evaluateWithGemini(fullText, memoryItems);
        if (question) {
          onQuestionTriggered(question);
        }
      } catch (e) {
        console.error('AntigravityMonitor evaluation error:', e);
      } finally {
        this.isEvaluating = false;
      }
    }
  }

  private static async evaluateWithGemini(
    transcriptSnippet: string,
    memoryItems: MemoryItem[]
  ): Promise<InterceptedQuestion | null> {
    const apiKey = GeminiService.getApiKey();
    if (!apiKey) return null;

    const locked = memoryItems.map((m) => `${m.key}: ${m.value}`).join(', ');

    const prompt = `SYSTEM: You are monitoring an AI Coding Agent stream.
Locked Architecture: [${locked}]

Transcript Snippet:
"${transcriptSnippet}"

Task: Check if the AI agent is assuming an unverified tech choice (e.g. database, auth, styling) that is NOT locked yet.
If YES, respond ONLY with a JSON object:
{
  "detectedPhrase": "string",
  "category": "string",
  "question": "string",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
}
If NO assumption is being made, respond with {"none": true}.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && parsed.question && parsed.options) {
        return parsed as InterceptedQuestion;
      }
    } catch (err) {}
    return null;
  }
}
