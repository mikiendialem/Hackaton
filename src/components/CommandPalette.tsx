'use client'

import { useState, useEffect, useRef } from 'react'
import { Trade } from '@/types/index'

const STRATEGIES = ['None', 'SMC', 'ICT', 'Breakout', 'Reversal', 'News', 'Liquidity Grab', 'Scalp', 'Swing']
const SESSIONS = ['None', 'London', 'New York', 'Asia']

interface Props {
  onTradeAdded: (trade: Trade) => void
}

export default function CommandPalette({ onTradeAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Open/close with Ctrl+K or Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus first input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 50)
      setError('')
      setSuccess(false)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const fd = new FormData(form)

    const payload = {
      symbol: (fd.get('symbol') as string).toUpperCase().trim(),
      direction: fd.get('direction') as string,
      date: fd.get('date') as string,
      entry: parseFloat(fd.get('entry') as string),
      exit: parseFloat(fd.get('exit') as string),
      size: parseFloat(fd.get('size') as string),
      fees: parseFloat((fd.get('fees') as string) || '0'),
      notes: fd.get('notes') as string,
      strategy: fd.get('strategy') as string,
      session: fd.get('session') as string,
    }

    const res = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to save trade')
    } else {
      onTradeAdded(data.trade)
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        form.reset()
      }, 1200)
    }
  }

  if (!open) return null

  const inputStyle: React.CSSProperties = {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(148,163,184,0.2)',
    color: 'var(--color-text-primary)',
    borderRadius: 8, padding: '9px 12px',
    fontSize: '0.88rem', outline: 'none',
    width: '100%', fontFamily: 'inherit',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.7rem', textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--color-text-muted)',
    marginBottom: 4, display: 'block',
  }

  const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(34,197,94,0.6)'
    e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)'
  }

  const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(148,163,184,0.2)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Palette */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 51, width: '100%', maxWidth: 560,
        padding: '0 16px',
        animation: 'slideUp 0.18s ease',
      }}>
        <div style={{
          borderRadius: 20,
          background: 'radial-gradient(circle at 0 0, rgba(15,23,42,0.98), #020617)',
          border: '1px solid rgba(148,163,184,0.2)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(148,163,184,0.1)',
            background: 'rgba(34,197,94,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
              }}>⚡</div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.92rem' }}>Quick Trade Entry</p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  Press Esc to close
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(148,163,184,0.1)', border: 'none',
                color: 'var(--color-text-muted)', borderRadius: 8,
                width: 28, height: 28, cursor: 'pointer',
                fontSize: '0.85rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit',
              }}
            >✕</button>
          </div>

          {/* Success State */}
          {success ? (
            <div style={{
              padding: '48px 20px', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem',
                boxShadow: '0 0 24px rgba(34,197,94,0.2)',
              }}>✅</div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem', color: 'var(--color-positive)' }}>
                Trade logged successfully!
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Closing palette...
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} style={{ padding: '18px 20px 20px' }}>

              {error && (
                <div style={{
                  marginBottom: 14, padding: '10px 14px', borderRadius: 10,
                  fontSize: '0.82rem', background: 'rgba(249,115,115,0.1)',
                  color: 'var(--color-negative)', border: '1px solid rgba(249,115,115,0.25)',
                }}>⚠️ {error}</div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Symbol + Direction + Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Symbol</label>
                    <input
                      ref={firstInputRef}
                      name="symbol" type="text" required
                      placeholder="NQ"
                      style={inputStyle}
                      onFocus={focusHandler} onBlur={blurHandler}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Direction</label>
                    <select name="direction" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input
                      name="date" type="date" required
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      style={inputStyle}
                      onFocus={focusHandler} onBlur={blurHandler}
                    />
                  </div>
                </div>

                {/* Entry + Exit + Size + Fees */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Entry</label>
                    <input
                      name="entry" type="number" step="0.01" required
                      placeholder="0.00"
                      style={inputStyle}
                      onFocus={focusHandler} onBlur={blurHandler}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Exit</label>
                    <input
                      name="exit" type="number" step="0.01" required
                      placeholder="0.00"
                      style={inputStyle}
                      onFocus={focusHandler} onBlur={blurHandler}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Size</label>
                    <input
                      name="size" type="number" step="1" required
                      placeholder="1"
                      style={inputStyle}
                      onFocus={focusHandler} onBlur={blurHandler}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Fees</label>
                    <input
                      name="fees" type="number" step="0.01"
                      placeholder="0"
                      style={inputStyle}
                      onFocus={focusHandler} onBlur={blurHandler}
                    />
                  </div>
                </div>

                {/* Strategy + Session */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Strategy</label>
                    <select name="strategy" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                      {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Session</label>
                    <select name="session" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                      {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea
                    name="notes" rows={2}
                    placeholder="Quick notes about this trade..."
                    style={{ ...inputStyle, resize: 'none' }}
                    onFocus={focusHandler} onBlur={blurHandler}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '11px 14px', borderRadius: 12,
                    border: 'none', width: '100%',
                    background: loading
                      ? 'rgba(34,197,94,0.4)'
                      : 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: loading ? 'none' : '0 8px 24px rgba(34,197,94,0.3)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff', display: 'inline-block',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Saving...
                    </>
                  ) : (
                    <>⚡ Log Trade</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Keyboard hint */}
        {!success && (
          <p style={{
            textAlign: 'center', marginTop: 10,
            fontSize: '0.72rem', color: 'rgba(148,163,184,0.4)',
          }}>
            Press <kbd style={{
              padding: '1px 6px', borderRadius: 4,
              background: 'rgba(148,163,184,0.1)',
              border: '1px solid rgba(148,163,184,0.2)',
              fontSize: '0.7rem',
            }}>Ctrl+K</kbd> to toggle · <kbd style={{
              padding: '1px 6px', borderRadius: 4,
              background: 'rgba(148,163,184,0.1)',
              border: '1px solid rgba(148,163,184,0.2)',
              fontSize: '0.7rem',
            }}>Esc</kbd> to close
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}