import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  X,
  Volume2,
  CheckCircle2,
  RotateCw,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { PronunciationAnalysis } from '../types';
import { expandMyanmarNumbers, segmentMyanmarSyllables } from '../utils/myanmarUtils';

interface PronunciationHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onApplyEnhancedText: (enhanced: string) => void;
  lang?: 'my' | 'en';
}

export const PronunciationHelperModal: React.FC<PronunciationHelperModalProps> = ({
  isOpen,
  onClose,
  initialText,
  onApplyEnhancedText,
  lang = 'my',
}) => {
  const [text, setText] = useState(initialText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PronunciationAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/analyze-pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Pronunciation analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const syllables = segmentMyanmarSyllables(text);
  const numbersExpanded = expandMyanmarNumbers(text);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {lang === 'my'
                  ? 'အသံပီသမှုနှင့် အသံထွက် လေ့လာရေး (Pronunciation Guide)'
                  : 'Myanmar Pronunciation & Phonetics Guide'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'my'
                  ? 'မြန်မာ အသံထွက် သံပြင်း/သံပျော့၊ သတ်သံများနှင့် ဂဏန်းစာလုံး အသံထွက်များကို စစ်ဆေးပါ'
                  : 'Inspect Burmese phonetics, syllable boundaries, and numeral word expansions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Input to analyze */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            {lang === 'my' ? 'စစ်ဆေးလိုသော မြန်မာစာသား:' : 'Myanmar Text to Analyze:'}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 font-myanmar focus:outline-none focus:border-amber-500 resize-none"
            placeholder="ဥပမာ- မင်္ဂလာပါ၊ ၁၅,၀၀၀ ကျပ်..."
          />
        </div>

        {/* Quick Tools buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{lang === 'my' ? 'AI ဖြင့် အသံထွက် သရုပ်ခွဲစစ်ဆေးမည်' : 'AI Phonetic Analysis'}</span>
          </button>

          <button
            onClick={() => {
              const expanded = expandMyanmarNumbers(text);
              setText(expanded);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            title="ဂဏန်းများကို စကားလုံးအဖြစ် အသံထွက်ပြောင်းရန်"
          >
            <Hash className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'my' ? 'ဂဏန်းများကို စာလုံးပြောင်း' : 'Numbers to Spoken Words'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Syllables Breakdown Preview */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              {lang === 'my' ? 'ဝဏ္ဏ အက္ခရာ ပုဒ်ဖြတ်ခြင်း (Syllable Breakdown):' : 'Syllable Segmentation:'}
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {syllables.length} {lang === 'my' ? 'ဝဏ္ဏ' : 'syllables'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1">
            {syllables.map((syl, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700 font-myanmar"
              >
                {syl}
              </span>
            ))}
          </div>
        </div>

        {/* AI Analysis Result */}
        {analysis && (
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block mb-1">
                {lang === 'my' ? 'ကာရာအိုကေ အသံထွက် (Romanized IPA Phonetics)' : 'Romanized Phonetics Guide'}
              </span>
              <p className="text-sm font-mono text-amber-200 bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/20">
                {analysis.phoneticGuide}
              </p>
            </div>

            {analysis.pronunciationNotes && analysis.pronunciationNotes.length > 0 && (
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  {lang === 'my' ? 'အသံပီသမှု အကြံပြုချက်များ' : 'Pronunciation Clarity Notes'}
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {analysis.pronunciationNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.enhancedSpokenForm && analysis.enhancedSpokenForm !== text && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  <span className="text-slate-200 font-semibold">{lang === 'my' ? 'အသံထွက် ပိုမိုပီသစေမည့် စာသား:' : 'Optimized text:'}</span>{' '}
                  <span className="text-amber-300 font-myanmar">{analysis.enhancedSpokenForm}</span>
                </div>
                <button
                  onClick={() => {
                    if (analysis.enhancedSpokenForm) {
                      onApplyEnhancedText(analysis.enhancedSpokenForm);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shrink-0"
                >
                  {lang === 'my' ? 'ဤစာသားကို အသုံးပြုမည်' : 'Apply to Studio'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
