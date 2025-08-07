import React, { useState, useCallback, useRef } from 'react';
import { RecordButton } from '@/components/ui/RecordButton';
import { AudioWaveform } from '@/components/ui/AudioWaveform';
import { Card } from '@/components/ui/card';
import { AlertCircle, Clock } from 'lucide-react';
import { AudioRecorder } from '@/utils/audioRecording';
import { SpeechRecognitionManager } from '@/utils/speechRecognition';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscription?: (text: string, isFinal: boolean) => void;
  onAudioRecorded?: (audioBlob: Blob) => void;
  disabled?: boolean;
  maxDuration?: number; // in seconds
}

export function VoiceRecorder({
  onTranscription,
  onAudioRecorded,
  disabled = false,
  maxDuration = 300 // 5 minutes default
}: VoiceRecorderProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionManager | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  const isAudioSupported = AudioRecorder.isSupported();
  const isSpeechSupported = SpeechRecognitionManager.isSupported();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= maxDuration) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    if (!isAudioSupported) {
      toast({
        title: "Not Supported",
        description: "Audio recording is not supported in your browser",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Initialize audio recorder
      audioRecorderRef.current = new AudioRecorder({
        onDataAvailable: (blob) => {
          onAudioRecorded?.(blob);
        },
        onLevelChange: setAudioLevel
      });

      // Initialize speech recognition if supported
      if (isSpeechSupported && onTranscription) {
        speechRecognitionRef.current = new SpeechRecognitionManager({
          onResult: onTranscription,
          onError: (error) => {
            console.warn('Speech recognition error:', error);
            // Don't show error toast for speech recognition as it's optional
          }
        });
      }

      // Start recording
      await audioRecorderRef.current.start();
      speechRecognitionRef.current?.start();

      setIsRecording(true);
      setHasPermission(true);
      startTimer();
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone"
      });

    } catch (error) {
      console.error('Failed to start recording:', error);
      setHasPermission(false);
      toast({
        title: "Recording Failed",
        description: "Please check your microphone permissions and try again",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isAudioSupported, isSpeechSupported, onTranscription, onAudioRecorded, maxDuration, toast]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;

    setIsProcessing(true);
    stopTimer();

    // Stop audio recording
    audioRecorderRef.current?.stop();
    speechRecognitionRef.current?.stop();

    setIsRecording(false);
    setAudioLevel(0);
    setRecordingTime(0);
    setIsProcessing(false);

    toast({
      title: "Recording Stopped",
      description: "Processing your audio..."
    });
  }, [isRecording, toast]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Show permission request if needed
  if (hasPermission === false) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Microphone Access Required</h3>
        <p className="text-muted-foreground mb-4">
          Please allow microphone access to use voice recording
        </p>
        <button
          onClick={() => setHasPermission(null)}
          className="text-primary hover:underline"
        >
          Try Again
        </button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center gap-2 text-accent font-medium">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <Clock size={16} />
          <span>{formatTime(recordingTime)}</span>
          {maxDuration && (
            <span className="text-muted-foreground">
              / {formatTime(maxDuration)}
            </span>
          )}
        </div>
      )}

      {/* Audio Waveform */}
      <div className="w-full max-w-xs">
        <AudioWaveform
          audioLevel={audioLevel}
          isActive={isRecording}
          className="opacity-80"
        />
      </div>

      {/* Record Button */}
      <RecordButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        onClick={toggleRecording}
        disabled={disabled || !isAudioSupported}
        audioLevel={audioLevel}
      />

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        {!isAudioSupported ? (
          <span className="text-destructive">Audio recording not supported</span>
        ) : isRecording ? (
          <span>Click to stop recording</span>
        ) : (
          <span>Click to start recording</span>
        )}
      </div>
    </div>
  );
}