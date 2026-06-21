import pkg from 'pg';
const { Client } = pkg;
import { readFileSync, existsSync } from 'fs';

const DOTENV = '.env.local';
if (existsSync(DOTENV)) {
  const lines = readFileSync(DOTENV, 'utf-8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PROJECT_REF = SUPABASE_URL?.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

const sql = `
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Chat Baru',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_chat_id_idx ON messages(chat_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(chat_id, created_at);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chats' AND policyname = 'chats_all') THEN
    CREATE POLICY "chats_all" ON chats FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_all') THEN
    CREATE POLICY "messages_all" ON messages FOR ALL USING (true);
  END IF;
END $$;
`;

async function tryConnect(connString, label) {
  console.log(`\nMencoba koneksi: ${label}...`);
  const client = new Client({ connectionString: connString, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    console.log('Terhubung!');
    return client;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`Gagal: ${msg}`);
    try { await client.end(); } catch {}
    return null;
  }
}

async function migrate() {
  if (!DB_PASSWORD) {
    console.error('\nSUPABASE_DB_PASSWORD belum diatur di .env.local');
    process.exit(1);
  }
  if (!PROJECT_REF) {
    console.error('NEXT_PUBLIC_SUPABASE_URL tidak valid di .env.local');
    process.exit(1);
  }

  const urls = [
    { label: `Pooler (${PROJECT_REF}.supabase.co:6543)`, ssl: true,
      conn: `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@${PROJECT_REF}.supabase.co:6543/postgres?pgbouncer=true&sslmode=require` },
    { label: `Direct (db.${PROJECT_REF}.supabase.co:5432)`, ssl: true,
      conn: `postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres?sslmode=require` },
  ];

  let client = null;
  for (const url of urls) {
    client = await tryConnect(url.conn, url.label);
    if (client) break;
  }

  if (!client) {
    console.error('\nTidak bisa terhubung ke database.');
    console.error('\nPastikan:');
    console.error(`  1. SUPABASE_DB_PASSWORD di .env.local sudah benar`);
    console.error('  2. IP server anda diizinkan di Supabase (Project Settings > Database > IP Restrictions)');
    console.error('  3. Atau jalankan SQL manual di Supabase Dashboard > SQL Editor\n');
    console.error('SQL untuk dijalankan manual:');
    console.error('─'.repeat(50));
    console.error(sql);
    console.error('─'.repeat(50));
    process.exit(1);
  }

  try {
    console.log('Menjalankan migrasi...');
    await client.query(sql);
    console.log('Migrasi berhasil! Tabel chats dan messages sudah dibuat.');
  } catch (err) {
    console.error('Migrasi gagal:', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
