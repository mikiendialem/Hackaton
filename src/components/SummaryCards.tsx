'use client'

import { Trade } from '@/types/index'

function formatCurrency(value: number) {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

function calculateMetrics(trades: Trade[]) {
  let wins = 0, losses = 0, profit = 0, loss = 0
  let best: number | null = null, worst: number | null = null
  let totalR = 0

  trades.forEach(t => {
    if (t.pl > 0) { wins++; profit += t.pl }
    else if (t.pl < 0) { losses++; loss += t.pl }
    if (best === null || t.pl > best) best = t.pl
    if (worst === null || t.pl < worst) worst = t.pl
    totalR += t.r_multiple
  })

  const total = trades.length
  const winRate = total ? (wins / total) * 100 : 0
  const avgR = total ? totalR / total : 0

  return { wins, losses, profit, loss, best, worst, total, winRate, avgR }
}

export default function SummaryCards({ trades }: { trades: Trade[] }) {
  const m = calculateMetrics(trades)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14, marginBottom: 18 }}>
      {/* Win Rate */}
      <div className="card summary-card">
        <h2 style={{ margin: '0 0 4px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>Win Rate</h2>
        <p style={{ margin: '0 0 6px', fontSize: '1.6rem', letterSpacing: '-0.04em' }}>{m.winRate.toFixed(1)}%</p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Winning trades / total trades</p>
      </div>

      {/* Total Profit */}
      <div className="card summary-card">
        <h2 style={{ margin: '0 0 4px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>Total Profit</h2>
        <p style={{ margin: '0 0 6px', fontSize: '1.6rem', letterSpacing: '-0.04em', color: 'var(--color-positive)' }}>{formatCurrency(m.profit)}</p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Sum of all positive trades</p>
      </div>

      {/* Total Loss */}
      <div className="card summary-card" style={{ background: 'radial-gradient(circle at 0 0, rgba(248,113,113,0.16), #020617)' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>Total Loss</h2>
        <p style={{ margin: '0 0 6px', fontSize: '1.6rem', letterSpacing: '-0.04em', color: 'var(--color-negative)' }}>{formatCurrency(m.loss)}</p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Sum of all negative trades</p>
      </div>
    </div>
  )
}