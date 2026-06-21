import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db('research-gate');

    const chat = await db.collection('chats').findOne({ _id: new ObjectId(id) });
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const messages = await db.collection('messages')
      .find({ chat_id: id })
      .sort({ created_at: 1 })
      .toArray();

    const mappedMessages = messages.map((m) => ({
      id: m._id.toString(),
      chat_id: m.chat_id,
      role: m.role,
      content: m.content,
      created_at: m.created_at,
    }));

    return NextResponse.json({
      id: chat._id.toString(),
      title: chat.title,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      messages: mappedMessages,
    });
  } catch {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db('research-gate');

    await db.collection('chats').deleteOne({ _id: new ObjectId(id) });
    await db.collection('messages').deleteMany({ chat_id: id });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db('research-gate');

    const result = await db.collection('chats').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { title: body.title, updated_at: new Date().toISOString() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: result._id.toString(),
      title: result.title,
      created_at: result.created_at,
      updated_at: result.updated_at,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}
