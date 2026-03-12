import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import prisma from '../../../lib/prisma'; // Ensure correct path to prisma client

// Initialize the Google Gen AI client with the API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let messages: any[];
    let fileDataParts: { inlineData: { mimeType: string; data: string } }[] = [];

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with files
      const formData = await request.formData();
      messages = JSON.parse(formData.get('messages') as string);
      
      // Process uploaded files
      const files = formData.getAll('files') as File[];
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        fileDataParts.push({
          inlineData: {
            mimeType: file.type,
            data: base64,
          }
        });
      }
    } else {
      // Handle regular JSON
      const body = await request.json();
      messages = body.messages;
    }

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
APAPUN ITU AWALAH HURUFNYA HARUS KAPITAL! SUPAYA ENAK DILIHAT!. BERLAKU KE SEMUA OUTPUT! TERMASUK KATEGORI

PENTING TENTANG "description" TRANSAKSI:
- Isi dengan keterangan murni produk, merk, atau detail barang/transaksi (misal: "Indomie Goreng", "Bensin Shell", "Gaji Pokok").
- DILARANG KERAS memasukkan peringatan anggaran, status overbudget, atau saran finansial ke dalam field "description". Peringatan anggaran akan ditangani secara otomatis oleh sistem UI.

PENTING TENTANG TARGET ANGGARAN:
1. JANGAN masukkan peringatan overbudget ke dalam parameter "description" saat menggunakan tool "addTransactions".
2. Jika pengguna meminta untuk mengatur target pengeluaran / limit anggaran bulanan untuk kategori tertentu (misal: "tolong batasi makan saya 2 juta sebulan"), GUNAKAN function "setBudget". Ingatkan pengguna limit yang lama jika sudah pernah di set sebelumnya.
3. Kategori anggaran (budget) HARUS terdiri dari satu kata dan relevan dengan pengeluaran.

PENTING TENTANG TRANSAKSI: Jika pengguna memberikan instruksi untuk MENCATAT atau MENAMBAHKAN pengeluaran/pemasukan baru, kamu WAJIB menggunakan tool "addTransactions". Untuk tipe data "type", isikan "expense" untuk pengeluaran dan "income" untuk pemasukan. Masukkan semua transaksi sekaligus jika ada banyak.

