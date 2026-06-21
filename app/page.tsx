'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import ChatMessages from './components/ChatMessages';
import InputArea from './components/InputArea';
import { ThemeProvider, useTheme } from './providers';
import type { AttachedFile } from './components/FileUploadBar';

interface MessageItem {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  files?: Array<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
    data: string;
  }>;
}

interface ChatItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

function HomeContent() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [streamMap, setStreamMap] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);
  const streamIntervals = useRef<Record<string, NodeJS.Timeout>>({});
  const userScrolledUpRef = useRef(false);
  useTheme();

  useEffect(() => {
    if (window.innerWidth >= 1024) setSidebarOpen(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/chats');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setChats(data);
        }
      } catch {
        // silent
      }
      if (!cancelled) setSidebarLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(streamIntervals.current).forEach(clearInterval);
      streamIntervals.current = {};
    };
  }, []);

  useEffect(() => {
    if (!userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, streamMap]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => {
      const threshold = 100;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      userScrolledUpRef.current = !atBottom;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [sidebarOpen]);

  const refreshChats = useCallback(async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch {
      // silent
    }
  }, []);

  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if ((!trimmed && attachedFiles.length === 0) || isTyping) return;

    let chatId = activeChatId;

    if (!chatId) {
      try {
        const res = await fetch('/api/chats', { method: 'POST' });
        if (!res.ok) throw new Error('Failed to create chat');
        const chat = await res.json();
        chatId = chat.id;
        setActiveChatId(chatId);
        setChats((prev) => [chat, ...prev]);
      } catch {
        setError('Gagal membuat chat baru');
        return;
      }
    }

    if (!chatId) return;

    setInput('');
    setIsTyping(true);
    setError(null);

    const filesPayload = attachedFiles.length > 0 ? attachedFiles.map((f) => ({
      mimeType: f.mimeType,
      data: f.data,
      name: f.name,
    })) : undefined;

    const messageFiles = attachedFiles.length > 0 ? attachedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size,
      data: f.data,
    })) : undefined;

    idCounter.current += 1;
    const tempUserMsg: MessageItem = {
      id: `temp-${idCounter.current}`,
      chat_id: chatId,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
      files: messageFiles,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setAttachedFiles([]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: trimmed, files: filesPayload }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal mendapatkan respons');
      }

      const assistantMsg: MessageItem = await res.json();
      setMessages((prev) => [...prev, assistantMsg]);
      refreshChats();

      const words = assistantMsg.content.split(' ');
      let wi = 0;
      setStreamMap((prev) => ({ ...prev, [assistantMsg.id]: '' }));

      const interval = setInterval(() => {
        wi++;
        if (wi >= words.length) {
          clearInterval(interval);
          delete streamIntervals.current[assistantMsg.id];
          setStreamMap((prev) => {
            const next = { ...prev };
            delete next[assistantMsg.id];
            return next;
          });
        } else {
          setStreamMap((prev) => ({
            ...prev,
            [assistantMsg.id]: words.slice(0, wi).join(' '),
          }));
        }
      }, 20);
      streamIntervals.current[assistantMsg.id] = interval;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsTyping(false);
    }
  }, [activeChatId, isTyping, refreshChats, attachedFiles]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleNewChat = useCallback(async () => {
    Object.values(streamIntervals.current).forEach(clearInterval);
    streamIntervals.current = {};
    setStreamMap({});
    setMessages([]);
    setActiveChatId(null);
    setInput('');
    setError(null);
    setAttachedFiles([]);
    inputRef.current?.focus();
  }, []);

  const handleSelectChat = useCallback(async (id: string) => {
    Object.values(streamIntervals.current).forEach(clearInterval);
    streamIntervals.current = {};
    setStreamMap({});
    setActiveChatId(id);
    setMessages([]);
    setMessagesLoading(true);
    setError(null);
    setAttachedFiles([]);
    try {
      const res = await fetch(`/api/chats/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        setError('Gagal memuat pesan');
      }
    } catch {
      setError('Gagal memuat pesan');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex h-screen bg-[#080810] overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        activeChatId={activeChatId}
        chats={chats}
        loading={sidebarLoading}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          hasSession={messages.length > 0}
        />

        <main ref={mainRef} className="flex-1 overflow-y-auto">
          {error && (
            <div className="px-4 sm:px-6 pt-4 max-w-3xl mx-auto">
              <div className="p-3 rounded-xl bg-red-500/8 border-red-500/10 border text-sm text-red-400">
                {error}
              </div>
            </div>
          )}

          {messagesLoading ? (
            <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className={`w-8 h-8 rounded-xl flex-shrink-0 mt-1 ${i % 2 === 0 ? 'bg-emerald-500/10' : 'bg-white/[0.04]'}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`p-5 rounded-2xl ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-emerald-500/3'} border border-white/[0.04]`}>
                      <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                      <div className="h-3 bg-white/[0.06] rounded w-1/2 mt-3" />
                      <div className="h-3 bg-white/[0.06] rounded w-5/6 mt-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 && !error ? (
            <WelcomeScreen onSend={handleSend} />
          ) : (
            <ChatMessages
              messages={messages}
              streamMap={streamMap}
              isTyping={isTyping}
              messagesEndRef={messagesEndRef}
            />
          )}
        </main>

        <InputArea
          input={input}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSend={() => handleSend(input)}
          isTyping={isTyping}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
          onError={setError}
          inputRef={inputRef}
          handleSend={handleSend}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}
