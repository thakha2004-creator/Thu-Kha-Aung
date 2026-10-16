import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Play,
  RotateCw,
  Sparkles,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { DialogueTurn } from '../types';
import { MYANMAR_VOICES } from '../constants/voices';

interface DialogueStudioProps {
  onPlayAudio: (
    audioBase64: string,
    voiceName: string,
    snippet: string,
    isLongForm?: boolean
  ) => void;
  lang?: 'my' | 'en';
}

const DEFAULT_DIALOGUE: DialogueTurn[] = [
  {
    id: '1',
    speaker: 'ဦးဘ',
    voice: 'Charon',
    text: 'မင်္ဂလာပါ သီရိရေ။ ဒီကနေ့ မြန်မာ့ရိုးရာ ယဉ်ကျေးမှု သဘင်အကြောင်းလေးကို ဆွေးနွေးကြရအောင်လား။',
    style: 'Calm and wise Myanmar elder tone',
  },
  {
    id: '2',
    speaker: 'သီရိ',
    voice: 'Kore',
    text: 'ဟုတ်ကဲ့ပါ ဆရာကြီးရှင့်။ ကျွန်မတို့ မြန်မာ့သဘင်ဟာ ရှေးယခင် ပုဂံခေတ်ကတည်းက စတင်ထွန်းကားခဲ့တာ ဖြစ်ပါတယ်နော်။',
    style: 'Warm, respectful, and clear Myanmar female tone',
  },
  {
    id: '3',
    speaker: 'ဦးဘ',
    voice: 'Charon',
    text: 'မှန်တာပေါ့ကွယ်။ ဇာတ်သဘင်၊ အငြိမ့်နှင့် ရုပ်သေးပညာရပ်တွေဟာ အလွန်တန်ဖိုးရှိတဲ့ အနုပညာ အမွေအနှစ်တွေပဲ ဖြစ်ပါတယ်။',
    style: 'Proud and articulate Myanmar elder voice',
  },
];