PENTING TENTANG FILE/MEDIA YANG DIUNGGAH:
- Pengguna bisa mengirimkan foto, rekaman audio, atau file PDF bersama pesannya.
- Jika pengguna mengirim FOTO STRUK/NOTA: Analisa gambar tersebut, identifikasi item-item belanjaan beserta harganya, lalu gunakan tool "addTransactions" untuk mencatat semua item secara otomatis. Jika ada item yang tidak jelas, tanyakan ke pengguna.
- Jika pengguna mengirim REKAMAN AUDIO: Dengarkan dan pahami isi audio tersebut, lalu proses sesuai instruksinya (misalnya mencatat transaksi yang disebutkan).
- Jika pengguna mengirim FILE PDF: Baca dan analisa isi dokumen PDF tersebut. Bisa berupa laporan keuangan, invoice, atau nota yang perlu dicatat.
- Selalu konfirmasi kembali hasil analisa file ke pengguna sebelum menyimpan data.
- Jika pengguna ingin membagi tagihan (split bill) dengan banyak teman dengan rincian per orang (terutama jika pesanan tiap orang berbeda), sarankan mereka menggunakan fitur **Split Bill Calculator** di menu navigasi atau langsung ke path \`/c\`. Kamu bisa menjelaskan bahwa fitur di \`/c\` lebih lengkap untuk menangani banyak orang, PPN, dan service charge secara otomatis.`;

    // Flatten user messages into the expected gemini format
    const formattedMessages = messages.map((msg: any, idx: number) => {
      const parts: any[] = [{ text: msg.content }];
      
      // Add file data parts to the LAST user message
      if (idx === messages.length - 1 && msg.role === 'user' && fileDataParts.length > 0) {
        parts.push(...fileDataParts);
      }
      
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

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
                    description: { type: Type.STRING, description: 'Detail produk/aktivitas (Contoh: "Beras Cianjur", "Shell V-Power"). DILARANG memasukkan peringatan budget di sini.' },
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

    // --- POST-AI LOGIC: Check for Alerts and FILTER by relevance ---
    const userMsg = messages[messages.length - 1].content.toLowerCase();
    const aiText = (response.text || "").toLowerCase();
    
    // 1. Initial proactive alerts calculation
    const allBudgets = await prisma.budget.findMany({
      where: { month: currentMonth + 1, year: currentYear }
    });
    const allExpensesFetch = await prisma.expense.findMany({
      where: { type: 'expense', createdAt: { gte: new Date(currentYear, currentMonth, 1), lt: new Date(currentYear, currentMonth + 1, 1) } }
    });
    
    const globalSpent: Record<string, number> = {};
    for (const exp of allExpensesFetch) {
      const cat = exp.category.toLowerCase().trim();
      globalSpent[cat] = (globalSpent[cat] || 0) + exp.amount;
    }

    const proactiveAlerts: { category: string, limit: number, spent: number, status: 'danger' | 'warning' }[] = [];
    for (const b of allBudgets) {
      const catLower = b.category.toLowerCase().trim();
      const spent = globalSpent[catLower] || 0;

      // Filter RELEVANT categories: mentioned in user text OR in AI response text
      const isMentioned = userMsg.includes(catLower) || catLower.includes(userMsg) || aiText.includes(catLower);
      
      if (isMentioned) {
          if (spent >= b.amount) {
            proactiveAlerts.push({ category: b.category, limit: b.amount, spent, status: 'danger' });
          } else if (spent >= b.amount * 0.8) {
            proactiveAlerts.push({ category: b.category, limit: b.amount, spent, status: 'warning' });
          }
      }
    }

    // Calculate current net balance
    const totalExpBalance = await prisma.expense.findMany({ select: { amount: true, type: true } });
    const finalInc = totalExpBalance.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const finalExp = totalExpBalance.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    const finalNet = finalInc - finalExp;

    const fnCalls = response.functionCalls;
    if (fnCalls && fnCalls.length > 0) {
      const call = fnCalls[0];
      if (call.name === 'setBudget') {
        const { category, amount, replyText } = call.args as any;
        return NextResponse.json({
          text: replyText || `Aku siapkan konfirmasi pengaturan budget untuk *${category}* ya Mas.`,
          pendingBudget: { category, amount },
          budgetAlerts: proactiveAlerts.length > 0 ? proactiveAlerts : undefined,
          totalBalance: finalNet
        });
      }

      if (call.name === 'addTransactions') {
        const { transactions } = call.args as any;
        if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
           return NextResponse.json({ text: 'Maaf Mas, aku tidak mendeteksi transaksi yang valid dalam permintaanmu.' });
        }

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

        const totalSaved = newRecords.reduce((sum, r) => sum + Number(r.amount), 0);
        const itemNames = newRecords.map(r => r.item).join(', ');

        const finalExpenses = await prisma.expense.findMany({ select: { amount: true, type: true } });
        const lastInc = finalExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
        const lastExp = finalExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
        const lastNet = lastInc - lastExp;

        const updatedExpenses = await prisma.expense.findMany({
            where: { type: 'expense', createdAt: { gte: new Date(currentYear, currentMonth, 1), lt: new Date(currentYear, currentMonth + 1, 1) } }
        });
        const updatedSpent: Record<string, number> = {};
        for (const exp of updatedExpenses) {
            const cat = exp.category.toLowerCase().trim();
            updatedSpent[cat] = (updatedSpent[cat] || 0) + exp.amount;
        }

        const postAlerts: { category: string, limit: number, spent: number, status: 'danger' | 'warning' }[] = [];
        const affectedCats = new Set(newRecords.map(r => r.category.toLowerCase().trim()));

        for (const b of allBudgets) {
            const catLower = b.category.toLowerCase().trim();
            const spent = updatedSpent[catLower] || 0;
            const isRelevant = userMsg.includes(catLower) || catLower.includes(userMsg) || aiText.includes(catLower) || affectedCats.has(catLower);
            
            if (isRelevant) {
                if (spent >= b.amount) {
                    postAlerts.push({ category: b.category, limit: b.amount, spent, status: 'danger' });
                } else if (spent >= b.amount * 0.8) {
                    postAlerts.push({ category: b.category, limit: b.amount, spent, status: 'warning' });
                }
            }
        }

        return NextResponse.json({ 
          text: `Sip Mas! **${newRecords.length} transaksi** (${itemNames}) sejumlah total Rp ${totalSaved.toLocaleString('id-ID')} sudah berhasil aku catat ya. 🎉 Ada lagi yang mau ditambah?`, 
          actionData: newRecords,
          budgetAlerts: postAlerts.length > 0 ? postAlerts : undefined,
          totalBalance: lastNet
        });
      }
    }

    return NextResponse.json({ 
        text: response.text,
        budgetAlerts: proactiveAlerts.length > 0 ? proactiveAlerts : undefined,
        totalBalance: finalNet
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
