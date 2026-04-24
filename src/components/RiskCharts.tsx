'use client'

import { useEffect, useRef, useState } from 'react'
import { Trade } from '@/types/index'
import {
  Chart,
  LineElement, PointElement, LineController,
  BarElement, BarController,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler,
} from 'chart.js'

Chart.register(
  LineElement, PointElement, LineController,
  BarElement, BarController,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
)

interface Props {
  equityData: {
    labels: string[]
    equity: number[]
    drawdown: number[]
    drawdownPct: number[]
  }
  trades: Trade[]
}

type CurveView = 'equity' | 'drawdown'

export default function RiskCharts({ equityData, trades }: Props) {
  const equityRef = useRef<HTMLCanvasElement>(null)
  const drawdownRef = useRef<HTMLCanvasElement>(null)
  const equityChart = useRef<Chart | null>(null)
  const drawdownChart = useRef<Chart | null>(null)
  const [view, setView] = useState<CurveView>('equity')

  useEffect(() => {
    if (!equityRef.current || !drawdownRef.current) return

    equityChart.current?.destroy()
    drawdownChart.current?.destroy()

    // Equity / Balance Curve
    equityChart.current = new Chart(equityRef.current, {
      type: 'line',
      data: {
        labels: equityData.labels,
        datasets: [{
          label: 'Cumulative P&L',
          data: equityData.equity,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.12)',
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          pointRadius: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `Equity: $${ctx.parsed.y.toFixed(2)}`,
            },
          },
        },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(148,163,184,0.1)' } },
          y: {
            ticks: { color: '#9ca3af', callback: val => `$${val}` },
            grid: { color: 'rgba(148,163,184,0.1)' },
          },
        },
      },
    })

    // Drawdown Chart
    drawdownChart.current = new Chart(drawdownRef.current, {
      type: 'line',
      data: {
        labels: equityData.labels,
        datasets: [{
          label: 'Drawdown %',
          data: equityData.drawdownPct,
          borderColor: '#f97373',
          backgroundColor: 'rgba(249,115,115,0.12)',
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          pointRadius: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `Drawdown: ${ctx.parsed.y.toFixed(2)}%`,
            },
          },
        },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(148,163,184,0.1)' } },
          y: {
            ticks: { color: '#9ca3af', callback: val => `${val}%` },
            grid: { color: 'rgba(148,163,184,0.1)' },
          },
        },
      },
    })

    return () => {
      equityChart.current?.destroy()
      drawdownChart.current?.destroy()
    }
  }, [equityData])

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 14px', borderRadius: 7, border: 'none',
    fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.15s ease',
    background: active ? 'rgba(34,197,94,0.15)' : 'transparent',
    color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Equity / Drawdown Toggle Chart */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              {view === 'equity' ? 'Equity Curve' : 'Drawdown Chart'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {view === 'equity' ? 'Cumulative P&L over time' : 'Peak-to-trough decline over time'}
            </p>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex', gap: 4,
            background: 'rgba(15,23,42,0.9)',
            borderRadius: 10, padding: 4,
            border: '1px solid rgba(148,163,184,0.15)',
          }}>
            <button onClick={() => setView('equity')} style={toggleStyle(view === 'equity')}>
              📈 Equity
            </button>
            <button onClick={() => setView('drawdown')} style={toggleStyle(view === 'drawdown')}>
              📉 Drawdown
            </button>
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', height: 280 }}>
          <canvas
            ref={equityRef}
            style={{ display: view === 'equity' ? 'block' : 'none' }}
          />
          <canvas
            ref={drawdownRef}
            style={{ display: view === 'drawdown' ? 'block' : 'none' }}
          />
        </div>
      </div>

      {/* Consecutive Losses Heatmap */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600 }}>
          Trade Outcome Sequence
        </h3>
        <p style={{ margin: '-8px 0 14px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Visual sequence of wins and losses
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {trades.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No trades yet.</p>
          ) : (
            [...trades]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((t, i) => (
                <div
                  key={t.id}
                  title={`${t.symbol} ${t.date}: ${t.pl >= 0 ? '+' : ''}$${t.pl.toFixed(2)}`}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: t.pl > 0
                      ? 'rgba(34,197,94,0.8)'
                      : t.pl < 0
                      ? 'rgba(249,115,115,0.8)'
                      : 'rgba(148,163,184,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700, color: '#fff',
                    cursor: 'default',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {t.pl > 0 ? 'W' : t.pl < 0 ? 'L' : 'B'}
                </div>
              ))
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
          {[
            { color: 'rgba(34,197,94,0.8)', label: 'Win' },
            { color: 'rgba(249,115,115,0.8)', label: 'Loss' },
            { color: 'rgba(148,163,184,0.3)', label: 'Breakeven' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}