'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTrades } from '../../../hooks/useTrade'
import { Trade } from '@/types/index'
import SummaryCards from '@/components/SummaryCards'
import TradeForm from '@/components/TradeForm'
import TradeTable from '@/components/TradeTable'
import DaysTable from '@/components/DaysTable'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import CommandPalette from '../../../components/CommandPalette'

const Charts = dynamic(() => import('@/components/Charts'), { ssr: false })

export default function DashboardPage() {
  const { data: session } = useSession()
  const { trades, loading, addTrade, deleteTrade } = useTrades()

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            padding: '6px 10px', borderRadius: 999, fontSize: '0.75rem',
            letterSpacing: '0.04em', textTransform: 'uppercase',
            background: 'rgba(34,197,94,0.12)', color: 'var(--color-accent)',
          }}>Live Workspace</span>
          <span style={{
            padding: '6px 10px', borderRadius: 999, fontSize: '0.75rem',
            letterSpacing: '0.04em', textTransform: 'uppercase',
            background: 'transparent', border: '1px solid rgba(148,163,184,0.35)',
            color: 'var(--color-text-muted)',
          }}>
            {trades.length} {trades.length === 1 ? 'trade' : 'trades'}
          </span>
          <span style={{
            padding: '6px 10px', borderRadius: 999, fontSize: '0.72rem',
            letterSpacing: '0.04em', background: 'transparent',
            border: '1px solid rgba(148,163,184,0.2)',
            color: 'rgba(148,163,184,0.5)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <kbd style={{ fontSize: '0.7rem' }}>Ctrl+K</kbd> Quick Entry
          </span>
          <Link href="/profile" style={{
            padding: '6px 14px', borderRadius: 999,
            border: '1px solid rgba(148,163,184,0.35)',
            background: 'transparent', color: 'var(--color-text-muted)',
            fontSize: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>👤 Profile</Link>
          <Link href="/analytics" style={{
            padding: '6px 14px', borderRadius: 999,
            border: '1px solid rgba(34,197,94,0.35)',
            background: 'rgba(34,197,94,0.08)', color: 'var(--color-accent)',
            fontSize: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>📊 Analytics</Link>
          <Link href="/advanced" style={{
            padding: '6px 14px', borderRadius: 999,
            border: '1px solid rgba(56,189,248,0.35)',
            background: 'rgba(56,189,248,0.08)', color: '#38bdf8',
            fontSize: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>🔬 Advanced</Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              padding: '6px 14px', borderRadius: 999,
              border: '1px solid rgba(148,163,184,0.35)',
              background: 'transparent', color: 'var(--color-text-muted)',
              fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
            Sign Out
          </button>
        </div>
      </header>

      {loading ? (
        /* Skeleton Loader */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{
              height: 120, background: 'rgba(15,23,42,0.5)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : (
        <>
          <SummaryCards trades={trades} />
          <DaysTable trades={trades} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
            gap: 20, marginBottom: 28,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Charts trades={trades} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <TradeForm onTradeAdded={addTrade} />
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
          <TradeTable trades={trades} onTradeDeleted={deleteTrade} />
        </>
      )}
      {/* ── Command Palette ── */}
      <CommandPalette onTradeAdded={addTrade} />
    </div>
  )
}