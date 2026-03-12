'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'react-qr-code';

// ─── Theme Configuration ──────────────────────────────────────────────────────
const theme = {
  dark: {
    bg:      '#0C0E16',
    surface: '#141620',
    surf2:   '#1C1F2E',
    surf3:   '#22263A',
    border:  '#252840',
    text:    '#EDF0F7',
    sub:     '#5B6380',
    muted:   '#3D4260',
    accent:  '#5B6CF8',
    green:   '#22C55E',
    red:     '#FF6B6B',
    yellow:  '#F59E0B',
    glow:    'rgba(91,108,248,0.15)',
    shadow:  '0 20px 50px rgba(0,0,0,0.5)',
  },
  light: {
    bg:      '#F3F4F6',
    surface: '#FFFFFF',
    surf2:   '#F9FAFB',
    surf3:   '#E5E7EB',
    border:  '#E5E7EB',
    text:    '#111827',
    sub:     '#6B7280',
    muted:   '#9CA3AF',
    accent:  '#5B6CF8',
    green:   '#10B981',
    red:     '#EF4444',
    yellow:  '#F59E0B',
    glow:    'rgba(91,108,248,0.08)',
    shadow:  '0 10px 30px rgba(0,0,0,0.05)',
  }
};

const avatarColors = [
  '#5B6CF8','#EC4899','#F59E0B','#10B981','#8B5CF6',
  '#EF4444','#06B6D4','#84CC16','#F97316','#6366F1',
];

const fmt = (n: number) => 'Rp\u00A0' + Math.floor(n).toLocaleString('id-ID');

// ─── Icons ────────────────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);
const WalletIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
    <path d="M16 3H8L4 7h16l-4-4z"/>
    <circle cx="17" cy="13" r="1.2" fill="currentColor" stroke="none"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);
const QRIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    <line x1="14" y1="14" x2="14" y2="14.01"/><line x1="17" y1="14" x2="17" y2="14.01"/><line x1="21" y1="14" x2="21" y2="14.01"/>
  </svg>
);
const DishIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 15h18"/><path d="M3 19h18"/><path d="M4 11V3h16v8"/>
  </svg>
);

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface MemberBreakdown {
  id: string;
  name: string;
  items: { name: string; share: number }[];
  subtotal: number;
  tax: number;
  service: number;
  total: number;
}

interface BillItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  assignedTo: string[];
}

interface BillData {
  items: BillItem[];
  subtotal: number;
  tax: number;
  service: number;
  total: number;
  members: MemberBreakdown[];
  taxRate: number;
  serviceRate: number;
  _createdAt?: string;
}

interface Props {
  data: BillData;
  shareUrl: string;
}

