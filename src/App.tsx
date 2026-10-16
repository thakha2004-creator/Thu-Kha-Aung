import React, { useState, useEffect } from 'react';
import {
  Mic2,
  FileText,
  Users,
  BookOpen,
  Sparkles,
  Play,
  RotateCw,
  Copy,
  Trash2,
  AlertTriangle,
  History,
  Layers,
  Sliders,
  Volume2,
  Radio,
  Zap,
  Globe,
  CheckCircle2,
  Hash,
  Download,
  Info,
  Bookmark,
  BookmarkCheck,
  Check,
} from 'lucide-react';
import { MYANMAR_VOICES, STYLE_PRESETS } from './constants/voices';
import { SAMPLE_TEXTS } from './constants/samples';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { VoiceSelector } from './components/VoiceSelector';
import { TxtToSpeechStudio } from './components/TxtToSpeechStudio';
import { DialogueStudio } from './components/DialogueStudio';
import { PronunciationHelperModal } from './components/PronunciationHelperModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { DraftsModal } from './components/DraftsModal';
import { WebsiteSections } from './components/WebsiteSections';
import { AdBanner } from './components/AdBanner';
import { AudioHistoryItem, VoiceProfile, DraftItem } from './types';
import {
  detectEncoding,
  convertZawgyiToUnicode,
} from './utils/zawgyiConverter';
import {
  normalizeForClearPronunciation,
  expandMyanmarNumbers,
  chunkMyanmarText,
} from './utils/myanmarUtils';

