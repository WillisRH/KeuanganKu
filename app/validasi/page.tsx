"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";

// ─── Theme (same tokens as main app) ─────────────────────────────────────────
const makeTheme = (dark: boolean) => ({
  bg:      dark ? '#0C0E16' : '#F4F7FE',
  surface: dark ? '#141620' : '#FFFFFF',
  surf2:   dark ? '#1C1F2E' : '#F8FAFC',
  border:  dark ? '#252840' : '#E2E8F0',
  text:    dark ? '#EDF0F7' : '#1E293B',
  sub:     dark ? '#5B6380' : '#64748B',
  muted:   dark ? '#3D4260' : '#94A3B8',
  accent:  '#5B6CF8',
  green:   '#22C55E',
  red:     '#FF6B6B',
});

// ─── SVG Kit ──────────────────────────────────────────────────────────────────
const WalletIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
    <path d="M16 3H8L4 7h16l-4-4z"/>
    <circle cx="17" cy="13" r="1.2" fill="currentColor" stroke="none"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CrossIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const DocIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const UpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
  </svg>
);

const DnIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/>
  </svg>
);

// Animated ring decoration
const Ring = ({ color }: { color: string }) => (
  <svg width="90" height="90" viewBox="0 0 90 90" fill="none" style={{ position: 'absolute', top: -10, right: -10, opacity: 0.12, pointerEvents: 'none' }}>
    <circle cx="45" cy="45" r="42" stroke={color} strokeWidth="1.5"/>
    <circle cx="45" cy="45" r="30" stroke={color} strokeWidth="1"/>
    <circle cx="45" cy="45" r="16" stroke={color} strokeWidth="1"/>
  </svg>
);

// Dots deco
const Dots = ({ color }: { color: string }) => (
  <svg viewBox="0 0 50 50" style={{ position: 'absolute', bottom: 20, left: 20, width: 60, height: 60, opacity: 0.08, pointerEvents: 'none' }}>
    {[0,1,2,3].flatMap(r => [0,1,2,3].map(c => (
      <circle key={`${r}${c}`} cx={c * 14 + 7} cy={r * 14 + 7} r="2" fill={color}/>
    )))}
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt  = (n: number) => 'Rp ' + Math.abs(n).toLocaleString('id-ID');
const fmtD = (d: string) => new Date(d).toLocaleString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
const fmtDs = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Row helper ───────────────────────────────────────────────────────────────
const Row = ({ label, value, valueColor, T }: { label: string; value: React.ReactNode; valueColor?: string; T: any }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:`1px solid ${T.border}` }}>
    <span style={{ fontSize:'0.8rem', color: T.sub }}>{label}</span>
    <span style={{ fontWeight:600, fontSize:'0.88rem', color: valueColor ?? T.text }}>{value}</span>
  </div>
);

