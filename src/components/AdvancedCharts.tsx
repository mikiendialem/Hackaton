'use client'

import { useEffect, useRef } from 'react'
import { StrategyStats } from '@/types/index'
import {
  Chart,
  BarElement, BarController,
  CategoryScale, LinearScale,
  Tooltip, Legend,
} from 'chart.js'

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend)

interface Props {
  rDistribution: { label: string; count: number }[]
  strategyStats: StrategyStats[]
}

export default function AdvancedCharts({ rDistribution, strategyStats }: Props) {
  const rDistRef = useRef<HTMLCanvasElement>(null)
  const strategyRef = useRef<HTMLCanvasElement>(null)
  const rDistChart = useRef<Chart | null>(null)
  const strategyChart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!rDistRef.current || !strategyRef.current) return

    rDistChart.current?.destroy()
    strategyChart.current?.destroy()

    // R Distribution Chart
    rDistChart.current = new Chart(rDistRef.current, {
      type: 'bar',
      data: {
        labels: rDistribution.map(r => r.label),
        datasets: [{
          label: 'Trades',
          data: rDistribution.map(r => r.count),
          backgroundColor: rDistribution.map(r =>
            r.label.includes('-') && !r.label.includes('to')
              ? 'rgba(249,115,115,0.7)'
              : r.label === '0R to 1R'
              ? 'rgba(250,204,21,0.7)'
              : 'rgba(34,197,94,0.7)'
          ),
          borderColor: rDistribution.map(r =>
            r.label.includes('-') && !r.label.includes('to')
              ? '#f97373'
              : r.label === '0R to 1R'
              ? '#facc15'
              : '#22c55e'
          ),
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.parsed.y} trades`,
            },
          },
        },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(148,163,184,0.08)' } },
          y: {
            ticks: { color: '#9ca3af', stepSize: 1 },
            grid: { color: 'rgba(148,163,184,0.08)' },
            beginAtZero: true,
          },
        },
      },
    })

    // Strategy Win Rate Chart
    if (strategyStats.length > 0) {
      strategyChart.current = new Chart(strategyRef.current, {
        type: 'bar',
        data: {
          labels: strategyStats.map(s => s.name),
          datasets: [
            {
              label: 'Win Rate %',
              data: strategyStats.map(s => s.winRate),
              backgroundColor: strategyStats.map(s =>
                s.winRate >= 60
                  ? 'rgba(34,197,94,0.7)'
                  : s.winRate >= 40
                  ? 'rgba(250,204,21,0.7)'
                  : 'rgba(249,115,115,0.7)'
              ),
              borderColor: strategyStats.map(s =>
                s.winRate >= 60 ? '#22c55e' : s.winRate >= 40 ? '#facc15' : '#f97373'
              ),
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `Win Rate: ${ctx.parsed.y.toFixed(1)}%`,
              },
            },
          },
          scales: {
            x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(148,163,184,0.08)' } },
            y: {
              ticks: { color: '#9ca3af', callback: val => `${val}%` },
              grid: { color: 'rgba(148,163,184,0.08)' },
              beginAtZero: true,
              max: 100,
            },
          },
        },
      })
    }

    return () => {
      rDistChart.current?.destroy()
      strategyChart.current?.destroy()
    }
  }, [rDistribution, strategyStats])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>

      {/* R Distribution */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600 }}>
          R Multiple Distribution
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          How your trades are distributed by R multiple
        </p>
        <div style={{ position: 'relative', height: 240 }}>
          <canvas ref={rDistRef} />
        </div>
      </div>

      {/* Strategy Win Rate Chart */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600 }}>
          Strategy Win Rate
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Visual comparison of win rate per strategy
        </p>
        <div style={{ position: 'relative', height: 240 }}>
          {strategyStats.length === 0 ? (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem',
            }}>
              No strategy data yet — tag your trades!
            </div>
          ) : (
            <canvas ref={strategyRef} />
          )}
        </div>
      </div>
    </div>
  )
}