export default function SharedBillView({ data, shareUrl }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberBreakdown | null>(null);

  // System Theme Detection
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(media.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const t = isDark ? theme.dark : theme.light;

  const createdDate = data._createdAt
    ? new Date(data._createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const copyAmount = async (member: MemberBreakdown) => {
    const text = `${member.name}: ${fmt(member.total)}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(member.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareWA = () => {
    const lines = data.members
      .filter(m => m.total > 0)
      .map(m => `• ${m.name}: *${fmt(m.total)}*`)
      .join('\n');
    const text = `💰 *Split Bill - KeuanganKu*\n\n${lines}\n\n📊 *Total: ${fmt(data.total)}*\n\nLihat rincian lengkap:\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; transition: background 0.3s, border-color 0.3s, transform 0.2s, color 0.2s; }

        body { background: ${t.bg}; color: ${t.text}; overflow-x: hidden; }

        .btn-primary {
          background: linear-gradient(135deg, ${t.accent}, #7C8CFB);
          color: #fff;
          padding: 14px 24px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 16px ${t.accent}40;
          font-family: inherit;
          text-decoration: none;
        }
        .btn-primary:active { transform: scale(0.97); }

        .btn-secondary {
          background: ${t.surf2};
          color: ${t.sub};
          padding: 13px 22px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
          border: 1.5px solid ${t.border};
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
        }

        .theme-toggle {
          position: fixed;
          top: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${t.surface};
          border: 1.5px solid ${t.border};
          color: ${t.accent};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          box-shadow: ${t.shadow};
        }

        .card {
          background: ${t.surface};
          border: 1.5px solid ${t.border};
          border-radius: 32px;
          padding: 32px;
          box-shadow: ${t.shadow};
        }

        .person-card {
          background: ${t.surface};
          border: 1.5px solid ${t.border};
          border-radius: 24px;
          padding: 20px;
          animation: fadeSlide 0.5s ease forwards;
          opacity: 0;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
        }
        .person-card:hover { border-color: ${t.accent}40; transform: translateY(-4px); }

        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.4rem;
          color: #fff;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 0.8rem;
          font-weight: 800;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Desktop & Layout ── */
        .page-wrapper {
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          padding: 40px 24px 100px;
        }

        @media (min-width: 1024px) {
          .page-layout {
            display: grid;
            grid-template-columns: 360px 1fr;
            gap: 48px;
            align-items: start;
          }
          .sticky-sidebar { position: sticky; top: 40px; }
          .person-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
          }
        }

        @media (max-width: 1023px) {
          .person-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
           .theme-toggle { top: 16px; right: 16px; width: 42px; height: 42px; }
        }

        @media (max-width: 480px) {
          .person-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .page-wrapper { padding: 20px 12px 80px; }
          .card { padding: 24px 20px; border-radius: 28px; }
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 16px;
        }
        .modal-box {
          background: ${t.surface};
          border: 1.5px solid ${t.border};
          border-radius: 32px;
          padding: 32px;
          width: 100%;
          max-width: 460px;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Manual Theme Toggle */}
      <button className="theme-toggle" onClick={() => setIsDark(!isDark)} title="Ganti Tema">
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Outfit', system-ui, sans-serif" }}>

        <div className="page-wrapper">
          
          <div className="page-layout">

            {/* ── SIDEBAR (Mobile top, Desktop sticky side) ── */}
            <aside className="sticky-sidebar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #5B6CF8, #9B7CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <WalletIcon />
                  </div>
                  <div>
                    <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: t.text, letterSpacing: '-0.5px' }}>Keuangan<span style={{ color: t.accent }}>Ku</span></h2>
                    <p style={{ fontSize: '0.8rem', color: t.sub, fontWeight: 700 }}>Split Bill Smart</p>
                  </div>
                </Link>
              </div>

              <div className="card" style={{ marginBottom: 24, borderBottom: `6px solid ${t.accent}` }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: t.sub, textTransform: 'uppercase', marginBottom: 16 }}>💰 Total Tagihan Bersama</p>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: t.accent, letterSpacing: '-1.5px', marginBottom: 24 }}>{fmt(data.total)}</h1>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span style={{ color: t.sub }}>Subtotal</span>
                    <span>{fmt(data.subtotal)}</span>
                  </div>
                  {(data.tax > 0 || data.service > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                      <span style={{ color: t.sub }}>Pajak & Service</span>
                      <span style={{ color: t.green }}>{fmt(data.tax + data.service)}</span>
                    </div>
                  )}
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${t.border}`, fontSize: '0.85rem', color: t.sub, fontWeight: 600 }}>
                    🧾 {data.items.length} Item &nbsp;·&nbsp; 👥 {data.members.length} Orang
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* <button className="btn-wa" onClick={shareWA} style={{ width: '100%' }}><WhatsAppIcon /> Bagikan via WA</button> */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 54px', gap: 10 }}>
                  <button className="btn-secondary" onClick={copyLink} style={{ width: '100%' }}>{copiedLink ? <><CheckIcon /> Link Tersalin</> : <><ShareIcon /> Copy Link</>}</button>
                  <button className="btn-secondary" onClick={() => setShowQR(true)}><QRIcon /></button>
                </div>
              </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

              {/* Tagihan Per Orang Section */}
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 24 }}>
                  <h3 style={{ fontWeight: 900, fontSize: '1.2rem' }}>Pilih Nama Untuk Detail</h3>
                  <span className="badge" style={{ background: t.accent + '15', color: t.accent }}>Siapa bayar berapa?</span>
                </div>

                <div className="person-grid">
                  {data.members.map((m, idx) => {
                    const color = avatarColors[idx % avatarColors.length];
                    return (
                      <div key={m.id || idx} className="person-card" onClick={() => setSelectedMember(m)}>
                        <div className="avatar" style={{ background: color }}>{m.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: 2 }}>{m.name}</p>
                          <p style={{ fontWeight: 900, fontSize: '1.1rem', color: t.accent }}>{fmt(m.total)}</p>
                        </div>
                        <div role="button" style={{ background: t.surf2, padding: '4px 12px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 800, color: t.sub }}>Klik Detail ➔</div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* All Items Rincian */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 900, fontSize: '1.2rem' }}>Daftar Semua Belanjaan</h3>
                  <div style={{ flex: 1, height: 1.5, background: t.border }} />
                </div>
                <div className="card" style={{ padding: '20px 32px' }}>
                  {data.items.map((item, i) => (
                    <div key={item.id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px dashed ${t.border}` }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: '1rem' }}>{item.name} {item.qty > 1 && <span style={{ color: t.accent }}>×{item.qty}</span>}</p>
                      </div>
                      <span style={{ fontWeight: 900, color: t.text }}>{fmt(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Link href="/c" className="btn-primary" style={{ background: 'none', border: `1.5px solid ${t.accent}`, color: t.accent, boxShadow: 'none' }}>✨ Buat Split Bill Sendiri</Link>
                  </div>
                </div>
              </section>

              <footer style={{ textAlign: 'center', color: t.muted, fontSize: '0.85rem', padding: '20px 0' }}>
                <p>© 2026 WillisRH · KeuanganKu</p>
              </footer>
            </main>

          </div>
        </div>
      </div>

      {/* ── MEMBER DETAIL MODAL ── */}
      {selectedMember && (
        <div className="modal-backdrop" onClick={() => setSelectedMember(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
              <div className="avatar" style={{ background: avatarColors[data.members.indexOf(selectedMember) % avatarColors.length], width: 64, height: 64, borderRadius: 24, fontSize: '1.6rem' }}>
                {selectedMember.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900 }}>{selectedMember.name}</h2>
                <p style={{ color: t.sub, fontWeight: 700 }}>Total: <span style={{ color: t.accent }}>{fmt(selectedMember.total)}</span></p>
              </div>
              <button onClick={() => setSelectedMember(null)} style={{ background: t.surf2, border: 'none', color: t.sub, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>

            <div style={{ background: t.surf2, borderRadius: 24, padding: '20px', marginBottom: 28 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 800, color: t.sub, textTransform: 'uppercase', marginBottom: 16 }}>Rincian Pesanan</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedMember.items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                    <span style={{ color: t.text, fontWeight: 600 }}>{it.name}</span>
                    <span style={{ fontWeight: 800 }}>{fmt(it.share)}</span>
                  </div>
                ))}
                {(selectedMember.tax + selectedMember.service > 0) && (
                  <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px dashed ${t.border}`, display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: t.sub, fontWeight: 700 }}>
                    <span>Pajak & Service</span>
                    <span>{fmt(selectedMember.tax + selectedMember.service)}</span>
                  </div>
                )}
                <div style={{ marginTop: 12, paddingTop: 16, borderTop: `1.5px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: t.sub }}>TOTAL TAGIHAN</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: t.accent }}>{fmt(selectedMember.total)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
               <button 
                  className={`btn-secondary ${copiedId === selectedMember.id ? 'copied' : ''}`} 
                  onClick={() => copyAmount(selectedMember)} 
                  style={{ flex: 1 }}
                >
                  {copiedId === selectedMember.id ? <><CheckIcon /> Tersalin</> : <><CopyIcon /> Salin Nominal</>}
               </button>
               <button className="btn-primary" onClick={() => setSelectedMember(null)} style={{ flex: 1 }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR MODAL ── */}
      {showQR && (
        <div className="modal-backdrop" onClick={() => setShowQR(false)}>
          <div className="modal-box" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: 24 }}>Scan Untuk Rincian 📱</h2>
            <div style={{ background: '#fff', padding: 24, borderRadius: 24, display: 'inline-block', marginBottom: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <QRCode value={shareUrl} size={200} />
            </div>
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setShowQR(false)}>Tutup</button>
          </div>
        </div>
      )}
    </>
  );
}
