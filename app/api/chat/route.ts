import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import prisma from '../../../lib/prisma'; // Ensure correct path to prisma client

// Initialize the Google Gen AI client with the API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }

    // Fetch up to 100 of the most recent transactions to give the AI context.
    const recentExpenses = await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
          id: true,
          amount: true,
          item: true,
          category: true,
          type: true,
          createdAt: true
      }
    });

    // Fetch user defined budgets
    const budgets = await prisma.budget.findMany();

    const totalIncome = recentExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = recentExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalIncome - totalExpense;

    // Calculate current month's spending per category
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthExpenses = recentExpenses.filter(e => e.type === 'expense' && new Date(e.createdAt).getMonth() === currentMonth && new Date(e.createdAt).getFullYear() === currentYear);
    
    const spentPerCategory: Record<string, number> = {};
    for (const exp of thisMonthExpenses) {
        const cat = exp.category.toLowerCase().trim();
        spentPerCategory[cat] = (spentPerCategory[cat] || 0) + exp.amount;
    }

    const budgetStatus = budgets.length > 0 ? budgets.map((b: any) => {
        const spent = spentPerCategory[b.category.toLowerCase()] || 0;
        const remaining = b.amount - spent;
        return `- Target ${b.category}: Limit Rp ${b.amount.toLocaleString('id-ID')} | Terpakai Rp ${spent.toLocaleString('id-ID')} | Sisa Rp ${remaining.toLocaleString('id-ID')} ${remaining < 0 ? '(OVERBUDGET!)' : ''}`;
    }).join('\n') : "Belum ada target anggaran yang diatur.";

    // Convert transactions to a readable string for the AI prompt
    const contextData = `
==== KONTEKS DATABASE KEUANGANKU ====
Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}
Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}
Saldo Bersih Skr: Rp ${netBalance.toLocaleString('id-ID')}

Status Anggaran Bulanan (Target Expenses):
${budgetStatus}

Daftar Transaksi (100 terakhir):
${recentExpenses.map(e => `- [${new Date(e.createdAt).toLocaleDateString('id-ID')}] ${e.type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}: ${e.item} (Kategori: ${e.category}) sejumlah Rp ${e.amount.toLocaleString('id-ID')}`).join('\n')}
==============================================================
`;

    // Construct the system instruction
    const systemInstruction = `Kamu adalah Asisten Finansial Pintar ("Keuanganku AI") yang bertugas membantu pengguna menganalisa data keuangannya. 
Kamu terhubung langsung ke database pengguna.
Berikut adalah data transaksi pengguna terkini:\n${contextData}\n
Gunakan data di atas untuk menjawab pertanyaan pengguna dengan RAMAH, SINGKAT, dan AKURAT. Berikan insight yang berguna. Jika pengguna bertanya hal di luar keuangan, tolak dengan sopan dengan mengatakan bahwa kamu adalah asisten khusus keuangan. Selalu format balasanmu dalam bahasa Indonesia yang santai tapi profesional (gunakan kata "Mas" jika cocok). Jangan cantumkan ID atau data mentah yang jelek dilihat, buatlah se-humanis mungkin. Jika menggunakan angka atau uang, format dengan format Rupiah (Rp X.XXX.XXX).

PENTING TENTANG TARGET ANGGARAN:
1. Peringatkan pengguna dengan sopan namun tegas jika kamu mendeteksi saldo "Sisa" untuk Target Anggaran hampir habis atau "OVERBUDGET".
2. Jika pengguna meminta untuk mengatur target pengeluaran / limit anggaran bulanan untuk kategori tertentu (misal: "tolong batasi makan saya 2 juta sebulan"), GUNAKAN function "setBudget". Ingatkan pengguna limit yang lama jika sudah pernah di set sebelumnya.
3. Kategori anggaran (budget) HARUS terdiri dari satu kata dan relevan dengan pengeluaran.

PENTING TENTANG TRANSAKSI: Jika pengguna memberikan instruksi untuk MENCATAT atau MENAMBAHKAN pengeluaran/pemasukan baru, kamu WAJIB menggunakan tool "addTransactions". Untuk tipe data "type", isikan "expense" untuk pengeluaran dan "income" untuk pemasukan. Masukkan semua transaksi sekaligus jika ada banyak.`;

    // Flatten user messages into the expected gemini format if needed. 
    // Usually, the SDK requires alternating "user" and "model" roles.
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Define the addTransactions tool
    const addTransactionsTool = {
      functionDeclarations: [
        {
          name: 'addTransactions',
          description: 'Mencatat sekumpulan transaksi pengeluaran atau pemasukan finansial pengguna ke dalam database',
          parameters: {
            type: Type.OBJECT,
            properties: {
              transactions: {
                type: Type.ARRAY,
                description: 'Daftar transaksi yang akan dimasukkan',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    amount: { type: Type.NUMBER, description: 'Jumlah nominal transaksi dalam angka mutlak positif' },
                    item: { type: Type.STRING, description: 'Nama barang atau judul transaksi singkat' },
                    type: { type: Type.STRING, description: 'Jenis transaksi: harus "expense" untuk pengeluaran atau "income" untuk pemasukan' },
                    category: { type: Type.STRING, description: 'Kategori pengeluaran/pemasukan (contoh: makanan, transportasi, hiburan, gaji, lainnya)' },
                    description: { type: Type.STRING, description: 'Catatan tambahan bersifat formal, informatif, dan baku. Maksimal 1 kalimat, JANGAN gunakan gaya santai.' },
                  },
                  required: ['amount', 'item', 'type', 'category', 'description'],
                }
              }
            },
            required: ['transactions'],
          },
        },
      ],
    };

    // Define the setBudget tool
    const setBudgetTool = {
      functionDeclarations: [
        {
          name: 'setBudget',
          description: 'Mengatur atau memperbarui target anggaran (limit pengeluaran) per bulan untuk kategori tertentu',
          parameters: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: 'Nama kategori pengeluaran (misal: "makanan", "transportasi"). Haram menggunakan spasi' },
              amount: { type: Type.NUMBER, description: 'Nominal maksimal batasan pengeluaran bulanan dalam Rupiah' },
              replyText: { type: Type.STRING, description: 'Pesan konfirmasi sopan yang akan kamu uapkan ke pengguna sebelum mengeksekusi databse' }
            },
            required: ['category', 'amount', 'replyText'],
          },
        },
      ]
    };

    // For genai SDK v1.x standard request
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: formattedMessages,
      config: {
        systemInstruction: systemInstruction,
        tools: [addTransactionsTool, setBudgetTool],
      }
    });

    const fnCalls = response.functionCalls;
    if (fnCalls && fnCalls.length > 0) {
      const call = fnCalls[0];
      if (call.name === 'setBudget') {
        const { category, amount, replyText } = call.args as any;
        // Instead of writing to the DB directly, return the pending intention
        return NextResponse.json({
          text: replyText || `Aku siapkan konfirmasi pengaturan budget untuk *${category}* ya Mas.`,
          pendingBudget: { category, amount }
        });
      }

      if (call.name === 'addTransactions') {
        const { transactions } = call.args as any;
        
        if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
           return NextResponse.json({ text: 'Maaf Mas, aku tidak mendeteksi transaksi yang valid dalam permintaanmu.' });
        }

        // Execute the database creation in a transaction block
        const newRecords = await prisma.$transaction(
          transactions.map((t: any) => prisma.expense.create({
            data: {
              amount: Number(t.amount),
              item: t.item,
              type: t.type,
              category: t.category,
              description: t.description || 'Dari AI Chat',
              rawInput: messages[messages.length - 1].content || 'Dari AI Chat',
              source: 'ai_tool_dashboard'
            }
          }))
        );

        const totalAmount = newRecords.reduce((sum, r) => sum + Number(r.amount), 0);
        const itemNames = newRecords.map(r => r.item).join(', ');

        // Inform the frontend of the successful action along with any generated response text
        return NextResponse.json({ 
          text: `Sip Mas! **${newRecords.length} transaksi** (${itemNames}) sejumlah total Rp ${totalAmount.toLocaleString('id-ID')} sudah berhasil aku catat ya. 🎉 Ada lagi yang mau ditambah?`, 
          actionData: newRecords // Now sending back an array
        });
      }
    }

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
