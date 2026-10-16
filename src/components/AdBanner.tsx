import React, { useEffect, useRef } from 'react';
import { Sparkles, Info, ExternalLink } from 'lucide-react';
import { ADSENSE_CONFIG, isAdSenseActive } from '../config/adsense';

interface AdBannerProps {
  type: 'top-banner' | 'sidebar' | 'in-content' | 'footer-banner';
  className?: string;
  lang?: 'my' | 'en';
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({
  type,
  className = '',
  lang = 'my',
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const isLive = isAdSenseActive();

  // Load AdSense script dynamically when publisher ID is configured
  useEffect(() => {
    if (!isLive) return;

    const scriptId = 'google-adsense-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense push error:', err);
    }
  }, [isLive, type]);

  // Determine slot ID and size configurations
  let slotId = ADSENSE_CONFIG.adUnits.topBanner;
  let labelBurmese = 'ကြော်ငြာ (ထိပ်ဆုံး နဖူးစည်းကြော်ငြာ)';
  let labelEnglish = 'Top Leaderboard Banner';
  let dimensions = 'Responsive (728x90 / Auto)';
  let containerHeight = 'min-h-[90px]';

  if (type === 'sidebar') {
    slotId = ADSENSE_CONFIG.adUnits.sidebar;
    labelBurmese = 'ကြော်ငြာ (ဘေးဘက် ကော်လံကြော်ငြာ)';
    labelEnglish = 'Sidebar Banner Unit';
    dimensions = '300x250 / 300x600';
    containerHeight = 'min-h-[250px]';
  } else if (type === 'in-content') {
    slotId = ADSENSE_CONFIG.adUnits.inContent;
    labelBurmese = 'ကြော်ငြာ (စာမျက်နှာတွင်း ကြော်ငြာ)';
    labelEnglish = 'In-Content Banner Unit';
    dimensions = 'Responsive Article Ad';
    containerHeight = 'min-h-[120px]';
  } else if (type === 'footer-banner') {
    slotId = ADSENSE_CONFIG.adUnits.footerBanner;
    labelBurmese = 'ကြော်ငြာ (အောက်ခြေ နဖူးစည်းကြော်ငြာ)';
    labelEnglish = 'Footer Banner Unit';
    dimensions = 'Responsive Horizontal (728x90)';
    containerHeight = 'min-h-[90px]';
  }

  if (!ADSENSE_CONFIG.enabled) {
    return null;
  }

  // Live Google AdSense Container
  if (isLive) {
    return (
      <div className={`w-full overflow-hidden my-4 text-center ${className}`}>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
          {lang === 'my' ? 'ကြော်ငြာ (ADVERTISEMENT)' : 'ADVERTISEMENT'}
        </div>
        <ins
          ref={adRef}
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Placeholder Mode: Sleek, high-fidelity AdSense Banner Preview
  return (
    <div
      className={`w-full relative overflow-hidden rounded-2xl border border-dashed border-slate-700/80 bg-gradient-to-r from-slate-900/90 via-slate-950/80 to-slate-900/90 p-4 transition-all duration-200 hover:border-amber-500/40 my-4 flex flex-col items-center justify-center text-center ${containerHeight} ${className}`}
    >
      {/* Top Header Label */}
      <div className="flex items-center justify-between w-full max-w-2xl px-2 mb-2 pb-1.5 border-b border-slate-800/80 text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>{lang === 'my' ? 'ကြော်ငြာ နေရာ (ADVERTISEMENT)' : 'ADVERTISEMENT'}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-500 font-mono">
          <span>Google AdSense Unit</span>
        </div>
      </div>

      {/* Center Body */}
      <div className="py-2 flex flex-col items-center justify-center space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-5 items-center gap-1 px-2 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold">
            <span>{lang === 'my' ? labelBurmese : labelEnglish}</span>
          </div>
          <span className="text-slate-400 text-xs font-mono">[{dimensions}]</span>
        </div>

        <p className="text-[11px] text-slate-400 max-w-lg mt-1 leading-relaxed">
          {lang === 'my'
            ? `Google AdSense Publisher ID (${ADSENSE_CONFIG.publisherId}) နှင့် Ad Slot (${slotId}) နေရာထားရှိပြီးဖြစ်ပါသည်။ \`src/config/adsense.ts\` တွင် မိမိ၏ တကယ့် AdSense ID ကို အလွယ်တကူ ထည့်သွင်းနိုင်ပါသည်။`
            : `Slot ID: ${slotId}. Replace with your real AdSense ID in src/config/adsense.ts to start serving live ads.`}
        </p>
      </div>

      {/* Bottom Hint */}
      <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
        <Info className="w-3 h-3 text-amber-400/80" />
        <span>
          {lang === 'my'
            ? 'AdSense စနစ် ဖွင့်လှစ်ရန် src/config/adsense.ts သို့မဟုတ် .env တွင် VITE_ADSENSE_PUB_ID ထည့်ပါ'
            : 'Configure in src/config/adsense.ts or set VITE_ADSENSE_PUB_ID in .env'}
        </span>
      </div>
    </div>
  );
};
