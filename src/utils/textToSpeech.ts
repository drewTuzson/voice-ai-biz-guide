interface TextToSpeechOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class TextToSpeechManager {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onSpeakingChange?: (speaking: boolean) => void;

  constructor(onSpeakingChange?: (speaking: boolean) => void) {
    this.synth = window.speechSynthesis;
    this.onSpeakingChange = onSpeakingChange;
  }

  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  // Get a professional male voice, fallback to default
  getPreferredVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    
    // Look for professional male voices
    const maleVoices = voices.filter(voice => 
      voice.name.toLowerCase().includes('male') ||
      voice.name.toLowerCase().includes('david') ||
      voice.name.toLowerCase().includes('alex') ||
      voice.name.toLowerCase().includes('daniel')
    );

    if (maleVoices.length > 0) {
      return maleVoices[0];
    }

    // Fallback to default English voice
    const englishVoices = voices.filter(voice => 
      voice.lang.startsWith('en-')
    );

    return englishVoices.length > 0 ? englishVoices[0] : null;
  }

  speak(text: string, options: TextToSpeechOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!TextToSpeechManager.isSupported()) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      // Stop any current speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      utterance.voice = options.voice || this.getPreferredVoice();
      utterance.rate = options.rate || 0.9; // Slightly slower for clarity
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      utterance.onstart = () => {
        this.onSpeakingChange?.(true);
      };

      utterance.onend = () => {
        this.onSpeakingChange?.(false);
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.onSpeakingChange?.(false);
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.onSpeakingChange?.(false);
    this.currentUtterance = null;
  }

  pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  isPaused(): boolean {
    return this.synth.paused;
  }
}