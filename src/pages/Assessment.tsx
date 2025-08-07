import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { VoiceRecorder } from '@/components/Voice/VoiceRecorder';
import { TranscriptionDisplay } from '@/components/Voice/TranscriptionDisplay';
import { useAssessment } from '@/contexts/AssessmentContext';
import { ChevronLeft, ChevronRight, SkipForward, CheckCircle } from 'lucide-react';
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
    progress
  } = useAssessment();

  const [currentResponse, setCurrentResponse] = useState('');
  const [transcription, setTranscription] = useState('');
  const [useTextMode, setUseTextMode] = useState(false);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);

  // Load assessment or start new one
  useEffect(() => {
    if (id) {
      loadAssessment(id);
    } else {
      startNewAssessment();
    }
  }, [id, loadAssessment, startNewAssessment]);

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
      saveResponse(currentQuestion.id, transcription || currentResponse, audioBlob);
    }
  };

  const handleTextResponse = () => {
    if (currentQuestion && currentResponse.trim()) {
      saveResponse(currentQuestion.id, currentResponse);
    }
  };

  const handleNext = async () => {
    // Save current response if there's text and no audio recorded
    if (currentQuestion && currentResponse.trim() && !hasRecordedAudio) {
      await saveResponse(currentQuestion.id, currentResponse);
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
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of 5
          </span>
        </div>
        
        {/* Progress Bar */}
        <Progress value={progress} className="w-full" />
      </div>

      {/* AI Assistant Introduction */}
      <Card className="mb-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Hi, I'm Alex, your AI business strategist
            </h3>
            <p className="text-muted-foreground text-sm">
              I'll guide you through this assessment to understand your business better. 
              You can speak your answers or type them - whatever feels more comfortable.
            </p>
          </div>
        </div>
      </Card>

      {/* Current Question */}
      <Card className="mb-8 p-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {currentQuestion.text}
        </h2>
        {currentQuestion.helpText && (
          <p className="text-muted-foreground text-sm mb-6">
            💡 {currentQuestion.helpText}
          </p>
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
              
              {/* Show transcription if available */}
              {transcription && (
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
                {useTextMode && currentResponse.trim() && (
                  <Button
                    size="sm"
                    onClick={handleTextResponse}
                    disabled={isLoading}
                  >
                    Save Response
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

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
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLastQuestion ? (
              <>
                <CheckCircle size={16} className="mr-1" />
                Complete
              </>
            ) : (
              <>
                Next
                <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}