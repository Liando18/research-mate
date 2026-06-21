'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioRecorderProps {
  onTranscript: (text: string) => void;
  onError: (msg: string) => void;
  disabled?: boolean;
}

export default function AudioRecorder({ onTranscript, onError, disabled }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* silent */ }
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError('Browser Anda tidak mendukung input suara. Gunakan Chrome atau Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        onError('Tidak ada suara yang terdeteksi. Silakan coba lagi.');
      } else if (event.error === 'not-allowed') {
        onError('Izin mikrofon ditolak. Izinkan akses mikrofon di pengaturan browser.');
      } else {
        onError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch {
      onError('Gagal memulai perekaman suara.');
    }
  }, [onTranscript, onError]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* silent */ }
      recognitionRef.current = null;
    }
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [recording, startRecording, stopRecording]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm ${
        recording
          ? 'bg-red-500 text-white shadow-md animate-pulse'
          : 'bg-white/[0.03] text-white/60 hover:bg-white/10 border border-white/[0.06]'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
      title={recording ? 'Hentikan rekaman' : 'Rekam suara'}
    >
      {recording ? (
        <span className="text-[10px] font-bold tabular-nums">{formatTime(elapsed)}</span>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )}
    </button>
  );
}
