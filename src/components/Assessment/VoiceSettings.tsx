import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Volume2, Mic, Zap } from 'lucide-react';

interface VoiceSettingsProps {
  settings: {
    alexVoiceEnabled: boolean;
    speakingSpeed: number;
    autoAdvance: boolean;
    showTranscriptionWhileRecording: boolean;
  };
  onSettingsChange: (settings: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceSettings({
  settings,
  onSettingsChange,
  isOpen,
  onClose
}: VoiceSettingsProps) {
  if (!isOpen) return null;

  const updateSetting = (key: string, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={20} />
            <h3 className="text-lg font-semibold">Voice Settings</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="space-y-4">
          {/* Alex's Voice */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 size={16} />
              <Label htmlFor="alex-voice">Alex's Voice</Label>
            </div>
            <Switch
              id="alex-voice"
              checked={settings.alexVoiceEnabled}
              onCheckedChange={(checked) => updateSetting('alexVoiceEnabled', checked)}
            />
          </div>

          <Separator />

          {/* Speaking Speed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap size={16} />
              <Label>Speaking Speed</Label>
            </div>
            <Slider
              value={[settings.speakingSpeed]}
              onValueChange={([value]) => updateSetting('speakingSpeed', value)}
              min={0.5}
              max={1.5}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground text-center">
              {settings.speakingSpeed}× speed
            </div>
          </div>

          <Separator />

          {/* Auto-advance */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-advance">Auto-advance Questions</Label>
              <p className="text-xs text-muted-foreground">
                Automatically go to next question after saving
              </p>
            </div>
            <Switch
              id="auto-advance"
              checked={settings.autoAdvance}
              onCheckedChange={(checked) => updateSetting('autoAdvance', checked)}
            />
          </div>

          <Separator />

          {/* Show Transcription */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mic size={16} />
                <Label htmlFor="show-transcription">Live Transcription</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Show text while recording
              </p>
            </div>
            <Switch
              id="show-transcription"
              checked={settings.showTranscriptionWhileRecording}
              onCheckedChange={(checked) => updateSetting('showTranscriptionWhileRecording', checked)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
}