'use client'

import { Trade } from '@/types/index'

function formatCurrency(value: number) {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

export default function TradeTable({ trades }: { trades: Trade[] }) {
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
              {['Date', 'Symbol', 'Dir', 'Entry', 'Exit', 'Size', 'P&L', 'R', 'Notes'].map(h => (
                <th key={h} style={{
                  padding: '8px 10px',
                  textAlign: 'left',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.09em',
                  color: 'var(--color-text-muted)',
                  borderBottom: '1px solid rgba(148,163,184,0.5)',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  No trades yet. Log your first trade →
                </td>
              </tr>
            ) : (
              [...trades].reverse().map(t => {
                const dateLabel = new Date(t.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{dateLabel}</td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', fontWeight: 500 }}>{t.symbol}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: t.direction === 'long' ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,115,0.12)',
                        color: t.direction === 'long' ? 'var(--color-accent)' : 'var(--color-negative)',
                      }}>
                        {t.direction === 'long' ? 'L' : 'S'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{t.entry.toFixed(2)}</td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{t.exit.toFixed(2)}</td>
                    <td style={{ padding: '8px 10px' }}>{t.size}</td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', fontWeight: 600, color: t.pl >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                      {formatCurrency(t.pl)}
                    </td>
                    <td style={{ padding: '8px 10px', color: t.r_multiple >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                      {t.r_multiple.toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: 200, color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                      {t.notes || '—'}
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