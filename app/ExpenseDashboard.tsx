'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getTransactions, addTransaction } from './actions';
import { Expense, Budget } from '../node_modules/.prisma/client-custom';
import QRCode from 'react-qr-code';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import ReactMarkdown from 'react-markdown';

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
  shadow:  dark ? '0 4px 32px rgba(0,0,0,0.5)' : '0 4px 24px rgba(91,108,248,0.08)',
  shad2:   dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
});

const CAT: Record<string, { color: string; emoji: string }> = {
  makanan:        { color: '#F97316', emoji: '🍜' },
  minuman:        { color: '#3B82F6', emoji: '🧋' },
  konsumsi:       { color: '#FB923C', emoji: '🍽️' },
  makanan_ringan: { color: '#FDBA74', emoji: '🍪' },

  transport:      { color: '#8B5CF6', emoji: '🚗' },
  transportasi:   { color: '#8B5CF6', emoji: '🚗' },
  bensin:         { color: '#7C3AED', emoji: '⛽' },
  parkir:         { color: '#A78BFA', emoji: '🅿️' },
  tol:            { color: '#6D28D9', emoji: '🛣️' },

  belanja:        { color: '#EC4899', emoji: '🛍️' },
  aksesori:       { color: '#F472B6', emoji: '🕶️' },
  pakaian:        { color: '#DB2777', emoji: '👕' },
  sepatu:         { color: '#BE185D', emoji: '👟' },

  hiburan:        { color: '#6366F1', emoji: '🎮' },
  langganan:      { color: '#4F46E5', emoji: '📺' },
  musik:          { color: '#4338CA', emoji: '🎵' },
  film:           { color: '#3730A3', emoji: '🎬' },

  kesehatan:      { color: '#10B981', emoji: '💊' },
  obat:           { color: '#059669', emoji: '🧴' },
  dokter:         { color: '#047857', emoji: '🩺' },

  pendidikan:     { color: '#F59E0B', emoji: '📚' },
  kursus:         { color: '#D97706', emoji: '🧑‍🏫' },
  buku:           { color: '#B45309', emoji: '📖' },

  elektronik:     { color: '#0EA5E9', emoji: '📱' },
  gadget:         { color: '#0284C7', emoji: '💻' },
  komputer:       { color: '#0369A1', emoji: '🖥️' },
  aksesoris_hp:   { color: '#075985', emoji: '🔌' },

  rumah:          { color: '#84CC16', emoji: '🏠' },
  rumah_tangga:   { color: '#65A30D', emoji: '🧹' },
  perabot:        { color: '#4D7C0F', emoji: '🪑' },

  listrik:        { color: '#FACC15', emoji: '⚡' },
  air:            { color: '#38BDF8', emoji: '🚿' },
  internet:       { color: '#06B6D4', emoji: '🌐' },
  tagihan:        { color: '#EF4444', emoji: '🧾' },

  hadiah:         { color: '#E11D48', emoji: '🎁' },
  donasi:         { color: '#F43F5E', emoji: '🤲' },

  pendapatan:     { color: '#22C55E', emoji: '💰' },
  gaji:           { color: '#16A34A', emoji: '💵' },
  bonus:          { color: '#15803D', emoji: '🎉' },
  pemasukan:      { color: '#4ADE80', emoji: '📥' },
  freelance:      { color: '#22C55E', emoji: '💻' },
  investasi:      { color: '#65A30D', emoji: '📈' },
  dividen:        { color: '#84CC16', emoji: '💹' },

  lainnya:        { color: '#94A3B8', emoji: '📌' },
};

const CHART_COLORS = ['#5B6CF8','#F97316','#22C55E','#F59E0B','#EC4899','#3B82F6','#8B5CF6','#10B981'];
const getCat = (cat: string) => CAT[cat.toLowerCase()] ?? { color: '#94A3B8', emoji: '📌' };

const fmt    = (n: number) => 'Rp ' + Math.abs(n).toLocaleString('id-ID');
const fmtS   = (n: number) => n >= 1_000_000 ? 'Rp '+(n/1_000_000).toFixed(1)+'jt' : n >= 1_000 ? 'Rp '+(n/1_000).toFixed(0)+'rb' : fmt(n);
const fmtD   = (d: Date|string) => new Date(d).toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' });
const fmtDs  = (d: Date|string) => new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short' });