export default function App() {
  // App state
  const [activeTab, setActiveTab] = useState<'studio' | 'txt' | 'dialogue' | 'samples'>('studio');
  const [lang, setLang] = useState<'my' | 'en'>('my');

  // TTS Input state
  const [text, setText] = useState<string>(
    'မင်္ဂလာပါခင်ဗျာ။ ရွှေသံစဉ် AI မြန်မာစာဖတ်စနစ်မှ နွေးထွေးစွာ ကြိုဆိုပါတယ်။ စာလုံးရေ အကန့်အသတ်မရှိဘဲ သဘာဝကျပြီး အသံထွက် ပီသကြည်လင်စွာ ဖတ်ကြားပေးနိုင်ပါသည်။'
  );
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon'>('Kore');
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_PRESETS[0].prompt);
  const [speed, setSpeed] = useState<number>(1.0);
  const [modelType, setModelType] = useState<'flash-lite' | 'flash'>('flash-lite');
  const [isArticulate, setIsArticulate] = useState<boolean>(true);

  // Audio Playback state
  const [currentAudioBase64, setCurrentAudioBase64] = useState<string | null>(null);
  const [currentVoiceName, setCurrentVoiceName] = useState<string>('သီရိ (Kore)');
  const [currentSnippet, setCurrentSnippet] = useState<string>('');
  const [isLongFormActive, setIsLongFormActive] = useState<boolean>(false);
  const [totalChunksActive, setTotalChunksActive] = useState<number>(1);

  // Processing state
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  // Modals state
  const [isPronunciationModalOpen, setIsPronunciationModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // History state
  const [history, setHistory] = useState<AudioHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('shwevoice_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('shwevoice_history', JSON.stringify(history.slice(0, 20)));
    } catch {
      // storage quota
    }
  }, [history]);

  // Drafts state (stored in localStorage key 'shwevoice_drafts')
  const [drafts, setDrafts] = useState<DraftItem[]>(() => {
    try {
      const saved = localStorage.getItem('shwevoice_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('shwevoice_drafts', JSON.stringify(drafts));
    } catch (e) {
      console.error('Error saving drafts to localStorage:', e);
    }
  }, [drafts]);

  const handleSaveDraft = () => {
    if (!text.trim()) {
      setErrorMsg(
        lang === 'my'
          ? 'သိမ်းဆည်းရန် စာသား ရိုက်ထည့်ထားခြင်း မရှိသေးပါ'
          : 'Please enter some text before saving as a draft'
      );
      return;
    }

    const firstLine = text.trim().split('\n')[0].trim();
    const title =
      firstLine.slice(0, 45) + (firstLine.length > 45 ? '...' : '') || 'Untitled Draft';

    const newDraft: DraftItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      title,
      text,
      voice: selectedVoice,
      style: selectedStyle,
      speed,
      modelType,
      isArticulate,
      charCount: text.length,
    };

    setDrafts((prev) => [newDraft, ...prev.filter((d) => d.text !== text)]);
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2500);
  };

  const handleResumeDraft = (draft: DraftItem) => {
    setText(draft.text);
    setSelectedVoice(draft.voice);
    if (draft.style) setSelectedStyle(draft.style);
    if (draft.speed) setSpeed(draft.speed);
    if (draft.modelType) setModelType(draft.modelType);
    if (draft.isArticulate !== undefined) setIsArticulate(draft.isArticulate);
    setIsDraftsModalOpen(false);
    setActiveTab('studio');
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleClearAllDrafts = () => {
    setDrafts([]);
  };

  // Check for shared text or voice in URL parameters on mount
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const sharedText = searchParams.get('text');
      const sharedVoice = searchParams.get('voice');
      if (sharedText) {
        setText(sharedText);
        if (
          sharedVoice &&
          ['Kore', 'Fenrir', 'Puck', 'Zephyr', 'Charon'].includes(sharedVoice)
        ) {
          setSelectedVoice(sharedVoice as any);
        }
        setActiveTab('studio');
      }
    } catch (e) {
      console.error('Error parsing shared URL params:', e);
    }
  }, []);

  // Syllables and text stats
  const encoding = detectEncoding(text);
  const textStats = normalizeForClearPronunciation(text);
  const chunks = chunkMyanmarText(text, 280);
  const isMultiChunk = chunks.length > 1;

  // Handle single TTS generation
  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setErrorMsg(
        lang === 'my'
          ? 'ကျေးဇူးပြု၍ ဖတ်ကြားလိုသော မြန်မာစာသားကို ရိုက်ထည့်ပါ'
          : 'Please enter Myanmar text to synthesize'
      );
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      let finalText = text;
      // Auto convert Zawgyi if detected
      if (encoding === 'zawgyi') {
        finalText = convertZawgyiToUnicode(text);
      }

      const selectedVoiceProfile = MYANMAR_VOICES.find((v) => v.geminiVoice === selectedVoice);
      const voiceLabel =
        lang === 'my'
          ? selectedVoiceProfile?.nameBurmese || selectedVoice
          : selectedVoiceProfile?.nameEnglish || selectedVoice;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: finalText,
          voice: selectedVoice,
          style: selectedStyle,
          speed,
          modelType,
          articulate: isArticulate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate speech');
      }

      const snippet = text.slice(0, 50) + (text.length > 50 ? '...' : '');
      setCurrentAudioBase64(data.audioBase64);
      setCurrentVoiceName(voiceLabel);
      setCurrentSnippet(snippet);
      setIsLongFormActive(data.isLongForm || false);
      setTotalChunksActive(data.totalChunks || 1);

      // Save to history
      const newHistoryItem: AudioHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        text: text.slice(0, 150),
        voiceName: voiceLabel,
        voiceGemini: selectedVoice,
        durationSec: textStats.estimatedSeconds,
        audioBase64: data.audioBase64,
        isLongForm: data.isLongForm,
        chunksCount: data.totalChunks,
      };
      setHistory((prev) => [newHistoryItem, ...prev]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Speech synthesis error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Audition voice preview
  const handlePreviewVoice = async (voice: VoiceProfile) => {
    setPreviewingVoiceId(voice.id);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voice.sampleAudioText,
          voice: voice.geminiVoice,
          style: 'Natural and fluent Myanmar introduction',
          speed: 1.0,
          articulate: true,
        }),
      });

      const data = await response.json();
      if (response.ok && data.audioBase64) {
        const voiceLabel = lang === 'my' ? voice.nameBurmese : voice.nameEnglish;
        setCurrentAudioBase64(data.audioBase64);
        setCurrentVoiceName(voiceLabel);
        setCurrentSnippet(voice.sampleAudioText);
        setIsLongFormActive(false);
        setTotalChunksActive(1);
      }
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setPreviewingVoiceId(null);
    }
  };

  // Convert Zawgyi to Unicode in text
  const handleConvertZawgyi = () => {
    const uni = convertZawgyiToUnicode(text);
    setText(uni);
  };

  // Expand numbers to words
  const handleExpandNumbers = () => {
    const expanded = expandMyanmarNumbers(text);
    setText(expanded);
  };

  // Insert Punctuation / Tone Tag
  const handleInsertTag = (tag: string) => {
    setText((prev) => prev + tag);
  };

  // Quick Load Sample
  const handleLoadSample = (sampleText: string, recommendedVoice: any) => {
    setText(sampleText);
    setSelectedVoice(recommendedVoice);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-28 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25">
              <Mic2 className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-100">
                  {lang === 'my' ? 'ရွှေသံစဉ် AI' : 'ShweVoice AI'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {lang === 'my'
                  ? 'မြန်မာ AI အသံဖတ် ဝက်ဘ်ဆိုက် • စာလုံးရေ အကန့်အသတ်မဲ့'
                  : 'Myanmar AI Text-to-Speech Platform • Unlimited Words'}
              </p>
            </div>
          </div>

          {/* Website Quick Jump Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
            <a
              href="#studio"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-amber-400 transition"
            >
              {lang === 'my' ? 'စတူဒီယို' : 'Studio'}
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-amber-400 transition"
            >
              {lang === 'my' ? 'အင်္ဂါရပ်များ' : 'Features'}
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-amber-400 transition"
            >
              {lang === 'my' ? 'အသုံးပြုပုံ' : 'How it Works'}
            </a>
            <a
              href="#use-cases"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('use-cases')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-amber-400 transition"
            >
              {lang === 'my' ? 'အသုံးချမှု' : 'Use Cases'}
            </a>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-amber-400 transition"
            >
              {lang === 'my' ? 'မေးခွန်းများ (FAQ)' : 'FAQ'}
            </a>
          </nav>

          {/* Right Tools & Language Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPronunciationModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-amber-300 flex items-center gap-1.5 transition"
              title={lang === 'my' ? 'အသံပီသမှုနှင့် အသံထွက်လမ်းညွှန်' : 'Phonetics & Pronunciation Guide'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {lang === 'my' ? 'အသံထွက် လမ်းညွှန်' : 'Pronunciation'}
              </span>
            </button>

            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 flex items-center gap-1.5 transition relative"
              title={lang === 'my' ? 'ဖန်တီးထားသော အသံဖိုင်မှတ်တမ်း' : 'Audio History'}
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{lang === 'my' ? 'မှတ်တမ်း' : 'History'}</span>
              {history.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </button>

            {/* Saved Drafts Button */}
            <button
              onClick={() => setIsDraftsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-amber-300 flex items-center gap-1.5 transition relative"
              title={lang === 'my' ? 'သိမ်းဆည်းထားသော မူကြမ်းများ' : 'Saved Drafts'}
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{lang === 'my' ? 'မူကြမ်း' : 'Drafts'}</span>
              {drafts.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  {drafts.length}
                </span>
              )}
            </button>

            {/* Download Project ZIP link */}
            <a
              href="/api/download-zip"
              download="shwevoice-myanmar-tts.zip"
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition shadow-sm"
              title={lang === 'my' ? 'ပရောဂျက် ZIP ဖိုင် ဒေါင်းလုဒ်ရယူရန်' : 'Download Project ZIP'}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ZIP {lang === 'my' ? 'ဒေါင်းလုဒ်' : 'Export'}</span>
            </a>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'my' ? 'en' : 'my')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-amber-400 flex items-center gap-1.5 transition"
              title="Toggle Language (မြန်မာ / English)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'my' ? 'EN' : 'မြန်မာ'}</span>
            </button>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-slate-800/60 py-1.5 custom-scrollbar">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'studio'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'အသံဖတ်စနစ် (Voice Studio)' : 'Voice Studio'}</span>
          </button>

          <button
            onClick={() => setActiveTab('txt')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'txt'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'TXT ဖိုင်မှ တိုက်ရိုက်ဖတ်ရန်' : 'TXT to Speak'}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
              New
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dialogue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'dialogue'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'စကားဝိုင်း / ဇာတ်လမ်း (Dialogue)' : 'Dual-Speaker Dialogue'}</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'samples'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'my' ? 'နမူနာ စာသားများ (Samples)' : 'Sample Library'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="studio" className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 flex-1 w-full space-y-8">
        {/* Google AdSense: Top Leaderboard Banner */}
        <AdBanner type="top-banner" lang={lang} />

        {/* TAB 1: Main Single Voice Studio */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Top Unlimited Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{lang === 'my' ? 'စာလုံးရေ အကန့်အသတ်မဲ့ မြန်မာအသံစနစ်' : 'Unlimited Myanmar TTS Studio'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                      Gemini 3.8 Audio
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'my'
                      ? 'ဝတ္ထု၊ သတင်း၊ စာတမ်း စသည့် စာသား အရှည်ကြီးများကိုလည်း အလိုအလျောက် ပေါင်းစပ်၍ အသံထွက် ပီသကြည်လင်စွာ ဖတ်ကြားပေးပါသည်'
                      : 'Synthesize long-form articles and novels seamlessly with authentic Myanmar standard pronunciation.'}
                  </p>
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'my' ? 'အသံပီသမှု အထူးစနစ် ဖွင့်ထားသည်' : 'Articulate Standard ON'}
                </span>
              </div>
            </div>

            {/* Studio Workspace: Text Editor & Generation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Text Area & Quick Insert Toolbar */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
                  {/* Text Header & Utilities */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'my' ? 'ဖတ်ကြားရမည့် မြန်မာစာသား' : 'Text Prompt (Burmese Script)'}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Zawgyi Warning & 1-Click Convert */}
                      {encoding === 'zawgyi' && (
                        <button
                          onClick={handleConvertZawgyi}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 flex items-center gap-1 transition animate-bounce"
                          title="Zawgyi မှ Unicode သို့ ချက်ချင်းပြောင်းရန်"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Zawgyi ➜ Unicode</span>
                        </button>
                      )}

                      {/* Expand Numbers Button */}
                      <button
                        onClick={handleExpandNumbers}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition"
                        title={lang === 'my' ? 'ဂဏန်းများကို စာလုံးအသံထွက်အဖြစ် ပြောင်းရန်' : 'Convert numerals to words'}
                      >
                        <Hash className="w-3 h-3 text-amber-400" />
                        <span className="hidden sm:inline">{lang === 'my' ? 'ဂဏန်းစာလုံးပြောင်း' : 'Num to Words'}</span>
                      </button>

                      {/* Save as Draft Button */}
                      <button
                        onClick={handleSaveDraft}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                          draftSavedToast
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border-slate-700'
                        }`}
                        title={
                          lang === 'my'
                            ? 'လက်ရှိစာသားနှင့် အသံဆက်တင်များကို မူကြမ်းအဖြစ် သိမ်းဆည်းရန်'
                            : 'Save current script and voice settings as draft'
                        }
                      >
                        {draftSavedToast ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">{lang === 'my' ? 'သိမ်းပြီး' : 'Saved!'}</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                            <span>{lang === 'my' ? 'မူကြမ်းသိမ်းမည်' : 'Save Draft'}</span>
                          </>
                        )}
                      </button>

                      {/* View Drafts Button */}
                      <button
                        onClick={() => setIsDraftsModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                        title={lang === 'my' ? 'သိမ်းဆည်းထားသော မူကြမ်းများကို ဖွင့်ရန်' : 'List and resume saved drafts'}
                      >
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">{lang === 'my' ? 'မူကြမ်းများ' : 'Drafts'}</span>
                        {drafts.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                            {drafts.length}
                          </span>
                        )}
                      </button>

                      {/* Clear Button */}
                      <button
                        onClick={() => setText('')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title={lang === 'my' ? 'စာသားအားလုံး ဖျက်ရန်' : 'Clear text'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Main Textarea */}
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={8}
                      placeholder={
                        lang === 'my'
                          ? 'ဖတ်ကြားလိုသော မြန်မာစာသားများကို ဤနေရာတွင် ရိုက်ထည့်ပါ သို့မဟုတ် ကူးယူထည့်ပါ... (စာလုံးရေ အကန့်အသတ်မရှိ)'
                          : 'Type or paste Myanmar text here... (Unlimited characters supported)'
                      }
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl p-4 text-sm sm:text-base text-slate-100 placeholder:text-slate-600 focus:outline-none font-myanmar resize-y custom-scrollbar"
                    />
                  </div>

                  {/* Quick Insertion Toolbar for Burmese Punctuation & Emotion Tags */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {lang === 'my' ? 'အမြန်ထည့်:' : 'Quick tags:'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleInsertTag('၊ ')}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-myanmar text-xs font-bold"
                        title="ပုဒ်ဖြတ် (Comma)"
                      >
                        ၊ (ပုဒ်ဖြတ်)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertTag('။ ')}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-myanmar text-xs font-bold"
                        title="ပုဒ်မ (Period)"
                      >
                        ။ (ပုဒ်မ)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertTag('... ')}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                        title="ခေတ္တရပ်နား (Pause)"
                      >
                        ... (ရပ်နား)
                      </button>
                    </div>

                    {/* Stats counter */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>{text.length} {lang === 'my' ? 'လုံး' : 'chars'}</span>
                      <span>•</span>
                      <span>{textStats.syllableCount} {lang === 'my' ? 'ဝဏ္ဏ' : 'syl'}</span>
                      <span>•</span>
                      <span>~{textStats.estimatedSeconds}s</span>
                      {isMultiChunk && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          {chunks.length} {lang === 'my' ? 'ပိုင်းခွဲဖတ်မည်' : 'chunks'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Generate Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleGenerateSpeech}
                    disabled={isGenerating || !text.trim()}
                    className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <RotateCw className="w-5 h-5 animate-spin text-slate-950" />
                        <span>
                          {lang === 'my'
                            ? isMultiChunk
                              ? `စာသား ${chunks.length} ပိုင်းကို ပေါင်းစပ် ဖတ်နေဆဲဖြစ်သည်...`
                              : 'မြန်မာအသံ ဖန်တီးနေဆဲဖြစ်သည်...'
                            : 'Synthesizing Authentic Myanmar Speech...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Mic2 className="w-5 h-5 fill-slate-950" />
                        <span>
                          {lang === 'my' ? 'မြန်မာအသံ စတင်ဖတ်ကြားမည် (Generate Speech)' : 'Generate Myanmar Speech'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Voice Personas & Speech Styling */}
              <div className="lg:col-span-5 space-y-4">
                {/* Voice Selection */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                  <VoiceSelector
                    selectedVoice={selectedVoice}
                    onSelectVoice={(v) => setSelectedVoice(v)}
                    onPreviewVoice={handlePreviewVoice}
                    previewingVoiceId={previewingVoiceId}
                    lang={lang}
                  />

                  {/* Emotion / Style Presets */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'my' ? 'အသံနေအထားနှင့် ရသပုံစံ (Tone & Style)' : 'Tone & Style Preset'}</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {STYLE_PRESETS.map((preset) => {
                        const isSelected = selectedStyle === preset.prompt;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSelectedStyle(preset.prompt)}
                            className={`p-2.5 rounded-xl text-left border transition text-xs flex items-center gap-2 ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                            <span className="truncate">
                              {lang === 'my' ? preset.labelBurmese : preset.labelEnglish}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Speech Fine-Tuning: Speed & Articulate Mode */}
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">
                        {lang === 'my' ? 'အသံ အမြန်နှုန်း (Pace / Speed):' : 'Speaking Speed:'}
                      </span>
                      <span className="font-mono text-amber-400 font-bold">{speed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.05"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />

                    {/* Articulate Standard Toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">
                          {lang === 'my' ? 'အသံပီသမှု အထူးစနစ် (Articulate Phonetics)' : 'Standard Phonetic Precision'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {lang === 'my' ? 'သတ်သံနှင့် ဗျည်းတွဲများ ပိုမိုတိကျစေပါသည်' : 'Accurate asat & medial phonetics'}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isArticulate}
                        onChange={(e) => setIsArticulate(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Google AdSense: Sidebar Banner Unit */}
                <AdBanner type="sidebar" lang={lang} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Direct TXT to Speech Studio */}
        {activeTab === 'txt' && (
          <TxtToSpeechStudio
            onPlayAudio={(audioBase64, voiceName, snippet, isLongForm, totalChunks) => {
              setCurrentAudioBase64(audioBase64);
              setCurrentVoiceName(voiceName);
              setCurrentSnippet(snippet);
              setIsLongFormActive(isLongForm || false);
              setTotalChunksActive(totalChunks || 1);
            }}
            lang={lang}
          />
        )}

        {/* TAB 3: Dual Speaker Dialogue Studio */}
        {activeTab === 'dialogue' && (
          <DialogueStudio
            onPlayAudio={(audioBase64, voiceName, snippet, isLongForm) => {
              setCurrentAudioBase64(audioBase64);
              setCurrentVoiceName(voiceName);
              setCurrentSnippet(snippet);
              setIsLongFormActive(isLongForm || false);
              setTotalChunksActive(1);
            }}
            lang={lang}
          />
        )}

        {/* TAB 4: Sample Texts Library */}
        {activeTab === 'samples' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/20">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>{lang === 'my' ? 'စမ်းသပ်ရန် မြန်မာစာသား နမူနာများ' : 'Curated Myanmar Sample Library'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'my'
                  ? 'အောက်ပါ စာသားများကို ရွေးချယ်၍ အသံဖတ်စနစ်ထဲသို့ တိုက်ရိုက်ထည့်သွင်း စမ်းသပ်နိုင်ပါသည်'
                  : 'Select any pre-formatted sample to load into the Voice Studio or test audio immediately'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAMPLE_TEXTS.map((sample) => (
                <div
                  key={sample.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition shadow-lg space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-bold">
                        {lang === 'my' ? sample.categoryBurmese : sample.categoryEnglish}
                      </span>
                      {sample.isLongForm && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          {lang === 'my' ? 'စာလုံးရေ အကန့်အသတ်မဲ့ စာပေ' : 'Long-Form Unlimited'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 font-myanmar">
                      {lang === 'my' ? sample.titleBurmese : sample.titleEnglish}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{sample.description}</p>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-3 font-myanmar bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      {sample.text}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {sample.text.length} {lang === 'my' ? 'လုံး' : 'chars'}
                    </span>
                    <button
                      onClick={() => handleLoadSample(sample.text, sample.recommendedVoice)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
                    >
                      <span>{lang === 'my' ? 'အသံဖတ်ရန် ထည့်သွင်းမည်' : 'Load & Synthesize'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Google AdSense: In-Content Article Banner */}
        <AdBanner type="in-content" lang={lang} />

        {/* Website Landing & Platform Sections (Features, How it Works, Use Cases, FAQ, Footer) */}
        <WebsiteSections
          onScrollToStudio={() => {
            setActiveTab('studio');
            document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
          }}
          lang={lang}
        />
      </main>

      {/* Floating Bottom Audio Player Bar */}
      <AudioPlayerBar
        audioBase64={currentAudioBase64}
        voiceName={currentVoiceName}
        textSnippet={currentSnippet}
        isLongForm={isLongFormActive}
        totalChunks={totalChunksActive}
        lang={lang}
      />

      {/* Pronunciation & Phonetics Modal */}
      <PronunciationHelperModal
        isOpen={isPronunciationModalOpen}
        onClose={() => setIsPronunciationModalOpen(false)}
        initialText={text}
        onApplyEnhancedText={(enhanced) => setText(enhanced)}
        lang={lang}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onPlayItem={(item) => {
          setCurrentAudioBase64(item.audioBase64);
          setCurrentVoiceName(item.voiceName);
          setCurrentSnippet(item.text);
          setIsLongFormActive(item.isLongForm || false);
          setTotalChunksActive(item.chunksCount || 1);
        }}
        onClearHistory={() => setHistory([])}
        onDeleteItem={(id) => setHistory((prev) => prev.filter((item) => item.id !== id))}
        lang={lang}
      />

      {/* Saved Drafts Modal */}
      <DraftsModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        drafts={drafts}
        onResumeDraft={handleResumeDraft}
        onDeleteDraft={handleDeleteDraft}
        onClearAllDrafts={handleClearAllDrafts}
        lang={lang}
      />
    </div>
  );
}
