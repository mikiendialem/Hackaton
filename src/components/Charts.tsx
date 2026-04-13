'use client'

import { useEffect, useRef } from 'react'
import { Trade } from '@/types/index'
import {
  Chart,
  LineElement, PointElement, LineController,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler,
} from 'chart.js'

Chart.register(
  LineElement, PointElement, LineController,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
)

function formatCurrency(value: number) {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

export default function Charts({ trades }: { trades: Trade[] }) {
  const equityRef = useRef<HTMLCanvasElement>(null)
  const outcomeRef = useRef<HTMLCanvasElement>(null)
  const equityChart = useRef<Chart | null>(null)
  const outcomeChart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!equityRef.current || !outcomeRef.current) return

    // Destroy old charts
    equityChart.current?.destroy()
    outcomeChart.current?.destroy()

    // Build equity curve
    const labels: string[] = []
    const data: number[] = []
    let running = 0
    const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date))
    sorted.forEach((t, i) => {
      running += t.pl
      const d = new Date(t.date + 'T00:00:00')
      labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) || `Trade ${i + 1}`)
      data.push(running)
    })

    // Wins / Losses
    const wins = trades.filter(t => t.pl > 0).length
    const losses = trades.filter(t => t.pl < 0).length

    // Equity Chart
    equityChart.current = new Chart(equityRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Equity',
          data,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.15)',
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
              label: ctx => {
                    const value = ctx.parsed.y
                    return `Equity: ${formatCurrency(value !== null ? value : 0)}`
                  },
            },
          },
        },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(148,163,184,0.15)' } },
          y: {
            ticks: { color: '#9ca3af', callback: val => `$${val}` },
            grid: { color: 'rgba(148,163,184,0.15)' },
          },
        },
      },
    })

    // Outcome Chart
    outcomeChart.current = new Chart(outcomeRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Wins', 'Losses'],
        datasets: [{
          data: [wins, losses],
          backgroundColor: ['rgba(34,197,94,0.85)', 'rgba(249,115,115,0.85)'],
          borderColor: ['#22c55e', '#f97373'],
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#e5e7eb', padding: 14, usePointStyle: true },
          },
        },
        cutout: '65%',
      },
    })

    return () => {
      equityChart.current?.destroy()
      outcomeChart.current?.destroy()
    }
  }, [trades])

  return (
    <>
      {/* Equity Curve */}
      <div className="card" style={{ paddingTop: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Equity Curve</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Cumulative P&L over time
          </p>
        </div>
        <div style={{ position: 'relative', width: '100%', height: 220 }}>
          <canvas ref={equityRef} aria-label="Equity curve" role="img" />
        </div>
      </div>

      {/* Wins vs Losses */}
      <div className="card" style={{ paddingTop: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Wins vs Losses</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Distribution of outcomes
          </p>
        </div>
        <div style={{ position: 'relative', width: '100%', height: 220 }}>
          <canvas ref={outcomeRef} aria-label="Wins vs losses" role="img" />
        </div>
      </div>
    </>
  )
}