'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [name, setName] = useState(session?.user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [nameLoading, setNameLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [nameSuccess, setNameSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [nameError, setNameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault()
    setNameLoading(true)
    setNameError('')
    setNameSuccess('')

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    const data = await res.json()
    setNameLoading(false)

    if (!res.ok) {
      setNameError(data.error || 'Failed to update name')
    } else {
      setNameSuccess('Name updated successfully!')
      await update({ name })
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      setPasswordLoading(false)
      return
    }

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = await res.json()
    setPasswordLoading(false)

    if (!res.ok) {
      setPasswordError(data.error || 'Failed to update password')
    } else {
      setPasswordSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '11px 14px', borderRadius: 10, fontSize: '0.9rem',
    outline: 'none', fontFamily: 'inherit', width: '100%',
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(148,163,184,0.2)',
    color: 'var(--color-text-primary)',
    transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem', textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--color-text-muted)', fontWeight: 500,
  }

  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(34,197,94,0.6)'
    e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)'
  }

  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(148,163,184,0.2)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 40px' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Profile Settings
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Manage your account information
          </p>
        </div>
        <Link href="/dashboard" style={{
          padding: '8px 18px', borderRadius: 999,
          border: '1px solid rgba(148,163,184,0.35)',
          color: 'var(--color-text-muted)', fontSize: '0.85rem',
          textDecoration: 'none', fontWeight: 500,
          transition: 'all 0.15s ease',
        }}>
          ← Back to Dashboard
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>

        {/* Personal Info Card */}
        <div className="card" style={{ padding: 28 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: 700, color: '#fff',
              boxShadow: '0 8px 20px rgba(34,197,94,0.3)',
            }}>
              {session?.user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>
                {session?.user?.name}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {session?.user?.email}
              </p>
            </div>
          </div>

          <h2 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 600 }}>
            Personal Information
          </h2>

          {nameError && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              fontSize: '0.84rem', background: 'rgba(249,115,115,0.1)',
              color: 'var(--color-negative)', border: '1px solid rgba(249,115,115,0.25)',
            }}>⚠️ {nameError}</div>
          )}

          {nameSuccess && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              fontSize: '0.84rem', background: 'rgba(34,197,94,0.1)',
              color: 'var(--color-positive)', border: '1px solid rgba(34,197,94,0.25)',
            }}>✅ {nameSuccess}</div>
          )}

          <form onSubmit={handleUpdateName} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
              />
              <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'rgba(148,163,184,0.5)' }}>
                Email cannot be changed
              </p>
            </div>

            <button
              type="submit"
              disabled={nameLoading}
              style={{
                padding: '11px 14px', borderRadius: 12, border: 'none',
                background: nameLoading ? 'rgba(34,197,94,0.5)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                cursor: nameLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: nameLoading ? 'none' : '0 8px 24px rgba(34,197,94,0.25)',
              }}>
              {nameLoading ? 'Saving...' : 'Save Changes →'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 600 }}>
            Change Password
          </h2>

          {passwordError && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              fontSize: '0.84rem', background: 'rgba(249,115,115,0.1)',
              color: 'var(--color-negative)', border: '1px solid rgba(249,115,115,0.25)',
            }}>⚠️ {passwordError}</div>
          )}

          {passwordSuccess && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              fontSize: '0.84rem', background: 'rgba(34,197,94,0.1)',
              color: 'var(--color-positive)', border: '1px solid rgba(34,197,94,0.25)',
            }}>✅ {passwordSuccess}</div>
          )}

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              style={{
                padding: '11px 14px', borderRadius: 12, border: 'none',
                background: passwordLoading ? 'rgba(34,197,94,0.5)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                cursor: passwordLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: passwordLoading ? 'none' : '0 8px 24px rgba(34,197,94,0.25)',
              }}>
              {passwordLoading ? 'Updating...' : 'Update Password →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}