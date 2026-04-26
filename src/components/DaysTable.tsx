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
  return cells
}

function getHeatmapColor(pl: number, maxAbsPL: number): string {
  if (maxAbsPL === 0) return 'rgba(148,163,184,0.08)'
  const intensity = Math.min(Math.abs(pl) / maxAbsPL, 1)
  if (pl > 0) {
    const alpha = 0.12 + intensity * 0.75
    return `rgba(34,197,94,${alpha.toFixed(2)})`
  } else {
    const alpha = 0.12 + intensity * 0.75
    return `rgba(249,115,115,${alpha.toFixed(2)})`
  }
}

function getHeatmapBorder(pl: number, maxAbsPL: number): string {
  if (maxAbsPL === 0) return 'rgba(148,163,184,0.1)'
  const intensity = Math.min(Math.abs(pl) / maxAbsPL, 1)
  if (pl > 0) {
    return `rgba(34,197,94,${(0.2 + intensity * 0.6).toFixed(2)})`
  } else {
    return `rgba(249,115,115,${(0.2 + intensity * 0.6).toFixed(2)})`
  }
}

// ─── Tooltip ──────────────────────────────────────────────────────
function DayTooltip({ summary }: { summary: DaySummary }) {
  const dateLabel = new Date(summary.date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  })
  return (
    <div style={{
      position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
      transform: 'translateX(-50%)', zIndex: 10,
      background: 'rgba(2,6,23,0.98)',
      border: '1px solid rgba(148,163,184,0.2)',
      borderRadius: 12, padding: '12px 14px',
      minWidth: 180, boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
      pointerEvents: 'none',
    }}>
      <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
        {dateLabel}
      </p>
      <p style={{
        margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700,
        color: summary.totalPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
      }}>
        {formatCurrency(summary.totalPL)}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          { label: 'Trades', value: summary.totalTrades },
          { label: 'Wins', value: summary.wins },
          { label: 'Losses', value: summary.losses },
          { label: 'Win Rate', value: `${summary.winRate.toFixed(0)}%` },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{item.label}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Heatmap Calendar ─────────────────────────────────────────────
function HeatmapCalendar({ summaries }: { summaries: DaySummary[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const cells = useMemo(() => buildCalendarDays(summaries, year, month), [summaries, year, month])
  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  // Get max abs PL for intensity scaling
  const maxAbsPL = useMemo(() => {
    const monthSummaries = summaries.filter(s => {
      const d = new Date(s.date + 'T00:00:00')
      return d.getFullYear() === year && d.getMonth() === month
    })
    return Math.max(...monthSummaries.map(s => Math.abs(s.totalPL)), 1)
  }, [summaries, year, month])

  // Month totals
  const monthSummary = useMemo(() => {
    const monthSummaries = summaries.filter(s => {
      const d = new Date(s.date + 'T00:00:00')
      return d.getFullYear() === year && d.getMonth() === month
    })
    const totalPL = monthSummaries.reduce((s, d) => s + d.totalPL, 0)
    const tradingDays = monthSummaries.length
    const profitDays = monthSummaries.filter(d => d.totalPL > 0).length
    const lossDays = monthSummaries.filter(d => d.totalPL < 0).length
    return { totalPL, tradingDays, profitDays, lossDays }
  }, [summaries, year, month])

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
      {/* Month Nav + Summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={prev} style={navBtnStyle}>←</button>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', minWidth: 140, textAlign: 'center' }}>{monthLabel}</span>
          <button onClick={next} style={navBtnStyle}>→</button>
        </div>

        {/* Month Stats */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Month P&L', value: formatCurrency(monthSummary.totalPL), color: monthSummary.totalPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' },
            { label: 'Trading Days', value: monthSummary.tradingDays, color: 'var(--color-text-primary)' },
            { label: 'Green Days', value: monthSummary.profitDays, color: 'var(--color-positive)' },
            { label: 'Red Days', value: monthSummary.lossDays, color: 'var(--color-negative)' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '6px 12px', borderRadius: 10,
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(148,163,184,0.1)',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.88rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Day Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: '0.68rem',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--color-text-muted)', padding: '4px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((cell, i) => {
          if (cell === 'empty') return <div key={`e-${i}`} />

          const firstDay = new Date(year, month, 1).getDay()
          const day = cell
            ? new Date(cell.date + 'T00:00:00').getDate()
            : i - firstDay + 1

          const dateStr = cell?.date || ''
          const isToday = dateStr === today.toISOString().slice(0, 10)
          const isHovered = hoveredDate === dateStr && cell !== null
          const isWeekend = (i % 7 === 0 || i % 7 === 6)
          return (
            <div
              key={i}
              onMouseEnter={() => cell && setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
              style={{
                minHeight: 72, borderRadius: 10,
                padding: '6px 8px', cursor: cell ? 'pointer' : 'default',
                position: 'relative',
                border: `1px solid ${cell
                  ? getHeatmapBorder(cell.totalPL, maxAbsPL)
                  : isWeekend
                  ? 'rgba(148,163,184,0.06)'
                  : 'rgba(148,163,184,0.1)'}`,
                background: cell
                  ? getHeatmapColor(cell.totalPL, maxAbsPL)
                  : isWeekend
                  ? 'rgba(15,23,42,0.2)'
                  : 'rgba(15,23,42,0.35)',
                outline: isToday ? '2px solid rgba(34,197,94,0.6)' : 'none',
                outlineOffset: 1,
                transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                boxShadow: isHovered
                  ? cell && cell.totalPL >= 0
                    ? '0 4px 20px rgba(34,197,94,0.25)'
                    : '0 4px 20px rgba(249,115,115,0.25)'
                  : 'none',
              }}
            >
              <div style={{
                fontSize: '0.7rem', fontWeight: 600, marginBottom: 4,
                color: isToday ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}>{day}</div>
              {cell && (
                <>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.2,
                    color: cell.totalPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                  }}>
                    {formatCurrency(cell.totalPL * 100)}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                    {cell.totalTrades}t · {cell.winRate.toFixed(0)}%
                  </div>
                </>
              )}
              {/* Tooltip */}
              {isHovered && cell && <DayTooltip summary={cell} />}
            </div>
          )
        })}
      </div>

      {/* Heatmap Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 14 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Less</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0.15, 0.35, 0.55, 0.75, 0.95].map(alpha => (
            <div key={alpha} style={{ display: 'flex', gap: 3 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: `rgba(249,115,115,${alpha})` }} />
            </div>
          ))}
          <div style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(148,163,184,0.1)', margin: '0 4px' }} />
          {[0.15, 0.35, 0.55, 0.75, 0.95].map(alpha => (
            <div key={alpha} style={{ width: 14, height: 14, borderRadius: 4, background: `rgba(34,197,94,${alpha})` }} />
          ))}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>More</span>
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
          {summaries.length === 0 ? (
            <tr>
              <td colSpan={7} style={{
                padding: '40px 10px', textAlign: 'center',
                color: 'var(--color-text-muted)', fontSize: '0.85rem',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '2rem' }}>📭</span>
                  <span>No trading days yet. Log your first trade to see daily performance.</span>
                </div>
              </td>
            </tr>
          ) : (
            [...summaries].reverse().map(s => {
              const dateLabel = new Date(s.date + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'short', month: 'short', day: 'numeric',
              })
              const avgPL = s.totalPL / s.totalTrades
              return (
                <tr key={s.date} style={{
                  borderBottom: '1px solid rgba(148,163,184,0.08)',
                  transition: 'background 0.12s ease',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(15,23,42,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: s.totalPL >= 0 ? 'var(--color-accent)' : 'var(--color-negative)',
                        boxShadow: s.totalPL >= 0 ? '0 0 6px rgba(34,197,94,0.5)' : '0 0 6px rgba(249,115,115,0.5)',
                      }} />
                      {dateLabel}
                    </div>
                  </td>
                  <td style={{ padding: '10px 10px' }}>{s.totalTrades}</td>
                  <td style={{ padding: '10px 10px', color: 'var(--color-positive)', fontWeight: 500 }}>{s.wins}</td>
                  <td style={{ padding: '10px 10px', color: 'var(--color-negative)', fontWeight: 500 }}>{s.losses}</td>
                  <td style={{ padding: '10px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(148,163,184,0.15)', maxWidth: 60 }}>
                        <div style={{
                          height: '100%', borderRadius: 999,
                          width: `${s.winRate}%`,
                          background: s.winRate >= 50 ? 'var(--color-accent)' : 'var(--color-negative)',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{s.winRate.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '10px 10px', fontWeight: 700, whiteSpace: 'nowrap',
                    color: s.totalPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                  }}>
                    {formatCurrency(s.totalPL * 100)}
                  </td>
                  <td style={{
                    padding: '10px 10px', whiteSpace: 'nowrap',
                    color: avgPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                  }}>
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

// ─── Nav Button ───────────────────────────────────────────────────
const navBtnStyle: React.CSSProperties = {
  background: 'rgba(15,23,42,0.9)',
  border: '1px solid rgba(148,163,184,0.2)',
  color: 'var(--color-text-primary)',
  borderRadius: 8, padding: '4px 12px',
  cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit',
  transition: 'all 0.15s ease',
}

// ─── Main Export ──────────────────────────────────────────────────
export default function DaysTable({ trades }: { trades: Trade[] }) {
  const [view, setView] = useState<'calendar' | 'table'>('calendar')
  const summaries = useMemo(() => buildDaySummaries(trades), [trades])

  return (
    <div className="card" style={{ marginBottom: 28 }}>
      {/* Header + Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1rem' }}>Daily Performance</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Heatmap intensity reflects profit and loss magnitude
          </p>
        </div>
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(15,23,42,0.9)', borderRadius: 10, padding: 4,
          border: '1px solid rgba(148,163,184,0.15)',
        }}>
          {(['calendar', 'table'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '5px 14px', borderRadius: 7, border: 'none',
              fontSize: '0.78rem', fontWeight: 500,
              textTransform: 'capitalize', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s ease',
              background: view === v ? 'rgba(34,197,94,0.15)' : 'transparent',
              color: view === v ? 'var(--color-accent)' : 'var(--color-text-muted)',
            }}>
              {v === 'calendar' ? '🌡️ Heatmap' : '📊 Table'}
            </button>
          ))}
        </div>
      </div>

      {view === 'calendar'
        ? <HeatmapCalendar summaries={summaries} />
        : <TableView summaries={summaries} />
      }
    </div>
  )
}