import React from 'react';
import { Volume2, Check, Sparkles } from 'lucide-react';
import { MYANMAR_VOICES } from '../constants/voices';
import { VoiceProfile } from '../types';

interface VoiceSelectorProps {
  selectedVoice: 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon';
  onSelectVoice: (voice: 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon') => void;
  onPreviewVoice: (voice: VoiceProfile) => void;
  previewingVoiceId?: string | null;
  lang?: 'my' | 'en';
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  onPreviewVoice,
  previewingVoiceId,
  lang = 'my',
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'my' ? 'မြန်မာ အသံရှင် ရွေးချယ်မှု' : 'Myanmar Voice Persona'}</span>
        </label>
        <span className="text-[11px] text-amber-400/90 font-medium">
          {lang === 'my' ? 'အသံပီသမှု အထူးစနစ် (Standard Yangon Spoken)' : 'Articulate Native Standard'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {MYANMAR_VOICES.map((voice) => {
          const isSelected = selectedVoice === voice.geminiVoice;
          const isAuditioning = previewingVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice.geminiVoice)}
              className={`relative p-3.5 rounded-2xl cursor-pointer border transition-all duration-200 flex flex-col justify-between group ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 border-amber-500/60 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              {/* Badge if available */}
              {voice.badge && (
                <span className="absolute -top-2 right-3 text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-slate-950 shadow-md">
                  {voice.badge}
                </span>
              )}

              {/* Avatar & Header */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${voice.avatarColor} flex items-center justify-center text-white shadow-md font-bold text-sm shrink-0`}
                >
                  {voice.nameEnglish.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-100 truncate">
                      {lang === 'my' ? voice.nameBurmese : voice.nameEnglish}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {voice.gender === 'female'
                      ? lang === 'my' ? 'အမျိုးသမီးသံ' : 'Female'
                      : lang === 'my' ? 'အမျိုးသားသံ' : 'Male'}
                    {' • '}
                    <span className="text-amber-400/80 font-mono">{voice.geminiVoice}</span>
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                {lang === 'my' ? voice.descriptionBurmese : voice.descriptionEnglish}
              </p>

              {/* Tags & Audition Preview */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
                <div className="flex flex-wrap gap-1">
                  {voice.recommendedTags.slice(0, 1).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewVoice(voice);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition ${
                    isAuditioning
                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                      : 'bg-slate-800 hover:bg-amber-500/20 text-amber-300 border border-slate-700'
                  }`}
                  title={lang === 'my' ? 'အသံစမ်းသပ်နားဆင်ရန်' : 'Audition voice sample'}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{lang === 'my' ? 'စမ်းရန်' : 'Test'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
