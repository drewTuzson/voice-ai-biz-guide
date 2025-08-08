import { supabase } from '@/integrations/supabase/client';

interface SpeakOptions {
  voice?: 'onyx' | 'alloy' | 'echo' | 'fable' | 'nova' | 'shimmer';
  speed?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

class AlexVoice {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map();
  
  async speak(text: string, options: SpeakOptions = {}) {
    const {
      voice = 'onyx',
      speed = 0.95,
      onStart,
      onEnd,
      onError
    } = options;

    try {
      this.stop();
      
      const cacheKey = `${text}-${voice}-${speed}`;
      let audioUrl = this.audioCache.get(cacheKey);
      
      if (!audioUrl) {
        onStart?.();
        
        const { data, error } = await supabase.functions.invoke('openai-tts', {
          body: { text, voice, speed }
        });
        
        if (error) throw error;
        
        audioUrl = URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' }));
        this.audioCache.set(cacheKey, audioUrl);
      }
      
      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.onended = () => {
        this.currentAudio = null;
        onEnd?.();
      };
      
      this.currentAudio.onerror = (e) => {
        onError?.(new Error('Audio playback failed'));
      };
      
      await this.currentAudio.play();
      
    } catch (error) {
      console.error('TTS Error:', error);
      onError?.(error as Error);
      this.fallbackSpeak(text, onEnd);
    }
  }
  
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }
  
  private fallbackSpeak(text: string, onEnd?: () => void) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.95;
    utterance.onend = () => onEnd?.();
    speechSynthesis.speak(utterance);
  }
  
  async preloadPhrases(phrases: string[]) {
    for (const phrase of phrases) {
      await this.speak(phrase, { onStart: () => {}, onEnd: () => {} });
    }
  }
}

export const alexVoice = new AlexVoice();