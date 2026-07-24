'use client';

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!identifier || !password) {
      setErrorMessage('ID Pengguna dan Password wajib diisi.');
      return;
    }

    try {
      await signIn.password({
        identifier,
        password,
      });

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl('/');
            if (url.startsWith('http')) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          },
        });
      } else {
        setErrorMessage(`Autentikasi belum lengkap (Status: ${signIn.status}). Silakan hubungi Administrator.`);
      }
    } catch (err) {
      console.error(err);
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'ID Pengguna atau Password salah.';
      setErrorMessage(msg);
    }
  };

  const isSubmitting = fetchStatus === 'fetching';

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-slate-50"
      style={{
        background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.05), transparent 40%)',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '36px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05), 0 10px 30px -15px rgba(79,70,229,0.1)',
          border: '1px solid rgba(226,232,240,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Logo Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <span style={{ fontSize: 20 }}>☕</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: '1.2' }}>HPP Calculator</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>F&B Professional</div>
          </div>
        </div>

        {/* Form Title */}
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '8px', textAlign: 'center' }}>Masuk Akun</h2>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '24px', textAlign: 'center', fontWeight: 400 }}>Masukkan ID dan Password untuk mengakses sistem</p>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            width: '100%',
            padding: '12px 14px',
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '12px',
            fontWeight: 500,
            marginBottom: '18px',
            lineHeight: '1.4',
            alignSelf: 'stretch'
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Username Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="identifier" style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.02em' }}>ID Pengguna</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Masukkan ID Anda"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                color: '#1e293b',
                outline: 'none',
                transition: 'all 0.15s',
                background: isSubmitting ? '#f8fafc' : '#ffffff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="password" style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan Password Anda"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                color: '#1e293b',
                outline: 'none',
                transition: 'all 0.15s',
                background: isSubmitting ? '#f8fafc' : '#ffffff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '11px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(79,70,229,0.2)'
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.target.style.background = 'linear-gradient(135deg, #4f46e5, #4338ca)';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                e.target.style.background = 'linear-gradient(135deg, #6366f1, #4f46e5)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {isSubmitting ? 'Memproses...' : 'Masuk Akun'}
          </button>
        </form>
      </div>
    </div>
  );
}
