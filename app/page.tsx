'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { theme } from '../lib/theme';
const t = theme.light;

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
const WalletIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
    <path d="M16 3H8L4 7h16l-4-4z"/>
    <circle cx="17" cy="13" r="1.2" fill="currentColor" stroke="none"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ─── Feature Data ──────────────────────────────────────────────────────────────
const features = [
  {
    emoji: '🤖',
    title: 'AI Chatbot',
    desc: 'Tanya apa saja tentang keuanganmu! Chatbot AI Gemini siap membantu analisis, saran, dan peringatan anggaran secara real-time.',
    gradient: 'linear-gradient(135deg, #5B6CF8 0%, #9B7CF8 100%)',
  },
  {
    emoji: '📊',
    title: 'Grafik & Analitik',
    desc: 'Visualisasi pengeluaran dengan pie chart dan bar chart. Lihat tren bulanan dan kategori pengeluaran terbesarmu.',
    gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
  },
  {
    emoji: '📅',
    title: 'Kalender Keuangan',
    desc: 'Heatmap kalender dengan warna berdasarkan intensitas pengeluaran. Tap hari mana saja untuk lihat detailnya.',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
  },
  {
    emoji: '🎯',
    title: 'Target Anggaran',
    desc: 'Set budget per kategori setiap bulan. Dapatkan peringatan otomatis saat mendekati atau melampaui limit.',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
  },
  {
    emoji: '💬',
    title: 'WhatsApp Bot',
    desc: 'Catat transaksi langsung dari WhatsApp! Cukup kirim pesan ke bot dan otomatis tersimpan ke dashboard.',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  },
  {
    emoji: '🧾',
    title: 'Cetak Struk & Laporan',
    desc: 'Generate laporan keuangan lengkap dengan QR code validasi. Export ke CSV atau cetak langsung.',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  },
];

const stats = [
  { value: '5s', label: 'Auto Sync' },
  { value: 'AI', label: 'Gemini Powered' },
  { value: '∞', label: 'Transaksi' },
  { value: '24/7', label: 'WhatsApp Bot' },
];

// ─── Floating Particles ────────────────────────────────────────────────────────
const Particles = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    {Array.from({ length: 30 }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: Math.random() * 3 + 1,
        height: Math.random() * 3 + 1,
        borderRadius: '50%',
        background: `rgba(91,108,248,${Math.random() * 0.3 + 0.05})`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `floatParticle ${Math.random() * 6 + 4}s ease-in-out infinite alternate`,
        animationDelay: `${Math.random() * 4}s`,
      }} />
    ))}
  </div>
);

import { useSession, signOut } from 'next-auth/react';

