'use client'

import { useState, useMemo } from 'react'
import { Trade, DaySummary } from '@/types/index'

function formatCurrency(value: number) {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

function buildDaySummaries(trades: Trade[]): DaySummary[] {
  const map = new Map<string, Trade[]>()

  trades.forEach(t => {
    const existing = map.get(t.date) || []
    map.set(t.date, [...existing, t])
  })

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayTrades]) => {
      const totalPL = dayTrades.reduce((sum, t) => sum + t.pl, 0)
      const wins = dayTrades.filter(t => t.pl > 0).length
      const losses = dayTrades.filter(t => t.pl < 0).length
      const totalTrades = dayTrades.length
      const winRate = totalTrades ? (wins / totalTrades) * 100 : 0
      return { date, trades: dayTrades, totalPL, wins, losses, winRate, totalTrades }
    })
}

function buildCalendarDays(summaries: DaySummary[], year: number, month: number) {
  const map = new Map(summaries.map(s => [s.date, s]))
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (DaySummary | null | 'empty')[] = []

  for (let i = 0; i < firstDay; i++) cells.push('empty')
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push(map.get(dateStr) || null)
  }

  return { cells, daysInMonth }
}

// ─── Calendar View ───────────────────────────────────────────────
function CalendarView({ summaries }: { summaries: DaySummary[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const { cells } = useMemo(() => buildCalendarDays(summaries, year, month), [summaries, year, month])

  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div>
      {/* Month Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prev} style={navBtnStyle}>←</button>
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{monthLabel}</span>
        <button onClick={next} style={navBtnStyle}>→</button>
      </div>

      {/* Day Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((cell, i) => {
          if (cell === 'empty') return <div key={`e-${i}`} />

          const day = cell
            ? new Date(cell.date + 'T00:00:00').getDate()
            : (() => {
                const firstDay = new Date(year, month, 1).getDay()
                return i - firstDay + 1
              })()

          const isToday = cell?.date === today.toISOString().slice(0, 10)

          return (
            <div key={i} style={{
              minHeight: 72,
              borderRadius: 10,
              padding: '6px 8px',
              border: `1px solid ${cell ? (cell.totalPL >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(249,115,115,0.3)') : 'rgba(148,163,184,0.12)'}`,
              background: cell
                ? (cell.totalPL >= 0 ? 'rgba(34,197,94,0.06)' : 'rgba(249,115,115,0.06)')
                : 'rgba(15,23,42,0.4)',
              outline: isToday ? '2px solid rgba(34,197,94,0.5)' : 'none',
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: isToday ? 'var(--color-accent)' : 'var(--color-text-muted)', marginBottom: 4 }}>
                {day}
              </div>
              {cell && (
                <>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: cell.totalPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)', lineHeight: 1.2 }}>
                    {formatCurrency(cell.totalPL)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {cell.totalTrades}t · {cell.winRate.toFixed(0)}%
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Table View ───────────────────────────────────────────────────
function TableView({ summaries }: { summaries: DaySummary[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr>
            {['Date', 'Trades', 'Wins', 'Losses', 'Win Rate', 'Total P&L', 'Avg P&L'].map(h => (
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
          {summaries.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                No trading days yet.
              </td>
            </tr>
          ) : (
            [...summaries].reverse().map(s => {
              const dateLabel = new Date(s.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
              const avgPL = s.totalPL / s.totalTrades
              return (
                <tr key={s.date} style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                  <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', fontWeight: 500 }}>{dateLabel}</td>
                  <td style={{ padding: '10px 10px' }}>{s.totalTrades}</td>
                  <td style={{ padding: '10px 10px', color: 'var(--color-positive)' }}>{s.wins}</td>
                  <td style={{ padding: '10px 10px', color: 'var(--color-negative)' }}>{s.losses}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(148,163,184,0.15)', maxWidth: 60 }}>
                        <div style={{ height: '100%', borderRadius: 999, width: `${s.winRate}%`, background: s.winRate >= 50 ? 'var(--color-accent)' : 'var(--color-negative)' }} />
                      </div>
                      <span>{s.winRate.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 10px', fontWeight: 700, whiteSpace: 'nowrap', color: s.totalPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                    {formatCurrency(s.totalPL)}
                  </td>
                  <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', color: avgPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                    {formatCurrency(avgPL)}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── Nav Button Style ─────────────────────────────────────────────
const navBtnStyle: React.CSSProperties = {
  background: 'rgba(15,23,42,0.9)',
  border: '1px solid rgba(148,163,184,0.3)',
  color: 'var(--color-text-primary)',
  borderRadius: 8,
  padding: '4px 12px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
}

// ─── Main Export ──────────────────────────────────────────────────
export default function DaysTable({ trades }: { trades: Trade[] }) {
  const [view, setView] = useState<'calendar' | 'table'>('calendar')
  const summaries = useMemo(() => buildDaySummaries(trades), [trades])

  return (
    <div className="card" style={{ marginBottom: 28 }}>
      {/* Header + Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1rem' }}>Daily Performance</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Track your edge day by day
          </p>
        </div>
        {/* Toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(15,23,42,0.9)', borderRadius: 10, padding: 4, border: '1px solid rgba(148,163,184,0.2)' }}>
          {(['calendar', 'table'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '5px 14px',
              borderRadius: 7,
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 500,
              textTransform: 'capitalize',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
              background: view === v ? 'rgba(34,197,94,0.15)' : 'transparent',
              color: view === v ? 'var(--color-accent)' : 'var(--color-text-muted)',
            }}>
              {v === 'calendar' ? '📅 Calendar' : '📊 Table'}
            </button>
          ))}
        </div>
      </div>

      {view === 'calendar'
        ? <CalendarView summaries={summaries} />
        : <TableView summaries={summaries} />
      }
    </div>
  )
}