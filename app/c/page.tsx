'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import QRCode from 'react-qr-code';

// ─── Theme ────────────────────────────────────────────────────────────────────
const makeTheme = (dark: boolean) => ({
  bg:      dark ? '#0C0E16' : '#F2F4F8',
  surface: dark ? '#141620' : '#FFFFFF',
  surf2:   dark ? '#1C1F2E' : '#F8F9FC',
  border:  dark ? '#252840' : '#E4E7EF',
  text:    dark ? '#EDF0F7' : '#111827',
  sub:     dark ? '#5B6380' : '#9CA3AF',
  muted:   dark ? '#3D4260' : '#D1D5DB',
  accent:  '#5B6CF8',
  green:   '#22C55E',
  red:     dark ? '#FF6B6B' : '#EF4444',
  yellow:  '#F59E0B',
  shadow:  dark ? '0 8px 40px rgba(0,0,0,0.6)' : '0 8px 32px rgba(91,108,248,0.12)',
  shad2:   dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);
const PlusIcon = ({ size=16 }: { size?:number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/>
  </svg>
);
const WalletIcon = ({ size=20 }: { size?:number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
    <path d="M16 3H8L4 7h16l-4-4z"/>
    <circle cx="17" cy="13" r="1.2" fill="currentColor" stroke="none"/>
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => 'Rp ' + Math.floor(n).toLocaleString('id-ID');

const avatarColors = [
  '#5B6CF8', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6',
  '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

interface Member { id: string; name: string; colorIdx: number; }
interface BillItem { id: string; name: string; price: number; qty: number; assignedTo: string[]; }
interface ToastMsg { id: number; msg: string; type: 'success' | 'error' | 'info'; }

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ toast, dark }: { toast: ToastMsg | null; dark: boolean }) {
  if (!toast) return null;
  const bg = toast.type === 'success' ? '#22C55E' : toast.type === 'error' ? '#EF4444' : '#5B6CF8';
  return (
    <div style={{
      position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#fff', padding: '14px 24px', borderRadius: '14px',
      fontWeight: 700, fontSize: '0.9rem', zIndex: 9999,
      boxShadow: `0 8px 32px ${bg}60`,
      animation: 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '90vw',
      whiteSpace: 'nowrap',
    }}>
      {toast.type === 'success' && '✓'} {toast.type === 'error' && '✕'} {toast.msg}
    </div>
  );
}

export default function SplitBillPage() {
  const [dark, setDark] = useState(false);
  const [members, setMembers] = useState<Member[]>([{ id: '1', name: 'Saya', colorIdx: 0 }]);
  const [items, setItems] = useState<BillItem[]>([]);
  const [taxRate, setTaxRate] = useState(11);
  const [serviceRate, setServiceRate] = useState(0);

  // UI states
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const memberInputRef = useRef<HTMLInputElement>(null);

  // AI Modal
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  const [aiPreviewFiles, setAIPreviewFiles] = useState<{file:File, preview:string}[]>([]);
  const [aiDescription, setAIDescription] = useState('');
  const [aiResult, setAIResult] = useState<{item:string, price:number, quantity:number, assigned_to?: string[]}[] | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Share modal
  const [shareLoading, setShareLoading] = useState(false);
  const [shareModal, setShareModal] = useState<{ url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = makeTheme(dark);

  useEffect(() => {
    if (localStorage.getItem('expense-theme') === 'dark') setDark(true);
  }, []);

  useEffect(() => {
    if (addingMember && memberInputRef.current) {
      memberInputRef.current.focus();
    }
  }, [addingMember]);

  const showToast = useCallback((msg: string, type: ToastMsg['type'] = 'success') => {
    const id = Date.now();
    setToast({ id, msg, type });
    setTimeout(() => setToast(t => t?.id === id ? null : t), 3000);
  }, []);

  const toggleDark = () => {
    setDark(d => {
      const next = !d;
      localStorage.setItem('expense-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // ─── Member Management ────────────────────────────────────────────────────
  const confirmAddMember = () => {
    const name = newMemberName.trim();
    if (!name) { setAddingMember(false); return; }
    if (members.some(m => m.name.toLowerCase() === name.toLowerCase())) {
      showToast('Nama sudah ada!', 'error'); return;
    }
    setMembers(prev => [...prev, {
      id: Math.random().toString(36).slice(2, 11),
      name,
      colorIdx: prev.length % avatarColors.length,
    }]);
    setNewMemberName('');
    setAddingMember(false);
    showToast(`${name} ditambahkan!`);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    const name = members.find(m => m.id === id)?.name;
    setMembers(members.filter(m => m.id !== id));
    setItems(items.map(item => ({ ...item, assignedTo: item.assignedTo.filter(mid => mid !== id) })));
    showToast(`${name} dihapus`, 'info');
  };

  // ─── Item Management ──────────────────────────────────────────────────────
  const addItem = () => {
    setItems(prev => [...prev, {
      id: Math.random().toString(36).slice(2, 11),
      name: '', price: 0, qty: 1, assignedTo: []
    }]);
  };

  const updateItem = (id: string, updates: Partial<BillItem>) =>
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));

  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));

  const toggleAssignment = (itemId: string, memberId: string) => {
    setItems(items.map(item => {
      if (item.id !== itemId) return item;
      const assignedTo = item.assignedTo.includes(memberId)
        ? item.assignedTo.filter(id => id !== memberId)
        : [...item.assignedTo, memberId];
      return { ...item, assignedTo };
    }));
  };

  const assignAll = (itemId: string) => {
    setItems(items.map(item => item.id === itemId
      ? { ...item, assignedTo: members.map(m => m.id) } : item));
  };

  // ─── Calculations ─────────────────────────────────────────────────────────
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.price * item.qty, 0), [items]);
  const taxAmount = (subtotal * taxRate) / 100;
  const serviceAmount = (subtotal * serviceRate) / 100;
  const grandTotal = subtotal + taxAmount + serviceAmount;

  const memberBreakdowns = useMemo(() => {
    const breakdown: Record<string, { items: { name: string, share: number }[], subtotal: number }> = {};
    members.forEach(m => (breakdown[m.id] = { items: [], subtotal: 0 }));
    items.forEach(item => {
      if (item.assignedTo.length === 0) return;
      const totalItemPrice = item.price * item.qty;
      const share = totalItemPrice / item.assignedTo.length;
      item.assignedTo.forEach(mid => {
        if (breakdown[mid]) {
          breakdown[mid].items.push({ name: item.name || 'Item', share });
          breakdown[mid].subtotal += share;
        }
      });
    });
    return members.map(m => {
      const data = breakdown[m.id];
      const proportion = subtotal > 0 ? data.subtotal / subtotal : 0;
      return {
        ...m,
        items: data.items,
        subtotal: data.subtotal,
        tax: taxAmount * proportion,
        service: serviceAmount * proportion,
        total: data.subtotal + taxAmount * proportion + serviceAmount * proportion,
      };
    });
  }, [members, items, subtotal, taxAmount, serviceAmount]);

  // ─── AI Logic ─────────────────────────────────────────────────────────────
  const handleAIFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setAIPreviewFiles(prev => [...prev, ...Array.from(files).map(f => ({
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : '',
    }))]);
  };

  const processWithAI = async (customPrompt?: string) => {
    const desc = customPrompt || aiDescription;
    if (aiPreviewFiles.length === 0 && !desc) return;
    setAILoading(true);
    try {
      const formData = new FormData();
      aiPreviewFiles.forEach(f => formData.append('files', f.file));
      formData.append('description', desc);
      const res = await fetch('/api/split', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.items) setAIResult(data.items);
      else showToast('AI tidak menemukan item.', 'error');
    } catch {
      showToast('Gagal memproses input AI.', 'error');
    } finally {
      setAILoading(false);
    }
  };

  const confirmAIResult = () => {
    if (!aiResult) return;
    let updatedMembers = [...members];
    const newItems: BillItem[] = aiResult.map(res => {
      const assignedMemberIds: string[] = [];
      if (res.assigned_to?.length) {
        res.assigned_to.forEach(name => {
          const normalized = name.trim();
          if (!normalized) return;
          let member = updatedMembers.find(m => m.name.toLowerCase() === normalized.toLowerCase());
          if (!member) {
            member = { id: Math.random().toString(36).slice(2, 11), name: normalized, colorIdx: updatedMembers.length % avatarColors.length };
            updatedMembers.push(member);
          }
          assignedMemberIds.push(member.id);
        });
      }
      return { id: Math.random().toString(36).slice(2, 11), name: res.item, price: res.price, qty: res.quantity || 1, assignedTo: assignedMemberIds };
    });
    setMembers(updatedMembers);
    setItems(prev => [...prev, ...newItems]);
    setAIResult(null); setAIPreviewFiles([]); setAIDescription(''); setChatInput(''); setShowAIModal(false);
    showToast(`${newItems.length} item berhasil ditambahkan!`);
  };

  // ─── Share Logic ──────────────────────────────────────────────────────────
  const generateShareLink = async () => {
    if (items.length === 0) { showToast('Tambahkan item terlebih dahulu!', 'error'); return; }
    setShareLoading(true);
    try {
      const res = await fetch('/api/split/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { items, subtotal, tax: taxAmount, service: serviceAmount, total: grandTotal, members: memberBreakdowns, taxRate, serviceRate } }),
      });
      const { id } = await res.json();
      setShareModal({ url: `${window.location.origin}/s/${id}` });
    } catch {
      showToast('Gagal membuat link sharing.', 'error');
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareModal) return;
    await navigator.clipboard.writeText(shareModal.url);
    setCopied(true);
    showToast('Link disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    if (!shareModal) return;
    const text = `💰 *Split Bill - KeuanganKu*\nCek rincian tagihan kita:\n${shareModal.url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleChatSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setShowAIModal(true);
    processWithAI(chatInput);
  };

  const unassignedCount = items.filter(i => i.assignedTo.length === 0 && i.price > 0).length;

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Outfit', system-ui, sans-serif", paddingBottom: '120px', transition: 'background 0.3s, color 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .card {
          background: ${t.surface};
          border: 1px solid ${t.border};
          border-radius: 24px;
          box-shadow: ${t.shad2};
          padding: 28px;
          transition: background 0.3s, border-color 0.3s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #5B6CF8, #7C8CFB);
          color: #fff;
          padding: 13px 24px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 16px #5B6CF840;
          font-family: inherit;
        }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px #5B6CF850; }
        .btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-secondary {
          background: ${t.surf2};
          color: ${t.sub};
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.88rem;
          border: 1px solid ${t.border};
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: all 0.2s;
          font-family: inherit;
        }
        .btn-secondary:hover { color: ${t.text}; border-color: #5B6CF860; background: ${t.surface}; }
        .btn-secondary:active { transform: scale(0.97); }

        .btn-icon {
          background: ${t.surf2};
          border: 1px solid ${t.border};
          color: ${t.sub};
          border-radius: 12px;
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          flex-shrink: 0;
        }
        .btn-icon:hover { color: ${t.text}; border-color: #5B6CF860; }

        .field {
          background: ${t.surf2};
          border: 1.5px solid ${t.border};
          color: ${t.text};
          padding: 11px 14px;
          border-radius: 12px;
          font-family: inherit;
          font-size: 0.95rem;
          transition: all 0.2s;
          width: 100%;
        }
        .field:focus {
          outline: none;
          border-color: #5B6CF8;
          background: ${t.surface};
          box-shadow: 0 0 0 3px #5B6CF815;
        }
        .field::placeholder { color: ${t.sub}; }

        .chip {
          padding: 7px 14px;
          border-radius: 99px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s;
          border: 1.5px solid ${t.border};
          background: ${t.surf2};
          color: ${t.sub};
          white-space: nowrap;
          font-family: inherit;
        }
        .chip:hover { border-color: #5B6CF870; color: ${t.text}; }
        .chip.active { background: #5B6CF8; color: #fff; border-color: #5B6CF8; box-shadow: 0 2px 10px #5B6CF840; }

        .item-card {
          background: ${t.surf2};
          border: 1.5px solid ${t.border};
          border-radius: 20px;
          padding: 20px;
          transition: all 0.2s;
        }
        .item-card:hover { border-color: #5B6CF830; }

        .stepper-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: ${t.surface};
          border: 1.5px solid ${t.border};
          color: ${t.text};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 700;
          font-family: inherit;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .stepper-btn:hover { background: #5B6CF8; color: #fff; border-color: #5B6CF8; }

        .member-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          color: #fff;
          flex-shrink: 0;
        }

        .divider { height: 1px; background: ${t.border}; }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 20px;
        }
        .modal-box {
          background: ${t.surface};
          border: 1px solid ${t.border};
          border-radius: 28px;
          padding: 32px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.4);
          animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px) scale(0.9); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .fade-in { animation: fadeIn 0.4s ease forwards; }
        .loader { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }

        .label {
          font-size: 0.72rem;
          font-weight: 800;
          color: ${t.sub};
          text-transform: uppercase;
          letter-spacing: 0.07em;
          display: block;
          margin-bottom: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 0.92rem;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .breakdown-card {
          background: ${t.surface};
          border: 1.5px solid ${t.border};
          border-radius: 22px;
          padding: 22px;
          transition: all 0.2s;
        }
        .breakdown-card:hover { border-color: #5B6CF840; box-shadow: 0 4px 20px rgba(91,108,248,0.08); }

        .input-number::-webkit-inner-spin-button,
        .input-number::-webkit-outer-spin-button { -webkit-appearance: none; }
        .input-number { -moz-appearance: textfield; }

        /* ── Responsive Layout ─────────────────────────────────────────── */
        .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: start;
        }
        .left-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .breakdown-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .main-grid {
            grid-template-columns: 300px 1fr;
            gap: 24px;
          }
          .breakdown-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .main-grid {
            grid-template-columns: 340px 1fr;
          }
          .breakdown-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1280px) {
          .breakdown-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 640px) {
          .card { padding: 20px; border-radius: 20px; }
          .modal-box { padding: 24px; border-radius: 24px; }
          .hide-mobile { display: none !important; }
        }
      `}</style>

      <Toast toast={toast} dark={dark} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: dark ? 'rgba(20,22,32,0.95)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, zIndex: 100, transition: 'background 0.3s' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/dashboard" style={{ color: t.sub, display: 'flex', alignItems: 'center', textDecoration: 'none' }} className="btn-icon">
              <ArrowLeft />
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #5B6CF8, #9B7CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <WalletIcon size={18} />
              </div>
              <div>
                <span style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
                  Keuangan<span style={{ color: t.accent }}>Ku</span>
                </span>
                <span style={{ color: t.sub, fontWeight: 500, fontSize: '0.85rem', marginLeft: 6 }}>Split Bill</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-icon" onClick={toggleDark} title="Toggle tema">
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="btn-secondary hide-mobile" onClick={() => setShowAIModal(true)}>
              <CameraIcon /> Scan AI
            </button>
            <button
              className="btn-primary"
              onClick={generateShareLink}
              disabled={shareLoading || items.length === 0}
            >
              {shareLoading ? <div className="loader" /> : <><ShareIcon /> <span className="hide-mobile">Bagikan</span></>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Chat AI Prompt */}
        <div className="card fade-in" style={{ marginBottom: 28, background: dark ? 'linear-gradient(135deg, #141620, #1C1F2E)' : 'linear-gradient(135deg, #fff, #F8F9FC)' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#5B6CF815', color: '#5B6CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid #5B6CF830' }}>
              <BotIcon />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 4 }}>Input via Chat AI</h2>
              <p style={{ fontSize: '0.83rem', color: t.sub, lineHeight: 1.5 }}>
                Ceritakan pesananmu, AI akan membuatkan daftar item secara otomatis.
              </p>
            </div>
            <button className="btn-secondary" style={{ marginLeft: 'auto', flexShrink: 0 }} onClick={() => setShowAIModal(true)}>
              <CameraIcon /> <span className="hide-mobile">Scan Struk</span>
            </button>
          </div>
          <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: 10 }}>
            <input
              className="field"
              style={{ height: 50, fontSize: '0.95rem' }}
              placeholder="Contoh: Nasi goreng 3 porsi 75rb, Jus jeruk 2 gelas 30rb..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ height: 50, padding: '0 20px', flexShrink: 0 }} disabled={!chatInput.trim()}>
              <SendIcon />
            </button>
          </form>
        </div>

        {/* Grid Layout */}
        <div className="main-grid">

          {/* ── Left Column ─────────────────────────────────────────────── */}
          <div className="left-col">

            {/* Members */}
            <div className="card fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>👥</span> Peserta
                  <span className="badge" style={{ background: '#5B6CF815', color: '#5B6CF8', marginLeft: 4 }}>
                    {members.length}
                  </span>
                </h3>
                <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                  onClick={() => setAddingMember(true)}>
                  <PlusIcon size={13} /> Tambah
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {members.map((m, idx) => (
                  <div key={m.id} className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 8px', borderRadius: 99, background: t.surf2, border: `1.5px solid ${t.border}`, animationDelay: `${idx * 0.05}s` }}>
                    <div className="member-avatar" style={{ width: 26, height: 26, fontSize: '0.72rem', background: avatarColors[m.colorIdx] }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.name}</span>
                    {members.length > 1 && (
                      <button onClick={() => removeMember(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.sub, display: 'flex', padding: 2, opacity: 0.7, marginLeft: -2 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Inline add member */}
              {addingMember && (
                <div style={{ marginTop: 14, display: 'flex', gap: 8 }} className="fade-in">
                  <input
                    ref={memberInputRef}
                    className="field"
                    placeholder="Nama teman..."
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') confirmAddMember();
                      if (e.key === 'Escape') { setAddingMember(false); setNewMemberName(''); }
                    }}
                    style={{ height: 42 }}
                  />
                  <button className="btn-primary" style={{ height: 42, padding: '0 14px', flexShrink: 0, fontSize: '0.85rem' }} onClick={confirmAddMember}>
                    <CheckIcon />
                  </button>
                  <button className="btn-icon" style={{ height: 42, width: 42 }} onClick={() => { setAddingMember(false); setNewMemberName(''); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              )}
            </div>

            {/* Tax & Service */}
            <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🧾</span> Biaya Tambahan
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label className="label">PPN (%)</label>
                  <input className="field input-number" type="number" value={taxRate} min={0} max={100}
                    onChange={e => setTaxRate(Number(e.target.value))} />
                </div>
                <div>
                  <label className="label">Service (%)</label>
                  <input className="field input-number" type="number" value={serviceRate} min={0} max={100}
                    onChange={e => setServiceRate(Number(e.target.value))} />
                </div>
              </div>

              <div style={{ background: t.surf2, borderRadius: 16, padding: '16px 20px', border: `1px solid ${t.border}` }}>
                <div className="summary-row">
                  <span style={{ color: t.sub }}>Subtotal</span>
                  <span style={{ fontWeight: 700 }}>{fmt(subtotal)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="summary-row">
                    <span style={{ color: t.sub }}>PPN ({taxRate}%)</span>
                    <span style={{ fontWeight: 700 }}>{fmt(taxAmount)}</span>
                  </div>
                )}
                {serviceRate > 0 && (
                  <div className="summary-row">
                    <span style={{ color: t.sub }}>Service ({serviceRate}%)</span>
                    <span style={{ fontWeight: 700 }}>{fmt(serviceAmount)}</span>
                  </div>
                )}
                <div className="divider" style={{ margin: '12px 0' }} />
                <div className="summary-row">
                  <span style={{ fontWeight: 900, fontSize: '1rem' }}>Total Tagihan</span>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#5B6CF8' }}>{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Items Column ─────────────────────────────────────────────── */}
          <div className="card fade-in" style={{ animationDelay: '0.15s', minHeight: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🍽️</span> Rincian Pesanan
                {items.length > 0 && (
                  <span className="badge" style={{ background: '#5B6CF815', color: '#5B6CF8' }}>
                    {items.length}
                  </span>
                )}
              </h3>
              <button className="btn-secondary" onClick={addItem} style={{ fontSize: '0.82rem' }}>
                <PlusIcon size={13} /> Tambah
              </button>
            </div>

            {unassignedCount > 0 && (
              <div style={{ background: '#F59E0B12', border: '1px solid #F59E0B30', borderRadius: 12, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: '#F59E0B', fontWeight: 700 }}>
                ⚠️ {unassignedCount} item belum diassign ke siapapun
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: `2px dashed ${t.border}`, borderRadius: 20, color: t.sub }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🍽️</div>
                  <p style={{ fontWeight: 700, marginBottom: 6 }}>Belum ada item</p>
                  <p style={{ fontSize: '0.83rem', marginBottom: 20, lineHeight: 1.5 }}>Tambah manual atau gunakan AI untuk scan struk</p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '10px 18px' }} onClick={addItem}>
                      <PlusIcon size={14} /> Tambah Manual
                    </button>
                    <button className="btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setShowAIModal(true)}>
                      <CameraIcon /> Scan AI
                    </button>
                  </div>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={item.id} className="item-card fade-in" style={{ animationDelay: `${idx * 0.04}s` }}>
                    {/* Name & Delete */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
                      <input
                        className="field"
                        placeholder="Nama item..."
                        value={item.name}
                        onChange={e => updateItem(item.id, { name: e.target.value })}
                        style={{ flex: 1, fontWeight: 700, height: 42 }}
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{ width: 38, height: 38, borderRadius: 10, border: 'none', background: t.red + '18', color: t.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    {/* Price & Qty */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                      <div style={{ flex: 1 }}>
                        <label className="label">Harga (Rp)</label>
                        <input
                          className="field input-number"
                          type="number"
                          placeholder="0"
                          value={item.price || ''}
                          onChange={e => updateItem(item.id, { price: Number(e.target.value) })}
                          style={{ height: 42 }}
                        />
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <label className="label">Qty</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42 }}>
                          <button className="stepper-btn" onClick={() => item.qty > 1 && updateItem(item.id, { qty: item.qty - 1 })}>−</button>
                          <span style={{ width: 28, textAlign: 'center', fontWeight: 800, fontSize: '1rem' }}>{item.qty}</span>
                          <button className="stepper-btn" onClick={() => updateItem(item.id, { qty: item.qty + 1 })}>+</button>
                        </div>
                      </div>
                    </div>

                    {/* Item total */}
                    {item.price > 0 && (
                      <div style={{ marginBottom: 12, fontSize: '0.8rem', color: t.sub, fontWeight: 600 }}>
                        Subtotal: <span style={{ color: '#5B6CF8', fontWeight: 800 }}>{fmt(item.price * item.qty)}</span>
                        {item.assignedTo.length > 1 && (
                          <span style={{ marginLeft: 8 }}>· <span style={{ color: t.green }}>{fmt(item.price * item.qty / item.assignedTo.length)}</span>/orang</span>
                        )}
                      </div>
                    )}

                    <div className="divider" style={{ marginBottom: 14 }} />

                    {/* Assign */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <label className="label" style={{ margin: 0 }}>Siapa yang memesan?</label>
                        {item.assignedTo.length < members.length && (
                          <button onClick={() => assignAll(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B6CF8', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit' }}>
                            Semua +
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {members.map(m => (
                          <button
                            key={m.id}
                            className={`chip ${item.assignedTo.includes(m.id) ? 'active' : ''}`}
                            onClick={() => toggleAssignment(item.id, m.id)}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Breakdown Section ────────────────────────────────────────────── */}
        {memberBreakdowns.some(m => m.total > 0) && (
          <div className="card fade-in" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ fontWeight: 900, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>📊</span> Tagihan Per Orang
              </h3>
              <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '10px 18px' }}
                onClick={generateShareLink} disabled={shareLoading}>
                {shareLoading ? <div className="loader" /> : <><ShareIcon /> Bagikan</>}
              </button>
            </div>
            <div className="breakdown-grid">
              {memberBreakdowns.map(m => (
                <div key={m.id} className="breakdown-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="member-avatar" style={{ background: avatarColors[m.colorIdx] }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '1rem' }}>{m.name}</span>
                    </div>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#5B6CF8' }}>{fmt(m.total)}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: m.total > 0 ? 14 : 0 }}>
                    {m.items.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: t.sub, fontStyle: 'italic' }}>Belum ada pesanan</p>
                    ) : (
                      m.items.map((it, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: 6, borderBottom: `1px dashed ${t.border}` }}>
                          <span style={{ color: t.sub }}>{it.name}</span>
                          <span style={{ fontWeight: 700 }}>{fmt(it.share)}</span>
                        </div>
                      ))
                    )}
                    {(m.tax + m.service > 0) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: t.sub }}>
                        <span>Pajak & Service</span>
                        <span>{fmt(m.tax + m.service)}</span>
                      </div>
                    )}
                  </div>

                  {m.total > 0 && (
                    <div style={{ background: '#5B6CF810', padding: '10px 14px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#5B6CF8' }}>TOTAL</span>
                      <span style={{ fontWeight: 900, fontSize: '1rem', color: '#5B6CF8' }}>{fmt(m.total)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── AI Modal ─────────────────────────────────────────────────────────── */}
      {showAIModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowAIModal(false); }}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: 4 }}>
                  Analisa AI <span style={{ color: '#5B6CF8' }}>✨</span>
                </h2>
                <p style={{ fontSize: '0.82rem', color: t.sub }}>Upload foto struk atau ketik keterangan</p>
              </div>
              <button className="btn-icon" onClick={() => setShowAIModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {!aiResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Upload zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: `2px dashed ${t.border}`, borderRadius: 18, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', background: t.surf2, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B6CF8'; e.currentTarget.style.background = '#5B6CF808'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.surf2; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#5B6CF815', color: '#5B6CF8', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CameraIcon />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 6 }}>Klik untuk upload foto struk</p>
                  <p style={{ fontSize: '0.8rem', color: t.sub }}>JPG, PNG, PDF — Opsional</p>
                  <input type="file" hidden multiple ref={fileInputRef} onChange={handleAIFileUpload} accept="image/*,application/pdf" />
                </div>

                {aiPreviewFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 0' }}>
                    {aiPreviewFiles.map((f, i) => (
                      <div key={i} style={{ width: 72, height: 72, borderRadius: 14, flexShrink: 0, position: 'relative', border: `1.5px solid ${t.border}`, overflow: 'hidden', background: t.surface }}>
                        {f.preview
                          ? <img src={f.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900, color: t.sub }}>PDF</div>
                        }
                        <button
                          onClick={e => { e.stopPropagation(); setAIPreviewFiles(aiPreviewFiles.filter((_, idx2) => idx2 !== i)); }}
                          style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: t.red, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="label">Keterangan / Chat Prompt</label>
                  <textarea
                    className="field"
                    value={aiDescription || chatInput}
                    onChange={e => setAIDescription(e.target.value)}
                    placeholder="Contoh: Makan sate 5 porsi 100rb, es teh 2 gelas 20rb..."
                    style={{ resize: 'vertical', minHeight: 90, padding: '14px', lineHeight: 1.6 }}
                  />
                </div>

                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', height: 52, fontSize: '1rem' }}
                  onClick={() => processWithAI()}
                  disabled={aiLoading || (aiPreviewFiles.length === 0 && !aiDescription && !chatInput)}
                >
                  {aiLoading ? <><div className="loader" /> Sedang diproses...</> : '✨ Proses dengan AI'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: '#22C55E12', padding: '14px 18px', borderRadius: 14, border: '1px solid #22C55E30', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.3rem' }}>✅</span>
                  <div>
                    <p style={{ fontWeight: 800, color: '#22C55E', fontSize: '0.9rem' }}>AI menemukan {aiResult.length} item!</p>
                    <p style={{ fontSize: '0.78rem', color: t.sub, marginTop: 2 }}>Koreksi jika ada yang kurang tepat, lalu konfirmasi.</p>
                  </div>
                </div>

                <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
                  {aiResult.map((res, i) => (
                    <div key={i} style={{ background: t.surf2, padding: '14px 16px', borderRadius: 14, border: `1px solid ${t.border}` }}>
                      <div style={{ display: 'flex', gap: 10, marginBottom: res.assigned_to?.length ? 10 : 0 }}>
                        <input
                          className="field"
                          value={res.item}
                          onChange={e => { const n = [...aiResult]; n[i].item = e.target.value; setAIResult(n); }}
                          style={{ flex: 2, fontWeight: 700, height: 40, fontSize: '0.9rem' }}
                          placeholder="Nama item"
                        />
                        <input
                          className="field input-number"
                          type="number"
                          value={res.price}
                          onChange={e => { const n = [...aiResult]; n[i].price = Number(e.target.value); setAIResult(n); }}
                          style={{ flex: 1, fontWeight: 700, height: 40, fontSize: '0.9rem' }}
                          placeholder="Harga"
                        />
                      </div>
                      {res.assigned_to && res.assigned_to.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {res.assigned_to.map((name, j) => (
                            <span key={j} style={{ fontSize: '0.7rem', fontWeight: 800, color: '#5B6CF8', background: '#5B6CF815', padding: '3px 8px', borderRadius: 6 }}>
                              @{name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setAIResult(null); setChatInput(''); }}>
                    ← Ulang
                  </button>
                  <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={confirmAIResult}>
                    ✓ Tambahkan ke Daftar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Share Modal ───────────────────────────────────────────────────────── */}
      {shareModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShareModal(null); }}>
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: '#22C55E15', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem' }}>
                🎉
              </div>
              <h2 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: 6 }}>Link Siap Dibagikan!</h2>
              <p style={{ fontSize: '0.85rem', color: t.sub }}>Bagikan ke teman-temanmu lewat WhatsApp atau salin link-nya.</p>
            </div>

            {/* QR Code */}
            <div style={{ background: '#fff', padding: 20, borderRadius: 20, marginBottom: 20, display: 'flex', justifyContent: 'center', border: `1px solid ${t.border}` }}>
              <QRCode value={shareModal.url} size={180} />
            </div>

            {/* URL Display */}
            <div style={{ background: t.surf2, border: `1.5px solid ${t.border}`, borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, wordBreak: 'break-all' }}>
              <span style={{ flex: 1, fontSize: '0.8rem', color: t.sub, fontFamily: 'monospace' }}>{shareModal.url}</span>
              <button className="btn-icon" style={{ flexShrink: 0 }} onClick={copyShareLink} title="Salin link">
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 4px 16px #25D36640' }}
                onClick={shareViaWhatsApp}
              >
                <WhatsAppIcon /> WhatsApp
              </button>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={copyShareLink}>
                {copied ? <><CheckIcon /> Tersalin!</> : <><CopyIcon /> Salin Link</>}
              </button>
            </div>

            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShareModal(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer style={{ maxWidth: 1100, margin: '40px auto 0', textAlign: 'center', color: t.sub, fontSize: '0.8rem', padding: '0 24px' }}>
        <p style={{ fontWeight: 700 }}>KeuanganKu — Split Bill Smart</p>
        <p style={{ opacity: 0.5, marginTop: 4 }}>© 2026 WillisRH · All Rights Reserved</p>
      </footer>
    </div>
  );
}