// ─── States ───────────────────────────────────────────────────────────────────
const LoadingState = ({ T }: { T: any }) => (
  <div style={{ padding:'48px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
    <div style={{
      width:32, height:32,
      borderWidth: '2.5px',
      borderStyle: 'solid',
      borderRightColor: T.muted,
      borderBottomColor: T.muted,
      borderLeftColor: T.muted,
      borderTopColor: T.accent,
      borderRadius:'50%',
      animation:'spin 0.8s linear infinite',
    }}/>
    <p style={{ fontSize:'0.82rem', color: T.sub }}>Memverifikasi dokumen...</p>
  </div>
);

const ErrorState = ({ message, T }: { message: string, T: any }) => (
  <div style={{ animation:'up .35s ease both', display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
    {/* Icon */}
    <div style={{ width:64, height:64, borderRadius:'50%', background:`${T.red}18`, border:`1.5px solid ${T.red}40`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18, color: T.red }}>
      <CrossIcon />
    </div>
    <h2 style={{ fontSize:'1rem', fontWeight:800, color: T.red, marginBottom:8 }}>Dokumen Tidak Valid</h2>
    <p style={{ fontSize:'0.82rem', color: T.sub, lineHeight:1.6, textAlign:'center' }}>{message}</p>
  </div>
);

const ValidState = ({ result, T }: { result: any, T: any }) => {
  const isIncome = result.data?.type === 'income';

  return (
    <div style={{ animation:'up .35s ease both' }}>
      {/* Valid badge */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        background:`${T.green}15`, border:`1px solid ${T.green}35`,
        color: T.green, padding:'10px 16px', borderRadius:10, marginBottom:24,
      }}>
        <CheckIcon />
        <span style={{ fontWeight:700, fontSize:'0.82rem', letterSpacing:'0.06em', textTransform:'uppercase' }}>Dokumen Valid Resmi</span>
      </div>

      {/* Monthly report */}
      {result.type === 'monthly' ? (
        <>
          {result.metadata && (
             <div style={{ textAlign:'center', marginBottom:20 }}>
               <p style={{ fontSize:'0.67rem', color: T.sub, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Total Pengeluaran</p>
               <p style={{ fontSize:'clamp(2rem,8vw,2.6rem)', fontWeight:900, letterSpacing:'-1.5px', color: T.red, lineHeight:1, marginBottom:6 }}>
                 {fmt(result.metadata.exp)}
               </p>
               <span style={{
                 display:'inline-flex', alignItems:'center', gap:5,
                 background: `${T.red}18`,
                 color: T.red,
                 padding:'4px 12px', borderRadius:99, fontSize:'0.72rem', fontWeight:700,
               }}>
                 <DnIcon /> Filtered Print
               </span>
             </div>
          )}

          <div style={{ background: T.surf2, border:`1px solid ${T.border}`, borderRadius:14, padding:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:`${T.accent}20`, color: T.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <DocIcon />
              </div>
              <div>
                <p style={{ fontSize:'0.67rem', color: T.sub, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Tipe Dokumen</p>
                <p style={{ fontWeight:700, fontSize:'0.92rem' }}>Laporan Bulanan</p>
              </div>
            </div>
            
            {result.metadata && (
              <div style={{ borderTop:`1px dashed ${T.border}`, margin:'14px 0', borderBottom:`1px dashed ${T.border}`, padding:'14px 0', display:'flex', justifyContent:'space-between' }}>
                 <div>
                   <p style={{ fontSize:'0.65rem', color:T.sub, textTransform:'uppercase', marginBottom:2 }}>Pemasukan</p>
                   <p style={{ fontSize:'0.85rem', fontWeight:700, color:T.green }}>{fmt(result.metadata.inc)}</p>
                 </div>
                 <div style={{ textAlign:'right' }}>
                   <p style={{ fontSize:'0.65rem', color:T.sub, textTransform:'uppercase', marginBottom:2 }}>Saldo Bersih</p>
                   <p style={{ fontSize:'0.85rem', fontWeight:700, color:result.metadata.bal >= 0 ? T.green : T.red }}>
                     {(result.metadata.bal > 0 ? '+' : '') + fmt(result.metadata.bal)}
                   </p>
                 </div>
              </div>
            )}

            <div style={{ paddingTop: result.metadata ? 0 : 14, borderTop: result.metadata ? 'none' : `1px dashed ${T.border}` }}>
              <p style={{ fontSize:'0.8rem', color: T.sub, lineHeight:1.65 }}>
                Rekapitulasi transaksi {result.metadata ? `dari ${fmtDs(result.metadata.start)} sampai ${fmtDs(result.metadata.end)}` : 'resmi yang dihasilkan otomatis'} oleh sistem Keuanganku.
              </p>
            </div>
          </div>
        </>
      ) : result.data && (
        <>
          {/* Amount hero */}
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <p style={{ fontSize:'0.67rem', color: T.sub, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Total Nominal</p>
            <p style={{ fontSize:'clamp(2rem,8vw,2.6rem)', fontWeight:900, letterSpacing:'-1.5px', color: isIncome ? T.green : T.red, lineHeight:1, marginBottom:6 }}>
              {fmt(result.data.amount)}
            </p>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:5,
              background: isIncome ? `${T.green}18` : `${T.red}18`,
              color: isIncome ? T.green : T.red,
              padding:'4px 12px', borderRadius:99, fontSize:'0.72rem', fontWeight:700,
            }}>
              {isIncome ? <UpIcon /> : <DnIcon />}
              {isIncome ? 'Pemasukan' : 'Pengeluaran'}
            </span>
          </div>

          {/* Detail rows */}
          <div style={{ background: T.surf2, border:`1px solid ${T.border}`, borderRadius:14, padding:'4px 16px', marginBottom:0 }}>
            <Row T={T} label="Item" value={`${result.data.item}${(result.data.quantity??1)>1 ? ` ×${result.data.quantity}` : ''}`}/>
            <Row T={T} label="Kategori" value={
              <span style={{ background:`${T.accent}18`, color: T.accent, padding:'3px 10px', borderRadius:99, fontSize:'0.7rem', fontWeight:700 }}>
                {result.data.category}
              </span>
            }/>
            {result.data.description && (
              <Row T={T} label="Deskripsi" value={<span style={{ color: T.sub, fontStyle:'italic', fontSize:'0.82rem' }}>{result.data.description}</span>}/>
            )}
          </div>
        </>
      )}

      {/* Printed at */}
      <div style={{ marginTop:16, background:`${T.surf2}`, border:`1px solid ${T.border}`, borderRadius:12, padding:'13px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <span style={{ fontSize:'0.67rem', color: T.sub, textTransform:'uppercase', letterSpacing:'0.08em' }}>Waktu Cetak</span>
        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.78rem', color: T.text, fontWeight:500 }}>
          <CalIcon /> {fmtD(result.printedAt)}
        </span>
      </div>
    </div>
  );
};

// ─── Main Content ─────────────────────────────────────────────────────────────
function ValidationContent() {
  const searchParams = useSearchParams();
  const printId = searchParams.get("printId");

  const [loading, setLoading] = useState(true);
  const [result,  setResult]  = useState<any>(null);
  const [error,   setError]   = useState<string|null>(null);
  const [dark,    setDark]    = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => setDark(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const T = makeTheme(dark);

  useEffect(() => {
    if (!printId) { setError("ID Validasi tidak ditemukan di URL."); setLoading(false); return; }
    fetch(`/api/validasi?printId=${printId}`)
      .then(r => r.json())
      .then(data => { if (data.error) throw new Error(data.error); setResult(data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [printId]);

  const accentColor = error ? T.red : result?.valid ? T.green : T.accent;

  return (
    <div style={{ minHeight:'100vh', background: T.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(1rem,4vw,2rem)', fontFamily:"'Outfit', system-ui, sans-serif", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes up   { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
        @keyframes glow { 0%,100%{opacity:.6} 50%{opacity:1} }
      `}</style>

      <div style={{
        width:'100%', maxWidth:420,
        background: T.surface,
        border:`1px solid ${T.border}`,
        borderRadius:22,
        padding:'clamp(1.5rem,5vw,2rem) clamp(1.25rem,5vw,1.75rem)',
        boxShadow:`0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${T.border}`,
        position:'relative', overflow:'hidden',
        animation:'up .4s ease both',
      }}>

        {/* Decorative elements */}
        <Ring color={accentColor} />
        <Dots color={accentColor} />

        {/* Top accent bar */}
        <div style={{
          position:'absolute', top:0, left:20, right:20, height:3,
          borderRadius:'0 0 4px 4px',
          background:`linear-gradient(90deg, ${T.accent}, #9B7CF8)`,
        }}/>

        {/* Ambient glow */}
        <div style={{
          position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)',
          width:200, height:120,
          background:`radial-gradient(ellipse, ${accentColor}22 0%, transparent 70%)`,
          pointerEvents:'none', transition:'background .5s',
          animation:'glow 3s ease infinite',
        }}/>

        {/* Header */}
        <div style={{ position:'relative', zIndex:1, textAlign:'center', marginBottom:28 }}>
          <div style={{
            width:46, height:46, borderRadius:13,
            background:`linear-gradient(135deg, ${T.accent}, #9B7CF8)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 14px', color:'#fff',
            boxShadow:`0 6px 20px ${T.accent}40`,
          }}>
            <WalletIcon />
          </div>
          <h1 style={{ fontSize:'1.05rem', fontWeight:800, letterSpacing:'-0.3px', marginBottom:3 }}>
            Keuangan<span style={{ color: T.accent }}>ku</span>
          </h1>
          <p style={{ fontSize:'0.68rem', color: T.sub, letterSpacing:'0.06em', textTransform:'uppercase' }}>Sistem Validasi Dokumen</p>
        </div>

        {/* Divider */}
        <div style={{ borderTop:`1px solid ${T.border}`, marginBottom:24 }}/>

        {/* Content */}
        <div style={{ position:'relative', zIndex:1 }}>
          {loading    ? <LoadingState T={T} /> :
           error      ? <ErrorState T={T} message={error} /> :
           result?.valid ? <ValidState T={T} result={result} /> :
           <ErrorState T={T} message="Dokumen tidak dapat diverifikasi." />
          }
        </div>

        {/* Footer */}
        <div style={{ marginTop:24, textAlign:'center', borderTop:`1px solid ${T.border}`, paddingTop:16 }}>
          <p style={{ fontSize:'0.62rem', color: T.muted, fontFamily:'monospace', letterSpacing:'0.04em' }}>Keuanganku Validation System</p>
          {printId && <p style={{ fontSize:'0.56rem', color: T.muted, fontFamily:'monospace', marginTop:3, opacity:.6 }}>ID: {printId}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ValidationPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background: '#0C0E16', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:28, height:28, borderWidth: '2.5px', borderStyle: 'solid', borderRightColor: '#3D4260', borderBottomColor: '#3D4260', borderLeftColor: '#3D4260', borderTopColor:'#5B6CF8', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      </div>
    }>
      <ValidationContent />
    </Suspense>
  );
}