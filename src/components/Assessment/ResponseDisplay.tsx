import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Check, X, Clock, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponseDisplayProps {
  response?: {
    text?: string;
    audioUrl?: string;
    timestamp?: string;
    type: 'voice' | 'text';
  };
  onEdit?: (newText: string) => void;
  onClear?: () => void;
  className?: string;
  isReadOnly?: boolean;
}

export function ResponseDisplay({
  response,
  onEdit,
  onClear,
  className,
  isReadOnly = false
}: ResponseDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(response?.text || '');

  if (!response) {
    return null;
  }

  const handleSave = () => {
    onEdit?.(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(response.text || '');
    setIsEditing(false);
  };

  const playAudio = () => {
    if (response.audioUrl) {
      const audio = new Audio(response.audioUrl);
      audio.play().catch(console.error);
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className={cn("p-4 bg-accent/5 border-accent/20", className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-foreground">Your Response</h4>
            {response.type === 'voice' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Volume2 size={12} />
                Voice
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {response.timestamp && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={12} />
                {formatTimestamp(response.timestamp)}
              </div>
            )}
            
            {!isReadOnly && !isEditing && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-7 px-2"
                >
                  <Edit3 size={12} />
                </Button>
                {onClear && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="h-7 px-2 text-destructive hover:text-destructive"
                  >
                    <X size={12} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[80px] resize-none"
              placeholder="Edit your response..."
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="h-8"
              >
                <Check size={14} className="mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="h-8"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm leading-relaxed text-foreground bg-background rounded-md p-3 border">
              {response.text || 'No text response provided'}
            </div>
            
            {/* Audio playback for voice responses */}
            {response.type === 'voice' && response.audioUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={playAudio}
                className="h-8"
              >
                <Volume2 size={14} className="mr-1" />
                Play Recording
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}