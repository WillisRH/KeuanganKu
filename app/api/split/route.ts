import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: 'Nama item/makanan' },
          price: { type: Type.NUMBER, description: 'Harga per unit' },
          quantity: { type: Type.NUMBER, description: 'Jumlah unit' },
          assigned_to: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'Daftar nama orang yang memesan item ini (jika terdeteksi di teks)' 
          },
        },
        required: ['item', 'price', 'quantity'],
      },
    },
    tax: { type: Type.NUMBER, description: 'Total pajak/PPN jika tertera' },
    service: { type: Type.NUMBER, description: 'Total service charge jika tertera' },
  },
  required: ['items'],
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const description = formData.get('description') as string;

    if (files.length === 0 && !description) {
      return NextResponse.json({ error: 'No media or description provided' }, { status: 400 });
    }

    const parts: any[] = [{ text: `Analisa input ini (bisa berupa struk belanja atau perintah teks) dan berikan daftar item, harga, dan kuantitas dalam format JSON. 
Jika input mengandung daftar nama orang dan pesanan mereka (misal: "1. Ajam, Nasi Puyunghai: 95k"), pastikan untuk mengisi field "assigned_to" dengan nama orang tersebut sesuai rinciannya.

PENTING: Jika ada list pesanan dengan beberapa menu tetapi harganya hanya satu (total per orang), gabungkan nama menu-menu tersebut menjadi satu item (misal: "Nasi Puyunghai + Tahu + Air mineral") dan set harganya ke total yang tertera (95000).

Keterangan dari pengguna: ${description}` }];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: base64,
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    const text = response.text || '{}';

    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error in /api/split:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
