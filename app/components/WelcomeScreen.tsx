'use client';

const suggestedPrompts = [
  {
    id: 1,
    title: "Rekomendasi Judul",
    text: "Bantu saya menentukan judul skripsi/penelitian yang menarik",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
  },
  {
    id: 2,
    title: "Bantu Tugas",
    text: "Tolong bantu saya mengerjakan tugas tentang sistem tata surya",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
  },
  {
    id: 3,
    title: "Belajar Matematika",
    text: "Jelaskan rumus luas dan keliling lingkaran dengan contoh soal",
    icon: "M4 6h16M4 12h16M4 18h16"
  },
  {
    id: 4,
    title: "Buat Artikel",
    text: "Bantu saya menulis artikel ilmiah populer tentang dampak media sosial pada remaja",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
  },
  {
    id: 5,
    title: "Skripsi/Tesis",
    text: "Bagaimana cara menentukan latar belakang masalah yang baik untuk skripsi?",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
  },
  {
    id: 6,
    title: "Bahasa Inggris",
    text: "Bantu saya belajar tenses bahasa Inggris untuk pemula dengan contoh kalimat",
    icon: "M3 5h12M9 3v2m0 4v2m0 4v2M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
  },
];

export default function WelcomeScreen({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 sm:px-6 py-8">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl w-full mx-auto text-center relative">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/8 text-emerald-400 mb-6 border border-emerald-500/10 animate-breathe">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>

        <h1 className="text-[28px] sm:text-[34px] font-bold text-white tracking-tight mb-1.5">
          ResearchMate
        </h1>
        <p className="text-base sm:text-lg text-white/50 mb-1 font-medium">
          Asisten Belajar & Riset AI
        </p>
        <p className="text-sm text-white/30 max-w-md mx-auto mb-8 leading-relaxed">
          Dari siswa, mahasiswa, hingga penelitian tingkat lanjut. Tanya apa pun tentang tugas sekolah, 
          skripsi, artikel, atau materi pelajaran. Saya siap membantu!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => onSend(prompt.text)}
              className="group text-left p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-all duration-200 card-glow"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={prompt.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white/90 group-hover:text-emerald-300 transition-colors">
                    {prompt.title}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed line-clamp-2">
                    {prompt.text}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
