'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface AttachedFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string | Date;
  streamContent?: string;
  files?: AttachedFile[];
}

function formatTime(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

const markdownComponents: Components = {
  strong: ({ children }) => (
    <strong className="font-semibold text-emerald-300">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-emerald-200">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  h1: ({ children }) => (
    <h1 className="text-lg font-bold my-3 text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold my-2 text-white">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-[15px] font-bold my-2 text-white">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-1.5 leading-relaxed">{children}</p>
  ),
  hr: () => (
    <hr className="my-3 border-white/10" />
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-white/8 text-emerald-300 text-sm font-mono">
          {children}
        </code>
      );
    }
    return (
      <pre className="my-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-x-auto">
        <code className="text-sm font-mono text-gray-200">{children}</code>
      </pre>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="my-3 pl-4 border-l-2 border-emerald-500/30 text-gray-300 italic">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-emerald-400 hover:text-emerald-500 transition-colors"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-sm border border-white/[0.06] rounded-xl overflow-hidden">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 bg-white/[0.04] text-white font-semibold text-left border-b border-white/[0.06]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-b border-white/[0.04] text-gray-300">
      {children}
    </td>
  ),
};

export default function ChatMessage({ role, content, timestamp, streamContent, files }: ChatMessageProps) {
  const isUser = role === 'user';
  const isStreaming = streamContent !== undefined;
  const displayText = isStreaming ? streamContent : content;

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
      )}

      <div className={`max-w-[78%] sm:max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-3 text-[15px] leading-relaxed ${
            isUser
              ? 'msg-user text-white rounded-2xl rounded-tr-sm shadow-lg'
              : 'msg-assistant text-gray-200 border border-white/[0.06] rounded-2xl rounded-tl-sm shadow-sm shadow-[0_0_0_1px_rgba(255,255,255,0.03)]'
          }`}
        >
          {isUser ? (
            <>
              {files && files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 text-white/80 text-xs"
                    >
                      {f.mimeType.startsWith('image/') ? (
                        <img
                          src={`data:${f.mimeType};base64,${f.data}`}
                          alt={f.name}
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-white/50">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      )}
                      <span className="truncate max-w-[120px]">{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap">{displayText}</p>
            </>
          ) : (
            <div className="[&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {displayText}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-[2px] h-[1em] ml-0.5 bg-emerald-500 animate-pulse align-middle" />
              )}
            </div>
          )}
        </div>
        <span className={`text-[11px] text-white/25 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(timestamp)}
        </span>
      </div>

      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-white flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
