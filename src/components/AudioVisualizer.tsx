import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  colorTheme?: 'amber' | 'emerald' | 'blue';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  colorTheme = 'amber',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 42;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / barCount) * 0.65;
      const gap = (width - barWidth * barCount) / (barCount - 1);

      // Create gradient based on theme
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      if (colorTheme === 'emerald') {
        gradient.addColorStop(0, '#059669');
        gradient.addColorStop(1, '#34d399');
      } else if (colorTheme === 'blue') {
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(1, '#60a5fa');
      } else {
        gradient.addColorStop(0, '#d97706');
        gradient.addColorStop(0.5, '#f59e0b');
        gradient.addColorStop(1, '#fbbf24');
      }

      ctx.fillStyle = gradient;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;
        if (isPlaying) {
          // Dynamic simulated frequency waves
          const wave1 = Math.sin(phase + i * 0.28) * 0.5 + 0.5;
          const wave2 = Math.cos(phase * 1.5 + i * 0.45) * 0.5 + 0.5;
          const centerBias = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
          barHeight = 6 + (wave1 * 0.6 + wave2 * 0.4) * (height - 10) * (0.4 + centerBias * 0.6);
        } else {
          // Gentle resting waveform
          const restingWave = Math.sin((i / barCount) * Math.PI);
          barHeight = 4 + restingWave * 12;
        }

        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        // Rounded bar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.08;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, colorTheme]);

  return (
    <div className="relative w-full h-12 bg-slate-900/80 rounded-xl px-3 py-1 flex items-center justify-center border border-slate-800 shadow-inner overflow-hidden">
      <canvas
        ref={canvasRef}
        width={360}
        height={44}
        className="w-full h-full block"
      />
      {isPlaying && (
        <span className="absolute right-3 top-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      )}
    </div>
  );
};
