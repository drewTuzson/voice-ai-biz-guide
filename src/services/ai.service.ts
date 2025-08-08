import { supabase } from '@/integrations/supabase/client';

interface AnalyzeResponseParams {
  currentQuestion: string;
  userResponse: string;
  conversationHistory?: string;
}

interface GenerateReportParams {
  assessmentData: any;
}

export class AIService {
  async analyzeResponse(params: AnalyzeResponseParams) {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-response', {
        body: params
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw error;
    }
  }

  async generateReport(params: GenerateReportParams) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: params
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Report Generation Error:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();