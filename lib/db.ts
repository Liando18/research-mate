import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'researchmate-files';
const STORE_NAME = 'files';
const EXPIRY_MS = 24 * 60 * 60 * 1000;

interface StoredFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  data: string;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function storeFile(file: StoredFile): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, file);
}

export async function getFile(id: string): Promise<StoredFile | undefined> {
  const db = await getDb();
  return db.get(STORE_NAME, id);
}

export async function getAllFiles(): Promise<StoredFile[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function removeFile(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

export async function clearExpired(): Promise<void> {
  const db = await getDb();
  const all = await db.getAll(STORE_NAME);
  const now = Date.now();
  for (const file of all) {
    if (now - file.timestamp > EXPIRY_MS) {
      await db.delete(STORE_NAME, file.id);
    }
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'audio/mp3': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  'audio/webm': ['.webm'],
};

export function isAcceptedType(mimeType: string): boolean {
  return mimeType in ACCEPTED_TYPES;
}

export function getAcceptString(): string {
  return Object.entries(ACCEPTED_TYPES)
    .map(([mime, exts]) => `${mime},${exts.join(',')}`)
    .join(',');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
