import React, { useState } from 'react';
import {
  History,
  X,
  Play,
  Download,
  Trash2,
  Clock,
  Sparkles,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { AudioHistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AudioHistoryItem[];
  onPlayItem: (item: AudioHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  lang?: 'my' | 'en';
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onPlayItem,
  onClearHistory,
  onDeleteItem,
  lang = 'my',
}) => {
  const [activeShareItemId, setActiveShareItemId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const getShareUrl = (item: AudioHistoryItem) => {
    const origin = window.location.origin;
    const params = new URLSearchParams();
    params.set('text', item.text);
    if (item.voiceGemini) {
      params.set('voice', item.voiceGemini);
    }
    return `${origin}/?${params.toString()}`;
  };

  const handleCopyLink = async (item: AudioHistoryItem) => {
    const url = getShareUrl(item);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyText = async (item: AudioHistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = item.text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleNativeShare = async (item: AudioHistoryItem) => {
    const url = getShareUrl(item);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ShweVoice AI - ${item.voiceName}`,
          text: item.text,
          url,
        });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink(item);
    }
  };

  const downloadWav = (item: AudioHistoryItem) => {
    if (!item.audioBase64) return;
    try {
      const binaryString = atob(item.audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ShweVoice_${item.voiceGemini || 'Voice'}_${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Social sharing handlers
  const shareToFacebook = (item: AudioHistoryItem) => {
    const url = getShareUrl(item);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(item.text.slice(0, 150))}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  const shareToTwitter = (item: AudioHistoryItem) => {
    const url = getShareUrl(item);
    const textSnippet = item.text.slice(0, 140) + '... (ရွှေသံစဉ် AI)';
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textSnippet)}&url=${encodeURIComponent(url)}`;
    window.open(twUrl, '_blank', 'noopener,noreferrer');
  };

  const shareToTelegram = (item: AudioHistoryItem) => {
    const url = getShareUrl(item);
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(item.text.slice(0, 160))}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const shareToWhatsApp = (item: AudioHistoryItem) => {
    const url = getShareUrl(item);
    const msg = `${item.text.slice(0, 160)}\n\nနားဆင်ရန်: ${url}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl p-5 space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {lang === 'my' ? 'ဖန်တီးထားသော အသံဖိုင်မှတ်တမ်း' : 'Audio History'}
              </h3>
              <span className="text-[11px] text-slate-400">
                {history.length} {lang === 'my' ? 'ခု သိမ်းဆည်းထားပါသည်' : 'clips saved'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-slate-800 transition"
              >
                {lang === 'my' ? 'အားလုံးဖျက်' : 'Clear All'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
              <History className="w-8 h-8 mb-2 stroke-1" />
              <p>{lang === 'my' ? 'ဖန်တီးထားသော အသံဖိုင် မရှိသေးပါ' : 'No generated audio yet'}</p>
            </div>
          ) : (
            history.map((item) => {
              const isSharing = activeShareItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3 group"
                >
                  {/* Top info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">
                        {item.voiceName}
                      </span>
                      {item.isLongForm && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          Long Form
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Text snippet */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-myanmar selection:bg-amber-500/30">
                    {item.text}
                  </p>

                  {/* Action Bar */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-900">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {item.durationSec}s
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Play Button */}
                      <button
                        onClick={() => onPlayItem(item)}
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 transition"
                        title={lang === 'my' ? 'ပြန်လည်နားဆင်ရန်' : 'Play audio'}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Download WAV */}
                      <button
                        onClick={() => downloadWav(item)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition"
                        title={lang === 'my' ? 'WAV ဖိုင် ဒေါင်းလုဒ်' : 'Download WAV'}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Share Button (Toggle Panel) */}
                      <button
                        onClick={() => setActiveShareItemId(isSharing ? null : item.id)}
                        className={`p-1.5 rounded-lg transition ${
                          isSharing
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300'
                        }`}
                        title={lang === 'my' ? 'လင့်ခ်နှင့် ဆိုရှယ်မီဒီယာသို့ မျှဝေရန်' : 'Share audio & text'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title={lang === 'my' ? 'ဖျက်ရန်' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Share Panel */}
                  {isSharing && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow-inner space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{lang === 'my' ? 'အသံနှင့် စာသား မျှဝေရန်' : 'Share Audio & Text'}</span>
                        </span>
                        <button
                          onClick={() => setActiveShareItemId(null)}
                          className="text-slate-500 hover:text-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Copy Link & Copy Text buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleCopyLink(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">{lang === 'my' ? 'လင့်ခ် ကူးပြီး' : 'Copied!'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-400" />
                              <span>{lang === 'my' ? 'လင့်ခ် ကူးယူရန်' : 'Copy Link'}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCopyText(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition"
                        >
                          {copiedText ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">{lang === 'my' ? 'စာသား ကူးပြီး' : 'Copied!'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-blue-400" />
                              <span>{lang === 'my' ? 'စာသား ကူးယူရန်' : 'Copy Text'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Social Share Buttons */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {lang === 'my' ? 'ဆိုရှယ်မီဒီယာသို့ ချက်ချင်းမျှဝေရန်:' : 'Share to Social Platforms:'}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Facebook */}
                          <button
                            onClick={() => shareToFacebook(item)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                            title="Share on Facebook"
                          >
                            <span>Facebook</span>
                          </button>

                          {/* Twitter / X */}
                          <button
                            onClick={() => shareToTwitter(item)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                            title="Share on X"
                          >
                            <span>X / Twitter</span>
                          </button>

                          {/* Telegram */}
                          <button
                            onClick={() => shareToTelegram(item)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 border border-sky-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                            title="Share on Telegram"
                          >
                            <Send className="w-3 h-3" />
                            <span>Telegram</span>
                          </button>

                          {/* WhatsApp */}
                          <button
                            onClick={() => shareToWhatsApp(item)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>

                      {/* Native System Share if supported */}
                      {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <button
                          onClick={() => handleNativeShare(item)}
                          className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>{lang === 'my' ? 'ဖုန်းစနစ်တွင်း မျှဝေမည် (System Share)' : 'System Share Sheet'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
