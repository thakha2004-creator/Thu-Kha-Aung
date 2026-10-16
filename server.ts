import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Create standard 44-byte WAV header for 24kHz 16-bit mono PCM
function createWavHeader(
  dataLength: number,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  const buffer = Buffer.alloc(44);
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(dataLength + 36, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

// Stitch multiple WAV files into a single seamless continuous WAV
function stitchWavBuffers(wavBuffers: Buffer[]): Buffer {
  if (wavBuffers.length === 0) return Buffer.alloc(0);
  if (wavBuffers.length === 1) return wavBuffers[0];

  const pcmList: Buffer[] = [];
  for (const buf of wavBuffers) {
    if (buf.length > 44) {
      const dataIndex = buf.indexOf('data');
      if (dataIndex !== -1 && dataIndex + 8 <= buf.length) {
        pcmList.push(buf.subarray(dataIndex + 8));
      } else {
        pcmList.push(buf.subarray(44));
      }
    }
  }

  const combinedPcm = Buffer.concat(pcmList);
  const header = createWavHeader(combinedPcm.length, 24000, 1, 16);
  return Buffer.concat([header, combinedPcm]);
}

// Myanmar text chunking helper
function splitIntoChunks(text: string, maxLen = 300): string[] {
  if (!text || text.trim().length === 0) return [];
  const clean = text.trim();
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  // Split on paragraph or Myanmar section period '။' or newlines
  const sentences = clean
    .split(/(?<=[။\n.!?])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let current = '';
  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      if (current.trim().length > 0) {
        chunks.push(current.trim());
        current = '';
      }
      // Sub-split by comma '၊'
      const parts = sentence
        .split(/(?<=[၊,])/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      for (const part of parts) {
        if ((current + ' ' + part).trim().length > maxLen) {
          if (current.trim().length > 0) chunks.push(current.trim());
          current = part;
        } else {
          current = current ? `${current} ${part}` : part;
        }
      }
    } else if ((current + ' ' + sentence).trim().length > maxLen) {
      if (current.trim().length > 0) chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks;
}

// Base speech style prompt ensuring authentic, articulate Burmese pronunciation
function buildMyanmarStylePrompt(baseStyle: string, speed = 1.0, isArticulate = true): string {
  let prompt = `Native Burmese (Myanmar) speaker with crystal-clear, articulate, and accurate Myanmar pronunciation. Tone: ${baseStyle}.`;
  if (isArticulate) {
    prompt += ` Pronounce all Myanmar consonants, medials, vowels, and asat (သတ်သံ) with crisp phonetics and authentic Yangon/Myanmar standard spoken rhythm.`;
  }
  if (speed < 0.85) {
    prompt += ` Speak at a measured, patient, steady pace.`;
  } else if (speed > 1.15) {
    prompt += ` Speak briskly and dynamically without swallowing syllable finals.`;
  }
  return prompt;
}

// 1. Single & Unlimited Character TTS Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
      voice = 'Kore',
      style = 'Natural, conversational, and warm',
      speed = 1.0,
      modelType = 'flash-lite',
      articulate = true,
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const targetModel =
      modelType === 'flash' ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';
    const chunks = splitIntoChunks(text, 280);
    const stylePrompt = buildMyanmarStylePrompt(style, speed, articulate);

    // If single chunk, execute standard single call
    if (chunks.length === 1) {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: chunks[0],
                speechMetadata: {
                  style: stylePrompt,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData && p.inlineData.data
      );

      if (!audioPart || !audioPart.inlineData?.data) {
        return res.status(500).json({
          error: 'No audio returned from Gemini speech model.',
        });
      }

      return res.json({
        audioBase64: audioPart.inlineData.data,
        mimeType: 'audio/wav',
        model: targetModel,
        voice,
        chunksProcessed: 1,
        totalChunks: 1,
      });
    }

    // Unlimited Long-form Text: process all chunks sequentially or in controlled batches
    // and stitch into single complete WAV file!
    const audioBuffers: Buffer[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: chunkText,
                speechMetadata: {
                  style: stylePrompt,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData && p.inlineData.data
      );

      if (audioPart && audioPart.inlineData?.data) {
        audioBuffers.push(Buffer.from(audioPart.inlineData.data, 'base64'));
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(500).json({
        error: 'Failed to synthesize audio for chunks.',
      });
    }

    const mergedWav = stitchWavBuffers(audioBuffers);
    const finalBase64 = mergedWav.toString('base64');

    return res.json({
      audioBase64: finalBase64,
      mimeType: 'audio/wav',
      model: targetModel,
      voice,
      chunksProcessed: audioBuffers.length,
      totalChunks: chunks.length,
      isLongForm: true,
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate speech.',
    });
  }
});

// 2. Multi-Speaker Dialogue TTS Endpoint
app.post('/api/dialogue', async (req, res) => {
  try {
    const { turns } = req.body;
    if (!Array.isArray(turns) || turns.length < 2) {
      return res.status(400).json({
        error: 'Dialogue requires at least 2 speech turns with 2 speakers.',
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const speakers = Array.from(new Set(turns.map((t) => t.speaker || 'Speaker1')));
    if (speakers.length !== 2) {
      return res.status(400).json({
        error: 'Multi-speaker dialogue requires exactly 2 distinct speakers (e.g. Speaker 1 & Speaker 2).',
      });
    }

    const speaker1Name = speakers[0];
    const speaker2Name = speakers[1];

    const speaker1Voice = turns.find((t) => t.speaker === speaker1Name)?.voice || 'Fenrir';
    const speaker2Voice = turns.find((t) => t.speaker === speaker2Name)?.voice || 'Kore';

    const parts = turns.map((turn) => ({
      text: `${turn.speaker}: ${turn.text}`,
      speechMetadata: {
        speaker: turn.speaker,
        style:
          turn.style ||
          'Authentic native Myanmar conversational tone with crystal-clear pronunciation',
      },
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: speaker1Name,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker1Voice },
                },
              },
              {
                speaker: speaker2Name,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker2Voice },
                },
              },
            ],
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(
      (p: any) => p.inlineData && p.inlineData.data
    );

    if (!audioPart || !audioPart.inlineData?.data) {
      return res.status(500).json({
        error: 'Failed to obtain synthesized dialogue audio.',
      });
    }

    return res.json({
      audioBase64: audioPart.inlineData.data,
      mimeType: audioPart.inlineData.mimeType || 'audio/wav',
      speakers: [
        { name: speaker1Name, voice: speaker1Voice },
        { name: speaker2Name, voice: speaker2Voice },
      ],
    });
  } catch (error: any) {
    console.error('Error generating dialogue TTS:', error);
    res.status(500).json({
      error: error?.message || 'Dialogue generation failed.',
    });
  }
});

// 3. AI Pronunciation Polisher & Syllable Guide
app.post('/api/analyze-pronunciation', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const prompt = `You are a master Myanmar (Burmese) phonetic linguist.
Analyze the following Myanmar text to maximize spoken pronunciation accuracy for AI Text-to-Speech:
"${text}"

Provide:
1. phoneticGuide: Clear Romanized phonetic guide (e.g., "Min-ga-la-ba")
2. pronunciationNotes: Specific tips for pronunciation clarity (e.g. voicing shifts like သ->ဒ, က->ဂ, asat finals)
3. enhancedSpokenForm: If any numbers, dates, or formal acronyms should be spelled out in Burmese words for 100% natural TTS speech, provide the rewritten version. Otherwise keep identical.
4. toneAdvice: Recommended emotion/pace

Respond ONLY with valid JSON:
{
  "phoneticGuide": "string",
  "pronunciationNotes": ["tip1", "tip2"],
  "enhancedSpokenForm": "string",
  "toneAdvice": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text?.trim() || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('Pronunciation analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze pronunciation.',
    });
  }
});

// 4. Translate and Polish for Myanmar Speech
app.post('/api/translate-burmese', async (req, res) => {
  try {
    const { text, style = 'natural' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Translate and adapt the following text into natural, spoken Myanmar (Burmese) Unicode text optimized for audio speech synthesis.
Input text: "${text}"
Desired speech style: ${style}

Respond in JSON:
{
  "burmeseText": "natural spoken Burmese text in Unicode",
  "phoneticGuide": "Romanized pronunciation guide",
  "englishMeaning": "English explanation or back-translation"
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text?.trim() || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Download Project ZIP endpoint
app.get('/api/download-zip', (req, res) => {
  const publicZip = path.resolve(__dirname, 'public', 'shwevoice-myanmar-tts.zip');
  const distZip = path.resolve(__dirname, 'dist', 'shwevoice-myanmar-tts.zip');
  const zipPath = fs.existsSync(publicZip) ? publicZip : distZip;

  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="shwevoice-myanmar-tts.zip"');
    const fileStream = fs.createReadStream(zipPath);
    fileStream.pipe(res);
  } else {
    res.status(404).json({ error: 'ZIP file not found. Please regenerate.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShweVoice AI Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
