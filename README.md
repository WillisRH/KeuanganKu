# 💰 Keuanganku - AI Expense Tracker

Keuanganku adalah aplikasi pencatat pengeluaran bertenaga AI yang dirancang untuk membantu Anda mengelola keuangan dengan lebih cerdas. Dilengkapi dengan asisten AI (Gemini) dan integrasi WhatsApp Bot untuk pencatatan transaksi yang instan dan mudah.

## 🖼️ Preview

### Dashboard Utama
![Dashboard Utama](public/dashboard.png)

### Integrasi WhatsApp Bot
![WhatsApp Bot](public/whatsapp_bot.png)

### Asisten Keuangan AI (Gemini)
![AI Chat](public/ai_chat.png)

### Fitur Cetak Laporan & Struk
![Print Preview](public/print_preview.png)

### Sistem Validasi Dokumen
![Validation Page](public/validation_page.png)

### Fitur Split Bill (Premium UI)
![Split Bill Main](public/split_bill_main.png)

### Split Bill & Checklist Pengeluaran
![Split Bill Checklist](public/split_bill_checklist.png)

### Premium OpenGraph Image (Light Mode)
![OG Image Redesign](public/og_preview.png)

## 🚀 Fitur Utama

- **📝 Pencatatan Cepat**: Catat transaksi melalui antarmuka web yang modern atau langsung lewat WhatsApp.
- **🤖 Asisten AI (Gemini)**: Analisis pengeluaran, tanya jawab seputar keuangan, dan pencatatan otomatis berbasis teks/kalimat natural.
- **🎯 Target Anggaran (Budgeting)**: Tetapkan batasan pengeluaran per kategori dan pantau progresnya secara visual.
- **🧾 Validasi Struk**: Fitur validasi struk belanja digital untuk memastikan keaslian transaksi.
- **📊 Visualisasi Data**: Grafik interaktif untuk memantau pemasukan dan pengeluaran Anda.
- **📱 Responsive Design**: Tampilan yang optimal baik di desktop maupun perangkat mobile.
- **🌙 Dark Mode**: Dukungan mode gelap yang nyaman di mata.
- **📈 Integrasi Split Bill**: Catat bagian tagihan Anda langsung dari halaman split bill ke dashboard pengeluaran dengan fitur checklist item.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS (Custom Styles).
- **Backend**: Next.js API Routes.
- **Database**: Prisma ORM (SQLite/PostgreSQL).
- **AI**: Google Gemini Pro API.
- **Integration**: `whatsapp-web.js` untuk WhatsApp Bot.

## ⚙️ Cara Instalasi

1. **Clone repositori**:
   ```bash
   git clone https://github.com/username/expense-tracker.git
   cd expense-tracker
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Buat file `.env` di root direktori dan isi dengan:
   ```env
   DATABASE_URL="file:./dev.db"
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

4. **Setup Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Jalankan Aplikasi**:
   ```bash
   npm run dev
   ```

6. **Jalankan WhatsApp Bot (Opsional)**:
   Buka terminal baru dan jalankan:
   ```bash
   # Pastikan Anda sudah mengonfigurasi nomor yang diizinkan di bot/index.ts
   npx ts-node bot/index.ts
   ```

## 📄 Lisensi

Proyek ini dibuat untuk tujuan pembelajaran. Silakan gunakan dan modifikasi sesuai kebutuhan.

---
*Dibuat dengan ❤️ serta **Vibe Code** dan menggunakan **Google Antigravity** untuk manajemen keuangan yang lebih baik.*
