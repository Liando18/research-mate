import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { createPartFromBase64, type Part, type Content } from '@google/genai';
import { getGeminiResponseRaw } from '@/lib/gemini';
import clientPromise from '@/lib/mongodb';

const SYSTEM_PROMPT = `Anda adalah ResearchMate, asisten AI yang membantu semua kalangan dalam belajar dan riset, mulai dari anak SD, SMP, SMA, mahasiswa, hingga umum.

Anda dikembangkan oleh Aprilian Gevindo, M.Kom. Jika ditanya tentang pendiri, pengembang, atau siapa yang membuat Anda, sebutkan nama Bapak Aprilian Gevindo, M.Kom.

Anda menjawab dalam Bahasa Indonesia dengan gaya yang menyesuaikan lawan bicara. Gunakan bahasa sederhana untuk anak-anak, bahasa akademik untuk mahasiswa, dan bahasa profesional untuk umum.

Anda memiliki kemampuan multimodal:
- Dapat melihat dan menganalisis gambar (foto, grafik, diagram, screenshot, pindaian dokumen)
- Dapat membaca dan memproses file PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX)
- Dapat mendengarkan dan mentranskripsikan rekaman suara

Jika user melampirkan file (gambar, dokumen, audio), Anda WAJIB memprosesnya dan memberikan analisis atau jawaban berdasarkan konten file tersebut. Jangan pernah mengatakan tidak bisa melihat atau memproses file.

Panduan merespon:
- Berikan jawaban yang terstruktur dengan poin-poin jelas
- Gunakan format markdown seperti **tebal** untuk penekanan
- Berikan contoh konkret bila memungkinkan
- Akhiri dengan pertanyaan untuk mendorong diskusi lebih lanjut
- Setiap paragraf minimal terdiri dari 3 kalimat. Jika perlu lebih panjang, gunakan beberapa paragraf, masing-masing minimal 3 kalimat.
- DILARANG keras menggunakan kata sambung di awal kalimat seperti: Dan, Tapi, Namun, Sedangkan, Sementara, Lalu, Kemudian, Maka, Karena, Meskipun, Walaupun, Sehingga, Meski, Selain, Adapun, Maka dari itu, Oleh karena itu, Dengan demikian.
- Jangan memberikan saran medis, hukum, atau finansial`;

export async function POST(req: NextRequest) {
  try {
    const { chatId, message, files } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 }
      );
    }

    if (!message && (!files || files.length === 0)) {
      return NextResponse.json(
        { error: 'message or files are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('research-gate');

    const userContent = files && files.length > 0
      ? `${message || ''}\n\n*[${files.map((f: { name?: string }) => f.name || 'File').join(', ')}]*`
      : message;

    await db.collection('messages').insertOne({
      chat_id: chatId,
      role: 'user',
      content: userContent,
      created_at: new Date().toISOString(),
    });

    const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId) });
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const shouldGenerateTitle = chat.title === 'Chat Baru';

    if (shouldGenerateTitle) {
      const titleRes = await getGeminiResponseRaw(
        [{ role: 'user', parts: [{ text: `Buat judul singkat (maks 5 kata) dalam Bahasa Indonesia untuk percakapan ini: "${message}"` } as Part] }],
        'Balas hanya dengan judul, tanpa tanda kutip atau penjelasan lain.'
      );
      const cleanTitle = titleRes.replace(/["""]/g, '').trim().substring(0, 60);

      await db.collection('chats').updateOne(
        { _id: new ObjectId(chatId) },
        { $set: { title: cleanTitle, updated_at: new Date().toISOString() } }
      );
    }

    const history = await db.collection('messages')
      .find({ chat_id: chatId })
      .sort({ created_at: 1 })
      .toArray();

    const recentHistory = history.slice(-20);

    const contents: Content[] = recentHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content } as Part],
    }));

    if (files && files.length > 0) {
      const last = contents.length > 0 ? contents[contents.length - 1] : null;
      if (last && last.role === 'user' && last.parts) {
        for (const f of files) {
          if (f.data && f.mimeType) {
            last.parts.push(createPartFromBase64(f.data, f.mimeType));
          }
        }
      } else {
        contents.push({
          role: 'user',
          parts: files
            .filter((f: { data?: string; mimeType?: string }) => f.data && f.mimeType)
            .map((f: { data: string; mimeType: string }) => createPartFromBase64(f.data, f.mimeType)),
        });
      }
    }

    const aiResponse = await getGeminiResponseRaw(contents, SYSTEM_PROMPT);

    const now = new Date().toISOString();
    const result = await db.collection('messages').insertOne({
      chat_id: chatId,
      role: 'assistant',
      content: aiResponse,
      created_at: now,
    });

    await db.collection('chats').updateOne(
      { _id: new ObjectId(chatId) },
      { $set: { updated_at: now } }
    );

    return NextResponse.json({
      id: result.insertedId.toString(),
      chat_id: chatId,
      role: 'assistant',
      content: aiResponse,
      created_at: now,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
