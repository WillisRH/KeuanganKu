'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import { theme, makeTheme } from '@/lib/theme';

interface HistoryClientProps {
  bills: any[];
}

export default function HistoryClient({ bills }: HistoryClientProps) {
  const [dark, setDark] = useState(false);
  const t = makeTheme(dark);

  useEffect(() => {
    if (localStorage.getItem('expense-theme') === 'dark') setDark(true);
  }, []);

  const toggleDark = () => {
    setDark(d => {
      const next = !d;
      localStorage.setItem('expense-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const fmt = (n: number) => 'Rp ' + Math.floor(n).toLocaleString('id-ID');

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Outfit', system-ui, sans-serif", width: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden', transition: 'background 0.3s, color 0.3s' }}>
      
      <Navbar 
        dark={dark} 
        toggleDark={toggleDark} 
        showGreeting={true}
        extraActions={
          <Link href="/c" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 12, textDecoration: 'none',
            background: `linear-gradient(135deg, #5B6CF8, #9B7CF8)`,
            color: '#fff', fontWeight: 700, fontSize: '0.85rem',
            boxShadow: '0 4px 12px rgba(91,108,248,0.35)',
            outline: 'none', border: 'none', whiteSpace: 'nowrap'
          }}>
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
            <span className="create-btn-label"> Buat Baru</span>
          </Link>
        }
      />

      <div style={{ flex: 1, padding: "clamp(24px, 5vw, 40px) clamp(16px, 4vw, 32px)", width: '100%', maxWidth: 840, margin: '0 auto', boxSizing: 'border-box' }}>
        <style jsx global>{`
          @media (max-width: 480px) {
            .create-btn-label { display: none; }
          }
        `}</style>
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

          .card-lift {
            transition: transform .25s cubic-bezier(.16,1,.3,1), box-shadow .2s ease, border-color .2s ease;
          }
          .card-lift:hover {
            transform: translateY(-4px);
            box-shadow: ${t.shadow} !important;
            border-color: ${t.accent}44 !important;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
          
          @media (max-width: 480px) {
            .card-lift { padding: 18px 20px !important; }
          }
        `}</style>

        <h1 style={{ fontSize: "clamp(1.5rem, 6vw, 2rem)", fontWeight: 900, letterSpacing: '-0.7px', marginBottom: 32, marginTop: 8 }}>
          Riwayat <span style={{ color: t.accent }}>Split Bill</span>
        </h1>

        {bills.length === 0 ? (
          <div className="fade-in" style={{ textAlign: "center", padding: "80px 0", background: t.surface, border: `1px dashed ${t.border}`, borderRadius: 24 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📑</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Belum ada riwayat</h3>
            <p style={{ color: t.sub, fontSize: "0.9rem", maxWidth: 300, margin: '0 auto' }}>Kamu belum pernah menyimpan catatan split bill sebelumnya.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16, width: '100%', minWidth: 0 }}>
            {bills.map((bill, i) => (
              <Link 
                key={bill.id} 
                href={`/s/${bill.id}`}
                className="card-lift fade-in"
                style={{ 
                  background: t.surface, 
                  border: `1px solid ${t.border}`, 
                  borderRadius: 24, 
                  padding: '20px 20px 20px 24px',
                  textDecoration: "none",
                  color: t.text,
                  display: "block",
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  width: '100%',
                  animationDelay: `${i * 0.05}s`
                }}
              >
                <div style={{ position:'absolute', top:0, left:0, width:'4px', height:'100%', background: `linear-gradient(to bottom, ${t.accent}, transparent)` }} />
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontSize:'0.68rem', fontWeight:800, color:t.accent, textTransform:'uppercase', letterSpacing:'0.05em', background:t.accent+'15', padding:'3px 8px', borderRadius:6, whiteSpace:'nowrap' }}>
                          {new Date(bill.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                        </span>
                        {(() => {
                          const totalPaid = bill.members.reduce((sum: number, m: any) => sum + (m.paidAmount || 0), 0);
                          const isLunas = totalPaid >= bill.total;
                          const isNyicil = totalPaid > 0 && totalPaid < bill.total;
                          if (isLunas) return <span style={{ fontSize:'0.65rem', fontWeight:800, color:'#10B981', background:'#10B98115', padding:'3px 8px', borderRadius:6, whiteSpace:'nowrap' }}>✅ Lunas</span>;
                          if (isNyicil) return <span style={{ fontSize:'0.65rem', fontWeight:800, color:t.accent, background:t.accent+'15', padding:'3px 8px', borderRadius:6, whiteSpace:'nowrap' }}>🕒 Nyicil</span>;
                          return <span style={{ fontSize:'0.65rem', fontWeight:800, color:t.sub, background:t.surf2, padding:'3px 8px', borderRadius:6, whiteSpace:'nowrap' }}>Belum Bayar</span>;
                        })()}
                      </div>
                      <span style={{ fontSize:'0.8rem', fontWeight:700, color:t.sub, whiteSpace:'nowrap' }}>
                        {new Date(bill.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    
                    <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:16 }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{fmt(bill.total)}</h2>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: 'center' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:-4 }}>
                         {bill.members.slice(0, 4).map((m: any, idx: number) => (
                           <div key={m.id} style={{ 
                             width: 24, height: 24, borderRadius: '50%', 
                             background: t.border, border: `2px solid ${t.surface}`,
                             display: 'flex', alignItems: 'center', justifyContent: 'center',
                             fontSize: 9, fontWeight: 900, color: t.text,
                             marginLeft: idx > 0 ? -8 : 0,
                             zIndex: 10 - idx
                           }}>
                             {m.name.charAt(0).toUpperCase()}
                           </div>
                         ))}
                         {bill.members.length > 4 && (
                           <div style={{ fontSize:'0.75rem', fontWeight:600, color:t.sub, marginLeft: 8 }}>
                             +{bill.members.length - 4} lainnya
                           </div>
                         )}
                      </div>
                      <span style={{ width:1, height:12, background:t.border }} />
                      <span style={{ color: t.sub, fontSize: "0.8rem", fontWeight: 600 }}>{bill.members.length} Orang Terlibat</span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 14, background: t.surf2, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: t.sub, border: `1px solid ${t.border}`
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ position:'fixed', top:'-10%', right:'-10%', width:'40vw', height:'40vw', background:`radial-gradient(circle, ${t.accent}08 0%, transparent 70%)`, pointerEvents:'none', zIndex: 0 }} />
    </div>
  );
}
