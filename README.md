# ShweVoice AI - Myanmar (Burmese) AI Text-to-Speech Studio
### ရွှေသံစဉ် AI - မြန်မာစာ AI အသံဖတ်စနစ်

A production-grade Myanmar (Burmese) Text-to-Speech AI web application built with React, Vite, Tailwind CSS, Express, and Google Gemini TTS (`gemini-3.8-flash-lite-tts` & `gemini-3.8-flash-tts`).

![ShweVoice AI](https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Features (အဓိက စွမ်းဆောင်ချက်များ)

- **✨ Unlimited Character Count (စာလုံးရေ အကန့်အသတ်မဲ့)**: Automatic semantic clause & sentence chunking with seamless PCM WAV stitching for long-form novels, books, and articles.
- **📄 Direct TXT to Speech (TXT ဖိုင်မှ တိုက်ရိုက်ဖတ်ကြားခြင်း)**: Drag-and-drop `.txt` file reader with chapter/paragraph navigator and full document audio generation.
- **🗣️ 5 Handcrafted Myanmar Voice Personas (မြန်မာအသံရှင် ၅ ဦး)**:
  - **သီရိ (Thiri)**: Clear, warm broadcaster & narrator (Kore)
  - **မင်းသန့် (Min Thant)**: Deep, authoritative documentary voice (Fenrir)
  - **နန်းခင် (Nang Khin)**: Sweet, friendly, and cheerful tone (Zephyr)
  - **ကျော်ဇင် (Kyaw Zin)**: Modern, energetic tech & conversationalist (Puck)
  - **ဆရာဦးဘ (U Ba)**: Calm, wise, and traditional elder storyteller (Charon)
- **🎯 Articulate Spoken Phonetics (မြန်မာအသံ ပီသကြည်လင်မှု စနစ်)**: Accurate Standard Yangon phonetics, medials, asat finals, and tone control.
- **🔤 Zawgyi ⇄ Unicode Converter**: Automatic encoding detection and instant conversion.
- **🔢 Myanmar Numbers to Spoken Words**: Automatically expands numerals (`၁,၅၀၀` ➜ `တစ်ထောင့်ငါးရာ`) for natural TTS cadence.
- **👥 Dual-Speaker Dialogue Studio (စကားဝိုင်း / ဇာတ်လမ်းဖန်တီးမှု)**: Multi-speaker conversations, podcasts, and interviews.
- **🎵 Studio Audio Player**: Animated canvas waveform visualizer, scrubber, speed controls (0.5x – 2.0x), and uncompressed 24kHz `.WAV` export.
- **📤 Audio & Text Sharing**: Copy direct shareable URL or share snippets to Facebook, X/Twitter, Telegram, and WhatsApp.
- **📢 Google AdSense Ready**: Configured with safe fallback values and responsive ad units.

---

## 🚀 Quick Start (စတင်အသုံးပြုနည်း)

### Prerequisites
- Node.js (v18+)
- npm or bun

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/shwevoice-myanmar-tts.git
cd shwevoice-myanmar-tts
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Add your Gemini API Key in `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
```
*(Get your free API key at [Google AI Studio](https://aistudio.google.com/app/apikey))*

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```

---

## 🌐 Deploy to Netlify
1. Push this repository to your GitHub.
2. Log in to [Netlify](https://netlify.com) and click **"Add new site"** > **"Import an existing project"** > **"GitHub"**.
3. Select this repository. Netlify will automatically detect `netlify.toml` (`npm run build` and `dist`).
4. Add your `GEMINI_API_KEY` under **Site configuration > Environment variables**.
5. Click **Deploy Site**.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS 4, Lucide Icons
- **Backend**: Express, Node.js (`server.ts`)
- **AI Audio Models**: `@google/genai` with `gemini-3.8-flash-lite-tts` and `gemini-3.8-flash-tts`
- **Audio Processing**: Custom RIFF WAV header generator & PCM binary chunk stitcher

---

## 📄 License
Apache-2.0
