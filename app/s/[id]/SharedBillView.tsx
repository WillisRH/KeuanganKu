'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { addTransaction } from '../../actions';
import QRCode from 'react-qr-code';

import { theme } from '../../../lib/theme';
const t_config = theme;

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
  dbId: string;
  name: string;
  items: { name: string; share: number }[];
  subtotal: number;
  tax: number;
  service: number;
  total: number;
  paidAmount: number;
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
  userId?: string | null;
  _createdAt?: string;
}

interface Props {
  data: BillData;
  shareUrl: string;
}

export default function SharedBillView({ data, shareUrl }: Props) {
  const { data: session } = useSession();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isDark, setIsDark] = useState(false); // Default to light mode (false)
  const [selectedMember, setSelectedMember] = useState<MemberBreakdown | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [installmentAmount, setInstallmentAmount] = useState('');
  const isOwner = session?.user?.id === data.userId;
  const [localMembers, setLocalMembers] = useState<MemberBreakdown[]>(data.members);
  const [recordingExpense, setRecordingExpense] = useState<string | null>(null);
  const [recordedMembers, setRecordedMembers] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{msg:string, type:'success'|'error'}|null>(null);
  const [showExpenseChecklist, setShowExpenseChecklist] = useState(false);
  const [checklistMember, setChecklistMember] = useState<MemberBreakdown | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openExpenseChecklist = (member: MemberBreakdown) => {
    if (!session?.user) {
      showToast('Silakan login terlebih dahulu', 'error');
      return;
    }
    if (member.items.length <= 1) {
      // Only 1 item, record directly
      recordAsExpense(member, member.items);
    } else {
      setChecklistMember(member);
      setCheckedItems(new Set(member.items.map((_, i) => i))); // All checked by default
      setShowExpenseChecklist(true);
    }
  };

  const recordAsExpense = async (member: MemberBreakdown, selectedItems: { name: string; share: number }[]) => {
    if (!session?.user || selectedItems.length === 0) return;
    setRecordingExpense(member.id);
    try {
      const totalAmount = selectedItems.reduce((sum, it) => sum + it.share, 0);
      // Add proportional tax/service
      const proportion = member.subtotal > 0 ? totalAmount / member.subtotal : 0;
      const taxService = (member.tax + member.service) * proportion;
      const finalAmount = Math.round(totalAmount + taxService);
      const itemNames = selectedItems.map(it => it.name).join(', ');
      
      await addTransaction({
        item: `Split Bill - ${member.name}`,
        amount: finalAmount,
        category: 'split-bill',
        type: 'expense',
        description: `Bagian ${member.name}: ${itemNames}`,
      });
      setRecordedMembers(prev => new Set(prev).add(member.id));
      setShowExpenseChecklist(false);
      showToast(`💸 ${selectedItems.length} item (${fmt(finalAmount)}) berhasil dicatat!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal mencatat pengeluaran', 'error');
    } finally {
      setRecordingExpense(null);
    }
  };

  useEffect(() => {
    setLocalMembers(data.members);
  }, [data.members]);

  // System Theme Detection
  useEffect(() => {
    const isL = localStorage.getItem('theme') === 'light' || !localStorage.getItem('theme');
    setIsDark(!isL);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const t = isDark ? t_config.dark : t_config.light;

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
    const lines = localMembers
      .filter(m => m.total > 0)
      .map(m => `• ${m.name}: *${fmt(m.total)}* ${m.paidAmount >= m.total ? '✅' : (m.paidAmount > 0 && isOwner) ? '🕒' : ''}`)
      .join('\n');
    const text = `💰 *Split Bill - KeuanganKu*\n\n${lines}\n\n📊 *Total: ${fmt(data.total)}*\n\nLihat rincian lengkap:\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const updateMemberPayment = async (memberDbId: string, amount: number) => {
    setUpdatingPayment(memberDbId);
    try {
      const res = await fetch('/api/shared-bill/member', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: memberDbId, paidAmount: amount })
      });
      if (res.ok) {
        setLocalMembers(prev => prev.map(m => m.dbId === memberDbId ? { ...m, paidAmount: amount } : m));
        if (selectedMember?.dbId === memberDbId) {
          setSelectedMember(prev => prev ? { ...prev, paidAmount: amount } : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingPayment(null);
    }
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                        <span style={{ color: t.sub }}>Pajak & Service {((data.taxRate || 0) + (data.serviceRate || 0)) > 0 && `(${(data.taxRate || 0) + (data.serviceRate || 0)}%)`}</span>
                        <span style={{ color: t.green }}>{fmt(data.tax + data.service)}</span>
                      </div>
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
                  {localMembers.map((m, idx) => {
                    const color = avatarColors[idx % avatarColors.length];
                    const isPaid = m.paidAmount >= m.total;
                    const isPartial = m.paidAmount > 0 && m.paidAmount < m.total;
                    const showPartial = isPartial && isOwner; // Only owner sees "Nyicil"
                    return (
                      <div key={m.id || idx} className="person-card" onClick={() => setSelectedMember(m)}>
                        {isPaid && (
                          <div style={{ position: 'absolute', top: 12, right: 12, background: t.green, color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                            <CheckIcon />
                          </div>
                        )}
                        <div className="avatar" style={{ background: color }}>{m.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: 2 }}>{m.name}</p>
                          <p style={{ fontWeight: 900, fontSize: '1.1rem', color: isPaid ? t.green : t.accent }}>{fmt(m.total)}</p>
                          {showPartial && <p style={{ fontSize: '0.7rem', fontWeight: 700, color: t.yellow }}>Nyicil: {fmt(m.paidAmount)}</p>}
                        </div>
                        <div role="button" style={{ background: t.surf2, padding: '4px 12px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 800, color: t.sub }}>Detail & Bayar ➔</div>
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
                    <span>Pajak & Service {((data.taxRate || 0) + (data.serviceRate || 0)) > 0 && `(${(data.taxRate || 0) + (data.serviceRate || 0)}%)`}</span>
                    <span>{fmt(selectedMember.tax + selectedMember.service)}</span>
                  </div>
                )}
                <div style={{ marginTop: 12, paddingTop: 16, borderTop: `1.5px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: t.sub }}>TOTAL TAGIHAN</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: t.accent }}>{fmt(selectedMember.total)}</span>
                    {selectedMember.paidAmount > 0 && selectedMember.paidAmount < selectedMember.total && isOwner && (
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: t.yellow }}>Telah dibayar: {fmt(selectedMember.paidAmount)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Controls - Only for Owner */}
            {isOwner ? (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: t.sub, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>Konfirmasi Pembayaran (Pemilik)</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {selectedMember.paidAmount < selectedMember.total ? (
                    <>
                      <button 
                        disabled={updatingPayment === selectedMember.dbId}
                        onClick={() => updateMemberPayment(selectedMember.dbId, selectedMember.total)}
                        className="btn-primary" 
                        style={{ flex: 1, fontSize: '0.85rem', padding: '12px' }}
                      >
                        {updatingPayment === selectedMember.dbId ? 'Loading...' : 'Lunas ✅'}
                      </button>
                      <button 
                        disabled={updatingPayment === selectedMember.dbId}
                        onClick={() => {
                          setInstallmentAmount((selectedMember.paidAmount || 0).toString());
                          setShowInstallmentModal(true);
                        }}
                        className="btn-secondary" 
                        style={{ flex: 1, fontSize: '0.85rem', padding: '12px' }}
                      >
                        Nyicil 🕒
                      </button>
                    </>
                  ) : (
                    <button 
                      disabled={updatingPayment === selectedMember.dbId}
                      onClick={() => updateMemberPayment(selectedMember.dbId, 0)}
                      className="btn-secondary" 
                      style={{ flex: 1, fontSize: '0.85rem', padding: '12px', color: t.red, borderColor: t.red + '30' }}
                    >
                      Reset Pembayaran ↺
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 24, padding: 12, borderRadius: 12, background: t.surf2, textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: t.sub }}> Status: 
                  {selectedMember.paidAmount >= selectedMember.total ? 
                    <span style={{ color: t.green }}> Lunas ✅</span> : 
                    (selectedMember.paidAmount > 0 && isOwner) ? 
                    <span style={{ color: t.yellow }}> Nyicil 🕒</span> : 
                    <span style={{ color: t.muted }}> Belum Bayar</span>
                  }
                </p>
                {selectedMember.paidAmount > 0 && selectedMember.paidAmount < selectedMember.total && isOwner && (
                   <p style={{ fontSize: '0.7rem', color: t.muted, marginTop: 4 }}>Sudah dikonfirmasi pemilik: {fmt(selectedMember.paidAmount)}</p>
                )}
              </div>
            )}

            {/* Record as Expense Button */}
            {session?.user && (
              <div style={{ marginBottom: 16 }}>
                <button
                  disabled={recordingExpense === selectedMember.id || recordedMembers.has(selectedMember.id)}
                  onClick={() => openExpenseChecklist(selectedMember)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 16,
                    background: recordedMembers.has(selectedMember.id)
                      ? t.green
                      : `linear-gradient(135deg, #F59E0B, #EF4444)`,
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: recordedMembers.has(selectedMember.id) ? 'default' : 'pointer',
                    opacity: recordingExpense === selectedMember.id ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontFamily: 'inherit',
                    boxShadow: recordedMembers.has(selectedMember.id)
                      ? `0 4px 12px ${t.green}40`
                      : '0 4px 16px rgba(245,158,11,0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  {recordedMembers.has(selectedMember.id)
                    ? '✅ Sudah Dicatat ke Pengeluaran'
                    : recordingExpense === selectedMember.id
                    ? 'Mencatat...'
                    : '💸 Catat ke Pengeluaran Saya'}
                </button>
              </div>
            )}

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

      {/* ── INSTALLMENT MODAL ── */}
      {showInstallmentModal && selectedMember && (
        <div className="modal-backdrop" style={{ zIndex: 300 }} onClick={() => setShowInstallmentModal(false)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: t.accent + '15', color: t.accent, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem' }}>
                🕒
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>Nominal Cicilan</h3>
              <p style={{ color: t.sub, fontSize: '0.9rem', fontWeight: 600 }}>Masukkan nominal yang sudah dibayar oleh {selectedMember.name}</p>
            </div>

            <div style={{ position: 'relative', marginBottom: 24 }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: t.accent }}>Rp</span>
              <input 
                autoFocus
                type="number" 
                value={installmentAmount}
                onChange={e => setInstallmentAmount(e.target.value)}
                placeholder="0"
                style={{ width: '100%', background: t.surf2, border: `2px solid ${t.border}`, borderRadius: 16, padding: '16px 16px 16px 44px', fontSize: '1.2rem', fontWeight: 800, color: t.text, fontFamily: 'inherit', outline: 'none' }}
                onFocus={e => e.target.parentElement!.style.borderColor = t.accent}
                onBlur={e => e.target.parentElement!.style.borderColor = t.border}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowInstallmentModal(false)}>Batal</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                updateMemberPayment(selectedMember.dbId, Number(installmentAmount));
                setShowInstallmentModal(false);
              }}>Simpan</button>
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

      {/* ── ITEM CHECKLIST MODAL ── */}
      {showExpenseChecklist && checklistMember && (
        <div className="modal-backdrop" style={{ zIndex: 400 }} onClick={() => setShowExpenseChecklist(false)}>
          <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: '#F59E0B15', color: '#F59E0B', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem' }}>
                📋
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>Pilih Item</h3>
              <p style={{ color: t.sub, fontSize: '0.9rem', fontWeight: 600 }}>Pilih item {checklistMember.name} yang mau dicatat</p>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: 24, paddingRight: 4 }}>
              {checklistMember.items.map((item, idx) => {
                const isChecked = checkedItems.has(idx);
                return (
                  <div 
                    key={idx} 
                    onClick={() => {
                      const next = new Set(checkedItems);
                      if (next.has(idx)) next.delete(idx);
                      else next.add(idx);
                      setCheckedItems(next);
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12, 
                      padding: '12px 16px', 
                      background: isChecked ? t.accent + '10' : t.surf2,
                      border: `1.5px solid ${isChecked ? t.accent : t.border}`,
                      borderRadius: 16,
                      marginBottom: 10,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: 6, 
                      border: `2px solid ${isChecked ? t.accent : t.sub}`,
                      background: isChecked ? t.accent : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 12
                    }}>
                      {isChecked && <CheckIcon />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: t.sub }}>{fmt(item.share)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: `1.5px dashed ${t.border}`, paddingTop: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: t.sub }}>ESTIMASI TOTAL</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: t.accent }}>
                  {fmt(Math.round(Array.from(checkedItems).reduce((sum, idx) => sum + checklistMember.items[idx].share, 0) * (checklistMember.subtotal > 0 ? 1 + (checklistMember.tax + checklistMember.service) / checklistMember.subtotal : 1)))}
                </span>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: t.muted }}>*Termasuk Pajak & Service</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowExpenseChecklist(false)}>Batal</button>
              <button 
                disabled={checkedItems.size === 0 || recordingExpense === checklistMember.id}
                className="btn-primary" 
                style={{ flex: 1.5 }} 
                onClick={() => recordAsExpense(checklistMember, checklistMember.items.filter((_, i) => checkedItems.has(i)))}
              >
                {recordingExpense === checklistMember.id ? 'Mencatat...' : 'Konfirmasi 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'success' ? t.green : '#EF4444',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: 16,
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
