import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  FileText,
  Volume2,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Radio,
  Video,
  BookOpen,
  Headphones,
  Award,
  Layers,
  Heart,
} from 'lucide-react';
import { AdBanner } from './AdBanner';

interface WebsiteSectionsProps {
  onScrollToStudio: () => void;
  lang?: 'my' | 'en';
}

export const WebsiteSections: React.FC<WebsiteSectionsProps> = ({
  onScrollToStudio,
  lang = 'my',
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const features = [
    {
      icon: Layers,
      titleBurmese: 'စာလုံးရေ အကန့်အသတ်မဲ့',
      titleEnglish: 'Unlimited Character Count',
      descBurmese: 'ဝတ္ထုရှည်၊ သတင်းဆောင်းပါး၊ စာတမ်း စသည့် စာသား အရှည်ကြီးများကို တစ်ဆက်တည်း ချောမွေ့စွာ ပေါင်းစပ်ဖတ်ကြားပေးပါသည်။',
      descEnglish: 'Synthesize entire novels, articles, and long transcripts seamlessly without token limits.',
      badge: 'အဓိကအင်္ဂါရပ်',
    },
    {
      icon: FileText,
      titleBurmese: '.txt ဖိုင်မှ တိုက်ရိုက်ဖတ်ကြားမှု',
      titleEnglish: 'Direct TXT to Speech Reader',
      descBurmese: 'ဖိုင်ကို တိုက်ရိုက်ဆွဲထည့်ပြီး စာအုပ်တစ်ခုလုံး သို့မဟုတ် စာပိုဒ်လိုက် သီးခြားစီ နားဆင်နိုင်ပါသည်။',
      descEnglish: 'Drag & drop any .txt file. Listen to the entire document or jump to specific paragraphs.',
      badge: 'အသစ်',
    },
    {
      icon: Sparkles,
      titleBurmese: 'မြန်မာအသံ ပီသကြည်လင်မှု စနစ်',
      titleEnglish: 'Articulate Phonetics Engine',
      descBurmese: 'ရန်ကုန်စကားပြော စံနှုန်းအတိုင်း သတ်သံ၊ ဗျည်းတွဲ နှင့် သံပြင်း/သံပျော့များကို တိကျပီသစွာ ဖတ်ကြားပေးပါသည်။',
      descEnglish: 'Engineered for spoken standard Burmese with precise asat, medials, and natural cadence.',
      badge: 'သဘာဝကျ',
    },
    {
      icon: ShieldCheck,
      titleBurmese: 'Zawgyi ⇄ Unicode အလိုအလျောက်ပြောင်း',
      titleEnglish: 'Zawgyi & Unicode Auto-Detection',
      descBurmese: 'Zawgyi ဖြင့် ရေးထားသော စာများကို စနစ်မှ အလိုအလျောက် စစ်ဆေးတွေ့ရှိပြီး စံပြု Unicode သို့ ပြောင်းပေးပါသည်။',
      descEnglish: 'Automatically identifies legacy Zawgyi text and converts to standard Unicode on the fly.',
      badge: 'လွယ်ကူမှု',
    },
    {
      icon: Headphones,
      titleBurmese: 'စကားဝိုင်း / ဇာတ်လမ်းဖန်တီးမှု',
      titleEnglish: 'Dual-Speaker Dialogue Studio',
      descBurmese: 'စကားပြောသူ ၂ ဦး အပြန်အလှန် ဆွေးနွေးပြောဆိုသော ပေါ့ဒ်ကတ်စ်နှင့် အင်တာဗျူးများကို အလွယ်တကူ ဖန်တီးနိုင်ပါသည်။',
      descEnglish: 'Craft realistic two-person interviews, podcasts, and audio dramas in Burmese script.',
      badge: 'အဆင့်မြင့်',
    },
    {
      icon: Volume2,
      titleBurmese: 'စတူဒီယိုအဆင့် .WAV ဒေါင်းလုဒ်',
      titleEnglish: 'Studio-Grade WAV Export',
      descBurmese: 'ဖန်တီးထားသော အသံဖိုင်များကို 24kHz မိုနို အသံအရည်အသွေးမြင့် .WAV ဖိုင်အဖြစ် ကလစ်တစ်ချက်ဖြင့် ဒေါင်းလုဒ် ရယူနိုင်ပါသည်။',
      descEnglish: 'Export crisp 24kHz audio in uncompressed WAV format for your videos, projects, or podcasts.',
      badge: 'အခမဲ့',
    },
  ];

  const useCases = [
    {
      icon: Video,
      titleBurmese: 'YouTube & TikTok ဗီဒီယို အသံနောက်ခံ',
      titleEnglish: 'YouTube & TikTok Voiceovers',
      descBurmese: 'ဗီဒီယိုဖန်တီးသူများအတွက် မျက်နှာမပြဘဲ အရည်အသွေးမြင့် မြန်မာအသံဖြင့် ရှင်းပြတင်ဆက်ရန် အထူးသင့်လျော်သည်။',
      descEnglish: 'Create high-engagement voiceovers for faceless channels, explainer videos, and social shorts.',
    },
    {
      icon: BookOpen,
      titleBurmese: 'အသံထွက် စာအုပ်များ (Audiobooks)',
      titleEnglish: 'Audiobooks & Literature',
      descBurmese: 'ဝတ္ထု၊ ပုံပြင်နှင့် သုတစာအုပ်များကို အချိန်မရွေး နေရာမရွေး နားဆင်နိုင်သော အသံစာအုပ်အဖြစ် ပြောင်းလဲနိုင်သည်။',
      descEnglish: 'Transform classic Burmese fables, novels, and knowledge essays into spoken audiobooks.',
    },
    {
      icon: Radio,
      titleBurmese: 'သတင်းနှင့် ရေဒီယို ကြေညာချက်များ',
      titleEnglish: 'News & Official Broadcasts',
      descBurmese: 'သတင်းမီဒီယာများ၊ ဝက်ဘ်ဆိုက်များနှင့် ကုမ္ပဏီများအတွက် တည်ကြည်လေးနက်သော တင်ဆက်မှု အသံများ။',
      descEnglish: 'Professional broadcast cadence for news portals, organizational podcasts, and announcements.',
    },
    {
      icon: Award,
      titleBurmese: 'စီးပွားရေး ကြော်ငြာနှင့် သင်ကြားရေး',
      titleEnglish: 'E-Learning & Commercials',
      descBurmese: 'သင်ခန်းစာများ၊ ထုတ်ကုန်ကြော်ငြာများနှင့် အွန်လိုင်းသင်တန်းများအတွက် ရှင်းလင်းပြတ်သားသော အသံထွက်။',
      descEnglish: 'Engaging tutorials, corporate training slides, and energetic product promotional spots.',
    },
  ];

  const faqs = [
    {
      qBurmese: 'စာလုံးရေ အကန့်အသတ်မရှိ တကယ် ဖတ်နိုင်ပါသလား?',
      qEnglish: 'Does it really support unlimited character counts?',
      aBurmese: 'ဟုတ်ကဲ့၊ အမှန်တကယ် ဖတ်နိုင်ပါသည်။ ရွှေသံစဉ် AI သည် စာသားအရှည်ကြီးများကို စာကြောင်းနှင့် ပုဒ်မများအလိုက် အလိုအလျောက် ပိုင်းခြားပြီး တစ်ဆက်တည်း ပေါင်းစပ်ပေးသည့် Multi-Chunk WAV Engine ကို အသုံးပြုထားသောကြောင့် စာအုပ်တစ်အုပ်လုံးကိုလည်း ဖတ်ကြားပေးနိုင်ပါသည်။',
      aEnglish: 'Yes! ShweVoice AI utilizes automated semantic sentence chunking and seamless WAV concatenation, allowing you to synthesize articles and entire book chapters continuously.',
    },
    {
      qBurmese: 'Zawgyi ဖောင့်ဖြင့် ရေးထားသော စာများကို ဖတ်ပေးနိုင်သလား?',
      qEnglish: 'Can it read text written in Zawgyi font?',
      aBurmese: 'ဖတ်ပေးနိုင်ပါသည်။ စနစ်တွင် Zawgyi ဖောင့်ကို အလိုအလျောက် စစ်ဆေးပြီး စံပြု Unicode သို့ ချက်ချင်း ပြောင်းလဲပေးသည့်စနစ် ပါဝင်သောကြောင့် စာသားမှားယွင်းခြင်း မရှိဘဲ ပီသစွာ ထွက်ပေါ်လာမည် ဖြစ်ပါသည်။',
      aEnglish: 'Yes. Our integrated converter automatically detects Zawgyi encoding and converts it into standard Unicode before speech generation.',
    },
    {
      qBurmese: '.txt ဖိုင်ကို ဘယ်လို တင်သွင်းရမလဲ?',
      qEnglish: 'How do I upload and use a .txt file?',
      aBurmese: 'အပေါ်ဘက်ရှိ "TXT ဖိုင်မှ တိုက်ရိုက်ဖတ်ရန်" တက်ဘ်ကို နှိပ်ပြီး မိမိဖတ်လိုသော .txt ဖိုင်ကို ဆွဲထည့်ပါ သို့မဟုတ် ရွေးချယ်ပေးပါ။ ထို့နောက် စာအုပ်တစ်ခုလုံး သို့မဟုတ် စာပိုဒ်တစ်ခုချင်းစီကို ရွေးချယ် နားဆင်နိုင်ပါသည်။',
      aEnglish: 'Click on the "TXT to Speak" tab, drag and drop your .txt file, and listen to individual paragraphs or generate the entire document.',
    },
    {
      qBurmese: 'ဒေါင်းလုဒ်လုပ်ထားသော အသံဖိုင်များကို စီးပွားဖြစ် YouTube/TikTok တွင် သုံးနိုင်သလား?',
      qEnglish: 'Can I use downloaded audio for commercial YouTube or TikTok videos?',
      aBurmese: 'အသုံးပြုနိုင်ပါသည်။ ဒေါင်းလုဒ်ရရှိသော .WAV အသံဖိုင်များကို ဗီဒီယိုအသံနောက်ခံ၊ ပေါ့ဒ်ကတ်စ်၊ စီးပွားရေးကြော်ငြာနှင့် ပညာရေးလုပ်ငန်းများတွင် စိတ်ကြိုက် အသုံးပြုနိုင်ပါသည်။',
      aEnglish: 'Yes, all exported WAV audio files can be freely integrated into your YouTube, TikTok, commercial projects, and podcasts.',
    },
  ];

  return (
    <div className="space-y-20 pt-12 border-t border-slate-800/80 mt-12">
      {/* 1. Features Grid Section */}
      <section id="features" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {lang === 'my' ? 'အဓိက အင်္ဂါရပ်များ' : 'Core Features'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            {lang === 'my'
              ? 'အကောင်းဆုံး မြန်မာ AI အသံစတူဒီယို အတွေ့အကြုံ'
              : 'Built for High-Fidelity Myanmar Speech'}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {lang === 'my'
              ? 'အသံထွက် ပီသမှု၊ စာလုံးရေ အကန့်အသတ်မဲ့ဖတ်နိုင်မှုနှင့် အသုံးပြုရ လွယ်ကူမှုတို့ကို အပြည့်အစုံ ပေါင်းစပ်ဖန်တီးထားပါသည်'
              : 'Engineered with authentic phonetics, unlimited length synthesis, and instant WAV export.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/90 transition-all duration-200 shadow-xl space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 pt-1">
                  {lang === 'my' ? feat.titleBurmese : feat.titleEnglish}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'my' ? feat.descBurmese : feat.descEnglish}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. How it works 3-Step Section */}
      <section id="how-it-works" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {lang === 'my' ? 'အသုံးပြုပုံ အဆင့်ဆင့်' : 'Simple Workflow'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            {lang === 'my' ? 'ရိုးရှင်းသော အဆင့် ၃ ဆင့်ဖြင့် အသံဖန်တီးပါ' : '3 Simple Steps to Generate Speech'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-md">
              ၁
            </div>
            <h4 className="text-sm font-bold text-slate-200">
              {lang === 'my' ? 'စာသား သို့မဟုတ် .txt ဖိုင်ထည့်ပါ' : '1. Enter Text or Upload .TXT'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'my'
                ? 'ဖတ်ကြားလိုသော မြန်မာစာသားကို ရိုက်ထည့်ပါ သို့မဟုတ် မည်သည့် .txt စာအုပ်ဖိုင်ကိုမဆို တင်သွင်းပါ။'
                : 'Paste your script or upload a .txt document. Zawgyi will be auto-converted.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-md">
              ၂
            </div>
            <h4 className="text-sm font-bold text-slate-200">
              {lang === 'my' ? 'အသံရှင်နှင့် ရသပုံစံ ရွေးပါ' : '2. Select Voice & Tone'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'my'
                ? 'သီရိ၊ မင်းသန့်၊ နန်းခင်၊ ကျော်ဇင် သို့မဟုတ် ဦးဘ အသံရှင်များနှင့် သင့်လျော်သော ရသပုံစံကို ရွေးချယ်ပါ။'
                : 'Pick from 5 natural personas and choose between News, Storytelling, or Conversational tone.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-md">
              ၃
            </div>
            <h4 className="text-sm font-bold text-slate-200">
              {lang === 'my' ? 'နားဆင်ပြီး .WAV ဒေါင်းလုဒ်ရယူပါ' : '3. Listen & Export Audio'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'my'
                ? 'ဖန်တီးပြီးသော အသံကို တိုက်ရိုက်နားဆင်နိုင်ပြီး စတူဒီယိုအဆင့် .WAV အသံဖိုင်အဖြစ် သိမ်းဆည်းပါ။'
                : 'Preview with real-time waveform and download your continuous WAV audio track.'}
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onScrollToStudio}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 inline-flex items-center gap-2 transition"
          >
            <span>{lang === 'my' ? 'ယခုပင် စတင်အသုံးပြုမည်' : 'Launch Studio Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. Use Cases Section */}
      <section id="use-cases" className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {lang === 'my' ? 'အသုံးချနိုင်သော နယ်ပယ်များ' : 'Versatile Applications'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            {lang === 'my' ? 'ရွှေသံစဉ် AI ကို မည်သည့်နေရာတွင် အသုံးပြုနိုင်သနည်း?' : 'Where Can You Use ShweVoice AI?'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-100 pt-1">
                  {lang === 'my' ? uc.titleBurmese : uc.titleEnglish}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'my' ? uc.descBurmese : uc.descEnglish}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section id="faq" className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            FAQ
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            {lang === 'my' ? 'မကြာခဏ မေးလေ့ရှိသော မေးခွန်းများ' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-200 hover:text-amber-300 transition"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{lang === 'my' ? faq.qBurmese : faq.qEnglish}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/80 bg-slate-950/40">
                    {lang === 'my' ? faq.aBurmese : faq.aEnglish}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer AdSense Banner */}
      <AdBanner type="footer-banner" lang={lang} />

      {/* 5. Website Footer */}
      <footer className="pt-12 border-t border-slate-800/80 pb-6 text-slate-500 text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
              ရွှေ
            </div>
            <span className="font-bold text-slate-300">
              {lang === 'my' ? 'ရွှေသံစဉ် AI စတူဒီယို' : 'ShweVoice AI Studio'}
            </span>
          </div>

          <p className="text-center sm:text-right">
            {lang === 'my'
              ? '© 2026 ရွှေသံစဉ် AI. မြန်မာစာ AI အသံစနစ် မူပိုင်ခွင့်များ ရယူထားပါသည်။'
              : '© 2026 ShweVoice AI. High-fidelity Myanmar Speech Studio.'}
          </p>
        </div>
      </footer>
    </div>
  );
};
