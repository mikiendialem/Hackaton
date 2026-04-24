'use client'

import { useMemo } from 'react'
import { useTrades } from '../../../hooks/useTrade'
import {
  calcStrategyStats,
  calcSessionStats,
  calcWeekdayStats,
  calcRDistribution,
  formatCurrency,
} from '@/lib/calculations'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const AdvancedCharts = dynamic(() => import('../../../components/AdvancedCharts'), { ssr: false })

export default function AdvancedAnalyticsPage() {
  const { trades, loading } = useTrades()

  const strategyStats = useMemo(() => calcStrategyStats(trades), [trades])
  const sessionStats = useMemo(() => calcSessionStats(trades), [trades])
  const weekdayStats = useMemo(() => calcWeekdayStats(trades), [trades])
  const rDistribution = useMemo(() => calcRDistribution(trades), [trades])

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 40px' }}>

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 32,
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Advanced Analytics
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Strategy breakdown, session performance and R distribution
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/analytics" style={{
            padding: '7px 16px', borderRadius: 999,
            border: '1px solid rgba(34,197,94,0.35)',
            background: 'rgba(34,197,94,0.08)',
            color: 'var(--color-accent)', fontSize: '0.78rem',
            textDecoration: 'none', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>⚡ Risk</Link>
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
              height: 160, animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="card" style={{
          padding: 48, textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>No trades yet</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: 360 }}>
            Log trades with strategies and sessions to unlock advanced analytics.
          </p>
          <Link href="/dashboard" style={{
            marginTop: 8, padding: '10px 24px', borderRadius: 999,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
            boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
          }}>Log Your First Trade →</Link>
        </div>
      ) : (
        <>
          {/* ── Strategy Table ── */}
          <div className="card" style={{ marginBottom: 20, padding: '22px 24px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600 }}>
              Strategy Performance
            </h2>
            <p style={{ margin: '0 0 18px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Win rate, profit factor and avg R broken down by strategy
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr>
                    {['Strategy', 'Trades', 'Wins', 'Losses', 'Win Rate', 'Profit Factor', 'Avg R', 'Total P&L'].map(h => (
                      <th key={h} style={{
                        padding: '8px 12px', textAlign: 'left',
                        fontSize: '0.7rem', textTransform: 'uppercase',
                        letterSpacing: '0.09em', color: 'var(--color-text-muted)',
                        borderBottom: '1px solid rgba(148,163,184,0.2)',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {strategyStats.map(s => (
                    <tr key={s.name} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999,
                          fontSize: '0.75rem', fontWeight: 600,
                          background: 'rgba(34,197,94,0.1)',
                          color: 'var(--color-accent)',
                        }}>{s.name}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{s.trades}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-positive)' }}>{s.wins}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-negative)' }}>{s.losses}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 50, height: 4, borderRadius: 999,
                            background: 'rgba(148,163,184,0.15)',
                          }}>
                            <div style={{
                              height: '100%', borderRadius: 999,
                              width: `${s.winRate}%`,
                              background: s.winRate >= 50 ? 'var(--color-accent)' : 'var(--color-negative)',
                            }} />
                          </div>
                          <span style={{
                            fontWeight: 600,
                            color: s.winRate >= 50 ? 'var(--color-positive)' : 'var(--color-negative)',
                          }}>
                            {s.winRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td style={{
                        padding: '10px 12px', fontWeight: 600,
                        color: s.profitFactor >= 1.5
                          ? 'var(--color-positive)'
                          : s.profitFactor >= 1
                          ? '#facc15'
                          : 'var(--color-negative)',
                      }}>
                        {s.profitFactor === Infinity ? '∞' : s.profitFactor.toFixed(2)}
                      </td>
                      <td style={{
                        padding: '10px 12px', fontWeight: 600,
                        color: s.avgR >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                      }}>
                        {s.avgR.toFixed(2)}R
                      </td>
                      <td style={{
                        padding: '10px 12px', fontWeight: 700,
                        color: s.totalPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                      }}>
                        {formatCurrency(s.totalPL)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Session + Weekday Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20, marginBottom: 20 }}>

            {/* Session Performance */}
            <div className="card" style={{ padding: '22px 24px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600 }}>Session Performance</h2>
              <p style={{ margin: '0 0 18px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                London, New York and Asia breakdown
              </p>
              {sessionStats.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
                  No session data yet — tag your trades with a session.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sessionStats.map(s => (
                    <div key={s.session} style={{
                      padding: '14px 16px', borderRadius: 12,
                      background: 'rgba(15,23,42,0.5)',
                      border: '1px solid rgba(148,163,184,0.1)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1rem' }}>
                            {s.session === 'London' ? '🇬🇧' : s.session === 'New York' ? '🇺🇸' : s.session === 'Asia' ? '🌏' : '⏰'}
                          </span>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.session}</span>
                        </div>
                        <span style={{
                          fontWeight: 700, fontSize: '0.9rem',
                          color: s.totalPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                        }}>
                          {formatCurrency(s.totalPL)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {s.trades} trades
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          color: s.winRate >= 50 ? 'var(--color-positive)' : 'var(--color-negative)',
                        }}>
                          {s.winRate.toFixed(1)}% win rate
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          color: s.profitFactor >= 1 ? 'var(--color-positive)' : 'var(--color-negative)',
                        }}>
                          PF: {s.profitFactor === Infinity ? '∞' : s.profitFactor.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekday Performance */}
            <div className="card" style={{ padding: '22px 24px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600 }}>Weekday Performance</h2>
              <p style={{ margin: '0 0 18px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Which days you trade best
              </p>
              {weekdayStats.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
                  No weekday data yet — log some trades first.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {weekdayStats.map(d => {
                    const maxPL = Math.max(...weekdayStats.map(w => Math.abs(w.totalPL)))
                    const barWidth = maxPL > 0 ? (Math.abs(d.totalPL) / maxPL) * 100 : 0
                    return (
                      <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          width: 36, fontSize: '0.75rem',
                          color: 'var(--color-text-muted)', flexShrink: 0,
                        }}>
                          {d.day.slice(0, 3)}
                        </span>
                        <div style={{
                          flex: 1, height: 8, borderRadius: 999,
                          background: 'rgba(148,163,184,0.1)',
                        }}>
                          <div style={{
                            height: '100%', borderRadius: 999,
                            width: `${barWidth}%`,
                            background: d.totalPL >= 0
                              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                              : 'linear-gradient(90deg, #f97373, #ef4444)',
                            transition: 'width 0.4s ease',
                          }} />
                        </div>
                        <span style={{
                          width: 70, textAlign: 'right', fontSize: '0.78rem',
                          fontWeight: 600, flexShrink: 0,
                          color: d.totalPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                        }}>
                          {formatCurrency(d.totalPL)}
                        </span>
                        <span style={{
                          width: 36, textAlign: 'right', fontSize: '0.72rem',
                          color: 'var(--color-text-muted)', flexShrink: 0,
                        }}>
                          {d.trades}t
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Charts: R Distribution ── */}
          <AdvancedCharts
            rDistribution={rDistribution}
            strategyStats={strategyStats}
          />
        </>
      )}
    </div>
  )
}