'use client';

import ChatMessage from './ChatMessage';

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

export default function ChatMessages({
  messages,
  streamMap,
  isTyping,
  messagesEndRef,
}: {
  messages: MessageItem[];
  streamMap: Record<string, string>;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          role={msg.role}
          content={msg.content}
          timestamp={msg.created_at}
          streamContent={streamMap[msg.id]}
          files={msg.files}
        />
      ))}

      {isTyping && (
        <div className="flex gap-3 animate-fade-in">
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
          <div className="msg-assistant text-gray-400 border border-white/[0.06] rounded-2xl rounded-tl-sm shadow-sm px-5 py-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full typing-dot" />
              <span className="w-2 h-2 bg-emerald-400 rounded-full typing-dot" />
              <span className="w-2 h-2 bg-emerald-400 rounded-full typing-dot" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
