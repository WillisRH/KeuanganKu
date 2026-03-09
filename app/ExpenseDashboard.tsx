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
const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);
const MicIcon = ({ size=16 }: { size?:number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const ClipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
  </svg>
);
const AlertIcon = ({ size=20 }: { size?:number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
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

  return <ReactMarkdown children={displayed} />;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  const [data, setData]         = useState<Expense[]>(expenses);
  const [budgets, setBudgets]   = useState<Budget[]>([]);

  const loadData = async (vDate: Date = viewDate) => {
    try {
      const res = await getTransactions();
      setData(res);
      const bRes = await fetch(`/api/budget?month=${vDate.getMonth()+1}&year=${vDate.getFullYear()}`);
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
  const [viewDate, setViewDate] = useState(new Date());
  const [pulse, setPulse]       = useState(false);
  const [printId, setPrintId]   = useState<string|null>(null);
  const [monthlyPrintId, setMonthlyPrintId] = useState<string|null>(null);
  const [calendarSelectedDay, setCalendarSelectedDay] = useState<Date|null>(null);

  // Custom UI Notifications
  const [toast, setToast] = useState<{msg:string, type:'success'|'error'|'info'}|null>(null);
  const [confirmModal, setConfirmModal] = useState<{msg:string, onConfirm:()=>void}|null>(null);

  const showToast = (msg:string, type:'success'|'error'|'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (mounted) loadData(viewDate);
    // Sync print dates with viewDate
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    setPrintStartDate(start.toISOString().slice(0, 10));
    setPrintEndDate(end.toISOString().slice(0, 10));
  }, [viewDate]);

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
  const [chatMessages, setChatMessages] = useState<{role:'user'|'assistant', content:string, isTyped?:boolean, actionData?:Expense[], budgetAlerts?: {category:string, limit:number, spent:number, status: 'danger'|'warning'}[], balanceAlert?: {balance:number}, pendingBudget?:{category:string, amount:number, confirmed?:boolean}}[]>([
    { role: 'assistant', content: (() => {
      const h = new Date().getHours();
      let g = 'Malam'; if (h < 11) g = 'Pagi'; else if (h < 15) g = 'Siang'; else if (h < 18) g = 'Sore';
      return `Halo selamat ${g} Mas! Aku Keuanganku AI. Ada yang bisa aku bantu seputar transaksimu?`;
    })(), isTyped: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Media upload state
  type ChatFile = { file: File; preview: string; type: 'image'|'audio'|'pdf' };
  const [chatFiles, setChatFiles] = useState<ChatFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder|null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout|null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const pendingMonthlyPrintRef = useRef(false);
  const pendingMonthlyTitleRef = useRef('');

  // Wait for QR code to render before calling window.print()
  useEffect(() => {
    if (monthlyPrintId && pendingMonthlyPrintRef.current) {
      pendingMonthlyPrintRef.current = false;
      // Double rAF ensures the browser has painted the QR SVG to DOM
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.print();
          document.title = pendingMonthlyTitleRef.current;
          setMonthlyPrintId(null);
        });
      });
    }
  }, [monthlyPrintId]);

  const addChatFile = (file: File, type: 'image'|'audio'|'pdf') => {
    const preview = type === 'image' ? URL.createObjectURL(file) : '';
    setChatFiles(prev => [...prev, { file, preview, type }]);
  };
  const removeChatFile = (idx: number) => {
    setChatFiles(prev => { const n = [...prev]; if (n[idx]?.preview) URL.revokeObjectURL(n[idx].preview); n.splice(idx,1); return n; });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        addChatFile(file, 'audio');
        setIsRecording(false);
        setRecordDuration(0);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordDuration(0);
      recordTimerRef.current = setInterval(() => setRecordDuration(d => d + 1), 1000);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading, showChat]);

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!chatInput.trim() && chatFiles.length === 0) || isChatLoading) return;

    const fileMeta = chatFiles.map(f => ({ name: f.file.name, type: f.type, mimeType: f.file.type }));
    const msgText = chatInput.trim() || (chatFiles.length > 0 ? `[Mengirim ${chatFiles.map(f => f.type === 'image' ? 'foto' : f.type === 'audio' ? 'audio' : 'PDF').join(', ')}]` : '');
    const newMsgs = [
      ...chatMessages,
      { role: 'user', content: msgText, isTyped: true, files: fileMeta, filePreviews: chatFiles.map(f => ({ preview: f.preview, type: f.type, name: f.file.name })) }
    ] as any[];
    const filesToSend = [...chatFiles];
    setChatMessages(newMsgs);
    setChatInput('');
    setChatFiles([]);
    setIsChatLoading(true);

    try {
      let res: Response;
      if (filesToSend.length > 0) {
        const formData = new FormData();
        formData.append('messages', JSON.stringify(newMsgs.map(m => ({ role: m.role, content: m.content }))));
        for (const f of filesToSend) {
          formData.append('files', f.file);
        }
        res = await fetch('/api/chat', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })) })
        });
      }
      const data = await res.json();
      if (data.text) {
        setChatMessages([...newMsgs, { 
          role: 'assistant', 
          content: data.text, 
          actionData: data.actionData, 
          pendingBudget: data.pendingBudget, 
          budgetAlerts: data.budgetAlerts,
          balanceAlert: data.totalBalance < 0 ? { balance: data.totalBalance } : undefined
        }]);
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
      await fetch('/api/budget', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...b, month: viewDate.getMonth()+1, year: viewDate.getFullYear() }) 
      });
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

  const currentMonthData = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    return data.filter(e => {
      const ed = new Date(e.createdAt);
      return ed.getFullYear() === y && ed.getMonth() === m;
    });
  }, [data, viewDate]);

  const filtered = useMemo(() => {
    let d = currentMonthData.filter(e => {
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
    const inc = currentMonthData.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
    const exp = currentMonthData.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
    return { inc, exp, bal: inc - exp };
  }, [currentMonthData]);

  const spentPerCategory = useMemo(() => {
    const m: Record<string, number> = {};
    currentMonthData.filter(e=>e.type==='expense').forEach(e => {
        const cat = e.category.toLowerCase().trim();
        m[cat] = (m[cat] || 0) + e.amount;
    });
    return m;
  }, [currentMonthData]);

  const chartData = useMemo(() => {
    const m: Record<string,number> = {};
    currentMonthData.filter(e=>e.type==='expense').forEach(e => { m[e.category] = (m[e.category]||0) + e.amount; });
    return Object.entries(m).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,7);
  }, [currentMonthData]);

  const monthlyData = useMemo(() => {
    // We keep this using full 'data' so the bar chart shows history
    const m: Record<string,{income:number;expense:number}> = {};
    data.forEach(e => {
      const k = new Date(e.createdAt).toLocaleDateString('id-ID',{month:'short',year:'2-digit'});
      if (!m[k]) m[k]={income:0,expense:0};
      m[k][e.type==='income'?'income':'expense'] += e.amount;
    });
    return Object.entries(m).map(([name,v])=>({name,...v})).slice(-6);
  }, [data]);

  const calDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [viewDate]);

  const dailySummary = useMemo(() => {
    const summary: Record<string, { inc: number, exp: number, topCat: string | null, catMax: number }> = {};
    currentMonthData.forEach(e => {
      const d = new Date(e.createdAt).toISOString().slice(0, 10);
      if (!summary[d]) summary[d] = { inc: 0, exp: 0, topCat: null, catMax: 0 };
      if (e.type === 'income') {
        summary[d].inc += e.amount;
      } else {
        summary[d].exp += e.amount;
        // Logic for top category
        const dayExpByCat: Record<string, number> = {};
        currentMonthData.filter(x => new Date(x.createdAt).toISOString().slice(0, 10) === d && x.type === 'expense')
            .forEach(x => { dayExpByCat[x.category] = (dayExpByCat[x.category] || 0) + x.amount; });
        
        let max = 0; let top = null;
        for (const [cat, amt] of Object.entries(dayExpByCat)) {
          if (amt > max) { max = amt; top = cat; }
        }
        summary[d].topCat = top;
      }
    });
    return summary;
  }, [currentMonthData]);

  const maxDailyExp = useMemo(() => {
    let max = 0;
    Object.values(dailySummary).forEach(s => { if (s.exp > max) max = s.exp; });
    return max || 1;
  }, [dailySummary]);

  const top3 = useMemo(() => [...data].filter(e=>e.type==='expense').sort((a,b)=>b.amount-a.amount).slice(0,3), [data]);

  const calendarSelectedDayTransactions = useMemo(() => {
    if (!calendarSelectedDay) return [];
    const dStr = calendarSelectedDay.toISOString().slice(0,10);
    return data.filter(e => new Date(e.createdAt).toISOString().slice(0,10) === dStr)
               .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data, calendarSelectedDay]);

  const calendarSelectedDayTotals = useMemo(() => {
    return calendarSelectedDayTransactions.reduce((acc, e) => {
      if (e.type === 'income') acc.inc += e.amount;
      else acc.exp += e.amount;
      return acc;
    }, { inc: 0, exp: 0 });
  }, [calendarSelectedDayTransactions]);

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
      showToast('Gagal menyimpan transaksi.', 'error');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: budgetCategory, 
          amount: parseFloat(budgetAmount),
          month: viewDate.getMonth() + 1,
          year: viewDate.getFullYear()
        }) 
      });
      await loadData();
      setShowBudgetModal(false);
      setBudgetAmount('');
    } catch(err) {
      console.error(err);
      showToast('Gagal menyimpan target anggaran.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLastMonthBudgets = async () => {
    setSubmitting(true);
    try {
      const prev = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
      const res = await fetch(`/api/budget?month=${prev.getMonth()+1}&year=${prev.getFullYear()}`);
      if (!res.ok) throw new Error();
      const lastBudgets: Budget[] = await res.json();
      
      if (lastBudgets.length === 0) {
        showToast('Tidak ada anggaran di bulan lalu untuk disalin.', 'info');
        return;
      }

      for (const b of lastBudgets) {
        await fetch('/api/budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: b.category,
            amount: b.amount,
            month: viewDate.getMonth() + 1,
            year: viewDate.getFullYear()
          })
        });
      }
      await loadData();
      showToast('Anggaran bulan lalu berhasil disalin ke bulan ini!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyalin anggaran bulan lalu.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBudgetDelete = async () => {
    if (!budgetCategory) return;
    setConfirmModal({
      msg: `Yakin ingin menghapus target untuk kategori ${CAT[budgetCategory]?.emoji || ''} ${budgetCategory}?`,
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await fetch(`/api/budget?category=${encodeURIComponent(budgetCategory)}&month=${viewDate.getMonth()+1}&year=${viewDate.getFullYear()}`, { method: 'DELETE' });
          await loadData();
          setShowBudgetModal(false);
          setBudgetAmount('');
          showToast('Target anggaran berhasil dihapus.', 'success');
        } catch(err) {
          console.error(err);
          showToast('Gagal menghapus target anggaran.', 'error');
        } finally {
          setSubmitting(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const t = makeTheme(dark);
  const balPos = stats.bal >= 0;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  if (!mounted) return null;

  return (
    <div style={{ minHeight:'100vh', background:t.bg, color:t.text, fontFamily:"'Outfit', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        /* ── Keyframes ─────────────────────────────────── */
        @keyframes up      { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:none } }
        @keyframes scIn    { from { opacity:0; transform:scale(.94) } to { opacity:1; transform:scale(1) } }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes slideUp { from { transform:translate(-50%,20px); opacity:0 } to { transform:translate(-50%,0); opacity:1 } }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes popIn   { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes barFill { from{width:0%} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes glow    { 0%,100%{opacity:.6} 50%{opacity:1} }

        /* ── Animation utilities ────────────────────────── */
        .f1{animation:up .45s cubic-bezier(.16,1,.3,1) both .04s}
        .f2{animation:up .45s cubic-bezier(.16,1,.3,1) both .10s}
        .f3{animation:up .45s cubic-bezier(.16,1,.3,1) both .16s}
        .f4{animation:up .45s cubic-bezier(.16,1,.3,1) both .22s}
        .sc{animation:scIn .32s cubic-bezier(.16,1,.3,1) both}

        /* ── Row (clickable table rows / cards) ─────────── */
        .row { cursor:pointer; transition:background .15s ease, box-shadow .15s ease; position:relative; }
        .row::after {
          content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
          border-radius:0 3px 3px 0; background:${t.accent};
          opacity:0; transition:opacity .2s ease;
        }
        .row:hover { background:${t.surf2} !important; }
        .row:hover::after { opacity:1; }
        .row:active { transform:scale(.999); }

        /* ── Tab buttons ────────────────────────────────── */
        .tab {
          position:relative; border:none; background:none; cursor:pointer;
          font-family:inherit; padding:8px 18px; border-radius:10px;
          font-size:.83rem; font-weight:600; color:${t.sub};
          transition:all .2s cubic-bezier(.16,1,.3,1); white-space:nowrap;
        }
        .tab.on {
          background:${dark ? t.accent+'28' : t.accent+'14'};
          color:${t.accent};
          box-shadow:0 2px 10px ${t.accent}22;
        }
        .tab:not(.on):hover { color:${t.text}; background:${t.surf2}; }

        /* ── Pill filter ────────────────────────────────── */
        .pill {
          border:none; background:none; cursor:pointer; font-family:inherit;
          padding:6px 15px; border-radius:99px; font-size:.76rem; font-weight:600;
          color:${t.sub}; transition:all .2s ease; white-space:nowrap;
        }
        .pill.on {
          background:${dark ? t.accent+'30' : t.accent+'14'};
          color:${t.accent};
          box-shadow:0 2px 10px ${t.accent}22;
        }
        .pill:not(.on):hover { color:${t.text}; background:${t.surf2}; }

        /* ── Inline buttons ─────────────────────────────── */
        .ibtn {
          display:inline-flex; align-items:center; gap:5px;
          border:1px solid ${t.border}; background:${t.surface}; color:${t.sub};
          border-radius:10px; padding:7px 14px; font-size:.78rem; font-weight:600;
          cursor:pointer; font-family:inherit; transition:all .2s ease;
        }
        .ibtn:hover {
          color:${t.accent}; border-color:${t.accent}55;
          background:${t.accent}08; box-shadow:0 4px 16px ${t.accent}18;
        }

        /* ── Sortable header ────────────────────────────── */
        .sth { cursor:pointer; user-select:none; transition:color .15s; }
        .sth:hover { color:${t.text} !important; }

        /* ── Card lift on hover ─────────────────────────── */
        .card-lift { transition:transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s ease !important; }
        .card-lift:hover {
          transform:translateY(-3px);
          box-shadow:0 20px 50px rgba(0,0,0,${dark?'.35':'.12'}) !important;
        }

        /* ── Input & Select ────────────────────────────── */
        input, select, textarea { font-family:inherit; }
        input::placeholder { color:${t.sub}; }
        input:focus, select:focus, textarea:focus { outline:none; }

        .field-input {
          width:100%; padding:12px 14px; border-radius:12px;
          border:1.5px solid ${t.border}; background:${t.surf2};
          color:${t.text}; font-family:inherit;
          transition:border-color .2s ease, box-shadow .2s ease;
        }
        .field-input:focus {
          border-color:${t.accent}80;
          box-shadow:0 0 0 3px ${t.accent}14;
          background:${t.surface};
        }
        .field-label {
          display:block; font-size:0.68rem; font-weight:700;
          letter-spacing:0.06em; color:${t.sub};
          text-transform:uppercase; margin-bottom:7px;
        }

        /* ── Scrollbar ──────────────────────────────────── */
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${t.muted}; border-radius:99px; }

        /* ── Progress bar fill animation ────────────────── */
        .bar-fill { animation: barFill .8s cubic-bezier(.16,1,.3,1) both; }

        /* ── Markdown chat ──────────────────────────────── */
        .md-chat p { margin-bottom:8px; }
        .md-chat p:last-child { margin-bottom:0; }
        .md-chat ul, .md-chat ol { margin-left:18px; margin-bottom:8px; }
        .md-chat li { margin-bottom:4px; }
        .md-chat strong, .md-chat b { font-weight:800 !important; color:inherit; }
        .md-chat code { background:${dark?'#000':'#eef'}; padding:2px 4px; border-radius:4px; font-family:monospace; font-size:0.8rem; }

        /* ── Print ──────────────────────────────────────── */
        @media print {
          .np { display:none !important; }
          .print-only { display:block !important; }
          .modal-backdrop-print { position:absolute !important; top:0 !important; left:0 !important; right:0 !important; align-items:flex-start !important; padding-top:40px !important; background:transparent !important; backdrop-filter:none !important; }
          .pa { box-shadow:none !important; border:1px solid #ccc !important; }
        }
        .print-only { display:none; }
        .watermark {
          position:absolute; top:45%; left:50%;
          transform:translate(-50%,-50%) rotate(-45deg);
          font-size:clamp(4rem,8vw,6rem); font-weight:900;
          color:rgba(34,197,94,0.08); pointer-events:none; z-index:0;
          letter-spacing:15px; user-select:none;
        }

        /* ── Toast ──────────────────────────────────────── */
        .toast-box {
          position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
          background:${dark?'rgba(10,12,20,0.94)':'rgba(17,24,39,0.92)'};
          backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
          color:#fff; padding:13px 22px; border-radius:14px; z-index:10000;
          box-shadow:0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
          display:flex; align-items:center; gap:10px;
          font-weight:600; font-size:0.85rem;
          animation:slideUp .3s cubic-bezier(.16,1,.3,1);
          min-width:220px;
        }
        .toast-box.success { border-bottom:2.5px solid #22C55E; }
        .toast-box.error   { border-bottom:2.5px solid #EF4444; }
        .toast-box.info    { border-bottom:2.5px solid ${t.accent}; }

        /* ── Confirm modal ──────────────────────────────── */
        .conf-overlay {
          position:fixed; inset:0;
          background:rgba(0,0,0,${dark?'.75':'.55'}); backdrop-filter:blur(16px);
          display:flex; align-items:center; justify-content:center; z-index:10001;
          animation:fadeIn .2s ease;
        }
        .conf-card {
          background:${t.surface}; border:1px solid ${t.border}; border-radius:24px;
          padding:28px; width:90%; max-width:360px;
          box-shadow:0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px ${t.border};
          animation:scIn .25s cubic-bezier(.16,1,.3,1);
        }

        /* ── Mobile ─────────────────────────────────────── */
        @media(max-width:640px){
          .dsk{display:none !important}
          .mob{display:flex !important}
          .sg{grid-template-columns:1fr 1fr !important}
          .ha .ibtn span{display:none}
          .ha .ibtn{padding:7px !important}
          .dsk-only { display:none !important; }
          .mob-only { display:flex !important; }
          .sidebar { margin-bottom:0.5rem !important; }
          .sidebar > div { margin-bottom:0.75rem !important; }

          .mob-sticky-tabs {
            position:sticky; top:0; z-index:50;
            background:${t.bg}d0;
            padding:10px 0 8px;
            margin:0 -1rem; padding-left:1rem; padding-right:1rem;
            border-bottom:1px solid ${t.border};
            backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
          }
          .mob-tabs-scroll {
            overflow-x:auto; -webkit-overflow-scrolling:touch;
            scrollbar-width:none; -ms-overflow-style:none;
          }
          .mob-tabs-scroll::-webkit-scrollbar { display:none; }
          .mob-card { padding:13px 14px !important; border-radius:16px !important; }
          .mn-wrapper { order:3; width:100%; margin-top:0.5rem; justify-content:center !important; }
          .mn-card { width:100%; max-width:100%; padding:6px 8px !important; border-radius:12px !important; background:${t.surface} !important; }
          .mn-btn { font-size:1.2rem !important; padding:6px 12px !important; }
          .mn-label { font-size:0.9rem !important; }
          .mob-balance-card { border-radius:20px !important; padding:1.25rem !important; }

          /* Full-screen chat on mobile */
          .chat-window {
            top:0 !important; left:0 !important; right:0 !important; bottom:0 !important;
            width:100% !important; max-width:100% !important;
            height:100dvh !important; max-height:100dvh !important;
            border-radius:0 !important; border:none !important;
          }
          .chat-window .chat-messages { padding:16px !important; }
          .chat-window .chat-header {
            padding:14px 16px !important;
            padding-top:calc(14px + env(safe-area-inset-top)) !important;
          }
          .chat-window .chat-input-area {
            padding-bottom:calc(12px + env(safe-area-inset-bottom)) !important;
          }
          .chat-fab { bottom:calc(24px + env(safe-area-inset-bottom)) !important; }
        }
        @media(min-width:641px){
          .mob{display:none !important}
          .mob-only { display:none !important; }
          .dsk-only { display:flex !important; }
        }

        /* ── Desktop grid ───────────────────────────────── */
        @media(min-width:900px){
          .dsk-grid { display:grid; grid-template-columns:310px 1fr; gap:2rem; align-items:start; }
          .sidebar { position:sticky; top:1.5rem; }
        }
        @media(max-width:899px){
          .dsk-grid { display:flex; flex-direction:column; }
          .sidebar-only { display:none !important; }
        }
      `}</style>

      <div className="np" style={{ maxWidth:1280, margin:'0 auto', padding:'clamp(1rem,4vw,2.5rem) clamp(1rem,4vw,1.75rem)' }}>

        {/* ── HEADER ── */}
        <header className="np" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'clamp(1rem,4vw,1.75rem)', flexWrap:'wrap', gap:'clamp(10px,3vw,15px)', paddingBottom:'clamp(0.75rem,3vw,1.25rem)', borderBottom:`1px solid ${t.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:'clamp(8px,2vw,12px)' }}>
            <div style={{ width:'clamp(36px,9vw,42px)', height:'clamp(36px,9vw,42px)', borderRadius:'clamp(11px,3vw,14px)', background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 6px 18px ${t.accent}40`, color:'#fff' }}>
              <WalletIcon size={22} />
            </div>
            <div>
              <h1 style={{ fontSize:'clamp(1rem,4vw,1.25rem)', fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>
                Keuangan<span style={{ color:t.accent }}>ku</span>
              </h1>
              {(() => {
                const now = new Date();
                const h = now.getHours();
                const dayName = now.toLocaleDateString('id-ID', { weekday:'long' });
                const dateStr = now.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
                const emoji = h < 6 ? '🌃' : h < 11 ? '🌅' : h < 15 ? '☀️' : h < 18 ? '🌇' : h < 21 ? '🌆' : '🌙';
                const greet = h < 6 ? 'Lembur ya' : h < 11 ? 'Selamat Pagi' : h < 15 ? 'Selamat Siang' : h < 18 ? 'Selamat Sore' : h < 21 ? 'Selamat Malam' : 'Istirahat dong';
                return (
                  <div style={{ marginTop:4 }}>
                    <p style={{ fontSize:'clamp(0.65rem,2vw,0.75rem)', color:t.sub, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ fontSize:'clamp(12px,3vw,14px)' }}>{emoji}</span> 
                      <span>{greet}, <span style={{ color:t.text, fontWeight:700 }}>Mas!</span></span>
                    </p>
                    <p className="dsk-only" style={{ fontSize:'0.62rem', color:t.muted, marginTop:2, fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
                      📆 {dayName}, {dateStr}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Month Navigator (Desktop Only) */}
          <div className="mn-wrapper dsk-only" style={{ display:'flex', alignItems:'center', flex:1, justifyContent:'center' }}>
            <div className="mn-card" style={{ display:'flex', alignItems:'center', gap:10, background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'4px 10px', boxShadow:t.shad2, minWidth:210 }}>
              <button className="mn-btn" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                style={{ background:'none', border:'none', color:t.text, cursor:'pointer', fontSize:'1.1rem', padding:'5px 10px', display:'flex', alignItems:'center' }}>←</button>
              <div style={{ textAlign:'center', flex:1 }}>
                <p className="mn-label" style={{ fontSize:'0.85rem', fontWeight:900, textTransform:'capitalize', margin:0, whiteSpace:'nowrap' }}>
                  {viewDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                </p>
                <button onClick={() => setViewDate(new Date())} style={{ background:'none', border:'none', color:t.accent, fontSize:'0.65rem', fontWeight:800, textTransform:'uppercase', cursor:'pointer', padding:0, marginTop:-1 }}>Hari Ini</button>
              </div>
              <button className="mn-btn" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                style={{ background:'none', border:'none', color:t.text, cursor:'pointer', fontSize:'1.1rem', padding:'5px 10px', display:'flex', alignItems:'center' }}>→</button>
            </div>
          </div>

          <div className="ha" style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button className="ibtn" onClick={exportCSV}><DlIcon /><span>CSV</span></button>
            <button className="ibtn" onClick={()=>setShowPrintSettings(true)}><PrIcon /><span>Print</span></button>
            <button onClick={()=>setDark(!dark)} style={{ width:34, height:34, borderRadius:10, border:`1px solid ${t.border}`, background:t.surface, color:t.sub, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </header>

        {/* ── DESKTOP GRID LAYOUT ── */}
        <div className="dsk-grid">
          
          {/* ── SIDEBAR ── */}
          <aside className="sidebar np">
            
            {/* ── COMPACT BALANCE CARD ── */}
            <div className="f1 mob-balance-card" style={{
              background:`linear-gradient(135deg, ${balPos?'#1B3554':'#3A1414'} 0%, ${balPos?'#0F2440':'#280E0E'} 100%)`,
              borderRadius:20, padding:'clamp(1.25rem,4vw,1.5rem)', marginBottom:'1rem',
              position:'relative', overflow:'hidden',
              boxShadow:`0 8px 32px ${balPos?'#1B355444':'#3A141444'}`,
            }}>
              <WaveBg color={balPos?'#60A5FA':'#F87171'} />
              <Dots color={balPos?'#93C5FD':'#FCA5A5'} />
              <div style={{ position:'relative', zIndex:1 }}>
                <p style={{ fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', opacity:.55, color:'#fff', marginBottom:6 }}>Saldo Bersih</p>
                <p style={{ fontSize:'clamp(1.6rem,5vw,2rem)', fontWeight:800, letterSpacing:'-1px', color:'#fff', lineHeight:1, marginBottom:14 }}>
                  {balPos?'':'−'}{fmt(stats.bal)}
                </p>
                <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:16 }}>
                  <span style={{ fontSize:'0.72rem', color:'#86EFAC', display:'flex', alignItems:'center', gap:4 }}><UpIcon /> {fmtS(stats.inc)}</span>
                  <span style={{ fontSize:'0.72rem', color:'#FCA5A5', display:'flex', alignItems:'center', gap:4 }}><DnIcon /> {fmtS(stats.exp)}</span>
                </div>
                
                <button onClick={()=>setShowAdd(true)} style={{ width:'100%', height:42, borderRadius:12, background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, color:'#fff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontWeight:700, fontSize:'0.82rem', boxShadow:`0 8px 24px ${t.accent}50`, transition:'transform 0.15s, box-shadow 0.15s', letterSpacing:'0.01em' }} onMouseDown={e=>{e.currentTarget.style.transform='scale(0.96)';e.currentTarget.style.boxShadow=`0 4px 12px ${t.accent}40`}} onMouseUp={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow=`0 8px 24px ${t.accent}50`}} onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow=`0 8px 24px ${t.accent}50`}}>
                  <PlusIcon /> Catat Transaksi
                </button>
              </div>
            </div>

            {/* ── STAT MINI CARDS ── */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'1rem' }}>
              {[
                { label:'Pemasukan', val:stats.inc, color:t.green, svg:<UpIcon />, count:data.filter(e=>e.type==='income').length },
                { label:'Pengeluaran', val:stats.exp, color:t.red, svg:<DnIcon />, count:data.filter(e=>e.type==='expense').length },
              ].map((c, i) => (
                <div key={i} className={`f${i+2} card-lift`} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'14px', boxShadow:t.shad2, overflow:'hidden', position:'relative' }}>
                  <div style={{ position:'absolute', top:0, right:0, width:56, height:56, borderRadius:'0 0 0 40px', background:`linear-gradient(135deg,${c.color}18,${c.color}06)`, pointerEvents:'none' }} />
                  <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${c.color}35,${c.color}18)`, color:c.color, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10, boxShadow:`0 4px 12px ${c.color}25` }}>
                    {c.svg}
                  </div>
                  <p style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:t.sub, marginBottom:4 }}>{c.label}</p>
                  <p style={{ fontSize:'1rem', fontWeight:900, color:c.color, letterSpacing:'-0.5px', lineHeight:1 }}>{fmtS(c.val)}</p>
                  <p style={{ fontSize:'0.62rem', color:t.sub, marginTop:5 }}>{c.count} transaksi</p>
                </div>
              ))}
            </div>

            {/* ── BUDGETS ── */}
            <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'16px', boxShadow:t.shad2 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.9rem' }}>
                <h3 style={{ fontSize:'0.85rem', fontWeight:800 }}>🎯 Anggaran</h3>
                <button onClick={() => setShowBudgetModal(true)} style={{ height:30, padding:'0 12px', borderRadius:8, background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, color:'#fff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontWeight:700, fontSize:'0.68rem', boxShadow:`0 4px 12px ${t.accent}40`, transition:'transform 0.1s' }} onMouseDown={e=>e.currentTarget.style.transform='scale(0.96)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                  <PlusIcon /> Atur
                </button>
              </div>

              {budgets.length > 0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
                  {budgets.map(b => {
                    const spent = spentPerCategory[b.category] || 0;
                    const pct = Math.min(100, (spent / b.amount) * 100);
                    const isDanger = pct >= 90;
                    const isWarning = pct >= 75 && !isDanger;
                    const barColor = isDanger ? t.red : isWarning ? t.yellow : t.green;
                    const catTheme = getCat(b.category);
                    
                    return (
                      <div className="row" onClick={() => { setBudgetCategory(b.category); setBudgetAmount(b.amount.toString()); setShowBudgetModal(true); }} key={b.id} style={{ cursor:'pointer' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                          <div style={{ width:24, height:24, borderRadius:7, background:catTheme.color+'20', color:catTheme.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', flexShrink:0 }}>{catTheme.emoji}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'capitalize', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.category}</p>
                          </div>
                          <span style={{ fontSize:'0.68rem', fontWeight:800, color:barColor, flexShrink:0 }}>{pct.toFixed(0)}%</span>
                        </div>
                        <div style={{ height:7, background:t.surf2, borderRadius:99, overflow:'hidden' }}>
                          <div className="bar-fill" style={{ width:`${pct}%`, height:'100%', background: isDanger ? `linear-gradient(90deg,${t.red},#FF8080)` : isWarning ? `linear-gradient(90deg,${t.yellow},#FCD34D)` : `linear-gradient(90deg,${t.green},#4ADE80)`, borderRadius:99, boxShadow: isDanger ? `0 0 8px ${t.red}60` : isWarning ? `0 0 8px ${t.yellow}60` : `0 0 8px ${t.green}50` }}/>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, fontSize:'0.6rem', color:t.sub }}>
                          <span style={{ fontWeight:600 }}>{fmtS(spent)}</span>
                          <span>/ {fmtS(b.amount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'14px 0', color:t.sub, fontSize:'0.75rem' }}>
                  <p>Belum ada target anggaran.</p>
                </div>
              )}
            </div>

            {/* ── TOP SPENDER ── */}
            {top3.length > 0 && (
              <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:16, padding:'16px', boxShadow:t.shad2, marginTop:'1rem' }}>
                <p style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:t.sub, marginBottom:14 }}>🔥 Top Pengeluaran</p>
                {top3.map((e, i) => {
                  const cat = getCat(e.category);
                  return (
                    <div key={e.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:i<2?12:0, padding:'6px 8px', borderRadius:10, transition:'background .15s', cursor:'default' }}
                      onMouseEnter={el=>el.currentTarget.style.background=t.surf2}
                      onMouseLeave={el=>el.currentTarget.style.background='transparent'}>
                      <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${cat.color}28,${cat.color}12)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', flexShrink:0, boxShadow:`0 2px 8px ${cat.color}20` }}>{cat.emoji}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:600, fontSize:'0.78rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.item}</p>
                        <p style={{ fontSize:'0.6rem', color:t.sub, marginTop:1, textTransform:'capitalize' }}>{e.category}</p>
                      </div>
                      <span style={{ fontWeight:800, color:t.red, fontSize:'0.78rem', whiteSpace:'nowrap' }}>{fmtS(e.amount)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main style={{ minWidth:0 }}>

            {/* ── TABS + FILTER ── */}
            <div className="np mob-sticky-tabs" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:10 }}>
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
            <div className="card-lift" style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:18, padding:'20px 20px 14px', boxShadow:t.shad2 }}>
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
            <div className="card-lift" style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:18, padding:'20px 20px 14px', boxShadow:t.shad2 }}>
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
            <div className="card-lift" style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:18, padding:'20px', boxShadow:t.shad2 }}>
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
                  {viewDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                </h3>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                    title="Bulan Sebelumnya"
                    style={{ background:t.surf2, border:`1px solid ${t.border}`, borderRadius:8, width:32, height:32, cursor:'pointer', color:t.text, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>←</button>
                  <button onClick={() => setViewDate(new Date())}
                    title="Bulan Ini"
                    style={{ background:t.surf2, border:`1px solid ${t.border}`, borderRadius:8, padding:'0 10px', height:32, cursor:'pointer', color:t.text, fontSize:'0.7rem', fontWeight:700, transition:'all .2s' }}>Hari Ini</button>
                  <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
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

                  const ratio = summary?.exp ? (summary.exp / maxDailyExp) : 0;
                  let colorBase = t.green;
                  let intensity = 0.1;

                  if (ratio > 0) {
                    if (ratio < 0.3) {
                      colorBase = t.green;
                      intensity = 0.15;
                    } else if (ratio < 0.7) {
                      colorBase = t.yellow;
                      intensity = 0.25;
                    } else {
                      colorBase = t.red;
                      intensity = 0.35;
                    }
                  }
                  
                  const alpha = Math.floor(intensity * 255).toString(16).padStart(2, '0');
                  const bgColor = summary?.exp ? colorBase + alpha : isToday ? t.accent+'08' : t.surf2;

                  return (
                    <div key={dStr} className="cal-day" onClick={() => setCalendarSelectedDay(date)} style={{ 
                      aspectRatio:'1/1', border:`1px solid ${isToday ? t.accent : t.border}`, 
                      borderRadius:10, padding:' clamp(2px,1vw,6px)', display:'flex', flexDirection:'column', justifyContent:'space-between',
                      background: bgColor,
                      position:'relative', transition:'transform .2s, box-shadow .2s',
                      cursor:'pointer', overflow:'hidden'
                    }}>
                      {summary?.topCat && (
                        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(1.2rem,4vw,1.8rem)', opacity:0.15, pointerEvents:'none', zIndex:0 }}>
                          {getCat(summary.topCat).emoji}
                        </div>
                      )}
                      <span style={{ position:'relative', zIndex:1, fontSize:'clamp(0.65rem,2vw,0.78rem)', fontWeight:800, color: isToday ? t.accent : t.text, opacity: isToday?1:0.8 }}>{dayNum}</span>
                      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:1, alignItems:'flex-end', overflow:'hidden' }}>
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
              <div style={{ flex:1, minWidth:200, display:'flex', alignItems:'center', gap:8, background:t.surface, border:`1px solid ${t.border}`, borderRadius:13, padding:'10px 14px', boxShadow:t.shad2, transition:'border-color .2s, box-shadow .2s' }}
                onFocusCapture={e=>{ e.currentTarget.style.borderColor=t.accent+'80'; e.currentTarget.style.boxShadow=`0 0 0 3px ${t.accent}14`; }}
                onBlurCapture={e=>{ e.currentTarget.style.borderColor=t.border; e.currentTarget.style.boxShadow=t.shad2; }}>
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
                    <tr style={{ borderBottom:`1px solid ${t.border}`, background:dark?'rgba(22,24,40,0.9)':'#F8FAFC' }}>
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
                      <tr><td colSpan={6} style={{ textAlign:'center', padding:'3.5rem' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, color:t.sub }}>
                          <div style={{ width:64, height:64, borderRadius:20, background:t.surf2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>
                            {search ? '🔍' : '📭'}
                          </div>
                          <div>
                            <p style={{ fontSize:'0.88rem', fontWeight:700, color:t.text, marginBottom:4 }}>{search ? `Tidak ditemukan` : 'Belum ada transaksi'}</p>
                            <p style={{ fontSize:'0.75rem', color:t.sub }}>{search ? `Coba kata kunci lain` : 'Tambah transaksi pertamamu!'}</p>
                          </div>
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
                            <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:cat.color+(dark?'28':'16'), color:cat.color, padding:'4px 10px', borderRadius:99, fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.03em', boxShadow:`0 1px 4px ${cat.color}20` }}>
                              {cat.emoji} {e.category}
                            </span>
                          </td>
                          <td style={{ padding:'12px 16px', textAlign:'right', fontWeight:800, fontSize:'0.9rem', color:isIn?t.green:t.red, whiteSpace:'nowrap', letterSpacing:'-0.3px' }}>
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
            <div className="mob" style={{ flexDirection:'column', gap:'0.5rem' }}>
              {paginatedData.length === 0 ? (
                <div style={{ textAlign:'center', padding:'3rem 1rem', color:t.sub, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                  <div style={{ width:60, height:60, borderRadius:18, background:t.surf2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem' }}>
                    {search ? '🔍' : '📭'}
                  </div>
                  <div>
                    <p style={{ fontSize:'0.88rem', fontWeight:700, color:t.text, marginBottom:4 }}>{search ? 'Tidak ditemukan' : 'Belum ada transaksi'}</p>
                    <p style={{ fontSize:'0.75rem', color:t.sub }}>{search ? 'Coba kata kunci lain' : 'Tambah transaksi pertamamu!'}</p>
                  </div>
                </div>
              ) : paginatedData.map(e => {
                const cat = getCat(e.category);
                const isIn = e.type === 'income';
                return (
                  <div key={e.id} className="row mob-card" onClick={()=>setSelected(e)}
                    style={{ background:t.surface, borderTop:`1px solid ${t.border}`, borderRight:`1px solid ${t.border}`, borderBottom:`1px solid ${t.border}`, borderLeft:`3px solid ${isIn?t.green:t.red}`, borderRadius:16, padding:'13px 14px', display:'flex', alignItems:'center', gap:12, boxShadow:t.shad2 }}>
                    <div style={{ width:44, height:44, borderRadius:13, background:`linear-gradient(135deg,${cat.color}28,${cat.color}10)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.15rem', flexShrink:0, boxShadow:`0 3px 10px ${cat.color}20` }}>
                      {cat.emoji}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:'0.88rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:5 }}>{e.item}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <span style={{ background:cat.color+'18', color:cat.color, padding:'2px 8px', borderRadius:99, fontSize:'0.62rem', fontWeight:700 }}>{cat.emoji} {e.category}</span>
                        <span style={{ fontSize:'0.6rem', color:t.sub }}>· {fmtDs(e.createdAt)}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontWeight:800, color:isIn?t.green:t.red, fontSize:'0.9rem', whiteSpace:'nowrap' }}>{isIn?'+':'−'}{fmtS(e.amount)}</p>
                      <p style={{ fontSize:'0.58rem', color:t.sub, marginTop:3, textTransform:'uppercase', letterSpacing:'0.04em' }}>{isIn?'masuk':'keluar'}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:6, marginTop:'1.2rem' }}>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  style={{ width:34, height:34, borderRadius:10, background:t.surface, border:`1px solid ${t.border}`, color:page===1?t.muted:t.text, cursor:page===1?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', fontWeight:700, transition:'all .2s', boxShadow:t.shad2 }}>
                  ‹
                </button>
                {(() => {
                  const pages: number[] = [];
                  if (totalPages <= 5) { for (let i=1;i<=totalPages;i++) pages.push(i); }
                  else if (page <= 3) { pages.push(1,2,3,4,5); }
                  else if (page >= totalPages-2) { for (let i=totalPages-4;i<=totalPages;i++) pages.push(i); }
                  else { for (let i=page-2;i<=page+2;i++) pages.push(i); }
                  return pages.map(p => (
                    <button key={p} onClick={()=>setPage(p)}
                      style={{ width:34, height:34, borderRadius:10, background:page===p?t.accent:t.surface, border:`1px solid ${page===p?t.accent:t.border}`, color:page===p?'#fff':t.sub, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.82rem', fontWeight:700, transition:'all .2s', boxShadow:page===p?`0 4px 14px ${t.accent}50`:t.shad2 }}>
                      {p}
                    </button>
                  ));
                })()}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{ width:34, height:34, borderRadius:10, background:t.surface, border:`1px solid ${t.border}`, color:page===totalPages?t.muted:t.text, cursor:page===totalPages?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', fontWeight:700, transition:'all .2s', boxShadow:t.shad2 }}>
                  ›
                </button>
              </div>
            )}
          </>
        )}
          </main>
        </div>{/* end dsk-grid */}

        {/* Month Navigator (Mobile Only) - Bottom Position */}
        <div className="mn-wrapper mob-only" style={{ display:'none', alignItems:'center', justifyContent:'center', marginTop:12, marginBottom:8 }}>
          <div className="mn-card" style={{ display:'flex', alignItems:'center', gap:6, background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:'5px 8px', boxShadow:t.shad2, width:'100%' }}>
            <button className="mn-btn" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              style={{ background:'none', border:'none', color:t.text, cursor:'pointer', fontSize:'1.4rem', padding:'10px 20px', display:'flex', alignItems:'center' }}>←</button>
            <div style={{ textAlign:'center', flex:1 }}>
              <p className="mn-label" style={{ fontSize:'1rem', fontWeight:900, textTransform:'capitalize', margin:0, whiteSpace:'nowrap' }}>
                {viewDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
              </p>
              <button onClick={() => setViewDate(new Date())} style={{ background:'none', border:'none', color:t.accent, fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', cursor:'pointer', padding:0, marginTop:0 }}>Hari Ini</button>
            </div>
            <button className="mn-btn" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              style={{ background:'none', border:'none', color:t.text, cursor:'pointer', fontSize:'1.4rem', padding:'10px 20px', display:'flex', alignItems:'center' }}>→</button>
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:'1.5rem', paddingBottom:12, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:t.green, animation:'blink 2s ease infinite', boxShadow:`0 0 6px ${t.green}` }} />
          <p style={{ fontSize:'0.65rem', color:t.sub, letterSpacing:'0.05em' }}>Sync otomatis 5s · WhatsApp Bot</p>
        </div>
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
              {/* Modal Header */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${addType==='expense'?t.red:t.green}30,${addType==='expense'?t.red:t.green}10)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', transition:'background .3s', flexShrink:0 }}>
                  {addType==='expense' ? '↓' : '↑'}
                </div>
                <div>
                  <h2 style={{ fontSize:'1.15rem', fontWeight:800, letterSpacing:'-0.5px', lineHeight:1.2 }}>Catat Transaksi</h2>
                  <p style={{ fontSize:'0.72rem', color:t.sub, marginTop:2 }}>Pengeluaran atau pemasukan baru</p>
                </div>
              </div>

              {/* Type Toggle */}
              <div style={{ display:'flex', background:t.surf2, borderRadius:12, padding:4, marginBottom:18, border:`1px solid ${t.border}` }}>
                {(['expense','income'] as const).map(type => (
                  <button key={type} type="button" onClick={()=>setAddType(type)}
                    style={{ flex:1, padding:'9px 0', border:'none', background:addType===type?t.surface:'transparent', color:addType===type?(type==='expense'?t.red:t.green):t.sub, borderRadius:9, fontSize:'0.78rem', fontWeight:700, cursor:'pointer', transition:'all .2s', boxShadow:addType===type?t.shad2:'none' }}>
                    {type==='expense' ? '↓ Pengeluaran' : '↑ Pemasukan'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div style={{ marginBottom:14 }}>
                <label className="field-label">Jumlah (Rp)</label>
                <input className="field-input" type="number" required min="0" value={addAmount} onChange={e=>setAddAmount(e.target.value)} placeholder="Misal: 50000" style={{ fontSize:'1.1rem', fontWeight:700 }} />
              </div>

              {/* Item Name */}
              <div style={{ marginBottom:14 }}>
                <label className="field-label">Nama Item / Aktivitas</label>
                <input className="field-input" type="text" required value={addItem} onChange={e=>setAddItem(e.target.value)} placeholder="Misal: Nasi Goreng" style={{ fontSize:'0.9rem' }} />
              </div>

              {/* Category */}
              <div style={{ marginBottom:14 }}>
                <label className="field-label">Kategori</label>
                <div style={{ position:'relative' }}>
                  <select className="field-input" value={addCategory} onChange={e=>setAddCat(e.target.value)} style={{ paddingRight:36, cursor:'pointer', fontSize:'0.88rem', appearance:'none' }}>
                    {Object.entries(CAT).map(([k, v]) => (
                      <option key={k} value={k}>{v.emoji} {k[0].toUpperCase()+k.slice(1).replace('_',' ')}</option>
                    ))}
                  </select>
                  <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:'0.7rem', color:t.sub, pointerEvents:'none' }}>▾</span>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom:24 }}>
                <label className="field-label">Keterangan <span style={{ fontWeight:400, textTransform:'none', opacity:.7 }}>(opsional)</span></label>
                <input className="field-input" type="text" value={addDesc} onChange={e=>setAddDesc(e.target.value)} placeholder="Catatan tambahan..." style={{ fontSize:'0.88rem' }} />
              </div>

              <button type="submit" disabled={isSubmitting}
                style={{ width:'100%', padding:'14px', borderRadius:12, background:addType==='expense'?`linear-gradient(135deg,${t.red},#FF8080)`:`linear-gradient(135deg,${t.green},#4ADE80)`, color:'#fff', border:'none', fontSize:'0.9rem', fontWeight:700, cursor:isSubmitting?'not-allowed':'pointer', opacity:isSubmitting?.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, boxShadow:`0 8px 24px ${addType==='expense'?t.red:t.green}45`, transition:'all .2s' }}>
                {isSubmitting ? 'Menyimpan...' : `Simpan ${addType==='expense'?'Pengeluaran':'Pemasukan'}`}
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
              {/* Modal Header */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${t.accent}30,${t.accent}10)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>
                  🎯
                </div>
                <div>
                  <h2 style={{ fontSize:'1.15rem', fontWeight:800, letterSpacing:'-0.5px', lineHeight:1.2 }}>Atur Limit Anggaran</h2>
                  <p style={{ fontSize:'0.72rem', color:t.sub, marginTop:2 }}>Batas maks. pengeluaran bulanan</p>
                </div>
              </div>

              {/* Category */}
              <div style={{ marginBottom:14 }}>
                <label className="field-label">Kategori</label>
                <div style={{ position:'relative' }}>
                  <select className="field-input" value={budgetCategory} onChange={e=>setBudgetCategory(e.target.value)} style={{ paddingRight:36, cursor:'pointer', fontSize:'0.88rem', appearance:'none' }}>
                    {Object.entries(CAT).map(([k, v]) => (
                      <option key={k} value={k}>{v.emoji} {k[0].toUpperCase()+k.slice(1).replace('_',' ')}</option>
                    ))}
                  </select>
                  <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:'0.7rem', color:t.sub, pointerEvents:'none' }}>▾</span>
                </div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom:24 }}>
                <label className="field-label">Batas Maksimal (Rp) <span style={{ fontWeight:400, textTransform:'none', opacity:.7 }}>(0 = hapus limit)</span></label>
                <input className="field-input" type="number" required min="0" value={budgetAmount} onChange={e=>setBudgetAmount(e.target.value)} placeholder="Misal: 500000" style={{ fontSize:'1.1rem', fontWeight:700 }} />
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

              <div style={{ marginTop: 12, borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
                <button type="button" onClick={handleCopyLastMonthBudgets} disabled={isSubmitting} style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'transparent', color: t.accent, border: `1px solid ${t.accent}`, fontSize: '0.75rem', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems:'center', justifyContent: 'center', gap: 6 }}>
                  🔄 Sama Seperti Bulan Lalu
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
                <label className="field-label">Tanggal Mulai</label>
                <input className="field-input" type="date" value={printStartDate} onChange={e=>setPrintStartDate(e.target.value)} style={{ fontSize:'0.9rem', fontWeight:600 }} />
              </div>

              {/* End Date */}
              <div style={{ marginBottom:20 }}>
                <label className="field-label">Tanggal Selesai</label>
                <input className="field-input" type="date" value={printEndDate} onChange={e=>setPrintEndDate(e.target.value)} style={{ fontSize:'0.9rem', fontWeight:600 }} />
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
                    if (d.printId) {
                      pendingMonthlyTitleRef.current = document.title;
                      pendingMonthlyPrintRef.current = true;
                      document.title = `Laporan_Bulanan_Keuanganku_${printStartDate}_to_${printEndDate}`;
                      setMonthlyPrintId(d.printId); // triggers useEffect above
                    }
                  } catch (e) { console.error(e); }
                  setSubmitting(false);
                  setShowPrintSettings(false);

                  // Fallback: if no printId returned, print without QR
                  if (!pendingMonthlyPrintRef.current) {
                    const oldTitle = document.title;
                    document.title = `Laporan_Bulanan_Keuanganku_${printStartDate}_to_${printEndDate}`;
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                      window.print();
                      document.title = oldTitle;
                    }));
                  }
                }} 
                style={{ width:'100%', padding:'14px', borderRadius:10, background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, color:'#fff', border:'none', fontSize:'0.9rem', fontWeight:700, cursor:printFilteredData.length===0?'not-allowed':'pointer', opacity:printFilteredData.length===0?.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:`0 6px 16px ${t.accent}40`, transition:'all 0.2s' }}>
                <PrIcon /> {printFilteredData.length === 0 ? 'Data Kosong' : isSubmitting ? 'Menyiapkan...' : 'Lanjut Cetak'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══════════════ CALENDAR DAY DETAIL MODAL ══════════════ */}
      {calendarSelectedDay && (
        <div className="modal-backdrop-print" style={{ position:'fixed', inset:0, background: 'rgba(0,0,0,0.65)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1001, padding:16 }}>
          <div className="sc" style={{ background: dark?'rgba(20,22,32,0.92)':'rgba(255,255,255,0.92)', color: t.text, borderRadius: 24, border: `1px solid ${dark?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.5)'}`, padding: '0px', maxWidth: 420, width: '100%', position: 'relative', boxShadow: '0 32px 64px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            
            <button type="button" onClick={()=>setCalendarSelectedDay(null)} style={{ position:'absolute', top:18, right:18, background:t.surf2, border:`1px solid ${t.border}`, borderRadius:10, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:t.sub, zIndex:10 }}>
              <XIcon />
            </button>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', color:t.accent, letterSpacing:'0.1em', marginBottom:6 }}>Ringkasan Harian</p>
                <h2 style={{ fontSize:'clamp(1.1rem,4vw,1.4rem)', fontWeight:900, letterSpacing:'-0.5px', margin:0 }}>
                  {calendarSelectedDay.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                </h2>
              </div>

              <div className="sc" style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: 20, paddingRight: 4, display:'flex', flexDirection:'column', gap:10 }}>
                {calendarSelectedDayTransactions.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'3rem 1rem', color:t.sub, opacity:0.6 }}>
                    <EmptySVG color={t.muted} />
                    <p style={{ fontSize:'0.85rem', marginTop:10 }}>Tidak ada transaksi di hari ini.</p>
                  </div>
                ) : calendarSelectedDayTransactions.map((trx) => {
                  const cat = getCat(trx.category);
                  return (
                    <div key={trx.id} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:14, padding:12, display:'flex', alignItems:'center', gap:12, boxShadow: t.shad2 }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:cat.color+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>
                        {cat.emoji}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:700, fontSize:'0.82rem', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{trx.item}</p>
                        <span style={{ fontSize:'0.65rem', color:t.sub, textTransform:'capitalize' }}>{trx.category}</span>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontWeight:800, fontSize:'0.85rem', color: trx.type==='income'?t.green:t.red }}>{trx.type==='income'?'+':'-'} {fmtS(trx.amount).replace('Rp ','')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: `1.5px dashed ${t.border}`, paddingTop: 16, display:'flex', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex:1 }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: t.sub, textTransform: 'uppercase', marginBottom: 4 }}>Pemasukan</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 900, color: t.green }}>+ {fmt(calendarSelectedDayTotals.inc)}</p>
                </div>
                <div style={{ flex:1, textAlign:'right' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: t.sub, textTransform: 'uppercase', marginBottom: 4 }}>Pengeluaran</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 900, color: t.red }}>− {fmt(calendarSelectedDayTotals.exp)}</p>
                </div>
              </div>
              
              <button onClick={()=>setCalendarSelectedDay(null)} style={{ marginTop: 24, width:'100%', padding:'12px', borderRadius:12, background: t.surf2, color: t.text, border:`1px solid ${t.border}`, fontWeight:700, fontSize:'0.85rem', cursor:'pointer', transition:'all 0.2s' }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ AI CHAT FLOATING WINDOW ══════════════ */}
      {showChat && (
        <div className="sc np chat-window" style={{ position:'fixed', bottom:90, right:24, width:380, maxWidth:'calc(100vw - 48px)', height:550, maxHeight:'calc(100vh - 120px)', borderRadius:20, background: dark?'rgba(20,22,32,0.95)':'rgba(255,255,255,0.95)', border:`1px solid ${t.border}`, boxShadow:'0 24px 48px rgba(0,0,0,0.2)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', zIndex:999, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Header */}
          <div className="chat-header" style={{ background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, padding:'16px 20px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
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
          <div className="chat-messages" style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:16, WebkitOverflowScrolling:'touch' }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
                <div style={{ maxWidth:'85%', background:m.role==='user'?`${t.accent}`:t.surf2, color:m.role==='user'?'#fff':t.text, padding:'12px 16px', borderRadius:18, borderBottomRightRadius:m.role==='user'?4:18, borderBottomLeftRadius:m.role==='assistant'?4:18, fontSize:'0.85rem', lineHeight:1.5, border:m.role==='assistant'?`1px solid ${t.border}`:'none', wordBreak:'break-word' }}>
                  {m.role === 'user' ? (
                    <div>
                      {/* File previews in user messages */}
                      {(m as any).filePreviews && (m as any).filePreviews.length > 0 && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                          {(m as any).filePreviews.map((fp: any, fi: number) => (
                            <div key={fi}>
                              {fp.type === 'image' && fp.preview && (
                                <img src={fp.preview} alt="" style={{ width:120, height:80, objectFit:'cover', borderRadius:10, border:'2px solid rgba(255,255,255,0.3)' }} />
                              )}
                              {fp.type === 'audio' && (
                                <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', padding:'6px 10px', borderRadius:8, fontSize:'0.72rem' }}>
                                  🎤 {fp.name}
                                </div>
                              )}
                              {fp.type === 'pdf' && (
                                <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', padding:'6px 10px', borderRadius:8, fontSize:'0.72rem' }}>
                                  📄 {fp.name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {m.content}
                    </div>
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
                         <ReactMarkdown children={m.content} />
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

                      {/* AI Budget Alerts (Overbudget/Almost Full Warning) */}
                      {m.budgetAlerts && m.budgetAlerts.map((alert, idx) => {
                        const isDanger = alert.status === 'danger';
                        const bg = isDanger ? 'linear-gradient(135deg, #FEF2F2, #FEE2E2)' : 'linear-gradient(135deg, #FFFBEB, #FEF3C7)';
                        const border = isDanger ? '#FECACA' : '#FDE68A';
                        const accent = isDanger ? t.red : '#D97706';
                        const text = isDanger ? '#991B1B' : '#92400E';
                        const subText = isDanger ? '#B91C1C' : '#B45309';

                        return (
                          <div key={idx} style={{ marginTop: 12, background: bg, borderRadius: 16, padding: '16px', border: `1px solid ${border}`, boxShadow: `0 8px 24px ${accent}20`, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, transform: 'rotate(15deg)', color: accent }}>
                              <AlertIcon size={80} />
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                               <div style={{ width:32, height:32, borderRadius:10, background:accent, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: `0 4px 12px ${accent}40` }}>
                                 <AlertIcon size={18} />
                               </div>
                               <span style={{ fontSize:'0.75rem', fontWeight:800, color:accent, letterSpacing:'0.05em', textTransform:'uppercase' }}>
                                 {isDanger ? 'Peringatan Anggaran!' : 'Hampir Terpenuhi!'}
                               </span>
                            </div>
                            <p style={{ fontSize:'0.85rem', fontWeight:700, color:text, margin:'0 0 4px' }}>
                              Kategori {alert.category} {isDanger ? 'Overbudget!' : 'Sudah 80%+'}
                            </p>
                            <div style={{ fontSize: '0.75rem', color: subText, opacity: 0.8, lineHeight: 1.4, margin:0 }}>
                               <ReactMarkdown children={`Mas sudah pakai **${fmtS(alert.spent)}** dari limit **${fmtS(alert.limit)}**. ${isDanger ? 'Segera rem pengeluaran di kategori ini ya Mas! 🛑' : 'Dikit lagi limitnya habis nih Mas, hati-hati ya! ⚠️'}`} />
                            </div>
                          </div>
                        );
                      })}

                      {/* AI Balance Alert (Negative Balance) */}
                      {m.balanceAlert && (
                        <div style={{ marginTop: 12, background: 'linear-gradient(135deg, #1F2937, #111827)', borderRadius: 16, padding: '16px', border: `1px solid rgba(239, 68, 68, 0.4)`, boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, transform: 'rotate(15deg)', color: '#EF4444' }}>
                            <WalletIcon size={80} />
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                             <div style={{ width:32, height:32, borderRadius:10, background:'#EF4444', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: `0 4px 12px rgba(239, 68, 68, 0.4)` }}>
                               <AlertIcon size={18} />
                             </div>
                             <span style={{ fontSize:'0.75rem', fontWeight:800, color:'#EF4444', letterSpacing:'0.05em', textTransform:'uppercase' }}>Saldo Minus!</span>
                          </div>
                          <p style={{ fontSize:'0.85rem', fontWeight:700, color:'#F9FAFB', margin:'0 0 4px' }}>Dompet Mas Sedang Kering!</p>
                          <div style={{ fontSize: '0.75rem', color: '#D1D5DB', opacity: 0.8, lineHeight: 1.4, margin:0 }}>
                            <ReactMarkdown children={`Saldo bersih Mas saat ini **Rp ${m.balanceAlert.balance.toLocaleString('id-ID')}**. Coba cek lagi catatannya atau tambahkan pemasukan baru ya Mas! 💸🆘`} />
                          </div>
                        </div>
                      )}

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

          {/* File Preview Bar */}
          {chatFiles.length > 0 && (
            <div style={{ padding:'8px 16px 0', borderTop:`1px solid ${t.border}`, background:t.surface, display:'flex', gap:8, flexWrap:'wrap' }}>
              {chatFiles.map((f, i) => (
                <div key={i} style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:6, background:t.surf2, border:`1px solid ${t.border}`, borderRadius:10, padding:'6px 10px', fontSize:'0.72rem', color:t.sub }}>
                  {f.type === 'image' && <img src={f.preview} alt="" style={{ width:32, height:32, borderRadius:6, objectFit:'cover' }} />}
                  {f.type === 'audio' && <span>🎤</span>}
                  {f.type === 'pdf' && <span>📄</span>}
                  <span style={{ maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.file.name}</span>
                  <button onClick={() => removeChatFile(i)} style={{ background:'none', border:'none', color:t.red, cursor:'pointer', fontSize:'0.8rem', padding:0, lineHeight:1, display:'flex' }}>
                    <XIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <div style={{ padding:'10px 16px', borderTop:`1px solid ${t.border}`, background:t.surface, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:t.red, animation:'blink 1s infinite' }} />
              <span style={{ fontSize:'0.78rem', color:t.red, fontWeight:700 }}>Merekam... {recordDuration}s</span>
              <button onClick={stopRecording} style={{ marginLeft:'auto', background:t.red, color:'#fff', border:'none', borderRadius:8, padding:'6px 14px', fontSize:'0.72rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                <StopIcon /> Selesai
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendChat} className="chat-input-area" style={{ padding:'12px 16px', borderTop: (chatFiles.length > 0 || isRecording) ? 'none' : `1px solid ${t.border}`, background:t.surface, display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
            {/* Hidden file inputs */}
            <input ref={imageInputRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) addChatFile(f, 'image'); e.target.value = ''; }} />
            <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf" style={{ display:'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) addChatFile(f, 'pdf'); e.target.value = ''; }} />

            {/* Media buttons */}
            <div style={{ display:'flex', gap:2 }}>
              <button type="button" onClick={() => imageInputRef.current?.click()} disabled={isChatLoading || isRecording}
                title="Kirim Foto"
                style={{ background:'none', border:'none', color:t.sub, cursor:'pointer', padding:6, borderRadius:8, display:'flex', transition:'color 0.2s', opacity:(isChatLoading||isRecording)?0.3:1 }}
                onMouseEnter={e => (e.currentTarget.style.color = t.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = t.sub)}>
                <CameraIcon />
              </button>
              <button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isChatLoading}
                title={isRecording ? 'Stop Rekaman' : 'Rekam Audio'}
                style={{ background:'none', border:'none', color:isRecording ? t.red : t.sub, cursor:'pointer', padding:6, borderRadius:8, display:'flex', transition:'color 0.2s', opacity:isChatLoading?0.3:1 }}
                onMouseEnter={e => { if (!isRecording) e.currentTarget.style.color = t.accent; }}
                onMouseLeave={e => { if (!isRecording) e.currentTarget.style.color = t.sub; }}>
                {isRecording ? <StopIcon /> : <MicIcon />}
              </button>
              <button type="button" onClick={() => pdfInputRef.current?.click()} disabled={isChatLoading || isRecording}
                title="Upload PDF"
                style={{ background:'none', border:'none', color:t.sub, cursor:'pointer', padding:6, borderRadius:8, display:'flex', transition:'color 0.2s', opacity:(isChatLoading||isRecording)?0.3:1 }}
                onMouseEnter={e => (e.currentTarget.style.color = t.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = t.sub)}>
                <ClipIcon />
              </button>
            </div>

            <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder={chatFiles.length > 0 ? 'Tambahkan keterangan...' : 'Tanya sesuatu...'} style={{ flex:1, background:t.surf2, border:`1px solid ${t.border}`, borderRadius:12, padding:'11px 14px', fontSize:'1rem', color:t.text, minWidth:0 }} disabled={isChatLoading || isRecording} />
            <button type="submit" disabled={isChatLoading || isRecording || (!chatInput.trim() && chatFiles.length === 0)} style={{ background:t.accent, color:'#fff', border:'none', borderRadius:12, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity:((!chatInput.trim() && chatFiles.length === 0)||isChatLoading||isRecording)?0.4:1, flexShrink:0, transition:'opacity 0.2s' }}>
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      {/* Floating Sparkle Button */}
      <button className="np chat-fab" onClick={()=>setShowChat(!showChat)} style={{ position:'fixed', bottom:24, right:24, width:56, height:56, borderRadius:'50%', background:`linear-gradient(135deg,${t.accent},#9B7CF8)`, color:'#fff', border:'none', boxShadow:`0 6px 20px ${t.accent}66`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:998, transition:'transform 0.2s' }}>
        {showChat ? <XIcon /> : <SparklesIcon />}
      </button>

      {/* ══════════════ CUSTOM NOTIFICATIONS ══════════════ */}
      {toast && (
        <div className={`toast-box ${toast.type}`}>
           {toast.type === 'success' && <span>✅</span>}
           {toast.type === 'error' && <span>❌</span>}
           {toast.type === 'info' && <span>ℹ️</span>}
           {toast.msg}
        </div>
      )}

      {confirmModal && (
        <div className="conf-overlay" onClick={() => setConfirmModal(null)}>
          <div className="conf-card" onClick={e => e.stopPropagation()}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: t.red + '15', color: t.red, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: '1.2rem' }}>
              ⚠️
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8 }}>Konfirmasi</h3>
            <p style={{ fontSize: '0.82rem', color: t.sub, lineHeight: 1.5, marginBottom: 20 }}>{confirmModal.msg}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmModal(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: t.surf2, border: `1px solid ${t.border}`, color: t.text, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Batal</button>
              <button onClick={confirmModal.onConfirm} style={{ flex: 1, padding: '10px', borderRadius: 10, background: t.red, border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: `0 4px 12px ${t.red}40` }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}