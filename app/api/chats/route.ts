import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('research-gate');
    const chats = await db.collection('chats')
      .find({})
      .sort({ updated_at: -1 })
      .toArray();

    const mapped = chats.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch chats', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db('research-gate');
    const now = new Date().toISOString();

    const result = await db.collection('chats').insertOne({
      title: 'Chat Baru',
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json({
      id: result.insertedId.toString(),
      title: 'Chat Baru',
      created_at: now,
      updated_at: now,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create chat', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
