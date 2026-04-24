'use client'

import { useState } from 'react'
import { Trade } from '@/types/index'

function formatCurrency(value: number) {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

interface Props {
  trades: Trade[]
  onTradeDeleted: (id: string) => void
}

export default function TradeTable({ trades, onTradeDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (confirmId !== id) {
      setConfirmId(id)
      return
    }

    setDeletingId(id)
    const res = await fetch(`/api/trades/${id}`, { method: 'DELETE' })

    if (res.ok) {
      onTradeDeleted(id)
    }

    setDeletingId(null)
    setConfirmId(null)
  }

  return (
    <div className="card" style={{ marginTop: 4 }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: '1rem' }}>Trade Journal</h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Review every execution and refine your edge.
        </p>
      </div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              {['Date', 'Symbol', 'Dir', 'Entry', 'Exit', 'Size', 'P&L', 'R', 'Strategy', 'Session', 'Notes', ''].map(h => (
                <th key={h} style={{
                  padding: '8px 10px', textAlign: 'left',
                  fontSize: '0.72rem', textTransform: 'uppercase',
                  letterSpacing: '0.09em', color: 'var(--color-text-muted)',
                  borderBottom: '1px solid rgba(148,163,184,0.5)',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td colSpan={12} style={{
                  padding: '40px 10px', textAlign: 'center',
                  color: 'var(--color-text-muted)', fontSize: '0.85rem',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '2rem' }}>📭</span>
                    <span>No trades yet. Press <kbd style={{
                      padding: '1px 6px', borderRadius: 4,
                      background: 'rgba(148,163,184,0.1)',
                      border: '1px solid rgba(148,163,184,0.2)',
                      fontSize: '0.72rem',
                    }}>Ctrl+K</kbd> to log your first trade.</span>
                  </div>
                </td>
              </tr>
            ) : (
              [...trades].reverse().map(t => {
                const dateLabel = new Date(t.date + 'T00:00:00').toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric',
                })
                const isConfirming = confirmId === t.id
                const isDeleting = deletingId === t.id

                return (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: '1px solid rgba(148,163,184,0.1)',
                      transition: 'background 0.15s ease',
                      background: isConfirming ? 'rgba(249,115,115,0.05)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isConfirming)
                        (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(15,23,42,0.6)'
                    }}
                    onMouseLeave={e => {
                      if (!isConfirming)
                        (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                    }}
                  >
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{dateLabel}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 500 }}>{t.symbol}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999,
                        fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                        background: t.direction === 'long'
                          ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,115,0.12)',
                        color: t.direction === 'long'
                          ? 'var(--color-accent)' : 'var(--color-negative)',
                      }}>
                        {t.direction === 'long' ? 'L' : 'S'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{t.entry.toFixed(2)}</td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{t.exit.toFixed(2)}</td>
                    <td style={{ padding: '8px 10px' }}>{t.size}</td>
                    <td style={{
                      padding: '8px 10px', whiteSpace: 'nowrap', fontWeight: 600,
                      color: t.pl >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                    }}>
                      {formatCurrency(t.pl)}
                    </td>
                    <td style={{
                      padding: '8px 10px',
                      color: t.r_multiple >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                    }}>
                      {t.r_multiple.toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      {t.strategy && t.strategy !== 'None' ? (
                        <span style={{
                          padding: '2px 8px', borderRadius: 999,
                          fontSize: '0.7rem', fontWeight: 600,
                          background: 'rgba(34,197,94,0.1)',
                          color: 'var(--color-accent)',
                        }}>{t.strategy}</span>
                      ) : (
                        <span style={{ color: 'rgba(148,163,184,0.3)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      {t.session && t.session !== 'None' ? (
                        <span style={{
                          padding: '2px 8px', borderRadius: 999,
                          fontSize: '0.7rem', fontWeight: 600,
                          background: 'rgba(56,189,248,0.1)',
                          color: '#38bdf8',
                        }}>{t.session}</span>
                      ) : (
                        <span style={{ color: 'rgba(148,163,184,0.3)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td style={{
                      padding: '8px 10px', maxWidth: 160,
                      color: 'var(--color-text-muted)', fontSize: '0.78rem',
                    }}>
                      {t.notes || '—'}
                    </td>

                    {/* Delete Button */}
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={isDeleting}
                        style={{
                          padding: '4px 10px', borderRadius: 8, border: 'none',
                          fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'inherit', transition: 'all 0.15s ease',
                          background: isConfirming
                            ? 'rgba(249,115,115,0.2)'
                            : 'rgba(148,163,184,0.08)',
                          color: isConfirming
                            ? 'var(--color-negative)'
                            : 'rgba(148,163,184,0.5)',
                          border: isConfirming
                            ? '1px solid rgba(249,115,115,0.3)'
                            : '1px solid rgba(148,163,184,0.15)',
                        }}
                      >
                        {isDeleting ? '...' : isConfirming ? 'Confirm?' : '🗑'}
                      </button>
                      {isConfirming && (
                        <button
                          onClick={() => setConfirmId(null)}
                          style={{
                            marginLeft: 4, padding: '4px 8px',
                            borderRadius: 8, border: '1px solid rgba(148,163,184,0.15)',
                            fontSize: '0.72rem', cursor: 'pointer',
                            background: 'transparent',
                            color: 'rgba(148,163,184,0.5)',
                            fontFamily: 'inherit',
                          }}
                        >✕</button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}