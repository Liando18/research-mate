import { GoogleGenAI, createPartFromBase64, type Part, type Content } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-2.5-flash-lite';

export interface FilePart {
  mimeType: string;
  data: string;
}

export async function getGeminiResponse(
  messages: Array<{ role: string; content: string }>,
  systemInstruction?: string,
  files?: FilePart[]
): Promise<string> {
  const contents: Content[] = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content } as Part],
  }));

  const last = contents.length > 0 ? contents[contents.length - 1] : null;

  if (files && files.length > 0) {
    if (last && last.role === 'user' && last.parts) {
      for (const file of files) {
        if (file.data && file.mimeType) {
          last.parts.push(createPartFromBase64(file.data, file.mimeType));
        }
      }
    } else {
      contents.push({
        role: 'user',
        parts: files
          .filter((f) => f.data && f.mimeType)
          .map((f) => createPartFromBase64(f.data, f.mimeType)),
      });
    }
  }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      topP: 0.95,
      systemInstruction: systemInstruction || undefined,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  return text;
}

export async function getGeminiResponseRaw(
  contents: Content[],
  systemInstruction?: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      topP: 0.95,
      systemInstruction: systemInstruction || undefined,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  return text;
}