// ─── Landing Page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { data: session } = useSession();
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Outfit', system-ui, sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        @keyframes floatParticle {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .hero-glow {
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
        }

        .feature-card {
          background: ${t.surface};
          border: 1px solid ${t.border};
          border-radius: 20px;
          padding: 28px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          border-color: #5B6CF830;
          box-shadow: 0 20px 60px rgba(91, 108, 248, 0.12);
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-card:hover::before {
          opacity: 1;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1rem;
          font-family: inherit;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }
        .cta-primary {
          background: linear-gradient(135deg, #5B6CF8, #9B7CF8);
          color: #fff;
          box-shadow: 0 8px 32px rgba(91,108,248,0.35);
        }
        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(91,108,248,0.5);
        }
        .cta-secondary {
          background: transparent;
          color: ${t.text};
          border: 1px solid ${t.border};
        }
        .cta-secondary:hover {
          border-color: #5B6CF860;
          background: rgba(91,108,248,0.05);
        }

        .stat-card {
          text-align: center;
          padding: 20px;
          border-radius: 16px;
          background: ${t.surface};
          border: 1px solid ${t.border};
        }

        .nav-link {
          color: ${t.sub};
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          transition: color 0.2s;
        }
        .nav-link:hover { color: ${t.text}; }

        .check-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: ${t.sub};
        }
        .check-item svg { color: ${t.green}; flex-shrink: 0; }

        @media (max-width: 768px) {
          .hero-title { font-size: clamp(2rem, 8vw, 2.5rem) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-buttons { flex-direction: column !important; align-items: stretch !important; }
          .hero-buttons .cta-btn { justify-content: center; }
          .nav-links { display: none !important; }
          .footer-grid { grid-template-columns: 1fr !important; text-align: center; }
        }
      `}</style>

      {/* ════════════ NAV ════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '14px clamp(1rem, 4vw, 3rem)',
        background: scrollY > 50 ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? `1px solid ${t.border}` : '1px solid transparent',
        transition: 'all 0.3s',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg, #5B6CF8, #9B7CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <WalletIcon />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Keuangan<span style={{ color: t.accent }}>ku</span>
          </span>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#features" className="nav-link">Fitur</a>
          <a href="#stats" className="nav-link">Keunggulan</a>
          {session ? (
            <>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/c/history" className="nav-link">History Split</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {session.user?.image && !imgError ? (
                  <img src={session.user.image} referrerPolicy="no-referrer" alt={session.user.name || ''} onError={() => setImgError(true)} style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${t.accent}` }} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <button onClick={() => signOut()} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Keluar</button>
              </div>
            </>
          ) : (
            <Link href="/api/auth/signin" className="nav-link">Masuk</Link>
          )}
          <Link href="/dashboard" className="cta-btn cta-primary" style={{ padding: '10px 24px', fontSize: '0.82rem', borderRadius: 10 }}>
            {session ? 'Buka Dashboard' : 'Mulai Sekarang'}
          </Link>
        </div>
        <Link href="/dashboard" className="cta-btn cta-primary nav-mobile-btn" style={{ padding: '8px 18px', fontSize: '0.78rem', borderRadius: 10, display: 'none' }}>
          Dashboard →
        </Link>
        <style>{`
          @media (max-width: 768px) {
            .nav-mobile-btn { display: inline-flex !important; }
          }
        `}</style>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(6rem, 15vw, 10rem) clamp(1.5rem, 5vw, 4rem) clamp(4rem, 10vw, 6rem)',
        textAlign: 'center',
      }}>
        <Particles />
        <div className="hero-glow" style={{ background: '#5B6CF8', top: '-20%', left: '10%' }} />
        <div className="hero-glow" style={{ background: '#9B7CF8', bottom: '-20%', right: '5%' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(91,108,248,0.1)', border: '1px solid rgba(91,108,248,0.2)',
            borderRadius: 99, padding: '6px 16px', marginBottom: 28,
            animation: 'fadeUp 0.6s ease both',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.green, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: t.sub }}>Powered by Gemini AI · v2.0</span>
          </div>

          {/* Title */}
          <h1 className="hero-title" style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            letterSpacing: '-2px',
            lineHeight: 1.1,
            marginBottom: 20,
            animation: 'fadeUp 0.6s ease both 0.1s',
          }}>
            Kelola Keuanganmu
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #5B6CF8, #9B7CF8, #EC4899)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>
              Lebih Cerdas.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
            color: t.sub,
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto 36px',
            animation: 'fadeUp 0.6s ease both 0.2s',
          }}>
            Dashboard keuangan personal dengan AI chatbot, analitik visual,
            kalender heatmap, target anggaran, dan integrasi WhatsApp — semua dalam satu tempat.
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons" style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
            animation: 'fadeUp 0.6s ease both 0.3s',
          }}>
            <Link href="/dashboard" className="cta-btn cta-primary">
              Mulai Sekarang <ArrowRight />
            </Link>
            <a href="#features" className="cta-btn cta-secondary">
              Lihat Fitur
            </a>
          </div>

          {/* Quick checks */}
          <div style={{
            display: 'flex', gap: 24, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap',
            animation: 'fadeUp 0.6s ease both 0.4s',
          }}>
            {['Gratis', 'Tanpa Install', 'Real-time Sync'].map(t => (
              <div key={t} className="check-item">
                <CheckIcon /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ STATS ════════════ */}
      <section id="stats" style={{
        padding: 'clamp(3rem, 8vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
        maxWidth: 900, margin: '0 auto',
      }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, color: t.accent, letterSpacing: '-1px', marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: t.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" style={{
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 6vw, 4rem)' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
            ✨ Fitur Unggulan
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 14 }}>
            Semua yang Kamu Butuhkan
          </h2>
          <p style={{ color: t.sub, fontSize: '0.95rem', maxWidth: 500, margin: '0 auto' }}>
            Tools lengkap untuk tracking, analisis, dan optimisasi keuangan pribadimu.
          </p>
        </div>

        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: f.gradient, opacity: 0, transition: 'opacity 0.3s' }} className="card-accent" />
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: f.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', marginBottom: 18,
                boxShadow: `0 8px 24px ${f.gradient.includes('#5B6CF8') ? 'rgba(91,108,248,0.25)' : 'rgba(0,0,0,0.2)'}`,
              }}>
                {f.emoji}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.3px' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: t.sub, lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ SHOWCASE SECTION ════════════ */}
      <section style={{
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)',
        maxWidth: 1000, margin: '0 auto',
      }}>
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 24,
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: '#5B6CF8', filter: 'blur(120px)', opacity: 0.08 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>
                🤖 AI-Powered
              </p>
              <h3 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 14, lineHeight: 1.2 }}>
                Chatbot AI yang
                <br />
                <span style={{ color: t.accent }}>Paham Keuanganmu</span>
              </h3>
              <p style={{ color: t.sub, fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 24 }}>
                Tanya &ldquo;Berapa pengeluaran makanan bulan ini?&rdquo; dan dapatkan jawaban instan.
                AI akan mengingatkanmu saat budget hampir habis.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Analisis pengeluaran otomatis', 'Peringatan budget real-time', 'Saran penghematan cerdas'].map(t => (
                  <div key={t} className="check-item">
                    <CheckIcon /> {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Chat UI */}
            <div style={{
              background: t.bg, borderRadius: 16, padding: 20,
              border: `1px solid ${t.border}`,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ alignSelf: 'flex-end', background: 'linear-gradient(135deg, #5B6CF8, #9B7CF8)', color: '#fff', padding: '10px 16px', borderRadius: '14px 14px 4px 14px', fontSize: '0.82rem', maxWidth: '80%' }}>
                  Berapa total pengeluaran makanan bulan ini?
                </div>
                <div style={{ alignSelf: 'flex-start', background: t.surface, border: `1px solid ${t.border}`, color: t.text, padding: '12px 16px', borderRadius: '14px 14px 14px 4px', fontSize: '0.82rem', maxWidth: '85%', lineHeight: 1.6 }}>
                  <strong>📊 Pengeluaran Makanan — Maret 2026</strong>
                  <br /><br />
                  Total: <strong style={{ color: '#EF4444' }}>Rp 23.7jt</strong> dari budget <strong>Rp 2.5jt</strong>
                  <br /><br />
                  ⚠️ <span style={{ color: '#F59E0B' }}>Sudah melebihi target 848%!</span> Pertimbangkan untuk mengurangi frekuensi makan di luar.
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .showcase-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section id="cta" style={{
        padding: 'clamp(4rem, 10vw, 7rem) clamp(1.5rem, 5vw, 4rem)',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div className="hero-glow" style={{ background: '#5B6CF8', bottom: 0, left: '30%', width: 400, height: 400 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            fontWeight: 900,
            letterSpacing: '-1.5px',
            marginBottom: 16,
          }}>
            Siap Kelola Keuanganmu?
          </h2>
          <p style={{ color: t.sub, fontSize: '1rem', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Mulai gratis sekarang. Tidak perlu install — langsung buka di browser.
          </p>
          <Link href="/dashboard" className="cta-btn cta-primary" style={{ fontSize: '1.05rem', padding: '18px 44px' }}>
            Buka Dashboard <ArrowRight />
          </Link>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer style={{
        borderTop: `1px solid ${t.border}`,
        padding: '40px clamp(1.5rem, 5vw, 4rem)',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #5B6CF8, #9B7CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  <path d="M16 3H8L4 7h16l-4-4z"/>
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Keuangan<span style={{ color: t.accent }}>ku</span></span>
            </div>
            <p style={{ fontSize: '0.78rem', color: t.sub, lineHeight: 1.6, maxWidth: 280 }}>
              Smart AI expense tracker untuk membantu kamu mengelola keuangan pribadi dengan lebih cerdas dan efisien.
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, color: t.sub }}>Fitur</p>
            {['Dashboard', 'AI Chatbot', 'Kalender', 'Anggaran', 'Laporan'].map(f => (
              <p key={f} style={{ fontSize: '0.8rem', color: t.muted, marginBottom: 8, cursor: 'pointer' }}>{f}</p>
            ))}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, color: t.sub }}>Lainnya</p>
            {['WhatsApp Bot', 'Export CSV', 'Cetak Struk', 'Dark Mode'].map(f => (
              <p key={f} style={{ fontSize: '0.8rem', color: t.muted, marginBottom: 8, cursor: 'pointer' }}>{f}</p>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: '0.7rem', color: t.muted }}>
            © 2026 Keuanganku. Built with ❤️ and Gemini AI.
          </p>
          <p style={{ fontSize: '0.65rem', color: t.muted }}>
            Next.js · Prisma · Supabase · Gemini
          </p>
        </div>
      </footer>
    </div>
  );
}