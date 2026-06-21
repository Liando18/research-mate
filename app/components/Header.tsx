'use client';

export default function Header({
  sidebarOpen,
  onToggleSidebar,
  hasSession,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  hasSession: boolean;
}) {
  return (
    <header className="glass-strong border-b border-white/[0.04]">
      <div className="flex items-center gap-2 px-4 sm:px-5 h-14">
        <button
          type="button"
          title={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
        >
          {sidebarOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">ResearchMate</span>
        </div>

        {hasSession && (
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/40 font-medium">Sesi Aktif</span>
          </div>
        )}

        <div className="flex-1" />
      </div>
    </header>
  );
}
