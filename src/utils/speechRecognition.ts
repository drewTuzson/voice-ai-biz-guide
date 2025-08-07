interface SpeechRecognitionOptions {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  language?: string;
  continuous?: boolean;
}

export class SpeechRecognitionManager {
  private recognition: any = null;
  private isListening = false;
  private options: SpeechRecognitionOptions;

  constructor(options: SpeechRecognitionOptions = {}) {
    this.options = {
      language: 'en-US',
      continuous: true,
      ...options
    };
  }

  static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }

  start(): void {
    if (!SpeechRecognitionManager.isSupported()) {
      this.options.onError?.('Speech recognition is not supported in this browser');
      return;
    }

    if (this.isListening) {
      return;
    }

    try {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = this.options.continuous;
      this.recognition.interimResults = true;
      this.recognition.lang = this.options.language;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.options.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          this.options.onResult?.(finalTranscript.trim(), true);
        } else if (interimTranscript) {
          this.options.onResult?.(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        
        let errorMessage = 'Speech recognition failed';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error during speech recognition.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        this.options.onError?.(errorMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.options.onEnd?.();
      };

      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.options.onError?.('Failed to start speech recognition');
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}