export class SpeechToTextService {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }
  }

  public startListening(onResult: (transcript: string) => void, onError?: (err: any) => void) {
    if (!this.recognition) {
      if (onResult) onResult('Supabase Auth'); // Fallback simulation
      return;
    }

    this.isListening = true;
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      this.isListening = false;
    };

    this.recognition.onerror = (err: any) => {
      if (onError) onError(err);
      this.isListening = false;
    };

    this.recognition.start();
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
