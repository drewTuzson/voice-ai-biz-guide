import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, RotateCcw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptionDisplayProps {
  transcription: string;
  isInterim?: boolean;
  onTranscriptionChange?: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function TranscriptionDisplay({
  transcription,
  isInterim = false,
  onTranscriptionChange,
  placeholder = "Your speech will appear here...",
  maxLength = 2000,
  className
}: TranscriptionDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(transcription);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setEditText(transcription);
    // Calculate word count
    const words = transcription.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [transcription]);

  const handleSaveEdit = () => {
    onTranscriptionChange?.(editText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(transcription);
    setIsEditing(false);
  };

  const handleClear = () => {
    onTranscriptionChange?.('');
    setEditText('');
    setIsEditing(false);
  };

  const charCount = transcription.length;
  const isNearLimit = charCount > maxLength * 0.8;

  return (
    <Card className={cn("p-4 space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Transcription
          {isInterim && (
            <span className="ml-2 text-xs text-muted-foreground animate-pulse">
              (listening...)
            </span>
          )}
        </h3>
        
        {transcription && !isEditing && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 px-2"
            >
              <Edit3 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 px-2 text-destructive hover:text-destructive"
            >
              <RotateCcw size={14} />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        {isEditing ? (
          // Edit mode
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              className="min-h-[120px] resize-none"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  className="h-8"
                >
                  <Check size={14} className="mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-8"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Display mode
          <div
            className={cn(
              "min-h-[120px] p-3 rounded-md border text-sm leading-relaxed",
              "bg-muted/50 border-border",
              transcription ? "text-foreground" : "text-muted-foreground",
              isInterim && "italic opacity-75"
            )}
          >
            {transcription || placeholder}
          </div>
        )}
      </div>

      {/* Stats */}
      {transcription && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{wordCount} words</span>
          <span className={cn(
            isNearLimit && "text-destructive font-medium"
          )}>
            {charCount} / {maxLength} characters
          </span>
        </div>
      )}
    </Card>
  );
}