import React from 'react';
import { Mic, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing?: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  audioLevel?: number;
}

export function RecordButton({
  isRecording,
  isProcessing = false,
  onClick,
  disabled = false,
  size = 'lg',
  audioLevel = 0
}: RecordButtonProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 28
  };

  // Create pulsing effect based on audio level
  const pulseScale = 1 + (audioLevel * 0.3);

  return (
    <button
      onClick={onClick}
      disabled={disabled || isProcessing}
      className={cn(
        'relative rounded-full flex items-center justify-center transition-all duration-200',
        'focus:outline-none focus:ring-4 focus:ring-primary/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        isRecording
          ? 'bg-accent text-white shadow-lg hover:bg-accent/90'
          : 'bg-primary text-white shadow-md hover:bg-primary/90 hover:scale-105'
      )}
      style={{
        transform: isRecording && audioLevel > 0 
          ? `scale(${pulseScale})` 
          : undefined
      }}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {/* Animated rings for recording state */}
      {isRecording && (
        <>
          <div className={cn(
            'absolute inset-0 rounded-full border-2 border-accent',
            'animate-ping opacity-75'
          )} />
          <div className={cn(
            'absolute inset-0 rounded-full border border-accent/50',
            'animate-pulse'
          )} />
        </>
      )}

      {/* Icon */}
      {isRecording ? (
        <Square size={iconSizes[size]} fill="currentColor" />
      ) : (
        <Mic size={iconSizes[size]} />
      )}

      {/* Processing spinner overlay */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/90 rounded-full">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}