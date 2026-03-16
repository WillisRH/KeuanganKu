'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { makeTheme } from '@/lib/theme';

// ─── Icons ────────────────────────────────────────────────────────────────────
const WalletIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
    <path d="M16 3H8L4 7h16l-4-4z" />
    <circle cx="17" cy="13" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

interface NavbarProps {
  dark: boolean;
  toggleDark: () => void;
  extraActions?: React.ReactNode;
  showGreeting?: boolean;
}

export default function Navbar({ dark, toggleDark, extraActions, showGreeting = true }: NavbarProps) {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const t = makeTheme(dark);

  const userName = session?.user?.name || '';
  const userImage = session?.user?.image;

  const now = new Date();
  const h = now.getHours();
  const emoji = h < 6 ? '🌃' : h < 11 ? '🌅' : h < 15 ? '☀️' : h < 18 ? '🌇' : h < 21 ? '🌆' : '🌙';
  const greet = h < 6 ? 'Lembur ya' : h < 11 ? 'Selamat Pagi' : h < 15 ? 'Selamat Siang' : h < 18 ? 'Selamat Sore' : h < 21 ? 'Selamat Malam' : 'Istirahat dong';

  return (
    <nav style={{
      background: dark ? 'rgba(12,14,22,0.85)' : 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(24px)',
      borderBottom: `1px solid ${t.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      paddingTop: 'env(safe-area-inset-top, 0px)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1rem, 4vw, 1.75rem)', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo & Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ 
              width: 38, height: 38, borderRadius: 12, 
              background: `linear-gradient(135deg, ${t.accent}, #9B7CF8)`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: `0 6px 18px ${t.accent}40`, color: '#fff' 
            }}>
              <WalletIcon size={20} />
            </div>
            <div className="logo-text-wrapper">
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1, color: t.text, margin: 0 }}>
                Keuangan<span style={{ color: t.accent }}>ku</span>
              </h1>
              {showGreeting && (
                <p className="dsk-only" style={{ fontSize: '0.72rem', color: t.sub, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <span>{emoji}</span> 
                  {status === 'loading' ? <span>{greet}...</span> : <span>{greet}, <span style={{ color: t.text, fontWeight: 700 }}>{userName.split(' ')[0] || 'User'}!</span></span>}
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* Desktop Navigation & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          
          {extraActions}

          <button onClick={toggleDark} className="nav-icon-btn" style={{ 
            width: 40, height: 40, borderRadius: 12, border: `1px solid ${t.border}`, 
            background: t.surface, color: t.accent, cursor: 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: t.shad2, transition: 'all 0.2s'
          }}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {userImage && !imgError ? (
                <img src={userImage} referrerPolicy="no-referrer" alt={userName} onError={() => setImgError(true)} style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${t.accent}`, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800 }}>
                  {(userName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {showProfileMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setShowProfileMenu(false)} />
                <div style={{ 
                  position: 'absolute', top: '100%', right: 0, marginTop: 12, 
                  background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, 
                  boxShadow: t.shadow, padding: 8, zIndex: 999, minWidth: 220,
                  animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  color: t.text
                }}>
                  <div style={{ padding: '12px 14px', borderBottom: `1px solid ${t.border}`, marginBottom: 6 }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: t.text }}>{userName}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: t.sub, opacity: 0.8 }}>{session?.user?.email}</p>
                  </div>
                  
                  <Link href="/dashboard" onClick={() => setShowProfileMenu(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, color: t.text, fontSize: '0.85rem', fontWeight: 600 }}>
                    📊 Dashboard
                  </Link>
                  <Link href="/c" onClick={() => setShowProfileMenu(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, color: t.text, fontSize: '0.85rem', fontWeight: 600 }}>
                    ⭐ Split Bill
                  </Link>
                  <Link href="/c/history" onClick={() => setShowProfileMenu(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, color: t.text, fontSize: '0.85rem', fontWeight: 600 }}>
                    🕒 Riwayat
                  </Link>
                  
                  <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${t.border}` }}>
                    <button onClick={() => signOut()} style={{ 
                      width: '100%', padding: '10px', borderRadius: 12, 
                      background: t.red + '15', color: t.red, border: 'none', 
                      fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.2s'
                    }}>
                      🏃 Keluar Aplikasi
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .nav-icon-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(91,108,248,0.15);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .dsk-only { display: none !important; }
          .logo-text-wrapper h1 { font-size: 1rem !important; }
        }
      `}</style>
    </nav>
  );
}
