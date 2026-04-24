'use client'

import { useMemo } from 'react'
import { useTrades } from '../../../hooks/useTrade'
import { calcRiskMetrics, calcMaxDrawdown, buildEquityCurve, formatCurrency } from '@/lib/calculations'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import AIRiskAdvisor from '@/components/AIRiskAdvisor'

const RiskCharts = dynamic(() => import('@/components/RiskCharts'), { ssr: false })

function RiskScoreBadge({ score }: { score: number }) {
  const color = score < 20
    ? 'var(--color-positive)'
    : score < 50
    ? '#facc15'
    : 'var(--color-negative)'

  const label = score < 20 ? 'Low Risk' : score < 50 ? 'Moderate' : 'High Risk'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 12, height: 12, borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }} />
      <span style={{ color, fontWeight: 600, fontSize: '0.88rem' }}>{label}</span>
    </div>
  )
}

export default function AnalyticsPage() {
  const { trades, loading } = useTrades()
  const metrics = useMemo(() => calcRiskMetrics(trades), [trades])
  const { absolute: maxDD, percentage: maxDDPct } = useMemo(() => calcMaxDrawdown(trades), [trades])
  const equityData = useMemo(() => buildEquityCurve(trades), [trades])

  const statCards = [
    {
      label: 'Max Drawdown',
      value: formatCurrency(maxDD),
      sub: `${Math.abs(maxDDPct).toFixed(1)}% from peak`,
      color: 'var(--color-negative)',
      bg: 'rgba(249,115,115,0.06)',
      border: 'rgba(249,115,115,0.2)',
      icon: '📉',
    },
    {
      label: 'Max Consecutive Losses',
      value: `${metrics.maxConsecutiveLosses}`,
      sub: 'In a row',
      color: metrics.maxConsecutiveLosses >= 4 ? 'var(--color-negative)' : 'var(--color-positive)',
      bg: 'rgba(15,23,42,0.5)',
      border: 'rgba(148,163,184,0.15)',
      icon: '🔴',
    },
    {
      label: 'Worst Day',
      value: formatCurrency(metrics.dailyLossLimit),
      sub: 'Single day loss',
      color: 'var(--color-negative)',
      bg: 'rgba(249,115,115,0.06)',
      border: 'rgba(249,115,115,0.2)',
      icon: '📆',
    },
    {
      label: 'Avg Risk Per Trade',
      value: formatCurrency(metrics.avgRisk),
      sub: 'Based on 1% of entry',
      color: 'var(--color-text-primary)',
      bg: 'rgba(15,23,42,0.5)',
      border: 'rgba(148,163,184,0.15)',
      icon: '⚖️',
    },
    {
      label: 'Risk of Ruin',
      value: `${metrics.riskOfRuin.toFixed(1)}%`,
      sub: 'Probability of blowing account',
      color: metrics.riskOfRuin > 50
        ? 'var(--color-negative)'
        : metrics.riskOfRuin > 20
        ? '#facc15'
        : 'var(--color-positive)',
      bg: 'rgba(15,23,42,0.5)',
      border: 'rgba(148,163,184,0.15)',
      icon: '💀',
    },
    {
      label: 'Total Trades',
      value: `${trades.length}`,
      sub: 'Sample size',
      color: 'var(--color-text-primary)',
      bg: 'rgba(15,23,42,0.5)',
      border: 'rgba(148,163,184,0.15)',
      icon: '📊',
    },
  ]

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 40px' }}>

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Risk Analytics
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Understand your downside and protect your capital
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <RiskScoreBadge score={metrics.riskOfRuin} />
          <Link href="/dashboard" style={{
            padding: '7px 16px', borderRadius: 999,
            border: '1px solid rgba(148,163,184,0.35)',
            color: 'var(--color-text-muted)', fontSize: '0.78rem',
            textDecoration: 'none', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>← Dashboard</Link>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{
              height: 120,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : trades.length === 0 ? (
        /* Empty State */
        <div className="card" style={{
          padding: 48, textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>No trades yet</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: 360 }}>
            Log at least a few trades to see your risk metrics and drawdown analysis.
          </p>
          <Link href="/dashboard" style={{
            marginTop: 8, padding: '10px 24px', borderRadius: 999,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
            boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
          }}>
            Log Your First Trade →
          </Link>
        </div>
      ) : (
        <>
          {/* ── Stat Cards Grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
            gap: 14, marginBottom: 24,
          }}>
            {statCards.map(card => (
              <div key={card.label} className="card" style={{
                padding: '20px 22px',
                background: card.bg,
                borderColor: card.border,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    fontSize: '0.72rem', textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--color-text-muted)',
                  }}>{card.label}</span>
                  <span style={{ fontSize: '1.1rem' }}>{card.icon}</span>
                </div>
                <p style={{
                  margin: '0 0 4px', fontSize: '1.7rem',
                  fontWeight: 700, letterSpacing: '-0.03em',
                  color: card.color,
                }}>{card.value}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {card.sub}
                </p>
              </div>
            ))}
          </div>

          {/* ── Charts ── */}
          <RiskCharts equityData={equityData} trades={trades} />

          {/* ── Risk of Ruin Explanation ── */}
          <AIRiskAdvisor trades={trades} metrics={metrics} />
        </>
      )}
    </div>
  )
}