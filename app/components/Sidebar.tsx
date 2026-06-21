'use client';

import { useState, useMemo } from 'react';

interface ChatItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  activeChatId: string | null;
  chats: ChatItem[];
  loading?: boolean;
}

function groupByDate(items: ChatItem[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, ChatItem[]> = {};

  items.forEach((item) => {
    const d = new Date(item.updated_at);
    let label: string;
    if (d >= today) label = 'Hari Ini';
    else if (d >= yesterday) label = 'Kemarin';
    else if (d >= weekAgo) label = '7 Hari';
    else label = 'Lama';

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });

  return groups;
}

function SidebarContent({ onClose, onNewChat, onSelectChat, activeChatId, chats, loading }: Omit<SidebarProps, 'isOpen'>) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = useMemo(() => {
    const groups = groupByDate(chats);
    return Object.entries(groups).reduce((acc, [date, items]) => {
      const filtered = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) acc[date] = filtered;
      return acc;
    }, {} as Record<string, ChatItem[]>);
  }, [chats, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="text-base font-semibold text-white tracking-tight">ResearchMate</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="px-3 pt-3 pb-1.5">
        <button
          onClick={onNewChat}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium transition-all border border-emerald-500/10 disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Chat Baru
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari percakapan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white/[0.03] text-white/80 placeholder:text-white/20 border border-white/[0.06] focus:outline-none focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full typing-dot" />
            </div>
          </div>
        ) : Object.keys(filteredGroups).length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-sm text-white/30">Belum ada percakapan</p>
            <p className="text-xs text-white/20 mt-1">Mulai chat baru untuk memulai</p>
          </div>
        ) : (
          Object.entries(filteredGroups).map(([date, items], gi) => (
            <div key={date} className={gi > 0 ? 'mt-3' : ''}>
              <p className="px-2 py-1.5 text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                {date}
              </p>
              {items.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-all duration-150 group ${
                    activeChatId === chat.id
                      ? 'bg-emerald-500/8 border-emerald-500/15 border'
                      : 'hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 flex-shrink-0 ${
                      activeChatId === chat.id
                        ? 'text-emerald-400'
                        : 'text-white/25'
                    }`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${
                        activeChatId === chat.id
                          ? 'text-emerald-300 font-medium'
                          : 'text-white/80 font-medium'
                      }`}>
                        {chat.title}
                      </p>
                      <p className="text-[11px] text-white/30 mt-0.5">
                        {new Date(chat.updated_at).toLocaleDateString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="px-3 py-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03]">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[11px] font-bold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/80 truncate">Pengguna Umum</p>
            <p className="text-[11px] text-white/30">ResearchMate</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  const { isOpen, onClose } = props;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`w-72 bg-[#0c0c18] border-r border-white/[0.04] flex-col fixed inset-y-0 left-0 z-40 ${
        isOpen ? 'flex' : 'hidden'
      } lg:hidden h-full overflow-hidden`}>
        <SidebarContent {...props} />
      </aside>

      <aside className={`w-72 bg-[#0c0c18] border-r border-white/[0.04] flex-col flex-shrink-0 ${
        isOpen ? 'lg:flex' : 'lg:hidden'
      } hidden h-full overflow-hidden`}>
        <SidebarContent {...props} />
      </aside>
    </>
  );
}
