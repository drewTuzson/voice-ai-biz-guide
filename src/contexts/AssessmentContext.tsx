import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { assessmentQuestions, AssessmentQuestion } from '@/data/questions';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/ai.service';

interface AssessmentResponse {
  id: string;
  question_id: string;
  response_text?: string | null;
  response_audio_url?: string | null;
  response_type: string;
  created_at: string;
  assessment_id: string;
}

interface Assessment {
  id: string;
  user_id: string;
  status: string;
  current_question: number;
  responses: any;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

interface AssessmentContextType {
  // Current assessment state
  currentAssessment: Assessment | null;
  currentQuestion: AssessmentQuestion | null;
  currentQuestionIndex: number;
  responses: AssessmentResponse[];
  
  // Actions
  startNewAssessment: () => Promise<void>;
  saveResponse: (questionId: string, responseText?: string, audioBlob?: Blob) => Promise<void>;
  nextQuestion: () => Promise<void>;
  previousQuestion: () => Promise<void>;
  skipQuestion: () => Promise<void>;
  completeAssessment: () => Promise<void>;
  loadAssessment: (assessmentId: string) => Promise<void>;
  analyzeResponse: (questionId: string, response: string) => Promise<string | null>;
  
  // State
  isLoading: boolean;
  isAnalyzing: boolean;
  aiResponses: Record<string, string>;
  error: string | null;
  canGoNext: boolean;
  canGoPrevious: boolean;
  progress: number;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentQuestion = assessmentQuestions[currentQuestionIndex] || null;
  const canGoNext = currentQuestionIndex < assessmentQuestions.length - 1;
  const canGoPrevious = currentQuestionIndex > 0;
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;

  const startNewAssessment = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          status: 'in_progress',
          current_question: 0
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentAssessment(data);
      setCurrentQuestionIndex(0);
      setResponses([]);

      toast({
        title: "Assessment Started",
        description: "Let's begin your business assessment"
      });
    } catch (err) {
      console.error('Failed to start assessment:', err);
      setError('Failed to start assessment');
      toast({
        title: "Error",
        description: "Failed to start assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const saveResponse = useCallback(async (
    questionId: string,
    responseText?: string,
    audioBlob?: Blob
  ) => {
    if (!currentAssessment) return;

    setIsLoading(true);

    try {
      let audioUrl: string | undefined;

      // Upload audio if provided
      if (audioBlob) {
        const fileName = `${currentAssessment.id}/${questionId}-${Date.now()}.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audio-responses')
          .upload(fileName, audioBlob);

        if (uploadError) {
          console.warn('Audio upload failed:', uploadError);
          // Continue without audio
        } else {
          const { data: urlData } = supabase.storage
            .from('audio-responses')
            .getPublicUrl(uploadData.path);
          audioUrl = urlData.publicUrl;
        }
      }

      // Save response to database
      const { data, error } = await supabase
        .from('assessment_responses')
        .insert({
          assessment_id: currentAssessment.id,
          question_id: questionId,
          response_text: responseText,
          response_audio_url: audioUrl,
          response_type: audioBlob ? 'voice' : 'text'
        })
        .select()
        .single();

      if (error) throw error;

      // Update responses state
      setResponses(prev => [...prev.filter(r => r.question_id !== questionId), data]);

      // Update assessment progress
      await supabase
        .from('assessments')
        .update({ 
          current_question: currentQuestionIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentAssessment.id);

    } catch (err) {
      console.error('Failed to save response:', err);
      toast({
        title: "Save Failed",
        description: "Failed to save your response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentAssessment, currentQuestionIndex, toast]);

  const nextQuestion = useCallback(async () => {
    if (!canGoNext) return;
    
    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);

    if (currentAssessment) {
      await supabase
        .from('assessments')
        .update({ current_question: newIndex })
        .eq('id', currentAssessment.id);
    }
  }, [canGoNext, currentQuestionIndex, currentAssessment]);

  const previousQuestion = useCallback(async () => {
    if (!canGoPrevious) return;
    
    const newIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(newIndex);

    if (currentAssessment) {
      await supabase
        .from('assessments')
        .update({ current_question: newIndex })
        .eq('id', currentAssessment.id);
    }
  }, [canGoPrevious, currentQuestionIndex, currentAssessment]);

  const skipQuestion = useCallback(async () => {
    await nextQuestion();
  }, [nextQuestion]);

  const completeAssessment = useCallback(async () => {
    if (!currentAssessment) return;

    setIsLoading(true);

    try {
      await supabase
        .from('assessments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentAssessment.id);

      toast({
        title: "Assessment Complete!",
        description: "Thank you for completing your assessment. We'll process your responses now."
      });

    } catch (err) {
      console.error('Failed to complete assessment:', err);
      toast({
        title: "Error",
        description: "Failed to complete assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentAssessment, toast]);

  const loadAssessment = useCallback(async (assessmentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Load assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (assessmentError) throw assessmentError;

      // Load responses
      const { data: responses, error: responsesError } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('created_at', { ascending: true });

      if (responsesError) throw responsesError;

      setCurrentAssessment(assessment);
      setCurrentQuestionIndex(assessment.current_question);
      setResponses(responses || []);

    } catch (err) {
      console.error('Failed to load assessment:', err);
      setError('Failed to load assessment');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeResponse = useCallback(async (questionId: string, responseText: string) => {
    setIsAnalyzing(true);
    try {
      const conversationHistory = responses
        .filter(r => !!r.response_text)
        .map(r => {
          const q = assessmentQuestions.find(q => q.id === r.question_id);
          return `Q: ${q?.text ?? r.question_id}\nA: ${r.response_text ?? ''}`;
        })
        .join('\n\n');

      const currentQuestionText = assessmentQuestions.find(q => q.id === questionId)?.text ?? questionId;

      const result = await aiService.analyzeResponse({
        currentQuestion: currentQuestionText,
        userResponse: responseText,
        conversationHistory,
      });

      const aiText: string = result?.response ?? '';
      if (aiText) {
        setAiResponses(prev => ({ ...prev, [questionId]: aiText }));
      }
      return aiText || null;
    } catch (err) {
      console.error('Analysis failed:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [responses]);

  const value: AssessmentContextType = {
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
    analyzeResponse,
    isLoading,
    isAnalyzing,
    aiResponses,
    error,
    canGoNext,
    canGoPrevious,
    progress
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};