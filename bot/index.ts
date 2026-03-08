import 'dotenv/config';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { GoogleGenAI } from '@google/genai';
import prisma from '../lib/prisma'; // Sesuaikan path jika perlu, karena dari bot/, lib ada di ../lib

// Inisialisasi Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_INSTRUCTION = `Asisten keuangan pribadi.
Balas HANYA array JSON valid. Bisa berisi 1 objek atau lebih.
PASTIKAN UNTUK KATEGORINYA HANYA SATU KATA. JANGAN LEBIH DARI SATU KATA.
UNTUK HURUF AWAL, HARUS KAPITAL!
Format:
[{"intent":"record"|"query"|"set_budget","item":"Nama/Teks","quantity":null|angka,"amount":angka,"description":"Ket","category":"Kategori","type":"expense"|"income"}]

PENTING TENTANG TARGET ANGGARAN:
1. Peringatkan pengguna di "description" jika kamu mendeteksi pengeluaran ini membuat kategori tersebut hampir overbudget atau sudah OVERBUDGET berdasar data yang diberikan.
2. Jika intent adalah "set_budget", targetkan property "category" untuk kategori dan "amount" untuk limitnya, serta "description" untuk balasan ucapan konfirmasi.`;

// Menyimpan status konfirmasi transaksi per nomor WA
const pendingConfirmations = new Map<string, any>();

// Inisialisasi WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    console.log('Scan QR Code di bawah ini melalui WhatsApp Anda:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Bot berhasil terkoneksi dan siap menerima pesan!');
});
client.on('message', async msg => {
    // Hanya proses pesan dari pengguna biasa. Izinkan jika ada body teks ATAU ada media.
    if (!msg.body && !msg.hasMedia) return;
    if (msg.isStatus) return;

    // Nomor yang diizinkan (dalam format WhatsApp)
    // - Nomor bot sendiri akan otomatis dikenali oleh msg.from === msg.to jika chat ke diri sendiri
    // - Atau via '6285175319097@c.us'
    const ALLOWED_NUMBERS = [
        client.info.wid._serialized, // Nomor bot sendiri
        '6285175319097@c.us'         // Nomor whitelist yang diminta
    ];

    // Cek apakah pengirim ada dalam whitelist
    if (!ALLOWED_NUMBERS.includes(msg.from)) {
        console.log(`[!] Mengabaikan pesan dari nomor tidak dikenal: ${msg.from}`);
        return;
    }

    const rawInput = msg.body;
    console.log(`[+] Pesan masuk dari ${msg.from}: ${rawInput} (Media: ${msg.hasMedia})`);

    try {
        // Cek apakah ada konfirmasi yang tertunda
        if (pendingConfirmations.has(msg.from) && !msg.hasMedia) {
            const pendingData = pendingConfirmations.get(msg.from);
            const reply = rawInput.toLowerCase().trim();
            
            if (['ya', 'y', 'yes', 'bener', 'benar', 'betul', 'oke', 'ok'].includes(reply)) {
                // Lanjut simpan bulk
                const itemsToSave = Array.isArray(pendingData) ? pendingData : [pendingData];
                
                await prisma.$transaction(
                    itemsToSave.map((p: any) => {
                        if (p.intent === 'set_budget') {
                            const cat = p.category.toLowerCase().trim();
                            return prisma.budget.upsert({
                                where: { category: cat },
                                update: { amount: parseFloat(p.amount) },
                                create: { category: cat, amount: parseFloat(p.amount) }
                            });
                        } else {
                            return prisma.expense.create({
                                data: {
                                    item: p.item,
                                    amount: parseFloat(p.amount),
                                    quantity: p.quantity ? parseInt(p.quantity, 10) : null,
                                    description: p.description,
                                    category: p.category || 'lainnya',
                                    type: p.type,
                                    rawInput: p.rawInput,
                                    source: 'whatsapp'
                                }
                            });
                        }
                    })
                );
                
                const msgLines = itemsToSave.map(e => `- ${e.intent === 'set_budget' ? `Target ${e.category}` : e.item}: Rp ${parseFloat(e.amount).toLocaleString('id-ID')}`).join('\n');
                
                console.log(`[+] Berhasil disimpan via konfirmasi: ${itemsToSave.length} records`);
                msg.reply(`✅ *${itemsToSave.length} Permintaan Berhasil Dicatat*\n\n${msgLines}`);
                
                pendingConfirmations.delete(msg.from);
                return;
            } else if (['batal', 'tidak', 'no', 'cancel', 'n', 'salah'].includes(reply)) {
                pendingConfirmations.delete(msg.from);
                msg.reply('❌ Pencatatan transaksi dibatalkan.');
                return;
            } else {
                msg.reply('Ketik *Ya* untuk menyimpan atau *Batal* untuk membatalkan.');
                return;
            }
        }

        let result;
        let finalRawInput = rawInput;

        // Fetch context for budgets
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const [allBudgets, allExpenses] = await Promise.all([
            prisma.budget.findMany(),
            prisma.expense.findMany({
                where: { type: 'expense' }
            })
        ]);
        const thisMonthExpenses = allExpenses.filter((e: any) => new Date(e.createdAt).getMonth() === currentMonth && new Date(e.createdAt).getFullYear() === currentYear);
        const spentPerCategory: Record<string, number> = {};
        for (const exp of thisMonthExpenses) {
            const cat = exp.category.toLowerCase().trim();
            spentPerCategory[cat] = (spentPerCategory[cat] || 0) + exp.amount;
        }
        const budgetStatus = allBudgets.length > 0 ? allBudgets.map((b: any) => {
            const spent = spentPerCategory[b.category.toLowerCase()] || 0;
            const remaining = b.amount - spent;
            return `- Target ${b.category}: Limit Rp ${b.amount.toLocaleString('id-ID')} | Terpakai Rp ${spent.toLocaleString('id-ID')} | Sisa Rp ${remaining.toLocaleString('id-ID')}`;
        }).join('\n') : "Belum ada target anggaran.";

        const enrichedInstruction = `${SYSTEM_INSTRUCTION}\n\nDATA ANGGARAN SAAT INI:\n${budgetStatus}`;

        if (msg.hasMedia) {
            const media = await msg.downloadMedia();
            if (media && (media.mimetype.startsWith('image/') || media.mimetype === 'application/pdf' || media.mimetype.startsWith('audio/'))) {
                console.log(`[+] Memproses media dari ${msg.from}`);
                msg.reply('⏳ Sedang memproses media, mohon tunggu sebentar...');
                
                const promptText = rawInput ? `Ket: ${rawInput}` : "Ekstrak data transaksi";
                finalRawInput = rawInput || "Media Ekstraksi";

                result = await ai.models.generateContent({
                    model: 'gemini-3.1-flash-lite-preview',
                    contents: [
                        enrichedInstruction,
                        promptText,
                        { inlineData: { data: media.data, mimeType: media.mimetype } }
                    ],
                });
            } else {
                msg.reply('Maaf, saya hanya bisa memproses gambar, PDF, atau rekaman suara.');
                return;
            }
        } else {
            // Hanya teks biasa
            result = await ai.models.generateContent({
                model: 'gemini-3.1-flash-lite-preview',
                contents: [enrichedInstruction, rawInput],
            });
        }

        const textOutput = result.text || '';
        console.log(`[>] Respons AI Asli:`, textOutput);

        // Membersihkan jika Gemini masih mengirim backticks JSON markdown
        const cleanedText = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedData;
        try {
            parsedData = JSON.parse(cleanedText);
        } catch (e) {
            console.error('[-] Gagal parsing JSON dari Gemini:', cleanedText);
            msg.reply('Maaf, saya gagal memahami format pesan Anda. Tolong coba dengan kalimat lain.');
            return;
        }

        // Array enforcement
        const parsedArray = Array.isArray(parsedData) ? parsedData : [parsedData];

        // --- Logika untuk intent BERTANYA (Query) ---
        if (parsedArray[0].intent === 'query') {
            console.log(`[+] User bertanya (query). Menyiapkan data untuk dijawab Gemini...`);
            try {
                const recentExpenses = await prisma.expense.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 100
                });

                const chatPrompt = `Asisten WA. Data terbaru:
