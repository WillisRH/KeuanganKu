import { Metadata } from 'next';
import { headers } from 'next/headers';
import prisma from '../../../lib/prisma';
import SharedBillView from './SharedBillView';
import Link from 'next/link';

const fmt = (n: number) => 'Rp\u00A0' + Math.floor(n).toLocaleString('id-ID');

async function getBillData(id: string) {
  const bill = await prisma.sharedBill.findUnique({ where: { id } });
  if (!bill) return null;
  const data = JSON.parse(bill.data);
  return { ...data, _createdAt: bill.createdAt.toISOString() };
}

// ─── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const data = await getBillData(id);

  if (!data) return { title: 'Bill Tidak Ditemukan - KeuanganKu' };

  const memberCount = data.members?.length ?? 0;
  const summary = `${memberCount} Orang · Total ${fmt(data.total)}`;

  return {
    title: `Total ${fmt(data.total)} — Rincian Tagihan`,
    description: `Rincian split bill untuk ${memberCount} orang. Klik untuk bayar!`,
    openGraph: {
      title: 'Split Bill Receipt — KeuanganKu',
      description: summary,
      type: 'website',
      siteName: 'KeuanganKu',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Split Bill Receipt — KeuanganKu',
      description: summary,
    },
  };
}

// ─── Not Found Component ───────────────────────────────────────────────────────
function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0C0E16',
      color: '#EDF0F7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: "'Outfit', system-ui, sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');`}</style>
      <div style={{ fontSize: '4rem', marginBottom: 20 }}>🔍</div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 10 }}>Bill Tidak Ditemukan</h1>
      <p style={{ color: '#5B6380', fontSize: '0.95rem', marginBottom: 32, maxWidth: 360, lineHeight: 1.6 }}>
        Link ini mungkin sudah kadaluarsa atau tidak valid. Silakan minta pengirim untuk membuat link baru.
      </p>
      <Link href="/c" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #5B6CF8, #7C8CFB)', color: '#fff', padding: '13px 24px', borderRadius: 14, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 4px 16px #5B6CF840' }}>
        Buat Split Bill Baru
      </Link>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function SharedBillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getBillData(id);

  if (!data) return <NotFound />;

  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const shareUrl = `${protocol}://${host}/s/${id}`;

  return <SharedBillView data={data} shareUrl={shareUrl} />;
}
