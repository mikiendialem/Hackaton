'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: `
        radial-gradient(at 10% 20%, rgba(34,197,94,0.18) 0px, transparent 45%),
        radial-gradient(at 90% 0%, rgba(56,189,248,0.16) 0px, transparent 50%),
        radial-gradient(at 0% 50%, rgba(96,165,250,0.12) 0px, transparent 55%),
        #050816
      `
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 22,
            boxShadow: '0 8px 24px rgba(34,197,94,0.35)',
          }}>📈</div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Reset Password
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            We'll send you a reset link
          </p>
        </div>

        {/* Card */}
        <div style={{
          borderRadius: 20, padding: '32px',
          background: 'radial-gradient(circle at 0 0, rgba(15,23,42,0.9), #020617)',
          border: '1px solid rgba(148,163,184,0.2)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}>

          {sent ? (
            /* Success state */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: 24,
              }}>✉️</div>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 600 }}>
                Check your email
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                We sent a password reset link to <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
              </p>
              <Link href="/login" style={{
                display: 'block', padding: '11px 14px', borderRadius: 12,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                textDecoration: 'none', textAlign: 'center',
                boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
              }}>
                Back to Sign In →
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              {error && (
                <div style={{
                  marginBottom: 20, padding: '12px 16px', borderRadius: 10,
                  fontSize: '0.84rem', background: 'rgba(249,115,115,0.1)',
                  color: 'var(--color-negative)', border: '1px solid rgba(249,115,115,0.25)',
                }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{
                    fontSize: '0.75rem', textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--color-text-muted)', fontWeight: 500,
                  }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={{
                      padding: '11px 14px', borderRadius: 10, fontSize: '0.9rem',
                      outline: 'none', fontFamily: 'inherit', width: '100%',
                      background: 'rgba(15,23,42,0.8)',
                      border: '1px solid rgba(148,163,184,0.2)',
                      color: 'var(--color-text-primary)',
                      transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(34,197,94,0.6)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(148,163,184,0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 14px', borderRadius: 12,
                    border: 'none', width: '100%',
                    background: loading ? 'rgba(34,197,94,0.5)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: loading ? 'none' : '0 8px 24px rgba(34,197,94,0.3)',
                  }}>
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
              </form>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '24px 0', color: 'var(--color-text-muted)', fontSize: '0.8rem',
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.15)' }} />
                <span>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.15)' }} />
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.88rem', margin: 0, color: 'var(--color-text-muted)' }}>
                <Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>
                  ← Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}