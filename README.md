# ResearchMate

**ResearchMate** adalah asisten AI berbasis web yang dirancang untuk membantu semua kalangan — dari anak SD, SMP, SMA, mahasiswa, hingga umum — dalam proses belajar dan riset. Dibangun dengan pendekatan modern, responsif, dan ramah pengguna.

Dibuat oleh **Aprilian Gevindo, M.Kom**.

---

## Fitur Utama

- **Chat dengan AI** — Mengirim pesan dan mendapatkan respons dari model AI (Google Gemini 2.5 Flash)
- **Streaming respons** — Teks AI muncul secara bertahap seperti mengetik real-time
- **Upload file** — Lampirkan gambar, dokumen, atau audio ke dalam chat (gambar max 1 MB, dokumen/audio max 5 MB, maksimal 3 file per pesan)
- **Rekaman audio** — Gunakan microphone untuk input suara (Web Speech API, bahasa Indonesia)
- **Riwayat chat** — Semua percakapan tersimpan dan bisa diakses kembali
- **Sidebar** — Daftar percakapan yang terkelompok berdasarkan tanggal, lengkap dengan pencarian
- **Tampilan dark mode** — Sepenuhnya gelap dengan aksen hijau dan putih, modern dan profesional

---

## Arsitektur & Struktur Folder

```
chatbot-ai/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # API untuk mengirim pesan AI (Gemini)
│   │   └── chats/
│   │       ├── route.ts           # API CRUD daftar chat
│   │       └── [id]/route.ts      # API untuk chat individual (GET/DELETE/PATCH)
│   ├── components/
│   │   ├── AudioRecorder.tsx      # Perekam suara via Web Speech API
│   │   ├── ChatMessage.tsx        # Tampilan satu pesan (markdown + file)
│   │   ├── ChatMessages.tsx       # Daftar pesan + typing indicator
│   │   ├── FileUploadBar.tsx      # Bar upload file (gambar/dokumen/audio)
│   │   ├── Header.tsx             # Header dengan toggle sidebar
│   │   ├── InputArea.tsx          # Input teks + tombol send + copyright
│   │   ├── Sidebar.tsx            # Sidebar riwayat chat + pencarian
│   │   └── WelcomeScreen.tsx      # Layar awal dengan 6 prompt cards
│   ├── globals.css                # Tailwind CSS global styles
│   ├── layout.tsx                 # Layout root (metadata, font)
│   ├── page.tsx                   # Halaman utama (state management utama)
│   └── providers.tsx              # Theme provider
├── lib/
│   ├── db.ts                     # Helper database untuk kueri MongoDB
│   ├── gemini.ts                  # Integrasi Google Gemini AI
│   ├── mongodb.ts                 # Koneksi MongoDB (client singleton)
│   └── types.ts                   # TypeScript shared types
├── scripts/
│   └── migrate.mjs               # Migrasi data dari Supabase ke MongoDB
├── types/
│   └── dom.d.ts                   # TypeScript declarations untuk Web Speech API
├── public/                        # Assets statis
├── .env.local                     # Environment variables (GEMINI_API_KEY, MONGODB_URI)
├── next.config.ts                 # Next.js konfigurasi
├── tailwind.config.ts             # Tailwind CSS konfigurasi
└── package.json
```

### Penjelasan Alur Data

1. Pengguna mengetik pesan atau mengirim file melalui **InputArea**
2. `page.tsx` mengirim request ke `POST /api/chat`
3. Backend memanggil **Gemini API** dengan konteks pesan sebelumnya
4. Respons AI dikembalikan dan disimpan ke **MongoDB**
5. Chat messages ditampilkan melalui komponen **ChatMessages** dan **ChatMessage**
6. Riwayat chat dikelola di sidebar melalui `GET /api/chats`

### Database

- **MongoDB Atlas** — database cloud `research-gate`
  - Collection `chats` — menyimpan sesi percakapan
  - Collection `messages` — menyimpan setiap pesan dalam chat

---

## Tech Stack

| Teknologi         | Keterangan                              |
| ----------------- | --------------------------------------- |
| **Next.js**       | Framework React (App Router)             |
| **React**         | UI library                              |
| **TypeScript**    | Type safety                             |
| **Tailwind CSS**  | Styling utility-first                   |
| **MongoDB**       | Database NoSQL                          |
| **Google Gemini** | AI model (`gemini-2.5-flash`)           |
| **Web Speech API**| Speech-to-text (input suara)            |
| **react-markdown**| Render markdown dari respons AI         |

---

## Lisensi

Hak cipta © 2026 Aprilian Gevindo, M.Kom.

AI dapat melakukan kesalahan. Harap verifikasi informasi penting secara mandiri.
