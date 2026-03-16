'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { theme } from '../../../lib/theme';
const t = theme.light;

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      color: t.text,
      fontFamily: "'Outfit', system-ui, sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-card {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .login-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(91,108,248,0.25);
          filter: brightness(1.1);
        }
        .login-btn:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Background Decorative Elements */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw',
        background: `radial-gradient(circle, ${t.accent}15 0%, transparent 70%)`,
        filter: 'blur(80px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw',
        background: `radial-gradient(circle, #9B7CF815 0%, transparent 70%)`,
        filter: 'blur(80px)', zIndex: 0
      }} />

      <div className="auth-card" style={{
        width: '100%', maxWidth: '420px', background: t.surface,
        border: `1px solid ${t.border}`, borderRadius: '28px',
        padding: '40px 32px', position: 'relative', zIndex: 1,
        boxShadow: t.shadow, textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: `linear-gradient(135deg, ${t.accent}, #9B7CF8)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', color: '#fff', boxShadow: `0 8px 24px ${t.accent}40`
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <path d="M16 3H8L4 7h16l-4-4z"/>
            <circle cx="17" cy="13" r="1.2" fill="currentColor" stroke="none"/>
          </svg>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.8px', marginBottom: 8 }}>
          Keuangan<span style={{ color: t.accent }}>ku</span>
        </h1>
        <p style={{ color: t.sub, fontSize: '0.95rem', fontWeight: 500, marginBottom: 32 }}>
          Masuk untuk mengelola keuanganmu dengan cerdas.
        </p>

        {error && (
          <div style={{
            background: `${t.red}15`, border: `1px solid ${t.red}30`,
            color: t.red, padding: '12px', borderRadius: '12px',
            fontSize: '0.85rem', fontWeight: 600, marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            <span>⚠️</span>
            <span>{error === 'OAuthSignin' || error === 'OAuthCallback' ? 'Gagal masuk dengan provider. Coba lagi.' : 'Terjadi kesalahan saat masuk.'}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Google Button */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="login-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: '#fff', color: '#111', border: 'none', borderRadius: '14px',
              padding: '14px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
              width: '100%'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Masuk dengan Google
          </button>

          {/* GitHub Button */}
          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="login-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: '#24292F', color: '#fff', border: 'none', borderRadius: '14px',
              padding: '14px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
              width: '100%'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.228-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            Masuk dengan GitHub
          </button>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${t.border}` }}>
          <p style={{ fontSize: '0.8rem', color: t.sub, fontWeight: 500 }}>
            Belum punya akun? <span style={{ color: t.accent, fontWeight: 700, cursor: 'pointer' }}>Daftar Sekarang</span>
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '0', right: '0',
        textAlign: 'center', fontSize: '0.75rem', color: t.sub, fontWeight: 500
      }}>
        © 2024 Keuanganku. Semua data terenkripsi aman.
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
