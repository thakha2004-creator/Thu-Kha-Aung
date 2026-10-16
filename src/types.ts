export interface VoiceProfile {
  id: string;
  nameBurmese: string;
  nameEnglish: string;
  gender: 'female' | 'male';
  geminiVoice: 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon';
  descriptionBurmese: string;
  descriptionEnglish: string;
  avatarColor: string;
  recommendedTags: string[];
  badge?: string;
  sampleAudioText: string;
}

export interface TTSGenerationOptions {
  voice: 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon';
  style: string;
  speed: number;
  modelType: 'flash-lite' | 'flash';
  articulate: boolean;
  expandNumbers: boolean;
  autoConvertZawgyi: boolean;
}

export interface AudioHistoryItem {
  id: string;
  timestamp: number;
  text: string;
  voiceName: string;
  voiceGemini: string;
  durationSec: number;
  audioBase64: string;
  isLongForm?: boolean;
  chunksCount?: number;
}

export interface DialogueTurn {
  id: string;
  speaker: string;
  text: string;
  voice: 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon';
  style: string;
}

export interface PronunciationAnalysis {
  phoneticGuide: string;
  pronunciationNotes: string[];
  enhancedSpokenForm?: string;
  toneAdvice?: string;
}

export interface SampleTextItem {
  id: string;
  categoryBurmese: string;
  categoryEnglish: string;
  titleBurmese: string;
  titleEnglish: string;
  text: string;
  description: string;
  recommendedVoice: 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon';
  isLongForm?: boolean;
}

export interface DraftItem {
  id: string;
  timestamp: number;
  title: string;
  text: string;
  voice: 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon';
  style: string;
  speed: number;
  modelType: 'flash-lite' | 'flash';
  isArticulate: boolean;
  charCount: number;
}
