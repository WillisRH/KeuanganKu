import { Metadata } from 'next';
import { headers } from 'next/headers';
import prisma from '../../../lib/prisma';
import SharedBillView from './SharedBillView';
import Link from 'next/link';

const fmt = (n: number) => 'Rp\u00A0' + Math.floor(n).toLocaleString('id-ID');

async function getBillData(id: string) {
  const bill = await prisma.sharedBill.findUnique({ 
    where: { id },
    include: {
      items: true,
      members: true,
    }
  });

  if (!bill) return null;

  // Transform relational data back into the format expected by the frontend
  // This maps the DB structure to the original JSON-like interface
  return {
    subtotal: bill.subtotal,
    tax: bill.tax,
    service: bill.service,
    total: bill.total,
    taxRate: bill.taxRate,
    serviceRate: bill.serviceRate,
    _createdAt: bill.createdAt.toISOString(),
    items: bill.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      assignedTo: item.assignedTo,
    })),
    members: bill.members.map(m => ({
      id: m.memberId, // Map back to original frontend ID
      name: m.name,
      subtotal: m.subtotal,
      tax: m.tax,
      service: m.service,
      total: m.total,
      // The frontend component expects 'items' rincian inside member too
      // We calculate this on the fly to avoid even more complex relations
      items: bill.items
        .filter(item => item.assignedTo.includes(m.memberId))
        .map(item => ({
          name: item.name,
          share: (item.price * item.qty) / (item.assignedTo.length || 1)
        }))
    }))
  };
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
      images: [
        {
          url: `/s/${id}/opengraph-image?v=8`, // New version for structural change
          width: 1200,
          height: 630,
          alt: 'KeuanganKu Receipt',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Split Bill Receipt — KeuanganKu',
      description: summary,
      images: [`/s/${id}/opengraph-image?v=8`],
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
