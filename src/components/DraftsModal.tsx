import React, { useState } from 'react';
import {
  Bookmark,
  X,
  Play,
  Trash2,
  Clock,
  ArrowRight,
  Search,
  FileEdit,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { DraftItem } from '../types';
import { MYANMAR_VOICES } from '../constants/voices';

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: DraftItem[];
  onResumeDraft: (draft: DraftItem) => void;
  onDeleteDraft: (id: string) => void;
  onClearAllDrafts: () => void;
  lang?: 'my' | 'en';
}

export const DraftsModal: React.FC<DraftsModalProps> = ({
  isOpen,
  onClose,
  drafts,
  onResumeDraft,
  onDeleteDraft,
  onClearAllDrafts,
  lang = 'my',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredDrafts = searchQuery
    ? drafts.filter(
        (d) =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : drafts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{lang === 'my' ? 'သိမ်းဆည်းထားသော မူကြမ်းများ' : 'Saved Drafts'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {drafts.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'my'
                  ? 'ယခင်က သိမ်းဆည်းခဲ့သော စာသားများနှင့် အသံဆက်တင်များကို ပြန်လည်ရွေးချယ် ဆက်လက်လုပ်ဆောင်ပါ'
                  : 'Resume previously saved scripts and voice settings in localStorage'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {drafts.length > 0 && (
              <button
                onClick={onClearAllDrafts}
                className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
              >
                {lang === 'my' ? 'မူကြမ်းအားလုံးဖျက်' : 'Clear All'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {drafts.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={lang === 'my' ? 'မူကြမ်းများထဲမှ ရှာဖွေရန်...' : 'Search in drafts...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {/* Drafts List */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 min-h-[220px]">
          {drafts.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs space-y-2">
              <Bookmark className="w-10 h-10 stroke-1 text-slate-600 mb-1" />
              <p className="font-semibold text-slate-400">
                {lang === 'my' ? 'သိမ်းဆည်းထားသော မူကြမ်း မရှိသေးပါ' : 'No saved drafts yet'}
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                {lang === 'my'
                  ? 'စတူဒီယိုတွင် စာရေးနေစဉ် "မူကြမ်းသိမ်းမည် (Save as Draft)" ခလုတ်ကို နှိပ်၍ အချိန်မရွေး သိမ်းဆည်းထားနိုင်ပါသည်'
                  : 'Click "Save as Draft" in the studio anytime to save your progress'}
              </p>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {lang === 'my' ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော မူကြမ်း မတွေ့ပါ' : 'No matching drafts found'}
            </div>
          ) : (
            filteredDrafts.map((draft) => {
              const voiceProfile = MYANMAR_VOICES.find((v) => v.geminiVoice === draft.voice);
              const voiceLabel =
                lang === 'my'
                  ? voiceProfile?.nameBurmese || draft.voice
                  : voiceProfile?.nameEnglish || draft.voice;

              return (
                <div
                  key={draft.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 shadow-md space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-200 truncate max-w-xs font-myanmar">
                          {draft.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                          {voiceLabel}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {draft.speed}x
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {new Date(draft.timestamp).toLocaleDateString()} at{' '}
                        {new Date(draft.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Resume Draft Button */}
                      <button
                        onClick={() => onResumeDraft(draft)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition active:scale-95"
                        title={lang === 'my' ? 'ဤမူကြမ်းကို စတူဒီယိုသို့ ပြန်ခေါ်မည်' : 'Resume this draft'}
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>{lang === 'my' ? 'ပြန်ဖွင့်မည်' : 'Resume'}</span>
                      </button>

                      {/* Delete Draft Button */}
                      <button
                        onClick={() => onDeleteDraft(draft.id)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title={lang === 'my' ? 'ဖျက်ရန်' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Text snippet preview */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-myanmar bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    {draft.text}
                  </p>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>
                      {draft.charCount} {lang === 'my' ? 'လုံး' : 'chars'}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-xs">
                      {draft.style}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
