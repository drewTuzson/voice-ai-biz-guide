import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { aiService } from '@/services/ai.service';
import { supabase } from '@/integrations/supabase/client';

export default function Report() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assessmentId) {
      generateReport();
    }
  }, [assessmentId]);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assessment data from Supabase
      const { data: assessment, error: fetchError } = await supabase
        .from('assessments')
        .select('*, assessment_responses(*)')
        .eq('id', assessmentId)
        .single();

      if (fetchError) throw fetchError;

      // Generate report using AI
      const result = await aiService.generateReport({
        assessmentData: assessment
      });

      setReport(result.report);
    } catch (error) {
      console.error('Report generation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log('PDF download not implemented yet');
  };

  const handleEmailReport = () => {
    // TODO: Implement email functionality
    console.log('Email report not implemented yet');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Generating your AI transformation report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Your AI Transformation Report</h1>
        <p className="text-muted-foreground">
          Based on your assessment, here are personalized AI recommendations for your business.
        </p>
      </div>
      
      {/* Executive Summary */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Executive Summary</h2>
        <p className="text-muted-foreground leading-relaxed">{report?.executiveSummary}</p>
      </Card>

      {/* AI Opportunities */}
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Top AI Opportunities</h2>
        <div className="space-y-4">
          {report?.opportunities?.map((opp: any, index: number) => (
            <div key={index} className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <h3 className="font-semibold text-foreground mb-2">{opp.title}</h3>
              <p className="text-muted-foreground mb-2">{opp.description}</p>
              <p className="text-sm text-primary font-medium">
                Estimated time savings: {opp.timeSavings}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Implementation Roadmap */}
      {report?.roadmap && (
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Implementation Roadmap</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <h3 className="font-semibold text-primary mb-2">30 Days</h3>
              <p className="text-muted-foreground text-sm">{report.roadmap['30days']}</p>
            </div>
            <div className="p-4 bg-secondary/5 rounded-lg">
              <h3 className="font-semibold text-secondary mb-2">60 Days</h3>
              <p className="text-muted-foreground text-sm">{report.roadmap['60days']}</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg">
              <h3 className="font-semibold text-accent mb-2">90 Days</h3>
              <p className="text-muted-foreground text-sm">{report.roadmap['90days']}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Recommended Tools */}
      {report?.recommendedTools?.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Recommended Tools</h2>
          <div className="flex flex-wrap gap-2">
            {report.recommendedTools.map((tool: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {tool}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Next Steps */}
      {report?.nextSteps?.length > 0 && (
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Next Steps</h2>
          <ol className="space-y-2">
            {report.nextSteps.map((step: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleDownloadPDF} disabled>
          <Download className="mr-2 h-4 w-4" />
          Download PDF (Coming Soon)
        </Button>
        <Button variant="outline" onClick={handleEmailReport} disabled>
          <Mail className="mr-2 h-4 w-4" />
          Email Report (Coming Soon)
        </Button>
      </div>
    </div>
  );
}