${JSON.stringify(recentExpenses)}
Pertanyaan: "${rawInput}"
Jawab singkat, akurat berdasar data di atas.`;

                const chatResponse = await ai.models.generateContent({
                    model: 'gemini-3.1-flash-lite-preview',
                    contents: chatPrompt,
                });
                
                msg.reply(chatResponse.text || 'Maaf, saya tidak bisa menjawab saat ini.');
            } catch (queryErr) {
                console.error('[-] Error saat memproses query:', queryErr);
                msg.reply('Terjadi kesalahan saat mencari data keuangan Anda.');
            }
            return; // Selesai memproses query
        }

        // --- Logika untuk intent MENCATAT (Record) atau BUDGET ---
        const validRecords = parsedArray.filter(p => (p.intent === 'set_budget' || p.item) && p.amount !== undefined && p.amount !== null && !isNaN(parseFloat(p.amount)));
        
        if (validRecords.length === 0) {
            msg.reply('Format hasil gagal divalidasi, pastikan ada nominal uangnya saat ingin mencatat/set target.');
            return;
        }

        const hasBudgetSettings = validRecords.some(p => p.intent === 'set_budget');

        // Always use confirmation if there is media OR if it's setting a budget
        if (msg.hasMedia || hasBudgetSettings) {
            const itemsToConfirm = validRecords.map(p => ({
                intent: p.intent || 'record',
                item: p.item || `Target ${p.category}`,
                amount: p.amount,
                quantity: p.quantity,
                description: p.description || finalRawInput,
                category: p.category || 'lainnya',
                type: p.type === 'income' ? 'income' : 'expense',
                rawInput: finalRawInput
            }));

            pendingConfirmations.set(msg.from, itemsToConfirm);

            const aiReplyDesc = validRecords.map(p => p.description).filter(Boolean).join('\n');
            const confirmMsgLines = itemsToConfirm.map((p, idx) => `${idx+1}. ${p.intent === 'set_budget' ? '[BUDGET]' : '[CATAT PENGELUARAN]'} ${p.item} (Rp ${parseFloat(p.amount).toLocaleString('id-ID')})`).join('\n');
            const confirmMsg = `${aiReplyDesc ? `\n💬 *Ai:* _${aiReplyDesc}_\n` : ''}\n*Konfirmasi ${itemsToConfirm.length} Tindakan*\n\n${confirmMsgLines}\n\nKetik *Y* untuk eksekusi, atau *Batal* untuk mengabaikan.`;
            msg.reply(confirmMsg);
        } else {
            // Bulk insert for text records without budget changes
            const expenses = await prisma.$transaction(
                validRecords.map((p) => prisma.expense.create({
                    data: {
                        item: p.item,
                        amount: parseFloat(p.amount),
                        quantity: p.quantity ? parseInt(p.quantity, 10) : null,
                        description: p.description || rawInput,
                        category: p.category || 'lainnya',
                        type: p.type === 'income' ? 'income' : 'expense',
                        rawInput: rawInput,
                        source: 'whatsapp'
                    }
                }))
            );

            const totalSaved = expenses.reduce((sum, e) => sum + e.amount, 0);
            const msgLines = expenses.map(e => `- ${e.item}: Rp ${e.amount.toLocaleString('id-ID')} [${e.type.toUpperCase()}]`).join('\n');
            
            // Check descriptions to see if AI gave overbudget warnings
            const aiWarnings = validRecords.map(p => p.description).filter(Boolean);
            
            console.log(`[+] Berhasil disimpan bulk text: ${expenses.length} records`);
            msg.reply(`✅ *${expenses.length} Transaksi Dicatat*\n\n${msgLines}\n\nTotal Nominal: Rp ${totalSaved.toLocaleString('id-ID')}${aiWarnings.length > 0 ? `\n\n📌 *Catatan:* ${aiWarnings.join(', ')}` : ''}`);
        }

    } catch (error) {
        console.error('[-] Terjadi kesalahan:', error);
        msg.reply('Maaf, terjadi kesalahan saat memproses pesan Anda.');
    }
});

client.initialize();
