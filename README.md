# Chatbot Groq - ChefBot Practicum

Project React TypeScript untuk praktikum Custom AI Chatbot menggunakan Groq AI. Aplikasi ini mempertahankan fitur lanjutan dari project saat ini, seperti multi-turn chat, localStorage history, rename/delete history, markdown rendering, tabel, source UI, image upload, web search mode, model selector, edit, regenerate, dan copy response.

## Project Overview

Default persona praktikum adalah **ChefBot**, asisten rekomendasi menu restoran. ChefBot menggunakan System Instruction dari `src/config/chatbotConfig.ts` agar jawaban tetap fokus pada makanan, minuman, dessert, dan rekomendasi menu restoran.

## Tech Stack

- React 19
- TypeScript
- Vite
- Groq Chat Completions API
- Browser `localStorage` untuk history chat

## Setup

1. Install dependency:

```bash
npm install
```

2. Buat file `.env` di root project:

```bash
VITE_GROQ_API_KEY=paste_your_groq_api_key_here
```

3. Jalankan development server:

```bash
npm run dev
```

4. Buka URL yang ditampilkan Vite di terminal.

File `.env` sudah masuk `.gitignore`, jadi API key lokal tidak ikut ter-commit.

## Health Check

Untuk mengecek `.env`, koneksi ke Groq, dan model chat aktif:

```bash
npm run health:check
```

Health check menggunakan model aktif non-deprecated:

- `llama-3.3-70b-versatile`
- `llama-3.1-8b-instant`
- `meta-llama/llama-4-scout-17b-16e-instruct`
- `openai/gpt-oss-120b`

## Build

```bash
npm run build
```

## ChefBot/System Instruction

Konfigurasi utama berada di `src/config/chatbotConfig.ts`:

- `botName`: `ChefBot`
- `welcomeMessage`: sapaan ramah dalam bahasa Indonesia
- `systemInstruction`: aturan persona, batasan topik, gaya komunikasi, dan daftar menu restoran beserta harga

Setiap request chat normal mengirim System Instruction sebagai pesan pertama:

```ts
{ role: "system", content: chatbotConfig.systemInstruction }
```

Pesan system ini dikirim sebelum conversation history dan pesan user terbaru, sehingga multi-turn conversation tetap berjalan tetapi perilaku ChefBot tetap konsisten.

## Model Metadata

Model ID utama dipusatkan di `src/config/groqModels.ts` agar selector, history label, capability check, dan library tidak memakai referensi model yang berbeda-beda. Referensi model deprecated dari modul lama sudah dibersihkan dari selector dan metadata library.

## Vercel Deployment Note

Jika deploy ke Vercel, tambahkan environment variable berikut di Project Settings:

```bash
VITE_GROQ_API_KEY=your_groq_api_key
```

Setelah env var ditambahkan, redeploy project agar nilai tersebut masuk ke build Vite.

## Security Note

Project ini memakai `VITE_GROQ_API_KEY` langsung di client karena cocok untuk demo lokal/praktikum. Ini **tidak aman untuk production**, karena Vite akan mengekspos nilai env client-side ke browser bundle. Untuk production, pindahkan request Groq ke backend/API route agar API key tetap rahasia.