// ─── SVG Kit ──────────────────────────────────────────────────────────────────
const WaveBg = ({ color }: { color:string }) => (
  <svg viewBox="0 0 400 80" fill="none" style={{ position:'absolute', bottom:0, left:0, right:0, width:'100%', opacity:0.12, pointerEvents:'none' }}>
    <path d="M0 40 Q100 10 200 40 Q300 70 400 40 L400 80 L0 80 Z" fill={color}/>
  </svg>
);
const Dots = ({ color }: { color:string }) => (
  <svg viewBox="0 0 60 60" style={{ position:'absolute', top:0, right:0, width:70, height:70, opacity:0.15, pointerEvents:'none' }}>
    {[0,1,2,3,4].flatMap(r => [0,1,2,3,4].map(c => <circle key={`${r}${c}`} cx={c*14+7} cy={r*14+7} r="2" fill={color}/>))}
  </svg>
);
const Ring = ({ color, size=42 }: { color:string; size?:number }) => (
  <svg width={size} height={size} viewBox="0 0 42 42" fill="none">
    <circle cx="21" cy="21" r="19" stroke={color} strokeWidth="1.5" opacity="0.25"/>
    <circle cx="21" cy="21" r="12" stroke={color} strokeWidth="1.5" opacity="0.45"/>
    <circle cx="21" cy="21" r="5"  fill={color}/>
  </svg>
);
const EmptySVG = ({ color }: { color:string }) => (
  <svg width="110" height="88" viewBox="0 0 110 88" fill="none">
    <rect x="15" y="16" width="80" height="58" rx="8" stroke={color} strokeWidth="1.5" opacity="0.3"/>
    <path d="M15 32h80" stroke={color} strokeWidth="1.5" opacity="0.3"/>
    <rect x="27" y="44" width="22" height="3.5" rx="2" fill={color} opacity="0.2"/>
    <rect x="27" y="53" width="36" height="3.5" rx="2" fill={color} opacity="0.15"/>
    <rect x="27" y="62" width="14" height="3.5" rx="2" fill={color} opacity="0.1"/>
    <circle cx="82" cy="66" r="14" fill={color} opacity="0.08"/>
    <path d="M78 66h8M82 62v8" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
  </svg>
);
const UpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
  </svg>
);
const DnIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const DlIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const PrIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const WalletIcon = ({ size=20 }: { size?:number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
    <path d="M16 3H8L4 7h16l-4-4z"/>
    <circle cx="17" cy="13" r="1.2" fill="currentColor" stroke="none"/>
  </svg>
);
const CvRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const SparklesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────
const ChartTip = ({ active, payload, dark }: any) => {
  if (!active || !payload?.length) return null;
  const t = makeTheme(dark);
  return (
    <div style={{ background: t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:'8px 13px', fontSize:'0.78rem', boxShadow: t.shad2, color: t.text }}>
      <div style={{ fontWeight:700, marginBottom:2 }}>{payload[0].name}</div>
      <div style={{ color: t.sub }}>{fmt(payload[0].value)}</div>
    </div>
  );
};

// ─── Typing Effect Component ────────────────────────────────────────────────
const TypingMarkdown = ({ content, speed = 12, onUpdate, onComplete }: { content: string, speed?: number, onUpdate?: () => void, onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState('');
  const onUpdateRef = useRef(onUpdate);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onCompleteRef.current = onComplete;
  }, [onUpdate, onComplete]);

  useEffect(() => {
    let i = 0;
    setDisplayed(''); // Reset content
    const interval = setInterval(() => {
      setDisplayed(content.substring(0, i));
      i++;
      if (onUpdateRef.current) onUpdateRef.current();
      if (i > content.length) {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [content, speed]);

  return <ReactMarkdown>{displayed}</ReactMarkdown>;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  const [data, setData]         = useState<Expense[]>(expenses);
  const [budgets, setBudgets]   = useState<Budget[]>([]);

  const loadData = async () => {
    try {
      const res = await getTransactions();
      setData(res);
      const bRes = await fetch('/api/budget');
      if (bRes.ok) setBudgets(await bRes.json());
    } catch(err) { console.error(err); }
  };
  const [dark, setDark]         = useState(false);
  const [search, setSearch]     = useState('');
  const [typeFilter, setType]   = useState<'all'|'income'|'expense'>('all');
  const [sortBy, setSortBy]     = useState<'date'|'amount'|'category'>('date');
  const [sortDir, setSortDir]   = useState<'desc'|'asc'>('desc');
  const [page, setPage]         = useState(1);
  const ITEMS_PER_PAGE          = 10;
  const [mounted, setMounted]   = useState(false);
  const [selected, setSelected] = useState<Expense|null>(null);
  const [tab, setTab]           = useState<'list'|'chart'|'calendar'>('list');
  const [calDate, setCalDate]   = useState(new Date());
  const [pulse, setPulse]       = useState(false);
  const [printId, setPrintId]   = useState<string|null>(null);
  const [monthlyPrintId, setMonthlyPrintId] = useState<string|null>(null);

  // Print Settings State
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [printStartDate, setPrintStartDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0,10);
  });
  const [printEndDate, setPrintEndDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth()+1, 0); return d.toISOString().slice(0,10);
  });

  // Add Transaction State
  const [showAdd, setShowAdd]       = useState(false);
  const [addType, setAddType]       = useState<'expense'|'income'>('expense');
  const [addItem, setAddItem]       = useState('');
  const [addAmount, setAddAmount]   = useState('');
  const [addCategory, setAddCat]    = useState('makanan');
  const [addDesc, setAddDesc]       = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  // Budget Modal State
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetCategory, setBudgetCategory]   = useState('makanan');
  const [budgetAmount, setBudgetAmount]       = useState('');

  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role:'user'|'assistant', content:string, isTyped?:boolean, actionData?:Expense[], pendingBudget?:{category:string, amount:number, confirmed?:boolean}}[]>([
    { role: 'assistant', content: (() => {
      const h = new Date().getHours();
      let g = 'Malam'; if (h < 11) g = 'Pagi'; else if (h < 15) g = 'Siang'; else if (h < 18) g = 'Sore';
      return `Halo selamat ${g} Mas! Aku Keuanganku AI. Ada yang bisa aku bantu seputar transaksimu?`;
    })(), isTyped: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading, showChat]);

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const newMsgs: {role:'user'|'assistant', content:string, isTyped?:boolean, actionData?:Expense[]}[] = [
      ...chatMessages,
      { role: 'user', content: chatInput.trim(), isTyped: true }
    ];
    setChatMessages(newMsgs);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs })
      });
      const data = await res.json();
      if (data.text) {
        setChatMessages([...newMsgs, { role: 'assistant', content: data.text, actionData: data.actionData, pendingBudget: data.pendingBudget }]);
        if (data.actionData) {
          loadData(); // Re-fetch main table if the AI added a row
        }
      }
    } catch (err) {
      console.error(err);
      setChatMessages([...newMsgs, { role: 'assistant', content: 'Maaf, gagal menghubungi AI.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const confirmBudget = async (b: {category:string, amount:number}, msgIndex: number) => {
    try {
      setIsChatLoading(true);
      await fetch('/api/budget', { method: 'POST', body: JSON.stringify(b) });
      await loadData();
      
      // Mark as confirmed
      setChatMessages(prev => {
        const clone = [...prev];
        if (clone[msgIndex]?.pendingBudget) {
          clone[msgIndex].pendingBudget!.confirmed = true;
        }
        return [...clone, { role: 'assistant', content: `Sip Mas! Target pengeluaran untuk kategori **${b.category}** sebesar ${fmt(b.amount)} berhasil aku simpan ya! 🎯` }];
      });
    } catch(e) {
      console.error(e);
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Maaf Mas, gagal menyimpan target anggarannya.` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('expense-theme') === 'dark') setDark(true);
    loadData(); // Load budgets on mount
  }, []);

  useEffect(() => { if (mounted) localStorage.setItem('expense-theme', dark ? 'dark' : 'light'); }, [dark, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(async () => {
      try { 
        setData(await getTransactions()); 
        setPulse(true); 
        setTimeout(() => setPulse(false), 1000); 
      } catch {}
    }, 5000);
    return () => clearInterval(id);
  }, [mounted]);

  // Reset page on search or filter change
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, sortBy, sortDir]);

  const toggleSort = (col: 'date'|'amount'|'category') => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    let d = data.filter(e => {
      const q = search.toLowerCase();
      return (e.item.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
        && (typeFilter === 'all' || e.type === typeFilter);
    });
    return [...d].sort((a, b) => {
      let v: number;
      if (sortBy === 'date') v = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortBy === 'category') v = a.category.localeCompare(b.category);
      else v = a.amount - b.amount;
      return sortDir === 'desc' ? -v : v;
    });
  }, [data, search, typeFilter, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const stats = useMemo(() => {
    const inc = data.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
    const exp = data.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
    return { inc, exp, bal: inc - exp };
  }, [data]);

  const chartData = useMemo(() => {
    const m: Record<string,number> = {};
    data.filter(e=>e.type==='expense').forEach(e => { m[e.category] = (m[e.category]||0) + e.amount; });
    return Object.entries(m).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,7);
  }, [data]);

  const monthlyData = useMemo(() => {
    const m: Record<string,{income:number;expense:number}> = {};
    data.forEach(e => {
      const k = new Date(e.createdAt).toLocaleDateString('id-ID',{month:'short',year:'2-digit'});
      if (!m[k]) m[k]={income:0,expense:0};
      m[k][e.type==='income'?'income':'expense'] += e.amount;
    });
    return Object.entries(m).map(([name,v])=>({name,...v})).slice(-6);
  }, [data]);

  const calDays = useMemo(() => {
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [calDate]);

  const dailySummary = useMemo(() => {
    const summary: Record<string, { inc: number, exp: number }> = {};
    data.forEach(e => {
      const d = new Date(e.createdAt).toISOString().slice(0, 10);
      if (!summary[d]) summary[d] = { inc: 0, exp: 0 };
      if (e.type === 'income') summary[d].inc += e.amount;
      else summary[d].exp += e.amount;
    });
    return summary;
  }, [data]);

  const top3 = useMemo(() => [...data].filter(e=>e.type==='expense').sort((a,b)=>b.amount-a.amount).slice(0,3), [data]);

  // Data specifically filtered for the Print Report
  const printFilteredData = useMemo(() => {
    const start = new Date(printStartDate); start.setHours(0,0,0,0);
    const end = new Date(printEndDate); end.setHours(23,59,59,999);
    return [...data].filter(e => {
      const d = new Date(e.createdAt);
      return d >= start && d <= end;
    }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [data, printStartDate, printEndDate]);

  const printStats = useMemo(() => {
    const inc = printFilteredData.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
    const exp = printFilteredData.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
    return { inc, exp, bal: inc - exp };
  }, [printFilteredData]);

  const exportCSV = () => {
    const h = ['Date','Type','Item','Category','Qty','Amount','Description'];
    const rows = data.map(e => [new Date(e.createdAt).toISOString(),e.type,`"${e.item}"`,e.category,e.quantity??1,e.amount,`"${e.description}"`]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[h,...rows].map(r=>r.join(',')).join('\n')], {type:'text/csv'}));
    a.download = `transaksi_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const handlePrint = async () => {
    if (!selected) return;
    try {
      const res = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenseId: selected.id }),
      });
      const data = await res.json();
      
      const oldTitle = document.title;
      const cleanItem = selected.item.replace(/[^a-zA-Z0-9]/g, '_');
      document.title = `Struk_Keu_${cleanItem}_${selected.id.slice(0,6).toUpperCase()}`;

      if (data.printId) {
        setPrintId(data.printId);
        setTimeout(() => {
          window.print();
          document.title = oldTitle;
        }, 150);
      } else {
        window.print();
        document.title = oldTitle;
      }
    } catch (e) {
      console.error('Print error:', e);
      window.print();
    }
  };

  useEffect(() => {
    if (!selected) setPrintId(null);
  }, [selected]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addItem || !addAmount) return;
    setSubmitting(true);
    try {
      await addTransaction({
        item: addItem,
        amount: parseFloat(addAmount),
        category: addCategory,
        type: addType,
        description: addDesc
      });
      // Reset form & close
      setAddItem(''); setAddAmount(''); setAddDesc(''); setAddCat('makanan'); setAddType('expense');
      setShowAdd(false);
      // Refresh Data
      setData(await getTransactions());
      setPulse(true); setTimeout(() => setPulse(false), 1000);
    } catch (err) {
      console.error('Failed to add transaction:', err);
      alert('Gagal menyimpan transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBudgetManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetCategory || !budgetAmount) return;
    setSubmitting(true);
    try {
      await fetch('/api/budget', { 
        method: 'POST', 
        body: JSON.stringify({ category: budgetCategory, amount: parseFloat(budgetAmount) }) 
      });
      await loadData();
      setShowBudgetModal(false);
      setBudgetAmount('');
    } catch(err) {
      console.error(err);
      alert('Gagal menyimpan target anggaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBudgetDelete = async () => {
    if (!budgetCategory) return;
    if (!confirm(`Yakin ingin menghapus target untuk kategori ${CAT[budgetCategory]?.emoji || ''} ${budgetCategory}?`)) return;
    setSubmitting(true);
    try {
      await fetch(`/api/budget?category=${encodeURIComponent(budgetCategory)}`, { method: 'DELETE' });
      await loadData();
      setShowBudgetModal(false);
      setBudgetAmount('');
    } catch(err) {
      console.error(err);
      alert('Gagal menghapus target anggaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const t = makeTheme(dark);
  const balPos = stats.bal >= 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const spentPerCategory = useMemo(() => {
    const m: Record<string,number> = {};
    data.filter(e => e.type === 'expense' && new Date(e.createdAt).getMonth() === currentMonth && new Date(e.createdAt).getFullYear() === currentYear).forEach(e => {
      const c = e.category.toLowerCase().trim();
      m[c] = (m[c]||0) + e.amount;
    });
    return m;
  }, [data, currentMonth, currentYear]);

  if (!mounted) return null;

  return (
    <div style={{ minHeight:'100vh', background:t.bg, color:t.text, fontFamily:"'Outfit', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes up    { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
        @keyframes scIn  { from { opacity:0; transform:scale(.96) } to { opacity:1; transform:scale(1) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

        .f1{animation:up .38s ease both .04s}
        .f2{animation:up .38s ease both .09s}
        .f3{animation:up .38s ease both .14s}
        .f4{animation:up .38s ease both .19s}
        .sc{animation:scIn .28s ease both}

        .row{transition:background .12s,transform .1s;cursor:pointer}
        .row:hover{background:${t.surf2} !important}
        .row:active{transform:scale(.996)}

        .tab{border:none;background:none;cursor:pointer;font-family:inherit;
          padding:7px 17px;border-radius:10px;font-size:.82rem;font-weight:600;
          color:${t.sub};transition:all .15s}
        .tab.on{background:${t.accent}18;color:${t.accent}}

        .pill{border:none;background:none;cursor:pointer;font-family:inherit;
          padding:5px 14px;border-radius:99px;font-size:.76rem;font-weight:600;
          color:${t.sub};transition:all .15s}
        .pill.on{background:${dark?'#252840':'#ECEFFE'};color:${t.accent}}
        .pill:hover{color:${t.text}}

        .ibtn{display:inline-flex;align-items:center;gap:5px;border:1px solid ${t.border};
          background:${t.surface};color:${t.sub};border-radius:10px;padding:7px 13px;
          font-size:.77rem;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
        .ibtn:hover{color:${t.accent};border-color:${t.accent}40}

        .sth{cursor:pointer;user-select:none;transition:color .15s}
        .sth:hover{color:${t.text} !important}

        input{font-family:inherit}
        input::placeholder{color:${t.sub}}
        input:focus{outline:none}

        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${t.muted};border-radius:99px}

        @media print{
          .np{display:none !important}
          .print-only{display:block !important}
          .modal-backdrop-print { position:absolute !important; top:0 !important; left:0 !important; right:0 !important; align-items:flex-start !important; padding-top:40px !important; background:transparent !important; backdrop-filter:none !important; }
          .pa { box-shadow:none !important; border:1px solid #ccc !important; }
        }
        .print-only { display: none; }
        .watermark {
          position: absolute; top: 45%; left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: clamp(4rem, 8vw, 6rem); font-weight: 900;
          color: rgba(34, 197, 94, 0.08);
          pointer-events: none; z-index: 0;
          letter-spacing: 15px; user-select: none;
        }

        .md-chat p { margin-bottom: 8px; }
        .md-chat p:last-child { margin-bottom: 0; }
        .md-chat ul, .md-chat ol { margin-left: 18px; margin-bottom: 8px; }
        .md-chat li { margin-bottom: 4px; }
        .md-chat strong { font-weight: 800; color: ${t.text}; }
        .md-chat code { background: ${dark?'#000':'#eef'}; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.8rem; }

        @media(max-width:640px){
          .dsk{display:none !important}
          .mob{display:flex !important}
          .sg{grid-template-columns:1fr 1fr !important}
          .ha .ibtn span{display:none}
          .ha .ibtn{padding:7px !important}
        }
        @media(min-width:641px){.mob{display:none !important}}
      `}</style>

      <div className="np" style={{ maxWidth:1080, margin:'0 auto', padding:'clamp(1rem,4vw,2.5rem) clamp(1rem,4vw,1.75rem)' }}>

        {/* ── HEADER ── */}
        <header className="np" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:14, background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 6px 18px ${t.accent}40`, color:'#fff' }}>
              <WalletIcon size={22} />
            </div>
            <div>
              <h1 style={{ fontSize:'1.25rem', fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>
                Keuangan<span style={{ color:t.accent }}>ku</span>
              </h1>
              <p style={{ fontSize:'0.75rem', color:t.sub, marginTop:4, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                {(() => {
                  const h = new Date().getHours();
                  if (h < 11) return <><span style={{fontSize:14}}>🌅</span> Selamat Pagi, Mas!</>;
                  if (h < 15) return <><span style={{fontSize:14}}>☀️</span> Selamat Siang, Mas!</>;
                  if (h < 18) return <><span style={{fontSize:14}}>🌇</span> Selamat Sore, Mas!</>;
                  return <><span style={{fontSize:14}}>🌙</span> Selamat Malam, Mas!</>;
                })()}
              </p>
            </div>
          </div>
          <div className="ha" style={{ display:'flex', gap:8, alignItems:'center' }}>
            {/* <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.68rem', color:pulse?t.green:t.sub, transition:'color .3s' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:pulse?t.green:t.muted, transition:'background .3s', animation:pulse?'blink .6s ease':'none' }}/>
              <span className="dsk">Live</span>
            </div> */}
            <button className="ibtn" onClick={exportCSV}><DlIcon /><span>CSV</span></button>
            <button className="ibtn" onClick={()=>setShowPrintSettings(true)}><PrIcon /><span>Print</span></button>
            <button onClick={()=>setDark(!dark)} style={{ width:34, height:34, borderRadius:10, border:`1px solid ${t.border}`, background:t.surface, color:t.sub, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </header>

        {/* ── HERO BALANCE CARD ── */}
        <div className="f1 np" style={{
          background:`linear-gradient(135deg, ${balPos?'#1B3554':'#3A1414'} 0%, ${balPos?'#0F2440':'#280E0E'} 100%)`,
          borderRadius:20, padding:'clamp(1.25rem,4vw,1.75rem)', marginBottom:'1.25rem',
          position:'relative', overflow:'hidden',
          boxShadow:`0 8px 32px ${balPos?'#1B355444':'#3A141444'}`,
        }}>
          <WaveBg color={balPos?'#60A5FA':'#F87171'} />
          <Dots color={balPos?'#93C5FD':'#FCA5A5'} />
          <div style={{ position:'absolute', top:-40, left:-40, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.025)' }}/>
          <div style={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', opacity:.55, color:'#fff', marginBottom:8 }}>Saldo Bersih</p>
              <p style={{ fontSize:'clamp(1.9rem,6vw,2.7rem)', fontWeight:800, letterSpacing:'-1px', color:'#fff', lineHeight:1, marginBottom:16 }}>
                {balPos?'':'−'}{fmt(stats.bal)}
              </p>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:20 }}>
                <span style={{ fontSize:'0.77rem', color:'#86EFAC', display:'flex', alignItems:'center', gap:4 }}><UpIcon /> {fmtS(stats.inc)} masuk</span>
                <span style={{ fontSize:'0.77rem', color:'#FCA5A5', display:'flex', alignItems:'center', gap:4 }}><DnIcon /> {fmtS(stats.exp)} keluar</span>
              </div>
              
              <button onClick={()=>setShowAdd(true)} style={{ height:38, padding:'0 18px', borderRadius:10, background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, color:'#fff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:'0.82rem', boxShadow:`0 6px 20px ${t.accent}40`, letterSpacing:'0.03em', transition:'transform 0.1s' }} onMouseDown={e=>e.currentTarget.style.transform='scale(0.96)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                <PlusIcon /> Catat Transaksi
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
              <Ring color={balPos?'#60A5FA':'#F87171'} size={46} />
              <span style={{ fontSize:'0.67rem', opacity:.45, color:'#fff' }}>{data.length} transaksi</span>
            </div>
          </div>
        </div>

        {/* ── BUDGET PROGRESS ── */}
        <div className="np" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:800, letterSpacing:'-0.5px' }}>🎯 Target Anggaran</h2>
          <button onClick={() => setShowBudgetModal(true)} style={{ height:34, padding:'0 14px', borderRadius:8, background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, color:'#fff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontWeight:700, fontSize:'0.75rem', boxShadow:`0 4px 12px ${t.accent}40`, transition:'transform 0.1s' }} onMouseDown={e=>e.currentTarget.style.transform='scale(0.96)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
            <PlusIcon /> Atur Target
          </button>
        </div>

        {budgets.length > 0 ? (
          <div className="np sg" style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
            {budgets.map(b => {
              const spent = spentPerCategory[b.category] || 0;
              const pct = Math.min(100, (spent / b.amount) * 100);
              const isDanger = pct >= 90;
              const isWarning = pct >= 75 && !isDanger;
              const barColor = isDanger ? t.red : isWarning ? t.yellow : t.green;
              const catTheme = getCat(b.category);
              
              return (
                <div className="sc row" onClick={() => { setBudgetCategory(b.category); setBudgetAmount(b.amount.toString()); setShowBudgetModal(true); }} key={b.id} style={{ minWidth:0, background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'clamp(10px,2.5vw,16px)', boxShadow:t.shad2 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:8, flexWrap:'wrap', gap:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:0 }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:catTheme.color+'20', color:catTheme.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', flexShrink:0 }}>{catTheme.emoji}</div>
                      <div style={{ minWidth:0, flex:1 }}>
                        <p style={{ fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:t.sub, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Target {b.category}</p>
                        <p style={{ fontSize:'0.9rem', fontWeight:800, color:t.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{fmtS(spent)} <span style={{fontSize:'0.7rem', color:t.sub, fontWeight:600}}>/ {fmtS(b.amount)}</span></p>
                      </div>
                    </div>
                    <span style={{ fontSize:'0.75rem', fontWeight:800, color:barColor, flexShrink:0 }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height:6, background:t.border, borderRadius:4, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:barColor, borderRadius:4, transition:'width 0.5s ease-out' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="np" style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'24px', textAlign:'center', color:t.sub, marginBottom:'1.5rem', boxShadow:t.shad2 }}>
            <p style={{ fontSize:'0.85rem' }}>Belum ada target anggaran. Tetapkan limit untuk mulai mengawasi pengeluaranmu!</p>
          </div>
        )}

        {/* ── DIVIDER ── */}
        <div className="np" style={{ height: 1, background: t.border, margin: '1rem 0 2rem 0', opacity: 0.6 }} />

        {/* ── STAT CARDS ── */}
        <div className="sg np" style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'0.75rem', marginBottom:'1.5rem' }}>
          {[
            { label:'Pemasukan', val:stats.inc, color:t.green,  svg:<UpIcon />,  dim:`${data.filter(e=>e.type==='income').length} transaksi` },
            { label:'Pengeluaran', val:stats.exp, color:t.red,  svg:<DnIcon />,  dim:`${data.filter(e=>e.type==='expense').length} transaksi` },
            { label:'Terbesar', val:top3[0]?.amount??0, color:t.yellow, svg:<StarIcon />, dim:top3[0]?.item??'—', span2:true },
          ].map((c, i) => (
            <div key={i} className={`f${i+2}`} style={{ minWidth:0, gridColumn: c.span2 ? 'span 2' : 'auto', background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'clamp(12px,3vw,18px)', position:'relative', overflow:'hidden', boxShadow:t.shad2 }}>
              <Dots color={c.color} />
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                <div style={{ width:24, height:24, borderRadius:7, background:c.color+'20', color:c.color, display:'flex', alignItems:'center', justifyContent:'center' }}>{c.svg}</div>
                <span style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:t.sub }}>{c.label}</span>
              </div>
              <p style={{ fontSize:'clamp(.95rem,3vw,1.25rem)', fontWeight:800, color:c.color, letterSpacing:'-0.4px', marginBottom:3 }}>{fmtS(c.val)}</p>
              <p style={{ fontSize:'0.68rem', color:t.sub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.dim}</p>
            </div>
          ))}
        </div>

        {/* ── TABS + FILTER ── */}
        <div className="np" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', gap:3, background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:4 }}>
            {(['list', 'chart', 'calendar'] as const).map(v => (
              <button key={v} className={`tab ${tab===v?'on':''}`} onClick={()=>setTab(v)}>
                {v==='list'?'📋 Transaksi':v==='chart'?'📊 Grafik':'📅 Kalender'}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:3, background:dark?t.surface:'#F1F3F9', padding:3, borderRadius:99, border:`1px solid ${t.border}` }}>
            {(['all','income','expense'] as const).map(v => (
              <button key={v} className={`pill ${typeFilter===v?'on':''}`} onClick={()=>setType(v)}>
                {v==='all'?'Semua':v==='income'?'↑ Masuk':'↓ Keluar'}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════ CHART TAB ══════════════ */}
        {tab === 'chart' && (
          <div className="sc" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>

            {/* Pie */}
            <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'20px 20px 14px', boxShadow:t.shad2 }}>
              <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:t.sub, marginBottom:14 }}>Kategori Pengeluaran</p>
              {chartData.length > 0 ? (
                <>
                  <div style={{ height:180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="42%" cy="50%" innerRadius={46} outerRadius={72} dataKey="value" paddingAngle={2} animationDuration={700}>
                          {chartData.map((_,i) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} stroke="none"/>)}
                        </Pie>
                        <Tooltip content={<ChartTip dark={dark}/>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 12px', marginTop:10 }}>
                    {chartData.map((d,i) => (
                      <div key={d.name} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.7rem', color:t.sub }}>
                        <div style={{ width:7, height:7, borderRadius:2, background:CHART_COLORS[i%CHART_COLORS.length], flexShrink:0 }}/>
                        <span style={{ textTransform:'capitalize' }}>{d.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ height:180, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
                  <EmptySVG color={t.muted} />
                  <p style={{ fontSize:'0.78rem', color:t.sub }}>Belum ada data</p>
                </div>
              )}
            </div>

            {/* Bar */}
            <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'20px 20px 14px', boxShadow:t.shad2 }}>
              <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:t.sub, marginBottom:14 }}>Trend Bulanan</p>
              {monthlyData.length > 0 ? (
                <>
                  <div style={{ height:180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false}/>
                        <XAxis dataKey="name" tick={{ fontSize:9, fill:t.sub }} axisLine={false} tickLine={false}/>
                        <YAxis tickFormatter={v=>fmtS(v).replace('Rp ','')} tick={{ fontSize:9, fill:t.sub }} axisLine={false} tickLine={false} width={34}/>
                        <Tooltip content={<ChartTip dark={dark}/>} />
                        <Bar dataKey="income"  fill={t.green} radius={[4,4,0,0]} opacity={.85}/>
                        <Bar dataKey="expense" fill={t.red}   radius={[4,4,0,0]} opacity={.85}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display:'flex', gap:14, marginTop:10 }}>
                    {[['income','Pemasukan',t.green],['expense','Pengeluaran',t.red]].map(([k,l,c])=>(
                      <div key={k} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.7rem', color:t.sub }}>
                        <div style={{ width:7, height:7, borderRadius:2, background:c as string }}/>
                        {l}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ height:180, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
                  <EmptySVG color={t.muted} />
                  <p style={{ fontSize:'0.78rem', color:t.sub }}>Belum ada data</p>
                </div>
              )}
            </div>

            {/* Top 3 */}
            <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'20px', boxShadow:t.shad2 }}>
              <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:t.sub, marginBottom:16 }}>🔥 Top Pengeluaran</p>
              {top3.length === 0
                ? <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, height:120 }}><EmptySVG color={t.muted}/><p style={{ fontSize:'0.78rem', color:t.sub }}>Belum ada data</p></div>
                : top3.map((e, i) => {
                  const cat = getCat(e.category);
                  return (
                    <div key={e.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:i<2?14:0 }}>
                      <div style={{ width:38, height:38, borderRadius:11, background:cat.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{cat.emoji}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:600, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>{e.item}</p>
                        <p style={{ fontSize:'0.68rem', color:t.sub }}>{fmtDs(e.createdAt)}</p>
                      </div>
                      <span style={{ fontWeight:800, color:t.red, fontSize:'0.85rem', whiteSpace:'nowrap' }}>{fmtS(e.amount)}</span>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

        {/* ══════════════ CALENDAR TAB ══════════════ */}
        {tab === 'calendar' && (
           <div className="sc" style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'clamp(15px,4vw,20px)', boxShadow:t.shad2, marginBottom:'1.5rem', minWidth:0, overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem', gap:10 }}>
                <h3 style={{ fontSize:'clamp(0.85rem,3vw,1rem)', fontWeight:800, color:t.text, textTransform:'capitalize', margin:0 }}>
                  {calDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                </h3>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}
                    title="Bulan Sebelumnya"
                    style={{ background:t.surf2, border:`1px solid ${t.border}`, borderRadius:8, width:32, height:32, cursor:'pointer', color:t.text, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>←</button>
                  <button onClick={() => setCalDate(new Date())}
                    title="Bulan Ini"
                    style={{ background:t.surf2, border:`1px solid ${t.border}`, borderRadius:8, padding:'0 10px', height:32, cursor:'pointer', color:t.text, fontSize:'0.7rem', fontWeight:700, transition:'all .2s' }}>Hari Ini</button>
                  <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))}
                    title="Bulan Berikutnya"
                    style={{ background:t.surf2, border:`1px solid ${t.border}`, borderRadius:8, width:32, height:32, cursor:'pointer', color:t.text, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>→</button>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'clamp(2px,1vw,6px)' }}>
                {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map((d,idx) => (
                  <div key={d} style={{ textAlign:'center', fontSize:'0.6rem', fontWeight:800, color:idx===0?t.red:t.sub, opacity:0.6, paddingBottom:6, textTransform:'uppercase' }}>{d}</div>
                ))}
                {calDays.map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} style={{ aspectRatio:'1/1' }}/>;
                  
                  const dStr = date.toISOString().slice(0,10);
                  const summary = dailySummary[dStr];
                  const isToday = new Date().toISOString().slice(0,10) === dStr;
                  const dayNum = date.getDate();

                  return (
                    <div key={dStr} className="cal-day" style={{ 
                      aspectRatio:'1/1', border:`1px solid ${isToday ? t.accent : t.border}`, 
                      borderRadius:10, padding:' clamp(2px,1vw,6px)', display:'flex', flexDirection:'column', justifyContent:'space-between',
                      background: isToday ? t.accent+'08' : t.surf2,
                      position:'relative', transition:'transform .2s, box-shadow .2s',
                    }}>
                      <span style={{ fontSize:'clamp(0.65rem,2vw,0.78rem)', fontWeight:800, color: isToday ? t.accent : t.text, opacity: isToday?1:0.8 }}>{dayNum}</span>
                      <div style={{ display:'flex', flexDirection:'column', gap:1, alignItems:'flex-end', overflow:'hidden' }}>
                        {summary?.inc > 0 && (
                          <span style={{ fontSize:'clamp(0.48rem,1.5vw,0.6rem)', fontWeight:800, color:t.green, whiteSpace:'nowrap' }}>
                            <span className="dsk-inline">+{fmtS(summary.inc).replace('Rp ','')}</span>
                            <span className="mob-inline">+{fmtS(summary.inc).replace('Rp ','').replace(/\.000$/,'rb').replace('000rb','jt').replace('000jt','M')}</span>
                          </span>
                        )}
                        {summary?.exp > 0 && (
                          <span style={{ fontSize:'clamp(0.48rem,1.5vw,0.6rem)', fontWeight:800, color:t.red, whiteSpace:'nowrap' }}>
                            <span className="dsk-inline">-{fmtS(summary.exp).replace('Rp ','')}</span>
                            <span className="mob-inline">-{fmtS(summary.exp).replace('Rp ','').replace(/\.000$/,'rb').replace('000rb','jt').replace('000jt','M')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <style jsx>{`
                .cal-day:hover { transform: scale(1.05); z-index: 2; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .dsk-inline { display: inline; }
                .mob-inline { display: none; }
                @media (max-width: 600px) {
                  .dsk-inline { display: none; }
                  .mob-inline { display: inline; }
                }
              `}</style>
           </div>
        )}

        {/* ══════════════ LIST TAB ══════════════ */}
        {tab === 'list' && (
          <>
            {/* Controls (Search + Sort) */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:'0.9rem' }}>
              <div style={{ flex:1, minWidth:200, display:'flex', alignItems:'center', gap:8, background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:'9px 14px', boxShadow:t.shad2 }}>
                <SearchIcon />
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari item atau kategori..."
                  style={{ flex:1, background:'transparent', border:'none', color:t.text, fontSize:'0.875rem' }}/>
                {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:t.sub, display:'flex', padding:2 }}><XIcon /></button>}
              </div>
              <div style={{ display:'flex', alignItems:'center', background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:'0 12px', boxShadow:t.shad2, minWidth:140 }}>
                <select 
                  value={`${sortBy}-${sortDir}`} 
                  onChange={e => {
                    const [b, d] = e.target.value.split('-');
                    setSortBy(b as 'date'|'amount'|'category');
                    setSortDir(d as 'asc'|'desc');
                  }}
                  style={{ flex:1, background:'none', border:'none', color:t.text, fontSize:'0.8rem', fontWeight:600, outline:'none', cursor:'pointer', padding:'10px 0', appearance:'none' }}>
                  <option value="date-desc">Urutkan: Terbaru</option>
                  <option value="date-asc">Urutkan: Terlama</option>
                  <option value="amount-desc">Urutkan: Termahal</option>
                  <option value="amount-asc">Urutkan: Termurah</option>
                  <option value="category-asc">Urutkan: Kategori (A-Z)</option>
                  <option value="category-desc">Urutkan: Kategori (Z-A)</option>
                </select>
                <span style={{ fontSize:'0.6rem', transform:'rotate(90deg)', opacity:0.5 }}>›</span>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="dsk" style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, overflow:'hidden', boxShadow:t.shad2 }}>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:580 }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${t.border}`, background:dark?'#161828':'#FAFBFC' }}>
                      {[
                        { label:'Tanggal', key:'date' as const },
                        { label:'', key:null },
                        { label:'Item', key:null },
                        { label:'Kategori', key:'category' as const },
                        { label:'Nominal', key:'amount' as const },
                        { label:'Keterangan', key:null },
                      ].map(({label,key},i) => (
                        <th key={i} className={key?'sth':''} onClick={()=>key&&toggleSort(key)}
                          style={{ padding:'11px 16px', textAlign:i===4?'right':'left', fontSize:'0.67rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:sortBy===key?t.accent:t.sub, whiteSpace:'nowrap' }}>
                          {label}{key&&sortBy===key?(sortDir==='desc'?' ↓':' ↑'):key?' ↕':''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign:'center', padding:'3rem' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, color:t.sub }}>
                          <EmptySVG color={t.muted} />
                          <p style={{ fontSize:'0.83rem' }}>{search?`Tidak ada "${search}"` : 'Belum ada transaksi'}</p>
                        </div>
                      </td></tr>
                    ) : paginatedData.map(e => {
                      const cat = getCat(e.category);
                      const isIn = e.type === 'income';
                      return (
                        <tr key={e.id} className="row" onClick={()=>setSelected(e)} style={{ borderBottom:`1px solid ${t.border}` }}>
                          <td style={{ padding:'12px 16px', fontSize:'0.77rem', color:t.sub, whiteSpace:'nowrap' }}>{fmtDs(e.createdAt)}</td>
                          <td style={{ padding:'12px 10px 12px 16px' }}>
                            <div style={{ width:26, height:26, borderRadius:8, background:isIn?t.green+'1E':t.red+'1E', color:isIn?t.green:t.red, display:'flex', alignItems:'center', justifyContent:'center' }}>
                              {isIn?<UpIcon/>:<DnIcon/>}
                            </div>
                          </td>
                          <td style={{ padding:'12px 16px', fontWeight:600, fontSize:'0.87rem' }}>
                            {e.item}
                            {(e.quantity??1)>1 && <span style={{ marginLeft:6, fontSize:'0.7rem', color:t.sub }}>×{e.quantity}</span>}
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:cat.color+(dark?'25':'15'), color:cat.color, padding:'3px 9px', borderRadius:99, fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.03em' }}>
                              {cat.emoji} {e.category}
                            </span>
                          </td>
                          <td style={{ padding:'12px 16px', textAlign:'right', fontWeight:700, fontSize:'0.9rem', color:isIn?t.green:t.red, whiteSpace:'nowrap' }}>
                            {isIn?'+':'−'} {fmt(e.amount)}
                          </td>
                          <td style={{ padding:'12px 16px', fontSize:'0.77rem', color:t.sub, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {e.description||'—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length > 0 && (
                <div style={{ padding:'9px 16px', borderTop:`1px solid ${t.border}`, display:'flex', justifyContent:'space-between', fontSize:'0.73rem', color:t.sub, alignItems:'center' }}>
                  <span>{filtered.length} transaksi filter</span>
                  <span>
                    <span style={{ color:t.green, fontWeight:700 }}>+{fmt(filtered.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0))}</span>
                    <span style={{ margin:'0 5px', opacity:.3 }}>·</span>
                    <span style={{ color:t.red, fontWeight:700 }}>−{fmt(filtered.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0))}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="mob" style={{ flexDirection:'column', gap:'0.55rem' }}>
              {paginatedData.length === 0 ? (
                <div style={{ textAlign:'center', padding:'3rem 1rem', color:t.sub, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                  <EmptySVG color={t.muted} />
                  <p style={{ fontSize:'0.83rem' }}>{search?`Tidak ada "${search}"` : 'Belum ada transaksi'}</p>
                </div>
              ) : paginatedData.map(e => {
                const cat = getCat(e.category);
                const isIn = e.type === 'income';
                return (
                  <div key={e.id} className="row" onClick={()=>setSelected(e)}
                    style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:14, padding:'13px 15px', display:'flex', alignItems:'center', gap:12, boxShadow:t.shad2 }}>
                    <div style={{ width:42, height:42, borderRadius:12, background:cat.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                      {cat.emoji}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:'0.88rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>{e.item}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ background:cat.color+'18', color:cat.color, padding:'2px 7px', borderRadius:99, fontSize:'0.63rem', fontWeight:700 }}>{e.category}</span>
                        <span style={{ fontSize:'0.65rem', color:t.sub }}>{fmtDs(e.createdAt)}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                      <p style={{ fontWeight:800, color:isIn?t.green:t.red, fontSize:'0.92rem', whiteSpace:'nowrap' }}>{isIn?'+':'−'}{fmtS(e.amount)}</p>
                      <span style={{ color:t.muted }}><CvRight /></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'1.2rem', padding:'0 5px' }}>
                <button 
                  onClick={()=>setPage(p => Math.max(1, p-1))} 
                  disabled={page === 1}
                  style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:'8px 16px', fontSize:'0.78rem', fontWeight:600, color:page===1?t.muted:t.text, cursor:page===1?'not-allowed':'pointer', boxShadow:t.shad2, transition:'all .2s' }}>
                  ← Prev
                </button>
                <div style={{ fontSize:'0.75rem', fontWeight:600, color:t.sub }}>
                  Page <span style={{ color:t.text }}>{page}</span> of {totalPages}
                </div>
                <button 
                  onClick={()=>setPage(p => Math.min(totalPages, p+1))} 
                  disabled={page === totalPages}
                  style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:10, padding:'8px 16px', fontSize:'0.78rem', fontWeight:600, color:page===totalPages?t.muted:t.text, cursor:page===totalPages?'not-allowed':'pointer', boxShadow:t.shad2, transition:'all .2s' }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        <p style={{ textAlign:'center', marginTop:'2rem', fontSize:'0.65rem', color:t.sub, letterSpacing:'0.05em' }}>
          ● Sync otomatis 5s · WhatsApp Bot
        </p>
      </div>

      {/* ══════════════ MONTHLY RECEIPT PRINT ══════════════ */}
      {!selected && (
        <div className="print-only" style={{ background: t.surface, color: t.text, padding: '40px 30px', position: 'relative' }}>
          <div className="watermark">VALID</div>
          
          <div style={{ textAlign: 'center', marginBottom: 30, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: `linear-gradient(135deg,${t.accent},#9B7CF8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#fff', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}>
              <WalletIcon size={20} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 5px' }}>Laporan Transaksi</h2>
            <p style={{ margin: 0, color: t.sub, fontSize: '0.85rem' }}>
              {printStartDate === printEndDate 
                ? fmtDs(printStartDate)
                : `${fmtDs(printStartDate)} - ${fmtDs(printEndDate)}`}
            </p>
          </div>

          <div style={{ borderTop: `1px dashed ${t.border}`, borderBottom: `1px dashed ${t.border}`, padding: '15px 0', marginBottom: 25, display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1, WebkitPrintColorAdjust: 'exact' }}>
             <div>
                <p style={{ fontSize: '0.75rem', color: t.sub, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pemasukan</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: t.green, margin: '4px 0 0' }}>+ {fmt(printStats.inc)}</p>
             </div>
             <div>
                <p style={{ fontSize: '0.75rem', color: t.sub, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pengeluaran</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: t.red, margin: '4px 0 0' }}>− {fmt(printStats.exp)}</p>
             </div>
             <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: t.sub, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo Bersih</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: printStats.bal >= 0 ? t.green : t.red, margin: '4px 0 0' }}>
                  {printStats.bal >= 0 ? '+' : '−'} {fmt(printStats.bal)}
                </p>
             </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', position: 'relative', zIndex: 1 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${t.border}` }}>
                 <th style={{ textAlign: 'left', padding: '10px 5px', color: t.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal</th>
                 <th style={{ textAlign: 'left', padding: '10px 5px', color: t.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item / Ket</th>
                 <th style={{ textAlign: 'center', padding: '10px 5px', color: t.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kategori</th>
                 <th style={{ textAlign: 'right', padding: '10px 5px', color: t.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {printFilteredData.map(e => {
                const isIn = e.type === 'income';
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: '12px 5px', color: t.sub }}>{fmtDs(e.createdAt)}</td>
                    <td style={{ padding: '12px 5px' }}>
                      <span style={{ fontWeight: 600 }}>{e.item}</span> {e.quantity && e.quantity > 1 ? <span style={{ color: t.sub, fontSize: '0.75rem' }}>x{e.quantity}</span> : ''}
                      {e.description && <div style={{ fontSize: '0.72rem', color: t.sub, marginTop: 3 }}>{e.description}</div>}
                    </td>
                    <td style={{ padding: '12px 5px', textAlign: 'center' }}>
                      <span style={{ border: `1px solid ${t.border}`, padding: '3px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600 }}>
                        {e.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 5px', textAlign: 'right', fontWeight: 700, color: isIn ? t.green : t.red }}>
                      {isIn ? '+' : '−'} {fmt(e.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {printFilteredData.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px 0', color: t.sub, fontSize: '0.85rem' }}>Tidak ada transaksi pada periode ini.</p>
          )}

          <div style={{ textAlign: 'center', marginTop: 40, borderTop: `1px dashed ${t.border}`, paddingTop: 20 }}>
            {monthlyPrintId && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:15, gap:8 }}>
                <div style={{ padding:10, background:'#fff', borderRadius:12, border:`1px solid ${t.border}`, display:'inline-block' }}>
                  <QRCode value={`${window.location.origin}/validasi?printId=${monthlyPrintId}`} size={70} level="M" />
                </div>
                <div style={{ fontSize:'0.65rem', color:t.sub, fontFamily:'monospace', letterSpacing:'1px' }}>
                  {monthlyPrintId.split('-')[0].toUpperCase()}
                </div>
              </div>
            )}
            <p style={{ fontSize: '0.7rem', color: t.sub, fontFamily: 'monospace' }}>Dicetak secara otomatis dari Keuanganku App</p>
            <p style={{ fontSize: '0.65rem', color: t.muted, fontFamily: 'monospace', marginTop: 5 }}>Dokumen Valid ({new Date().toISOString()})</p>
          </div>
        </div>
      )}

      {/* ══════════════ RECEIPT MODAL ══════════════ */}
      {selected && (
        <div onClick={e=>{if(e.target===e.currentTarget)setSelected(null)}}
          style={{ position:'fixed', inset:0, background: 'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:16, overflowY:'auto' }}
          className="modal-backdrop-print">
          
          <div className="pa sc" style={{
            background: t.surface, color: t.text,
            borderRadius: 12, border: `1px solid ${t.border}`, padding: '0px',
            maxWidth: 360, width: '100%', position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
            maxHeight: '90vh', overflowY: 'auto', margin: 'auto'
          }}>
            {/* Edge zigzag effect via pseudo element can be simulated or we use border */}
            <div style={{ height: 6, background: `repeating-linear-gradient(45deg, transparent, transparent 5px, ${t.surface} 5px, ${t.surface} 10px)` }} />
            
            <div style={{ padding: '30px 24px' }}>
              <div className="watermark" style={{ fontSize: '4.5rem', letterSpacing: '10px', top: '50%', color: dark ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.08)' }}>VALID</div>
              
              <button onClick={()=>setSelected(null)} className="np" style={{ position:'absolute', top:14, right:14, background:t.surf2, border:`1px solid ${t.border}`, borderRadius:8, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:t.sub, zIndex:10 }}>
                <XIcon />
              </button>

              {/* Header */}
              <div style={{ textAlign:'center', marginBottom:20, position: 'relative', zIndex: 1 }}>
                <div style={{ width:46, height:46, borderRadius:13, background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', color:'#fff', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}>
                  <WalletIcon size={20} />
                </div>
                <h3 style={{ fontSize:'1rem', fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:2, fontFamily:'monospace' }}>Keuanganku App</h3>
                <p style={{ fontSize:'0.75rem', color:t.sub, fontFamily:'monospace' }}>{fmtD(selected.createdAt)}</p>
                <p style={{ fontSize:'0.65rem', color:t.muted, fontFamily:'monospace', marginTop:4 }}>RECEIPT #{selected.id.slice(0,8).toUpperCase()}</p>
              </div>

              <div style={{ borderTop:`1.5px dashed ${t.border}`, marginBottom:15, position: 'relative', zIndex: 1 }}/>

              <div style={{ position: 'relative', zIndex: 1 }}>
                {[
                  ['Tipe Data', selected.type==='income'?'PEMASUKAN' : 'PENGELUARAN'],
                  ['Nama Item', selected.item],
                  ['Kategori', `${getCat(selected.category).emoji} ${selected.category}`],
                  ['Kuantitas', `${selected.quantity??1}x`],
                  ['Deskripsi', selected.description||'—'],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, fontSize:'0.85rem', gap:12, fontFamily:'monospace' }}>
                    <span style={{ color:t.sub, flexShrink:0, textTransform:'uppercase' }}>{k}</span>
                    <span style={{ fontWeight:700, textAlign:'right' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop:`1.5px dashed ${t.border}`, margin:'15px 0', position: 'relative', zIndex: 1 }}/>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, position: 'relative', zIndex: 1 }}>
                <span style={{ fontWeight:800, fontSize:'1rem', fontFamily:'monospace', textTransform:'uppercase' }}>Total Akhir</span>
                <span style={{ fontWeight:900, fontSize:'1.3rem', color:selected.type==='income'?t.green:t.red, letterSpacing:'-0.5px', fontFamily:'monospace' }}>
                  {selected.type==='income'?'+':'−'} {fmt(selected.amount)}
                </span>
              </div>

              <div style={{ display:'flex', justifyContent:'center', gap:20, marginBottom:8, position: 'relative', zIndex: 1 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                  <div style={{ background:'#fff', padding:8, borderRadius:8, display:'inline-flex', border: '1px solid #E2E8F0' }}>
                    <QRCode value={`TRX:${selected.id}|${selected.amount}|${selected.type}`} size={75} level="L"/>
                  </div>
                  <span style={{ fontSize:'0.55rem', color:t.sub, fontWeight:700, fontFamily:'monospace' }}>QR STRUK</span>
                </div>
                {printId && (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                    <div style={{ background:'#fff', padding:8, borderRadius:8, display:'inline-flex', border: '1px solid #E2E8F0' }}>
                      <QRCode value={`${window.location.origin}/validasi?printId=${printId}`} size={75} level="L"/>
                    </div>
                    <span style={{ fontSize:'0.55rem', color:t.sub, fontWeight:700, fontFamily:'monospace' }}>QR VALIDASI</span>
                  </div>
                )}
              </div>
              <p style={{ textAlign:'center', fontSize:'0.6rem', color:t.sub, marginBottom:20, fontFamily:'monospace', position: 'relative', zIndex: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {printId ? 'Scan untuk Verifikasi Keaslian' : 'Scan barcode for Auth'}
              </p>

              <button className="np" onClick={handlePrint} style={{
                width:'100%', background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, color:'#fff', border:'none',
                borderRadius:10, padding:'14px', fontWeight:700, fontSize:'0.9rem', cursor:'pointer',
                fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow: `0 8px 20px ${t.accent}40`, position: 'relative', zIndex: 1
              }}>
                <PrIcon /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ ADD TRANSACTION MODAL ══════════════ */}
      {showAdd && (
        <div className="modal-backdrop-print" style={{ position:'fixed', inset:0, background: 'rgba(0,0,0,0.65)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div className="sc" style={{ background: dark?'rgba(20,22,32,0.85)':'rgba(255,255,255,0.85)', color: t.text, borderRadius: 20, border: `1px solid ${dark?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.5)'}`, padding: '0px', maxWidth: 400, width: '100%', position: 'relative', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
            <button type="button" onClick={()=>setShowAdd(false)} style={{ position:'absolute', top:16, right:16, background:t.surf2, border:`1px solid ${t.border}`, borderRadius:9, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:t.sub, zIndex:10 }}>
              <XIcon />
            </button>

            <form onSubmit={handleAddSubmit} style={{ padding:'28px 24px' }}>
              <h2 style={{ fontSize:'1.25rem', fontWeight:800, letterSpacing:'-0.5px', marginBottom:4 }}>Catat Transaksi</h2>
              <p style={{ fontSize:'0.75rem', color:t.sub, marginBottom:22 }}>Masukkan detail pengeluaran atau pemasukan baru.</p>

              {/* Type Toggle */}
              <div style={{ display:'flex', background:t.surf2, borderRadius:12, padding:4, marginBottom:16, border:`1px solid ${t.border}` }}>
                <button type="button" onClick={()=>setAddType('expense')} style={{ flex:1, padding:'8px 0', border:'none', background:addType==='expense'?t.surface:'transparent', color:addType==='expense'?t.red:t.sub, borderRadius:9, fontSize:'0.75rem', fontWeight:700, cursor:'pointer', transition:'all 0.2s', boxShadow:addType==='expense'?t.shad2:'none' }}>
                  ↓ Pengeluaran
                </button>
                <button type="button" onClick={()=>setAddType('income')} style={{ flex:1, padding:'8px 0', border:'none', background:addType==='income'?t.surface:'transparent', color:addType==='income'?t.green:t.sub, borderRadius:9, fontSize:'0.75rem', fontWeight:700, cursor:'pointer', transition:'all 0.2s', boxShadow:addType==='income'?t.shad2:'none' }}>
                  ↑ Pemasukan
                </button>
              </div>

              {/* Amount */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.05em', color:t.sub, textTransform:'uppercase', marginBottom:6 }}>Jumlah (Rp)</label>
                <input type="number" required min="0" value={addAmount} onChange={e=>setAddAmount(e.target.value)} placeholder="Misal: 50000" style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:t.surface, color:t.text, fontSize:'1rem', fontWeight:600 }} />
              </div>

              {/* Item Name */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.05em', color:t.sub, textTransform:'uppercase', marginBottom:6 }}>Nama Item / Aktivitas</label>
                <input type="text" required value={addItem} onChange={e=>setAddItem(e.target.value)} placeholder="Misal: Nasi Goreng" style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:t.surface, color:t.text, fontSize:'0.85rem' }} />
              </div>

              {/* Category */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.05em', color:t.sub, textTransform:'uppercase', marginBottom:6 }}>Kategori</label>
                <select value={addCategory} onChange={e=>setAddCat(e.target.value)} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:t.surface, color:t.text, fontSize:'0.85rem', appearance:'none', outline:'none', cursor:'pointer' }}>
                  {Object.entries(CAT).map(([k, v]) => (
                    <option key={k} value={k}>{v.emoji} {k[0].toUpperCase()+k.slice(1).replace('_',' ')}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.05em', color:t.sub, textTransform:'uppercase', marginBottom:6 }}>Keterangan Opsional</label>
                <input type="text" value={addDesc} onChange={e=>setAddDesc(e.target.value)} placeholder="Catatan tambahan..." style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:t.surface, color:t.text, fontSize:'0.85rem' }} />
              </div>

              <button type="submit" disabled={isSubmitting} style={{ width:'100%', padding:'14px', borderRadius:10, background:addType==='expense'?t.red:t.green, color:'#fff', border:'none', fontSize:'0.85rem', fontWeight:700, cursor:isSubmitting?'not-allowed':'pointer', opacity:isSubmitting?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'background 0.2s', boxShadow:`0 6px 16px ${addType==='expense'?t.red+'40':t.green+'40'}` }}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ BUDGET TARGET MODAL ══════════════ */}
      {showBudgetModal && (
        <div className="modal-backdrop-print" style={{ position:'fixed', inset:0, background: 'rgba(0,0,0,0.65)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div className="sc" style={{ background: dark?'rgba(20,22,32,0.85)':'rgba(255,255,255,0.85)', color: t.text, borderRadius: 20, border: `1px solid ${dark?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.5)'}`, padding: '0px', maxWidth: 400, width: '100%', position: 'relative', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
            <button type="button" onClick={()=>setShowBudgetModal(false)} style={{ position:'absolute', top:16, right:16, background:t.surf2, border:`1px solid ${t.border}`, borderRadius:9, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:t.sub, zIndex:10 }}>
              <XIcon />
            </button>

            <form onSubmit={handleBudgetManualSubmit} style={{ padding:'28px 24px' }}>
              <h2 style={{ fontSize:'1.25rem', fontWeight:800, letterSpacing:'-0.5px', marginBottom:4 }}>🎯 Atur Limit Anggaran</h2>
              <p style={{ fontSize:'0.75rem', color:t.sub, marginBottom:22 }}>Tetapkan batas maksimal pengeluaran bulanan. Masukkan nominal 0 untuk menghapus limit.</p>

              {/* Category */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.05em', color:t.sub, textTransform:'uppercase', marginBottom:6 }}>Kategori</label>
                <select value={budgetCategory} onChange={e=>setBudgetCategory(e.target.value)} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:t.surface, color:t.text, fontSize:'0.85rem', appearance:'none', outline:'none', cursor:'pointer' }}>
                  {Object.entries(CAT).map(([k, v]) => (
                    <option key={k} value={k}>{v.emoji} {k[0].toUpperCase()+k.slice(1).replace('_',' ')}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div style={{ marginBottom:24 }}>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.05em', color:t.sub, textTransform:'uppercase', marginBottom:6 }}>Batas Maksimal (Rp)</label>
                <input type="number" required min="0" value={budgetAmount} onChange={e=>setBudgetAmount(e.target.value)} placeholder="0 = Hapus Limit" style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:t.surface, color:t.text, fontSize:'1rem', fontWeight:600 }} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {budgets.some(b => b.category === budgetCategory) && (
                  <button type="button" onClick={handleBudgetDelete} disabled={isSubmitting} style={{ flex: 1, padding:'14px', borderRadius:10, background: t.surf2, color: t.red, border:`1px solid ${t.border}`, fontSize:'0.85rem', fontWeight:700, cursor:isSubmitting?'not-allowed':'pointer', opacity:isSubmitting?0.7:1, transition:'all 0.2s' }}>
                    Hapus
                  </button>
                )}
                <button type="submit" disabled={isSubmitting} style={{ flex: budgets.some(b => b.category === budgetCategory) ? 2 : 1, padding:'14px', borderRadius:10, background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, color:'#fff', border:'none', fontSize:'0.85rem', fontWeight:700, cursor:isSubmitting?'not-allowed':'pointer', opacity:isSubmitting?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'transform 0.2s', boxShadow:`0 6px 16px ${t.accent}40` }} onMouseDown={e=>e.currentTarget.style.transform='scale(0.96)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ PRINT FILTER MODAL ══════════════ */}
      {showPrintSettings && (
        <div className="modal-backdrop-print" style={{ position:'fixed', inset:0, background: 'rgba(0,0,0,0.65)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div className="sc" style={{ background: dark?'rgba(20,22,32,0.85)':'rgba(255,255,255,0.85)', color: t.text, borderRadius: 20, border: `1px solid ${dark?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.5)'}`, padding: '0px', maxWidth: 380, width: '100%', position: 'relative', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
            <button type="button" onClick={()=>setShowPrintSettings(false)} style={{ position:'absolute', top:16, right:16, background:t.surf2, border:`1px solid ${t.border}`, borderRadius:9, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:t.sub, zIndex:10 }}>
              <XIcon />
            </button>

            <div style={{ padding:'28px 24px' }}>
              <h2 style={{ fontSize:'1.25rem', fontWeight:800, letterSpacing:'-0.5px', marginBottom:4 }}>Pengaturan Cetak</h2>
              <p style={{ fontSize:'0.75rem', color:t.sub, marginBottom:22 }}>Pilih rentang tanggal laporan yang akan dicetak.</p>

              {/* Start Date */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.05em', color:t.sub, textTransform:'uppercase', marginBottom:6 }}>Tanggal Mulai</label>
                <input type="date" value={printStartDate} onChange={e=>setPrintStartDate(e.target.value)} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:t.surface, color:t.text, fontSize:'0.9rem', fontWeight:600 }} />
              </div>

              {/* End Date */}
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.05em', color:t.sub, textTransform:'uppercase', marginBottom:6 }}>Tanggal Selesai</label>
                <input type="date" value={printEndDate} onChange={e=>setPrintEndDate(e.target.value)} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1px solid ${t.border}`, background:t.surface, color:t.text, fontSize:'0.9rem', fontWeight:600 }} />
              </div>

              {/* Live Preview Block */}
              <div style={{ background:t.surf2, border:`1px solid ${t.border}`, borderRadius:12, padding:'14px', marginBottom:20 }}>
                <p style={{ fontSize:'0.65rem', fontWeight:700, color:t.sub, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>Pratinjau Data</p>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.8rem' }}>
                  <span style={{ color:t.sub }}>Pemasukan</span>
                  <span style={{ color:t.green, fontWeight:700 }}>+{fmt(printStats.inc)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:'0.8rem' }}>
                  <span style={{ color:t.sub }}>Pengeluaran</span>
                  <span style={{ color:t.red, fontWeight:700 }}>−{fmt(printStats.exp)}</span>
                </div>
                <div style={{ borderTop:`1px dashed ${t.border}`, margin:'8px 0', paddingTop:8, display:'flex', justifyContent:'space-between', fontSize:'0.9rem' }}>
                  <span style={{ fontWeight:700 }}>Total Filtered</span>
                  <span style={{ fontWeight:800 }}>{printFilteredData.length} item</span>
                </div>
              </div>

              <button 
                disabled={printFilteredData.length === 0 || isSubmitting}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    const res = await fetch('/api/print', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        type: 'monthly',
                        metadata: JSON.stringify({
                          start: printStartDate,
                          end: printEndDate,
                          inc: printStats.inc,
                          exp: printStats.exp,
                          bal: printStats.bal
                        })
                      }),
                    });
                    const d = await res.json();
                    if (d.printId) setMonthlyPrintId(d.printId);
                  } catch (e) { console.error(e); }
                  setSubmitting(false);
                  setShowPrintSettings(false);
                  
                  const oldTitle = document.title;
                  document.title = `Laporan_Bulanan_Keuanganku_${printStartDate}_to_${printEndDate}`;

                  setTimeout(() => {
                    window.print();
                    document.title = oldTitle; // Restore title after dialog opens
                    setMonthlyPrintId(null); // Cleanup after print dialog
                  }, 150);
                }} 
                style={{ width:'100%', padding:'14px', borderRadius:10, background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, color:'#fff', border:'none', fontSize:'0.9rem', fontWeight:700, cursor:printFilteredData.length===0?'not-allowed':'pointer', opacity:printFilteredData.length===0?.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:`0 6px 16px ${t.accent}40`, transition:'all 0.2s' }}>
                <PrIcon /> {printFilteredData.length === 0 ? 'Data Kosong' : isSubmitting ? 'Menyiapkan...' : 'Lanjut Cetak'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══════════════ AI CHAT FLOATING WINDOW ══════════════ */}
      {showChat && (
        <div className="sc np" style={{ position:'fixed', bottom:90, right:24, width:380, maxWidth:'calc(100vw - 48px)', height:550, maxHeight:'calc(100vh - 120px)', borderRadius:20, background: dark?'rgba(20,22,32,0.95)':'rgba(255,255,255,0.95)', border:`1px solid ${t.border}`, boxShadow:'0 24px 48px rgba(0,0,0,0.2)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', zIndex:999, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Header */}
          <div style={{ background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, padding:'16px 20px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ background:'rgba(255,255,255,0.2)', padding:6, borderRadius:12, display:'flex' }}><SparklesIcon /></div>
              <div>
                <h3 style={{ fontSize:'0.95rem', fontWeight:700, lineHeight:1.2, margin:0 }}>Keuanganku AI</h3>
                <p style={{ fontSize:'0.7rem', opacity:0.8, margin:0, marginTop:1 }}>Asisten Keuangan Pintar - Powered by Gemini</p>
              </div>
            </div>
            <button onClick={()=>setShowChat(false)} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', opacity:0.8, display:'flex' }}><XIcon /></button>
          </div>
          
          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:16 }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
                <div style={{ maxWidth:'85%', background:m.role==='user'?`${t.accent}`:t.surf2, color:m.role==='user'?'#fff':t.text, padding:'12px 16px', borderRadius:18, borderBottomRightRadius:m.role==='user'?4:18, borderBottomLeftRadius:m.role==='assistant'?4:18, fontSize:'0.85rem', lineHeight:1.5, border:m.role==='assistant'?`1px solid ${t.border}`:'none', wordBreak:'break-word' }}>
                  {m.role === 'user' ? (
                    m.content
                  ) : (
                    <div className="md-chat">
                      {i === chatMessages.length - 1 && !m.isTyped ? (
                        <TypingMarkdown 
                          content={m.content} 
                          onUpdate={() => chatEndRef.current?.scrollIntoView()} 
                          onComplete={() => {
                            setChatMessages(prev => {
                              const clone = [...prev];
                              if (clone[i]) clone[i].isTyped = true;
                              return clone;
                            });
                          }}
                        />
                      ) : (
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      )}
                      
                      {/* AI Action Receipt Card (Success Indicator) */}
                      {m.actionData && m.actionData.map((trx, idx) => (
                        <div key={idx} style={{ marginTop: 12, background: t.surface, borderRadius: 12, padding: 12, border: `1px solid ${t.border}`, boxShadow: `0 4px 12px rgba(0,0,0,0.05)`, color: t.text }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:'0.75rem', fontWeight:700, opacity:0.7, color: t.green }}>
                            <div style={{ width:16, height:16, borderRadius:'50%', background:t.green, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>✓</div>
                            BERHASIL DICATAT
                          </div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                            <span style={{ fontSize:'0.85rem', fontWeight:600 }}>{trx.item}</span>
                            <span style={{ fontSize:'0.85rem', fontWeight:800, color: trx.type==='income'?t.green:t.red }}>{trx.type==='income'?'+':'-'} Rp {trx.amount.toLocaleString('id-ID')}</span>
                          </div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.7rem', opacity:0.6 }}>
                            <span>Kategori: {trx.category}</span>
                            <span>{new Date(trx.createdAt).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                      ))}

                      {/* AI Budget Confirmation Card */}
                      {m.pendingBudget && (
                        <div style={{ marginTop:14, padding:14, borderRadius:12, background: t.surface, border:`1px solid ${t.border}`, display:'flex', flexDirection:'column', gap:8, color: t.text }}>
                          <p style={{ margin:0, fontSize:'0.85rem', fontWeight:600 }}>Konfirmasi Target 🎯</p>
                          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', alignItems: 'center' }}>
                            <span style={{ color: t.sub }}>Kategori:</span>
                            <span style={{ fontWeight:600, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize:'1rem' }}>{getCat(m.pendingBudget.category).emoji}</span> {m.pendingBudget.category}
                            </span>
                          </div>
                          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', alignItems: 'center' }}>
                            <span style={{ color: t.sub }}>Limit Bulanan:</span>
                            <span style={{ fontWeight:700, color: t.accent }}>{fmt(m.pendingBudget.amount)}</span>
                          </div>
                          {m.pendingBudget.amount > 0 ? (
                            <button disabled={m.pendingBudget.confirmed} onClick={() => confirmBudget(m.pendingBudget!, i)} style={{ marginTop: 4, padding: '10px 0', borderRadius: 8, background: `linear-gradient(135deg,${t.accent},#9B7CF8)`, color: '#fff', border: 'none', fontWeight: 600, cursor: m.pendingBudget.confirmed?'not-allowed':'pointer', opacity:m.pendingBudget.confirmed?0.5:1, fontSize: '0.8rem', boxShadow:`0 4px 12px ${t.accent}40`, transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                              {m.pendingBudget.confirmed ? 'Tersimpan ✓' : 'Simpan Target'}
                            </button>
                          ) : (
                            <button disabled={m.pendingBudget.confirmed} onClick={() => confirmBudget(m.pendingBudget!, i)} style={{ marginTop: 4, padding: '10px 0', borderRadius: 8, background: t.red, color: '#fff', border: 'none', fontWeight: 600, cursor: m.pendingBudget.confirmed?'not-allowed':'pointer', opacity:m.pendingBudget.confirmed?0.5:1, fontSize: '0.8rem', boxShadow:`0 4px 12px ${t.red}40`, transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                              {m.pendingBudget.confirmed ? 'Terhapus ✓' : 'Hapus Limit Target'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div style={{ display:'flex', justifyContent:'flex-start' }}>
                <div style={{ background:t.surf2, padding:'12px 16px', borderRadius:18, borderBottomLeftRadius:4, border:`1px solid ${t.border}`, fontSize:'0.85rem' }}>
                  <span style={{ display:'inline-block', opacity:0.6 }}>Mengetik...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendChat} style={{ padding:16, borderTop:`1px solid ${t.border}`, background:t.surface, display:'flex', gap:10 }}>
            <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Tanya sesuatu..." style={{ flex:1, background:t.surf2, border:`1px solid ${t.border}`, borderRadius:12, padding:'12px 16px', fontSize:'0.85rem', color:t.text }} disabled={isChatLoading} />
            <button type="submit" disabled={isChatLoading || !chatInput.trim()} style={{ background:t.accent, color:'#fff', border:'none', borderRadius:12, width:44, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:(!chatInput.trim()||isChatLoading)?0.5:1 }}>
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      {/* Floating Sparkle Button */}
      <button className="np" onClick={()=>setShowChat(!showChat)} style={{ position:'fixed', bottom:24, right:24, width:50, height:50, borderRadius:'50%', background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, color:'#fff', border:'none', boxShadow:`0 6px 20px ${t.accent}66`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:998, transition:'transform 0.2s' }}>
        {showChat ? <XIcon /> : <SparklesIcon />}
      </button>

    </div>
  );
}