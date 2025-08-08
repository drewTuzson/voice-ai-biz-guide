import { Card } from '@/components/ui/card';
import { VoiceControls } from './VoiceControls';
import { Loader2 } from 'lucide-react';

interface AlexResponseProps {
  response: string;
  isLoading?: boolean;
  autoPlay?: boolean;
}

export function AlexResponse({ response, isLoading, autoPlay = false }: AlexResponseProps) {
  if (isLoading) {
    return (
      <Card className="p-4 mt-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-muted-foreground">Alex is analyzing your response...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (!response) return null;

  return (
    <Card className="p-4 mt-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
          A
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-primary">Alex</p>
            <VoiceControls text={response} autoPlay={autoPlay} />
          </div>
          <p className="text-foreground leading-relaxed">{response}</p>
        </div>
      </div>
    </Card>
  );
}