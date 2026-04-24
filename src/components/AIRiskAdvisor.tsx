'use client'

import { useState } from 'react'
import { Trade, RiskMetrics } from '@/types/index'
import { calcStrategyStats, calcWinRate, formatCurrency } from '@/lib/calculations'

interface Props {
  trades: Trade[]
  metrics: RiskMetrics
}

export default function AIRiskAdvisor({ trades, metrics }: Props) {
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function getAdvice() {
    setLoading(true)
    setError('')
    setAdvice('')

    const strategyStats = calcStrategyStats(trades)
    const winRate = calcWinRate(trades)
    const totalPL = trades.reduce((s, t) => s + t.pl, 0)

    const prompt = `You are an expert trading coach analyzing a trader's performance data. Give specific, actionable advice in a professional but friendly tone.

Here is the trader's data:

PERFORMANCE SUMMARY:
- Total Trades: ${trades.length}
- Win Rate: ${winRate.toFixed(1)}%
- Total P&L: ${formatCurrency(totalPL)}

RISK METRICS:
- Max Drawdown: ${formatCurrency(metrics.maxDrawdown)} (${Math.abs(metrics.maxDrawdownPct).toFixed(1)}% from peak)
- Max Consecutive Losses: ${metrics.maxConsecutiveLosses}
- Worst Single Day: ${formatCurrency(metrics.dailyLossLimit)}
- Risk of Ruin: ${metrics.riskOfRuin.toFixed(1)}%
- Average Risk Per Trade: ${formatCurrency(metrics.avgRisk)}

STRATEGY BREAKDOWN:
${strategyStats.map(s => `- ${s.name}: ${s.trades} trades, ${s.winRate.toFixed(1)}% win rate, Profit Factor ${s.profitFactor.toFixed(2)}, Avg R ${s.avgR.toFixed(2)}`).join('\n')}

Please provide:
1. A brief overall assessment (2-3 sentences)
2. Top 3 specific risks you see in this data
3. Top 3 actionable improvements the trader should make
4. Which strategy they should focus on and why
5. A prop firm readiness score out of 100 with explanation

Keep the total response under 400 words. Use clear sections with emoji headers.`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'API error')
      }

      const text = data.content
        .filter((block: { type: string }) => block.type === 'text')
        .map((block: { text: string }) => block.text)
        .join('')

      setAdvice(text)
    } catch (err) {
      setError('Failed to get AI advice. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginTop: 20, padding: '24px 28px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            🤖 AI Risk Advisor
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Personalized analysis based on your real trading data
          </p>
        </div>
        <button
          onClick={getAdvice}
          disabled={loading || trades.length === 0}
          style={{
            padding: '9px 20px', borderRadius: 999, border: 'none',
            background: loading || trades.length === 0
              ? 'rgba(34,197,94,0.3)'
              : 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', fontSize: '0.85rem', fontWeight: 600,
            cursor: loading || trades.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: loading ? 'none' : '0 8px 20px rgba(34,197,94,0.3)',
            transition: 'all 0.18s ease',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: 14, height: 14, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }} />
              Analyzing...
            </>
          ) : (
            <>✨ {advice ? 'Refresh Analysis' : 'Analyze My Trading'}</>
          )}
        </button>
      </div>

      {/* Empty state */}
      {!advice && !loading && !error && (
        <div style={{
          padding: '32px 24px', textAlign: 'center',
          borderRadius: 12, border: '1px dashed rgba(148,163,184,0.2)',
          background: 'rgba(15,23,42,0.4)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🧠</div>
          <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '0.95rem' }}>
            Get personalized trading advice
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: 380, marginInline: 'auto' }}>
            Click Analyze My Trading to get AI-powered insights based on your win rate, drawdown, strategy performance and risk of ruin.
          </p>
          {trades.length === 0 && (
            <p style={{ margin: '12px 0 0', fontSize: '0.78rem', color: 'var(--color-negative)' }}>
              ⚠️ Log at least one trade first to get analysis.
            </p>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          padding: '14px 16px', borderRadius: 10,
          background: 'rgba(249,115,115,0.1)',
          border: '1px solid rgba(249,115,115,0.25)',
          color: 'var(--color-negative)', fontSize: '0.85rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{
          padding: '32px 24px', textAlign: 'center',
          borderRadius: 12, border: '1px dashed rgba(34,197,94,0.2)',
          background: 'rgba(34,197,94,0.04)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '0.95rem' }}>
            Analyzing your trading data...
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            The AI is reviewing your metrics and strategies
          </p>
        </div>
      )}

      {/* AI Response */}
      {advice && !loading && (
        <div style={{
          padding: '20px 22px', borderRadius: 12,
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(34,197,94,0.15)',
        }}>
          {/* Render advice with line breaks */}
          <div style={{
            fontSize: '0.88rem',
            lineHeight: 1.8,
            color: 'var(--color-text-primary)',
            whiteSpace: 'pre-wrap',
          }}>
            {advice}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 16, paddingTop: 14,
            borderTop: '1px solid rgba(148,163,184,0.1)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--color-accent)',
              boxShadow: '0 0 6px var(--color-accent)',
            }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              Analysis based on {trades.length} trades · Powered by Claude AI
            </span>
          </div>
        </div>
      )}

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}