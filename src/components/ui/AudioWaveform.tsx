import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioLevel: number;
  isActive: boolean;
  barCount?: number;
  className?: string;
}

export function AudioWaveform({ 
  audioLevel, 
  isActive, 
  barCount = 5, 
  className 
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;
      const maxHeight = canvas.height * 0.8;

      for (let i = 0; i < barCount; i++) {
        // Create different heights for each bar with some randomness
        const baseHeight = isActive ? audioLevel * maxHeight : maxHeight * 0.1;
        const variation = Math.sin(Date.now() * 0.01 + i) * 0.3;
        const height = Math.max(2, baseHeight + (baseHeight * variation));

        const x = i * barWidth + barWidth * 0.25;
        const y = (canvas.height - height) / 2;
        const width = barWidth * 0.5;

        // Set color based on activity
        ctx.fillStyle = isActive 
          ? `hsl(9, 100%, 70%)` // Accent color
          : `hsl(215, 16%, 47%)`; // Muted color

        // Add gradient for active state
        if (isActive && audioLevel > 0.1) {
          const gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, 'hsl(9, 100%, 70%)');
          gradient.addColorStop(1, 'hsl(199, 89%, 48%)');
          ctx.fillStyle = gradient;
        }

        ctx.fillRect(x, y, width, height);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isActive, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={40}
      className={cn('w-full h-10', className)}
      aria-hidden="true"
    />
  );
}