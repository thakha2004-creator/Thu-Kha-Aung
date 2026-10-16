import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  FastForward,
  Rewind,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

interface AudioPlayerBarProps {
  audioBase64: string | null;
  mimeType?: string;
  voiceName?: string;
  textSnippet?: string;
  isLongForm?: boolean;
  totalChunks?: number;
  onClear?: () => void;
  lang?: 'my' | 'en';
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  audioBase64,
  mimeType = 'audio/wav',
  voiceName = 'ရွှေသံစဉ် AI',
  textSnippet = '',
  isLongForm = false,
  totalChunks = 1,
  lang = 'my',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Setup audio source whenever audioBase64 changes
  useEffect(() => {
    if (!audioBase64) {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    try {
      const binaryString = atob(audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const newUrl = URL.createObjectURL(blob);
      setAudioUrl(newUrl);

      // Reset state for new audio
      setIsPlaying(false);
      setCurrentTime(0);

      return () => {
        URL.revokeObjectURL(newUrl);
      };
    } catch (err) {
      console.error('Error creating audio blob:', err);
    }
  }, [audioBase64, mimeType]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error('Audio play error:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      audioRef.current.playbackRate = playbackRate;
      // Auto-play when ready
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay policy prevented, keep paused
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const downloadWav = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.download = `ShweVoice_Myanmar_TTS_${dateStr}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!audioBase64 || !audioUrl) {
    return null;
  }

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-amber-500/30 shadow-2xl transition-all duration-300">
      <audio
        ref={audioRef}
        src={audioUrl}
        loop={isLoop}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Left: Voice Info & Snippet */}
          <div className="md:col-span-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 text-sm truncate">
                  {voiceName}
                </span>
                {isLongForm && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {lang === 'my' ? `ရှည်လျားစာသား (${totalChunks} ပိုင်း)` : `Long Form (${totalChunks})`}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5" title={textSnippet}>
                {textSnippet || (lang === 'my' ? 'မြန်မာ အသံထွက် ပြီးပြည့်စုံပါပြီ' : 'Generated Myanmar Speech')}
              </p>
            </div>
          </div>

          {/* Center: Controls, Scrubber & Visualizer */}
          <div className="md:col-span-5 flex flex-col items-center gap-1.5">
            {/* Visualizer & Scrubber in single compact column */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="relative flex-1 group py-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.05"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:h-2 transition-all"
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => skipSeconds(-5)}
                className="p-1.5 text-slate-400 hover:text-amber-400 transition"
                title={lang === 'my' ? '၅ စက္ကန့် နောက်သို့' : 'Rewind 5s'}
              >
                <Rewind className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/30 transition transform hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
              </button>

              <button
                onClick={() => skipSeconds(5)}
                className="p-1.5 text-slate-400 hover:text-amber-400 transition"
                title={lang === 'my' ? '၅ စက္ကန့် ရှေ့သို့' : 'Forward 5s'}
              >
                <FastForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    setCurrentTime(0);
                    if (!isPlaying) togglePlay();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-slate-200 transition"
                title={lang === 'my' ? 'အစမှ ပြန်ဖွင့်' : 'Replay'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsLoop(!isLoop)}
                className={`p-1.5 rounded transition ${
                  isLoop ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={lang === 'my' ? 'ထပ်ခါထပ်ခါ ဖွင့်ရန်' : 'Loop'}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Waveform, Speed, Volume & Download */}
          <div className="md:col-span-3 flex items-center justify-end gap-3">
            {/* Mini Waveform Display */}
            <div className="hidden lg:block w-32">
              <AudioVisualizer isPlaying={isPlaying} colorTheme="amber" />
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
              {speedOptions.map((rate) => (
                <button
                  key={rate}
                  onClick={() => changeRate(rate)}
                  className={`text-[11px] px-1.5 py-0.5 rounded font-medium transition ${
                    playbackRate === rate
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Volume */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-slate-200"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Download WAV button */}
            <button
              onClick={downloadWav}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-amber-500/20 transition active:scale-95 shrink-0"
              title={lang === 'my' ? 'WAV အသံဖိုင် ဒေါင်းလုဒ်ရယူရန်' : 'Download WAV Audio'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'ဒေါင်းလုဒ်' : 'Export'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
