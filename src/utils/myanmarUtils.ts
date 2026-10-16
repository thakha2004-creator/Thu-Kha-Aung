/**
 * Myanmar Language Utilities:
 * - Syllable breaking
 * - Number to Burmese words expansion
 * - Sentence chunking for unlimited text TTS
 * - Phonetic romanization helper
 * - Pronunciation normalization
 */

// Myanmar Digits to Words Map
const DIGITS_MAP: Record<string, string> = {
  '၀': 'သုည',
  '၁': 'တစ်',
  '၂': 'နှစ်',
  '၃': 'သုံး',
  '၄': 'လေး',
  '၅': 'ငါး',
  '၆': 'ခြောက်',
  '၇': 'ခုနစ်',
  '၈': 'ရှစ်',
  '၉': 'ကိုး',
  '0': 'သုည',
  '1': 'တစ်',
  '2': 'နှစ်',
  '3': 'သုံး',
  '4': 'လေး',
  '5': 'ငါး',
  '6': 'ခြောက်',
  '7': 'ခုနစ်',
  '8': 'ရှစ်',
  '9': 'ကိုး',
};

// Convert single/multi digit numbers to spoken Burmese
export function expandMyanmarNumbers(text: string): string {
  if (!text) return '';

  // Currency formats like 1,000 ကျပ် or ၁,၀၀၀ ကျပ်
  let result = text.replace(/([၀-၉0-9,]+)\s*(ကျပ်|ဒေါ်လာ|ပြား|ခု|ယောက်|ကြိမ်|နှစ်|လ|ရက်)/g, (match, num, unit) => {
    const cleanNum = num.replace(/,/g, '');
    return `${convertNumberToBurmeseWords(cleanNum)} ${unit}`;
  });

  // Convert remaining individual numbers or sequences
  result = result.replace(/[၀-၉0-9]+/g, (match) => {
    return convertNumberToBurmeseWords(match);
  });

  return result;
}

function convertNumberToBurmeseWords(numStr: string): string {
  // Normalize western digits to myanmar digits
  const westernToMyan: Record<string, string> = {
    '0': '၀', '1': '၁', '2': '၂', '3': '၃', '4': '၄',
    '5': '၅', '6': '၆', '7': '၇', '8': '၈', '9': '၉'
  };
  const normalized = numStr.split('').map(c => westernToMyan[c] || c).join('');

  const n = parseInt(numStr.replace(/[၀-၉]/g, (d) => {
    const myanToWest: Record<string, string> = {
      '၀': '0', '၁': '1', '၂': '2', '၃': '3', '၄': '4',
      '၅': '5', '၆': '6', '၇': '7', '၈': '8', '၉': '9'
    };
    return myanToWest[d] || d;
  }), 10);

  if (isNaN(n)) {
    return normalized.split('').map(d => DIGITS_MAP[d] || d).join(' ');
  }

  if (n === 0) return 'သုည';
  if (n < 10) return DIGITS_MAP[normalized] || normalized;

  // Basic Burmese number grammar (၁၀ - တစ်ဆယ်, ၂၀ - နှစ်ဆယ်, ၁၀၀ - တစ်ရာ, ၁၀၀၀ - တစ်ထောင်, ၁၀၀၀၀ - တစ်သောင်း, ၁၀၀၀၀၀ - တစ်သိန်း, ၁၀၀၀၀၀၀ - တစ်သန်း)
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const rem = n % 10;
    const tensWord = tens === 1 ? 'ဆယ်' : `${DIGITS_MAP[String(tens)]}ဆယ်`;
    if (rem === 0) return tens === 1 ? 'တစ်ဆယ်' : tensWord;
    return `${tens === 1 ? 'ဆယ့်' : tensWord + '့'} ${DIGITS_MAP[String(rem)]}`;
  }

  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rem = n % 100;
    const hundredsWord = `${DIGITS_MAP[String(hundreds)]}ရာ`;
    if (rem === 0) return hundredsWord;
    return `${hundredsWord}့ ${convertNumberToBurmeseWords(String(rem))}`;
  }

  if (n < 10000) {
    const thousands = Math.floor(n / 1000);
    const rem = n % 1000;
    const thousandsWord = `${DIGITS_MAP[String(thousands)]}ထောင်`;
    if (rem === 0) return thousandsWord;
    return `${thousandsWord}့ ${convertNumberToBurmeseWords(String(rem))}`;
  }

  if (n < 100000) {
    const tenThousands = Math.floor(n / 10000);
    const rem = n % 10000;
    const tenThousandsWord = `${DIGITS_MAP[String(tenThousands)]}သောင်း`;
    if (rem === 0) return tenThousandsWord;
    return `${tenThousandsWord} ${convertNumberToBurmeseWords(String(rem))}`;
  }

  // Fallback to spoken digit-by-digit for huge numbers or phone numbers
  return normalized.split('').map(d => DIGITS_MAP[d] || d).join(' ');
}

