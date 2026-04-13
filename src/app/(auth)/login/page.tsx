'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/dashboard')
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
            margin: '0 auto 16px',
            fontSize: 22,
            boxShadow: '0 8px 24px rgba(34,197,94,0.35)',
          }}>📈</div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Trade Tracker
          </h1>
          <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Card */}
        <div style={{
          borderRadius: 20,
          padding: '32px',
          background: 'radial-gradient(circle at 0 0, rgba(15,23,42,0.9), #020617)',
          border: '1px solid rgba(148,163,184,0.2)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}>

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

            {/* Email */}
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

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{
                  fontSize: '0.75rem', textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--color-text-muted)', fontWeight: 500,
                }}>Password</label>
                <Link href="/forgot-password" style={{
                  fontSize: '0.75rem', color: 'var(--color-accent)',
                  textDecoration: 'none', fontWeight: 500,
                }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4, padding: '12px 14px', borderRadius: 12,
                border: 'none', width: '100%',
                background: loading ? 'rgba(34,197,94,0.5)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(34,197,94,0.3)',
                transition: 'all 0.18s ease',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '24px 0', color: 'var(--color-text-muted)', fontSize: '0.8rem',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.15)' }} />
            <span>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.15)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.88rem', margin: 0, color: 'var(--color-text-muted)' }}>
            No account?{' '}
            <Link href="/register" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>
              Create one free →
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.75rem', color: 'rgba(148,163,184,0.4)' }}>
          Your trades are private and secure.
        </p>
      </div>
    </div>
  )
}