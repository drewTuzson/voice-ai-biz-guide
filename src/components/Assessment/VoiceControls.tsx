import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { alexVoice } from '@/utils/textToSpeech';
import { Button } from '@/components/ui/button';

interface VoiceControlsProps {
  text: string;
  autoPlay?: boolean;
  className?: string;
}

export function VoiceControls({ text, autoPlay = true, className = '' }: VoiceControlsProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const handleSpeak = async () => {
    if (isMuted) return;
    
    await alexVoice.speak(text, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (error) => {
        console.error('Speech error:', error);
        setIsSpeaking(false);
      }
    });
  };
  
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (isSpeaking) {
      alexVoice.stop();
      setIsSpeaking(false);
    }
  };
  
  const handleReplay = () => {
    if (!isMuted) {
      handleSpeak();
    }
  };
  
  useEffect(() => {
    if (autoPlay && !isMuted && text) {
      handleSpeak();
    }
  }, [text, autoPlay, isMuted]);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleMute}
        className="h-8 px-2"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReplay}
        disabled={isSpeaking || isMuted}
        className="h-8 px-2"
        aria-label="Replay"
      >
        <RotateCcw size={16} className={isSpeaking ? 'animate-spin' : ''} />
      </Button>
      
      {isSpeaking && (
        <div className="flex items-center gap-1 ml-2 text-accent">
          <div className="w-1 h-3 bg-accent animate-pulse rounded-full" />
          <div className="w-1 h-4 bg-accent animate-pulse rounded-full" style={{ animationDelay: '100ms' }} />
          <div className="w-1 h-3 bg-accent animate-pulse rounded-full" style={{ animationDelay: '200ms' }} />
          <span className="text-sm ml-1">Speaking...</span>
        </div>
      )}
    </div>
  );
}