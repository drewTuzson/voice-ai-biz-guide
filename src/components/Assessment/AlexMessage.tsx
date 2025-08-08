import { VoiceControls } from './VoiceControls';
import { Card } from '@/components/ui/card';

interface AlexMessageProps {
  message: string;
  showAvatar?: boolean;
  autoPlay?: boolean;
}

export function AlexMessage({ message, showAvatar = true, autoPlay = true }: AlexMessageProps) {
  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <div className="flex items-start gap-4">
        {showAvatar && (
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Alex, your AI business strategist</h3>
            <VoiceControls text={message} autoPlay={autoPlay} />
          </div>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {message}
          </div>
        </div>
      </div>
    </Card>
  );
}