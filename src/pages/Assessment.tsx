import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { VoiceRecorder } from '@/components/Voice/VoiceRecorder';
import { TranscriptionDisplay } from '@/components/Voice/TranscriptionDisplay';
import { ResponseDisplay } from '@/components/Assessment/ResponseDisplay';
import { VoiceSettings } from '@/components/Assessment/VoiceSettings';
import { AlexMessage } from '@/components/Assessment/AlexMessage';
import { AlexResponse } from '@/components/Assessment/AlexResponse';
import { useAssessment } from '@/contexts/AssessmentContext';
import { alexVoice } from '@/utils/textToSpeech';
import { ChevronLeft, ChevronRight, SkipForward, CheckCircle, Volume2, VolumeX, RotateCcw, Settings, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Assessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    currentAssessment,
    currentQuestion,
    currentQuestionIndex,
    responses,
    startNewAssessment,
    saveResponse,
    nextQuestion,
    previousQuestion,
    skipQuestion,
    completeAssessment,
    loadAssessment,
    isLoading,
    error,
    canGoNext,
    canGoPrevious,
    progress,
    analyzeResponse,
    isAnalyzing
  } = useAssessment();

  const [currentResponse, setCurrentResponse] = useState('');
  const [transcription, setTranscription] = useState('');
  const [useTextMode, setUseTextMode] = useState(false);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [isAlexSpeaking, setIsAlexSpeaking] = useState(false);
  const [alexMuted, setAlexMuted] = useState(false);
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    alexVoiceEnabled: true,
    speakingSpeed: 0.9,
    autoAdvance: false,
    showTranscriptionWhileRecording: true
  });
  const [showAiResponse, setShowAiResponse] = useState(false);
  const [currentAiResponse, setCurrentAiResponse] = useState('');

  // Load assessment or start new one
  useEffect(() => {
    if (id) {
      loadAssessment(id);
    } else {
      startNewAssessment();
    }
  }, [id, loadAssessment, startNewAssessment]);

  // Preload common phrases on mount
  useEffect(() => {
    alexVoice.preloadPhrases([
      "Great answer! Let me ask you more about that.",
      "Interesting! Tell me more.", 
      "Thank you for sharing that.",
    ]);
  }, []);

  // Load existing response for current question
  useEffect(() => {
    if (currentQuestion) {
      const existingResponse = responses.find(r => r.question_id === currentQuestion.id);
      if (existingResponse) {
        setCurrentResponse(existingResponse.response_text || '');
        setTranscription(existingResponse.response_text || '');
      } else {
        setCurrentResponse('');
        setTranscription('');
      }
      setHasRecordedAudio(false);
      setSaveStatus('idle');
      
    }
  }, [currentQuestion, responses]);

  const handleTranscription = (text: string, isFinal: boolean) => {
    setTranscription(text);
    if (isFinal) {
      setCurrentResponse(text);
    }
  };

  const handleAudioRecorded = (audioBlob: Blob) => {
    setHasRecordedAudio(true);
    // Auto-save the response with audio
    if (currentQuestion) {
      const text = transcription || currentResponse;
      saveResponse(currentQuestion.id, text, audioBlob);
      setShowAiResponse(true);
      analyzeResponse(currentQuestion.id, text).then((res) => {
        if (res) setCurrentAiResponse(res);
      });
    }
  };

  const handleTextResponse = async () => {
    if (currentQuestion && currentResponse.trim()) {
      setSaveStatus('saving');
      try {
        await saveResponse(currentQuestion.id, currentResponse);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
        
        if (voiceSettings.autoAdvance) {
          setTimeout(() => handleNext(), 1500);
        }
      } catch (error) {
        setSaveStatus('idle');
        console.error('Failed to save response:', error);
      }
    }
  };

  const handleResponseEdit = async (newText: string) => {
    if (currentQuestion) {
      setSaveStatus('saving');
      try {
        await saveResponse(currentQuestion.id, newText);
        setCurrentResponse(newText);
        setTranscription(newText);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
        setSaveStatus('idle');
        console.error('Failed to update response:', error);
      }
    }
  };

  const handleResponseClear = () => {
    setCurrentResponse('');
    setTranscription('');
    setHasRecordedAudio(false);
    setSaveStatus('idle');
  };

  const toggleAlexMute = () => {
    setAlexMuted(!alexMuted);
    if (!alexMuted) {
      alexVoice.stop();
    }
  };

  const handleNext = async () => {
    // Save current response if there's text and no audio recorded
    if (currentQuestion && currentResponse.trim() && !hasRecordedAudio && saveStatus !== 'saved') {
      setSaveStatus('saving');
      try {
        await saveResponse(currentQuestion.id, currentResponse);
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('idle');
        console.error('Failed to save response:', error);
        return;
      }
    }

    if (canGoNext) {
      await nextQuestion();
    } else {
      // This is the last question, complete the assessment
      await completeAssessment();
      navigate('/dashboard');
      toast({
        title: "Assessment Complete!",
        description: "Thank you for completing your assessment. We'll analyze your responses and prepare your report."
      });
    }
  };

  const handlePrevious = async () => {
    if (canGoPrevious) {
      await previousQuestion();
    }
  };

  const handleSkip = async () => {
    await skipQuestion();
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentQuestion || !currentAssessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === 4; // 5 questions total (0-4)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Business Assessment</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="h-8 px-2"
            >
              <Settings size={16} />
            </Button>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of 5
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <Progress value={progress} className="w-full" />
      </div>

      {/* Current Question with Alex */}
      <AlexMessage 
        message={currentQuestion.text}
        autoPlay={voiceSettings.alexVoiceEnabled && !alexMuted}
      />

      {/* Response Section */}
      <Card className="mb-8 p-8">
        {currentQuestion.helpText && (
          <p className="text-muted-foreground text-sm mb-6">
            💡 {currentQuestion.helpText}
          </p>
        )}

        {/* Current Response Display */}
        {(currentResponse || transcription) && (
          <div className="mb-6">
            <ResponseDisplay
              response={{
                text: currentResponse || transcription,
                type: hasRecordedAudio ? 'voice' : 'text',
                timestamp: new Date().toISOString()
              }}
              onEdit={handleResponseEdit}
              onClear={handleResponseClear}
            />
          </div>
        )}

        {/* Response Options */}
        <div className="space-y-6">
          {/* Voice Recording */}
          {!useTextMode && (
            <div>
              <h3 className="text-sm font-medium mb-4 text-center">
                Speak your answer
              </h3>
              <VoiceRecorder
                onTranscription={handleTranscription}
                onAudioRecorded={handleAudioRecorded}
                disabled={isLoading}
              />
              
              {/* Show transcription if available and setting enabled */}
              {transcription && voiceSettings.showTranscriptionWhileRecording && (
                <div className="mt-4">
                  <TranscriptionDisplay
                    transcription={transcription}
                    onTranscriptionChange={(text) => {
                      setTranscription(text);
                      setCurrentResponse(text);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="text-center">
            <button
              onClick={() => setUseTextMode(!useTextMode)}
              className="text-sm text-primary hover:underline"
            >
              {useTextMode ? 'Switch to voice mode' : 'Prefer to type? Switch to text mode'}
            </button>
          </div>

          {/* Text Input */}
          {useTextMode && (
            <div>
              <h3 className="text-sm font-medium mb-4">
                Type your answer
              </h3>
              <Textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder="Share your thoughts here..."
                className="min-h-[120px]"
                maxLength={2000}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {currentResponse.length} / 2000 characters
                </span>
                <div className="flex items-center gap-2">
                  {saveStatus === 'saving' && (
                    <span className="text-xs text-muted-foreground">Saving...</span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="text-xs text-accent">✓ Response saved</span>
                  )}
                  {useTextMode && currentResponse.trim() && (
                    <Button
                      size="sm"
                      onClick={handleTextResponse}
                      disabled={isLoading || saveStatus === 'saving'}
                    >
                      Save Response
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Alex AI Response */}
      {showAiResponse && (
        <AlexResponse response={currentAiResponse} isLoading={isAnalyzing} />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoPrevious || isLoading}
        >
          <ChevronLeft size={16} className="mr-1" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading}
          >
            <SkipForward size={16} className="mr-1" />
            Skip
          </Button>

          <Button
            onClick={handleNext}
            disabled={isLoading || saveStatus === 'saving'}
            className="min-w-[100px]"
          >
            {saveStatus === 'saving' ? (
              'Saving...'
            ) : isLastQuestion ? (
              <>
                <CheckCircle size={16} className="mr-1" />
                Complete
              </>
            ) : (
              <>
                {saveStatus === 'saved' ? 'Continue' : 'Save & Continue'}
                <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettings
        settings={voiceSettings}
        onSettingsChange={setVoiceSettings}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}