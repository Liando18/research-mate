'use client';

import FileUploadBar, { type AttachedFile } from './FileUploadBar';
import AudioRecorder from './AudioRecorder';

export default function InputArea({
  input,
  onInputChange,
  onKeyDown,
  onSend,
  isTyping,
  attachedFiles,
  setAttachedFiles,
  onError,
  inputRef,
  handleSend,
}: {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  isTyping: boolean;
  attachedFiles: AttachedFile[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  onError: (msg: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleSend: (text: string) => void;
}) {
  return (
    <footer className="border-t border-white/[0.04]">
      <div className="px-4 sm:px-6 py-3 sm:py-4 max-w-3xl mx-auto">
        <FileUploadBar
          files={attachedFiles}
          onAdd={(newFiles) => setAttachedFiles((prev) => [...prev, ...newFiles])}
          onRemove={(id) => setAttachedFiles((prev) => prev.filter((f) => f.id !== id))}
          onError={(msg) => onError(msg)}
        />
        <div className="flex items-end gap-2.5">
          <button
            onClick={() => document.getElementById('file-trigger')?.click()}
            disabled={isTyping}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/[0.03] text-white/50 hover:bg-white/10 border border-white/[0.06] flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Lampirkan file"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <input
            id="file-trigger"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.webm"
            onChange={async (e) => {
              const picked = Array.from(e.target.files || []);
              if (picked.length === 0) return;

              const maxFiles = 3;
              const imageMax = 1048576;
              const docMax = 5242880;
              const errors: string[] = [];
              const valid: File[] = [];

              if (attachedFiles.length + picked.length > maxFiles) {
                errors.push(`Maksimal ${maxFiles} file dalam satu waktu`);
                onError(errors.join('. '));
                if (e.target) e.target.value = '';
                return;
              }

              for (const file of picked) {
                const maxSize = file.type.startsWith('image/') ? imageMax : docMax;
                if (file.size > maxSize) {
                  const label = file.type.startsWith('image/') ? 'Gambar' : 'File';
                  const limit = file.type.startsWith('image/') ? '1 MB' : '5 MB';
                  errors.push(`${label} ${file.name} melebihi batas ${limit}`);
                  continue;
                }
                valid.push(file);
              }

              if (errors.length > 0) {
                onError(errors.join('. '));
              }

              const processed: AttachedFile[] = [];
              for (const file of valid) {
                const base64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve((reader.result as string).split(',')[1]);
                  reader.onerror = () => reject(new Error('Gagal membaca file'));
                  reader.readAsDataURL(file);
                });
                processed.push({
                  id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                  name: file.name,
                  mimeType: file.type,
                  size: file.size,
                  data: base64,
                });
              }

              setAttachedFiles((prev) => [...prev, ...processed]);
              if (e.target) e.target.value = '';
            }}
            className="hidden"
          />
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder="Tanya apa pun..."
              disabled={isTyping}
              className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.03] text-white/80 placeholder:text-white/20 border border-white/[0.06] focus:outline-none focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 transition-all disabled:opacity-50 input-glow"
            />
          </div>
          <AudioRecorder
            onTranscript={(text) => {
              const newVal = input + (input ? ' ' : '') + text;
              onInputChange({ target: { value: newVal } } as React.ChangeEvent<HTMLInputElement>);
            }}
            onError={(msg) => onError(msg)}
            disabled={isTyping}
          />
          <button
            onClick={onSend}
            disabled={(!input.trim() && attachedFiles.length === 0) || isTyping}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/[0.05] disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:shadow-none btn-glow"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-[11px] text-white/15 text-center mt-2.5">
  &copy; {new Date().getFullYear()} ResearchMate by Aprilian Gevindo, M.Kom
</p>
      </div>
    </footer>
  );
}
