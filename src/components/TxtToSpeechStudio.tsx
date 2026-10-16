import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  BookOpen,
  Volume2,
  Trash2,
  ArrowRight,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MYANMAR_VOICES } from '../constants/voices';
import { detectEncoding, convertZawgyiToUnicode } from '../utils/zawgyiConverter';
import { normalizeForClearPronunciation, chunkMyanmarText } from '../utils/myanmarUtils';

interface TxtToSpeechStudioProps {
  onPlayAudio: (
    audioBase64: string,
    voiceName: string,
    snippet: string,
    isLongForm?: boolean,
    totalChunks?: number
  ) => void;
  lang?: 'my' | 'en';
}

export const TxtToSpeechStudio: React.FC<TxtToSpeechStudioProps> = ({
  onPlayAudio,
  lang = 'my',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [rawContent, setRawContent] = useState<string>('');
  const [encodingDetected, setEncodingDetected] = useState<'unicode' | 'zawgyi' | 'ascii'>('unicode');
  const [activeVoice, setActiveVoice] = useState<'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon'>('Kore');
  const [styleMode, setStyleMode] = useState<string>('Natural and fluent Myanmar audiobook narration');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);
  const [paragraphLoadingIndex, setParagraphLoadingIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File loading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.txt') && !file.type.includes('text')) {
      setErrorMsg(
        lang === 'my'
          ? '.txt ဖိုင်ကိုသာ ထည့်သွင်းပေးပါ'
          : 'Please upload a .txt format file'
      );
      return;
    }

    setErrorMsg(null);
    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const enc = detectEncoding(text);
      if (enc === 'zawgyi') {
        setEncodingDetected('zawgyi');
        // Auto convert to Unicode for proper TTS
        const converted = convertZawgyiToUnicode(text);
        setRawContent(converted);
      } else {
        setEncodingDetected('unicode');
        setRawContent(text);
      }
    };
    reader.onerror = () => {
      setErrorMsg(lang === 'my' ? 'ဖိုင်ဖတ်ရာတွင် အမှားဖြစ်ပေါ်ပါသည်' : 'Error reading file');
    };
    reader.readAsText(file, 'utf-8');
  };

  // Convert Zawgyi manually if user wants to re-run
  const handleConvertToUnicode = () => {
    const uni = convertZawgyiToUnicode(rawContent);
    setRawContent(uni);
    setEncodingDetected('unicode');
  };

  // Calculate stats
  const stats = normalizeForClearPronunciation(rawContent);
  const paragraphs = rawContent
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const filteredParagraphs = searchQuery
    ? paragraphs.filter((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
    : paragraphs;

  // Read full document via unlimited chunking
  const handleGenerateFullAudio = async () => {
    if (!rawContent.trim()) return;

    setIsProcessingAll(true);
    setErrorMsg(null);

    const chunks = chunkMyanmarText(rawContent, 280);
    setProcessingProgress({ current: 1, total: chunks.length });

    try {
      const selectedVoiceProfile = MYANMAR_VOICES.find((v) => v.geminiVoice === activeVoice);
      const voiceLabel =
        lang === 'my'
          ? selectedVoiceProfile?.nameBurmese || activeVoice
          : selectedVoiceProfile?.nameEnglish || activeVoice;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawContent,
          voice: activeVoice,
          style: styleMode,
          speed: 1.0,
          articulate: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to synthesize speech');
      }

      const snippet = `${fileName || 'TXT File'} (${stats.syllableCount} ဝဏ္ဏ)`;
      onPlayAudio(data.audioBase64, voiceLabel, snippet, data.isLongForm, data.totalChunks);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'TTS generation error');
    } finally {
      setIsProcessingAll(false);
    }
  };

  // Read single paragraph
  const handleReadParagraph = async (index: number, text: string) => {
    setParagraphLoadingIndex(index);
    setErrorMsg(null);

    try {
      const selectedVoiceProfile = MYANMAR_VOICES.find((v) => v.geminiVoice === activeVoice);
      const voiceLabel =
        lang === 'my'
          ? selectedVoiceProfile?.nameBurmese || activeVoice
          : selectedVoiceProfile?.nameEnglish || activeVoice;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: activeVoice,
          style: styleMode,
          speed: 1.0,
          articulate: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to synthesize paragraph');
      }

      setActiveParagraphIndex(index);
      const snippet = text.slice(0, 60) + '...';
      onPlayAudio(data.audioBase64, voiceLabel, snippet, false, 1);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to speak paragraph');
    } finally {
      setParagraphLoadingIndex(null);
    }
  };

  const handleClear = () => {
    setFileName('');
    setFileSize(0);
    setRawContent('');
    setActiveParagraphIndex(null);
    setSearchQuery('');
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explainer */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{lang === 'my' ? 'TXT ဖိုင်မှ တိုက်ရိုက် စာဖတ်ပေးခြင်း (Txt to Speak)' : 'Direct TXT File to Speech'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {lang === 'my' ? 'စာလုံးရေ အကန့်အသတ်မဲ့' : 'Unlimited Length'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'my'
                ? 'မည်သည့် .txt စာအုပ်၊ သတင်း၊ စာတမ်းဖိုင်မဆို တင်သွင်းပြီး တစ်ခုလုံး သို့မဟုတ် စာပိုဒ်လိုက် အသံထွက် ပီသစွာ ဖတ်ကြားနားဆင်ပါ'
                : 'Upload novels, essays, or transcripts (.txt). Listen to entire document or paragraph-by-paragraph with articulate Burmese voice.'}
            </p>
          </div>
        </div>

        {/* Selected Voice Pill */}
        <div className="flex items-center gap-2 self-stretch md:self-auto bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">
            {lang === 'my' ? 'အသံရှင်:' : 'Voice:'}
          </span>
          <select
            value={activeVoice}
            onChange={(e) => setActiveVoice(e.target.value as any)}
            className="bg-transparent text-xs font-semibold text-amber-400 focus:outline-none cursor-pointer"
          >
            {MYANMAR_VOICES.map((v) => (
              <option key={v.id} value={v.geminiVoice} className="bg-slate-900 text-slate-200">
                {lang === 'my' ? v.nameBurmese : v.nameEnglish} ({v.gender === 'female' ? 'မ' : 'ကျား'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Zone (if no file loaded) */}
      {!rawContent ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-200 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,text/plain"
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h4 className="text-base font-semibold text-slate-200 mb-1">
            {lang === 'my' ? '.txt ဖိုင်ကို ဤနေရာသို့ ဆွဲထည့်ပါ သို့မဟုတ် နှိပ်ပါ' : 'Drop your .txt file here or browse'}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            {lang === 'my'
              ? 'ဝတ္ထုရှည်၊ သတင်းဆောင်းပါး၊ ဟောပြောချက်မှတ်တမ်း စသည့် စာသားဖိုင်များကို တိုက်ရိုက် အသံပြောင်းပေးနိုင်ပါသည်'
              : 'Support novels, news scripts, articles, and long-form transcripts with automated Zawgyi/Unicode detection'}
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition"
          >
            {lang === 'my' ? 'ဖိုင်ရွေးချယ်ရန် (.txt)' : 'Select .TXT File'}
          </button>
        </div>
      ) : (
        /* File Loaded Dashboard */
        <div className="space-y-5">
          {/* File Meta & Control Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    {fileName || 'document.txt'}
                    <span className="text-[11px] font-normal text-slate-400">
                      ({(fileSize / 1024).toFixed(1)} KB)
                    </span>
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {encodingDetected === 'zawgyi' ? 'Zawgyi (Unicode သို့ ပြောင်းပြီး)' : 'Unicode အသင့်'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>{lang === 'my' ? 'ဖိုင်အသစ်တင်ရန်' : 'New File'}</span>
                </button>
              </div>
            </div>

            {/* Statistics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'my' ? 'စာလုံးရေ' : 'Characters'}</span>
                </div>
                <div className="text-base font-bold text-slate-100 mt-1 font-mono">
                  {rawContent.length.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'my' ? 'မြန်မာ ဝဏ္ဏ (Syllables)' : 'Syllables'}</span>
                </div>
                <div className="text-base font-bold text-slate-100 mt-1 font-mono">
                  {stats.syllableCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === 'my' ? 'စာပိုဒ်ပေါင်း' : 'Paragraphs'}</span>
                </div>
                <div className="text-base font-bold text-slate-100 mt-1 font-mono">
                  {paragraphs.length}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>{lang === 'my' ? 'ခန့်မှန်း ကြာချိန်' : 'Est. Duration'}</span>
                </div>
                <div className="text-base font-bold text-slate-100 mt-1 font-mono">
                  {stats.estimatedSeconds >= 60
                    ? `${(stats.estimatedSeconds / 60).toFixed(1)} မိနစ်`
                    : `${stats.estimatedSeconds} စက္ကန့်`}
                </div>
              </div>
            </div>

            {/* Zawgyi warning banner if relevant */}
            {encodingDetected === 'zawgyi' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    {lang === 'my'
                      ? 'မူရင်းဖိုင်တွင် Zawgyi ဖောင့်သုံးထားသည်ကို စနစ်မှ တွေ့ရှိသဖြင့် စံပြု Unicode သို့ အလိုအလျောက် ပြောင်းလဲဖတ်ကြားပေးထားပါသည်။'
                      : 'Zawgyi encoding was detected in the file. Automatically converted to standard Unicode for accurate pronunciation.'}
                  </span>
                </div>
                <button
                  onClick={handleConvertToUnicode}
                  className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shrink-0"
                >
                  {lang === 'my' ? 'ပြန်လည်စစ်ဆေး' : 'Re-verify'}
                </button>
              </div>
            )}

            {/* Main Action: Generate Full Audio */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400">
                <span className="text-amber-400 font-semibold">{lang === 'my' ? 'အကန့်အသတ်မရှိ စနစ်:' : 'Unlimited engine:'}</span>{' '}
                {lang === 'my'
                  ? 'စာမျက်နှာ ရာဂဏန်းရှိသော စာအုပ်ဖိုင်များကိုလည်း တစ်ဆက်တည်း ပီသစွာ ပေါင်းစပ်ဖတ်ကြားပေးနိုင်ပါသည်'
                  : 'Automated multi-chunk synthesis with seamless WAV stitching for long documents.'}
              </div>

              <button
                onClick={handleGenerateFullAudio}
                disabled={isProcessingAll}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isProcessingAll ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>
                      {lang === 'my'
                        ? `တစ်ခုလုံးကို အသံဖိုင်ပြောင်းနေဆဲဖြစ်သည်...`
                        : `Synthesizing full text...`}
                    </span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>
                      {lang === 'my'
                        ? 'တစ်ခုလုံးကို အသံဖိုင်ပြောင်း၍ နားဆင်မည် (Full Audio)'
                        : 'Generate Full Audio from TXT'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Paragraph-by-Paragraph Interactive Reader */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'my' ? 'စာပိုဒ်အလိုက် ရွေးချယ်နားဆင်ခြင်း' : 'Paragraph-by-Paragraph Reader'}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'my'
                    ? 'နားဆင်လိုသော စာပိုဒ်၏ ဖွင့်ခလုတ်ကို နှိပ်၍ သီးခြားစီ နားဆင်နိုင်ပါသည်'
                    : 'Click play on any specific paragraph to synthesize and listen instantly'}
                </p>
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={lang === 'my' ? 'စာသားရှာဖွေရန်...' : 'Search in text...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Paragraphs list */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredParagraphs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  {lang === 'my' ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော စာသားမတွေ့ရှိပါ' : 'No matching paragraphs found'}
                </div>
              ) : (
                filteredParagraphs.map((para, idx) => {
                  const isCurrent = activeParagraphIndex === idx;
                  const isLoading = paragraphLoadingIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {para.length} {lang === 'my' ? 'လုံး' : 'chars'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-myanmar selection:bg-amber-500/30">
                            {para}
                          </p>
                        </div>

                        {/* Read button */}
                        <button
                          onClick={() => handleReadParagraph(idx, para)}
                          disabled={isLoading || isProcessingAll}
                          className={`p-2.5 rounded-xl shrink-0 transition ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                              : 'bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700'
                          }`}
                          title={lang === 'my' ? 'ဤစာပိုဒ်ကို ဖတ်ပြရန်' : 'Read this paragraph'}
                        >
                          {isLoading ? (
                            <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
