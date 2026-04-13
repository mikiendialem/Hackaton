'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Trade } from '@/types/index'
import SummaryCards from '@/components/SummaryCards'
import TradeForm from '@/components/TradeForm'
import TradeTable from '@/components/TradeTable'
import DaysTable from '@/components/DaysTable'
import dynamic from 'next/dynamic'

const Charts = dynamic(() => import('@/components/Charts'), { ssr: false })

export default function DashboardPage() {
  const { data: session } = useSession()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/trades')
      .then(r => r.json())
      .then(data => {
        setTrades(data.trades || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function handleTradeAdded(trade: Trade) {
    setTrades(prev => [...prev, trade])
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 40px' }}>

      {/* ── Header ── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.9rem', letterSpacing: '-0.03em' }}>
            Trade Tracker
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Trader'} 👋
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '6px 10px',
            borderRadius: 999, fontSize: '0.75rem', letterSpacing: '0.04em',
            textTransform: 'uppercase', background: 'rgba(34,197,94,0.12)',
            color: 'var(--color-accent)',
          }}>
            Live Workspace
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '6px 10px',
            borderRadius: 999, fontSize: '0.75rem', letterSpacing: '0.04em',
            textTransform: 'uppercase', background: 'transparent',
            border: '1px solid rgba(148,163,184,0.35)',
            color: 'var(--color-text-muted)',
          }}>
            {trades.length} {trades.length === 1 ? 'trade' : 'trades'}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              padding: '6px 14px', borderRadius: 999,
              border: '1px solid rgba(148,163,184,0.35)',
              background: 'transparent', color: 'var(--color-text-muted)',
              fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.color = 'var(--color-negative)'
              ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(249,115,115,0.4)'
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.color = 'var(--color-text-muted)'
              ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(148,163,184,0.35)'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Loading your trades...
        </div>
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <SummaryCards trades={trades} />

          {/* ── Days Table (Calendar + Table toggle) ── */}
          <DaysTable trades={trades} />

          {/* ── Main Layout: Charts + Form ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
            gap: 20,
            marginBottom: 28,
          }}>
            {/* Left: Charts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Charts trades={trades} />
            </div>

            {/* Right: Form + Quick Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <TradeForm onTradeAdded={handleTradeAdded} />

              {/* Quick Stats */}
              <div className="card" style={{ padding: '16px 18px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>Quick Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px' }}>
                  {[
                    { label: 'Total Trades', value: trades.length },
                    {
                      label: 'Avg R',
                      value: trades.length
                        ? (trades.reduce((s, t) => s + t.r_multiple, 0) / trades.length).toFixed(2)
                        : '0.00'
                    },
                    {
                      label: 'Best Trade',
                      value: trades.length
                        ? `$${Math.max(...trades.map(t => t.pl)).toFixed(2)}`
                        : '$0.00'
                    },
                    {
                      label: 'Worst Trade',
                      value: trades.length
                        ? `-$${Math.abs(Math.min(...trades.map(t => t.pl))).toFixed(2)}`
                        : '$0.00'
                    },
                  ].map(stat => (
                    <div key={stat.label}>
                      <dt style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                        {stat.label}
                      </dt>
                      <dd style={{ margin: '2px 0 0', fontSize: '0.92rem', fontWeight: 500 }}>
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Trade Journal Table ── */}
          <TradeTable trades={trades} />
        </>
      )}
    </div>
  )
}