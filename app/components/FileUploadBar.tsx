'use client';

import { useCallback, useRef } from 'react';

interface AttachedFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data: string;
}

interface FileUploadBarProps {
  files: AttachedFile[];
  onAdd: (files: AttachedFile[]) => void;
  onRemove: (id: string) => void;
  onError?: (msg: string) => void;
}

const MAX_FILES = 3;
const IMAGE_MAX_SIZE = 1048576;
const DOC_MAX_SIZE = 5242880;

function getMaxSize(mime: string): number {
  return mime.startsWith('image/') ? IMAGE_MAX_SIZE : DOC_MAX_SIZE;
}

function validateFiles(files: File[], currentCount: number): { valid: File[]; errors: string[] } {
  const errors: string[] = [];
  const valid: File[] = [];

  if (currentCount + files.length > MAX_FILES) {
    errors.push(`Maksimal ${MAX_FILES} file dalam satu waktu`);
    return { valid, errors };
  }

  for (const file of files) {
    const maxSize = getMaxSize(file.type);
    if (file.size > maxSize) {
      const label = file.type.startsWith('image/') ? 'Gambar' : 'File';
      const limit = file.type.startsWith('image/') ? '1 MB' : '5 MB';
      errors.push(`${label} ${file.name} melebihi batas ${limit}`);
      continue;
    }
    valid.push(file);
  }

  return { valid, errors };
}

const MIME_ICONS: Record<string, string> = {
  'application/pdf': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  'application/msword': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  'image': 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z M14 2v6h6 M10 12l-2 2 4 4 4-4-2-2 M10 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
};

function getMimeIcon(mime: string): string {
  if (mime.startsWith('image/')) return MIME_ICONS['image'];
  if (mime.startsWith('audio/')) return 'M9 18V5l12-2v13 M6 10l-3 2v4l3 2 M18 12a3 3 0 0 0-3-3';
  return MIME_ICONS[mime] || MIME_ICONS['application/pdf'];
}

function getTypeColor(mime: string): string {
  if (mime === 'application/pdf') return 'dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-600 dark:border-red-500/10 border-red-200';
  if (mime.startsWith('image/')) return 'dark:bg-blue-500/10 bg-blue-50 dark:text-blue-400 text-blue-600 dark:border-blue-500/10 border-blue-200';
  if (mime.startsWith('audio/')) return 'dark:bg-purple-500/10 bg-purple-50 dark:text-purple-400 text-purple-600 dark:border-purple-500/10 border-purple-200';
  if (mime.includes('word')) return 'dark:bg-blue-500/10 bg-blue-50 dark:text-blue-400 text-blue-600 dark:border-blue-500/10 border-blue-200';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'dark:bg-orange-500/10 bg-orange-50 dark:text-orange-400 text-orange-600 dark:border-orange-500/10 border-orange-200';
  return 'dark:bg-gray-500/10 bg-gray-50 dark:text-gray-400 text-gray-600 dark:border-gray-500/10 border-gray-200';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export type { AttachedFile };

export default function FileUploadBar({ files, onAdd, onRemove, onError }: FileUploadBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    const { valid, errors } = validateFiles(picked, files.length);

    if (errors.length > 0 && onError) {
      onError(errors.join('. '));
    }

    if (valid.length === 0) {
      if (inputRef.current) inputRef.current.value = '';
      return;
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

    onAdd(processed);
    if (inputRef.current) inputRef.current.value = '';
  }, [onAdd, onError, files.length]);

  if (files.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 max-w-3xl mx-auto w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${getTypeColor(file.mimeType)}`}
          >
            {file.mimeType.startsWith('image/') ? (
              <div className="w-7 h-7 rounded overflow-hidden flex-shrink-0 dark:bg-white/5 bg-gray-100">
                <img
                  src={`data:${file.mimeType};base64,${file.data}`}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d={getMimeIcon(file.mimeType)} />
              </svg>
            )}
            <span className="font-medium truncate max-w-[120px] sm:max-w-[180px]">{file.name}</span>
            <span className="opacity-60 flex-shrink-0">{formatSize(file.size)}</span>
            <button
              onClick={() => onRemove(file.id)}
              className="ml-0.5 p-0.5 rounded hover:dark:bg-white/10 hover:bg-black/10 opacity-60 hover:opacity-100 transition-all flex-shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.webm"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
