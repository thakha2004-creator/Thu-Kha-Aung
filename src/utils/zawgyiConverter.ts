/**
 * Myanmar Unicode and Zawgyi detection & conversion utilities
 */

// Regex patterns to detect Zawgyi characteristics
const ZAWGYI_REGEX =
  /\u1031(?=[\u1000-\u1021])|[\u107E\u107F\u1080-\u1097]|[\u102B\u102C][\u103A\u1037]|[\u103B\u103C][\u1031]|[\u103A][\u1037]/;

const UNICODE_REGEX =
  /[\u1000-\u1021][\u103B-\u103E]*[\u102C-\u1032]*[\u1036-\u1038]*|[\u1000-\u1021]\u103A[\u1000-\u1021]/;

export function detectEncoding(text: string): 'zawgyi' | 'unicode' | 'mixed' | 'ascii' {
  if (!text || text.trim().length === 0) return 'unicode';
  
  // Check if text has any Myanmar characters
  const hasMyanmar = /[\u1000-\u109F\uAA60-\uAA7F]/.test(text);
  if (!hasMyanmar) return 'ascii';

  const isZawgyi = ZAWGYI_REGEX.test(text);
  if (isZawgyi) return 'zawgyi';

  return 'unicode';
}

// Mapping of common Zawgyi to Unicode codepoints
export function convertZawgyiToUnicode(text: string): string {
  if (!text) return '';
  let str = text;

  // 1. Fix Zawgyi 'e' vowel (U+1031) preceding consonant -> consonant + U+1031 in Unicode
  str = str.replace(/\u1031([\u1000-\u1021])/g, '$1\u1031');
  
  // Medials rearrangement
  // Zawgyi ra-yit (U+103B/107E/107F/1080/1081/1082/1083/1084) before consonant
  str = str.replace(/([\u107E\u107F\u1080-\u1084\u103B\u103C])([\u1000-\u1021])/g, '$2$1');

  // Common Zawgyi ligatures to Unicode
  const zawgyiToUniMap: Record<string, string> = {
    '\u1064': '\u1004\u103A\u1038', // Kinzi
    '\u1060': '\u1000\u1039\u1000',
    '\u1061': '\u1000\u1039\u1001',
    '\u1062': '\u1000\u1039\u1002',
    '\u1063': '\u1000\u1039\u1003',
    '\u1065': '\u1004\u1039\u1005',
    '\u106b': '\u1009\u1039\u1009',
    '\u106c': '\u1009\u103A',
    '\u106d': '\u100A\u103A',
    '\u1070': '\u100F\u1039\u100D',
    '\u1071': '\u100D\u1039\u100D',
    '\u1072': '\u100D\u1039\u100E',
    '\u1073': '\u100E\u1039\u100D',
    '\u1074': '\u100E\u1039\u100E',
    '\u1075': '\u1010\u1039\u1010',
    '\u1076': '\u1010\u1039\u1011',
    '\u1077': '\u1011\u1039\u1011',
    '\u1078': '\u1012\u1039\u1012',
    '\u1079': '\u1012\u1039\u1013',
    '\u107a': '\u1013\u1039\u1013',
    '\u107b': '\u1014\u1039\u1014',
    '\u107c': '\u1015\u1039\u1015',
    '\u107d': '\u1015\u1039\u1016',
    '\u107e': '\u103C', // Ra-yit
    '\u107f': '\u103C',
    '\u1080': '\u103C',
    '\u1081': '\u103C',
    '\u1082': '\u103C',
    '\u1083': '\u103C',
    '\u1084': '\u103C',
    '\u1085': '\u1016\u1039\u1016',
    '\u1086': '\u103F', // Great Sa
    '\u1087': '\u103D', // Wa hswè
    '\u1088': '\u103E', // Ha hto
    '\u1089': '\u103D\u103E',
    '\u108a': '\u103D\u103E',
    '\u108b': '\u103A\u1038',
    '\u108c': '\u103A\u1038',
    '\u108d': '\u103A\u1037',
    '\u108e': '\u103A\u1037',
    '\u108f': '\u1037',
    '\u1090': '\u1038',
    '\u1091': '\u100F\u1039\u100C',
    '\u1092': '\u100B\u1039\u100C',
    '\u1093': '\u102B\u103A',
    '\u1094': '\u103B\u103D',
    '\u1095': '\u103B\u103E',
    '\u1096': '\u103C\u103D',
    '\u1097': '\u103C\u103E',
  };

  for (const [zg, uni] of Object.entries(zawgyiToUniMap)) {
    str = str.split(zg).join(uni);
  }

  // Common tone mark order fix: ensure asat (103A) comes before anusvara/visarga/dot below
  str = str.replace(/([\u1037\u1038])\u103A/g, '\u103A$1');

  return str;
}