export const DialogueStudio: React.FC<DialogueStudioProps> = ({
  onPlayAudio,
  lang = 'my',
}) => {
  const [turns, setTurns] = useState<DialogueTurn[]>(DEFAULT_DIALOGUE);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available speakers
  const speakerOptions = [
    { name: 'သီရိ', voice: 'Kore' as const, label: 'သီရိ (အမျိုးသမီး)' },
    { name: 'မင်းသန့်', voice: 'Fenrir' as const, label: 'မင်းသန့် (အမျိုးသား)' },
    { name: 'နန်းခင်', voice: 'Zephyr' as const, label: 'နန်းခင် (အမျိုးသမီး)' },
    { name: 'ကျော်ဇင်', voice: 'Puck' as const, label: 'ကျော်ဇင် (အမျိုးသား)' },
    { name: 'ဦးဘ', voice: 'Charon' as const, label: 'ဦးဘ (အဘိုး/ဆရာ)' },
  ];

  const handleAddTurn = () => {
    const lastTurn = turns[turns.length - 1];
    // Alternate speaker if possible
    const otherSpeaker =
      lastTurn?.speaker === 'ဦးဘ'
        ? { name: 'သီရိ', voice: 'Kore' as const }
        : { name: 'ဦးဘ', voice: 'Charon' as const };

    const newTurn: DialogueTurn = {
      id: Date.now().toString(),
      speaker: otherSpeaker.name,
      voice: otherSpeaker.voice,
      text: '',
      style: 'Natural Myanmar conversational speech',
    };
    setTurns([...turns, newTurn]);
  };

  const handleRemoveTurn = (id: string) => {
    if (turns.length <= 2) {
      setErrorMsg(
        lang === 'my'
          ? 'စကားဝိုင်းတွင် အနည်းဆုံး အပြန်အလှန် စကားပြောသူ ၂ ဦး လိုအပ်ပါသည်'
          : 'Dialogue requires at least 2 speech turns'
      );
      return;
    }
    setTurns(turns.filter((t) => t.id !== id));
  };

  const handleUpdateTurn = (id: string, updates: Partial<DialogueTurn>) => {
    setTurns(
      turns.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleGenerateDialogue = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    // Validate that we have at least 2 unique speakers
    const uniqueSpeakers = Array.from(new Set(turns.map((t) => t.speaker)));
    if (uniqueSpeakers.length !== 2) {
      setErrorMsg(
        lang === 'my'
          ? 'စကားဝိုင်း ဖန်တီးရာတွင် အတိအကျ စကားပြောသူ ၂ ဦး (Speaker 1 & Speaker 2) ဖြစ်ရပါမည်။ ကျေးဇူးပြု၍ စကားပြောသူ ၂ ဦးသာ သတ်မှတ်ပေးပါ။'
          : 'Gemini dual-speaker requires exactly 2 distinct speakers in the dialogue.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turns }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Dialogue synthesis failed');
      }

      const snippet = `${uniqueSpeakers[0]} နှင့် ${uniqueSpeakers[1]} စကားဝိုင်း (${turns.length} ကြိမ်)`;
      onPlayAudio(data.audioBase64, 'Dual Voice AI', snippet);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to synthesize dialogue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Explainer */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-slate-900 border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{lang === 'my' ? 'မြန်မာ အသံစုံ စကားဝိုင်း / ဇာတ်လမ်းစနစ်' : 'Myanmar Dual-Speaker Dialogue Studio'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Gemini 3.8 Flash TTS
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'my'
                ? 'စကားပြောသူ ၂ ဦး အပြန်အလှန် ဆွေးနွေးပြောဆိုသည့် ပေါ့ဒ်ကတ်စ်၊ အင်တာဗျူး သို့မဟုတ် ဇာတ်လမ်းတွဲများကို တစ်ဆက်တည်း ဖန်တီးပါ'
                : 'Create dual-speaker podcasts, conversations, and interviews with natural backchanneling and realistic interaction'}
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateDialogue}
          disabled={isLoading}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin text-white" />
              <span>{lang === 'my' ? 'စကားဝိုင်း ဖန်တီးနေဆဲ...' : 'Synthesizing...'}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>{lang === 'my' ? 'စကားဝိုင်း တစ်ခုလုံး ဖွင့်မည်' : 'Generate Full Dialogue'}</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Turns list */}
      <div className="space-y-3">
        {turns.map((turn, index) => {
          return (
            <div
              key={turn.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                    Turn #{index + 1}
                  </span>

                  {/* Speaker selector */}
                  <select
                    value={turn.speaker}
                    onChange={(e) => {
                      const sel = speakerOptions.find((o) => o.name === e.target.value);
                      handleUpdateTurn(turn.id, {
                        speaker: e.target.value,
                        voice: sel ? sel.voice : 'Kore',
                      });
                    }}
                    className="bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400 rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500"
                  >
                    {speakerOptions.map((opt) => (
                      <option key={opt.name} value={opt.name}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleRemoveTurn(turn.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Remove turn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Text input */}
              <textarea
                value={turn.text}
                onChange={(e) => handleUpdateTurn(turn.id, { text: e.target.value })}
                rows={2}
                placeholder={lang === 'my' ? 'ဤသူ ပြောမည့် မြန်မာစကားကို ရိုက်ထည့်ပါ...' : 'Type line in Myanmar script...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-myanmar resize-none"
              />
            </div>
          );
        })}
      </div>

      {/* Add turn button */}
      <button
        type="button"
        onClick={handleAddTurn}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/40 text-slate-400 hover:text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
      >
        <Plus className="w-4 h-4" />
        <span>{lang === 'my' ? 'နောက်ထပ် စကားပြောတစ်လှည့် ထပ်ထည့်ရန်' : 'Add Speech Turn'}</span>
      </button>
    </div>
  );
};