// Burmese Syllable Segmenter Regex
// Matches a syllable: consonant / independent vowel + medials + vowel signs + virama/asat
const SYLLABLE_REGEX =
  /(?:[က-အဢ-ဪ]|(?:\u104E))[\u103B-\u103E]*(?:[\u102B-\u1032\u1036-\u1038]|\u103A[\u1000-\u1021]?)*(?:\u1037)?/g;

export function segmentMyanmarSyllables(text: string): string[] {
  if (!text) return [];
  const matches = text.match(SYLLABLE_REGEX);
  return matches ? matches.filter(s => s.trim().length > 0) : text.split(/\s+/);
}

/**
 * Split text into reasonable chunks for long-form unlimited TTS.
 * Targets ~200-350 characters per chunk, splitting preferentially on:
 * 1. Double sections / Paragraphs (\n\n or \n)
 * 2. Myanmar period '။' (ပုဒ်မ)
 * 3. Myanmar comma '၊' (ပုဒ်ဖြတ်)
 * 4. Punctuation (. ! ?)
 */
export function chunkMyanmarText(text: string, maxChunkLength = 280): string[] {
  if (!text || text.trim().length === 0) return [];

  const rawText = text.trim();
  if (rawText.length <= maxChunkLength) {
    return [rawText];
  }

  const chunks: string[] = [];
  // First split by sentence enders '။' or newlines
  const sentences = rawText
    .split(/(?<=[။\n.!?])/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let currentChunk = '';

  for (const sentence of sentences) {
    // If the sentence itself is too long, split by comma '၊'
    if (sentence.length > maxChunkLength) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      const clauses = sentence
        .split(/(?<=[၊,])/)
        .map(c => c.trim())
        .filter(c => c.length > 0);

      for (const clause of clauses) {
        if ((currentChunk + ' ' + clause).trim().length > maxChunkLength) {
          if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = clause;
        } else {
          currentChunk = currentChunk ? `${currentChunk} ${clause}` : clause;
        }
      }
    } else if ((currentChunk + ' ' + sentence).trim().length > maxChunkLength) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Normalizes text for clearest Burmese pronunciation:
 * - Fixes Zawgyi ordering if detected
 * - Expands numbers to spoken Burmese words
 * - Harmonizes punctuation for natural pause
 */
export function normalizeForClearPronunciation(text: string): {
  normalizedText: string;
  syllableCount: number;
  wordCount: number;
  estimatedSeconds: number;
} {
  if (!text) {
    return { normalizedText: '', syllableCount: 0, wordCount: 0, estimatedSeconds: 0 };
  }

  let processed = text.trim();
  // Expand numbers
  processed = expandMyanmarNumbers(processed);

  // Ensure pauses at Burmese punctuation
  processed = processed.replace(/([၊။])/g, '$1 ');

  const syllables = segmentMyanmarSyllables(processed);
  const syllableCount = syllables.length;
  // Natural Burmese speaking rate: ~4 to 4.5 syllables per second
  const estimatedSeconds = Math.max(1, Math.round((syllableCount / 4.2) * 10) / 10);
  const wordCount = processed.split(/\s+/).filter(Boolean).length;

  return {
    normalizedText: processed,
    syllableCount,
    wordCount,
    estimatedSeconds,
  };
}
