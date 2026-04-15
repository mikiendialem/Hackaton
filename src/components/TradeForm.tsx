'use client'

import { useState } from 'react'
import { Trade } from '@/types/index'

const instruments: Record<string, { pipValuePerLot: number }> = {
  EURUSD: { pipValuePerLot: 100000 },
  GBPUSD: { pipValuePerLot: 100000 },
  USDJPY: { pipValuePerLot: 100000 },
  XAUUSD: { pipValuePerLot: 100 },
  NAS100: { pipValuePerLot: 100 },
}

function calculatePnL(symbol: string, entry: number, exit: number, size: number) {
  const instrument = instruments[symbol] || { pipValuePerLot: 10 }
  const move = Math.abs(exit - entry)
  return move * size * instrument.pipValuePerLot
}

interface Props {
  onTradeAdded: (trade: Trade) => void
}

export default function TradeForm({ onTradeAdded }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /** 🔥 NEW: Preview State */
  const [preview, setPreview] = useState({
    pnl: 0,
  })

  /** 🔥 NEW: Live Preview Handler */
  function handlePreview(e: React.ChangeEvent<HTMLInputElement>) {
    const form = e.currentTarget.form
    if (!form) return

    const symbol = (form.symbol.value || '').toUpperCase()
    const entry = parseFloat(form.entry.value)
    const exit = parseFloat(form.exit.value)
    const size = parseFloat(form.size.value)

    if (!symbol || !entry || !exit || !size) return

    const pnl = calculatePnL(symbol, entry, exit, size)

    setPreview({ pnl })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const fd = new FormData(form)

    const payload = {
      symbol: (fd.get('symbol') as string).toUpperCase().trim(),
      direction: fd.get('direction') as string,
      date: fd.get('date') as string,
      entry: parseFloat(fd.get('entry') as string),
      exit: parseFloat(fd.get('exit') as string),
      size: parseFloat(fd.get('size') as string),
      fees: parseFloat((fd.get('fees') as string) || '0'),
      notes: fd.get('notes') as string,
    }

    const res = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to save trade')
    } else {
      onTradeAdded(data.trade)
      const dateVal = fd.get('date') as string
      form.reset()
      ;(form.querySelector('[name="date"]') as HTMLInputElement).value = dateVal
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(15,23,42,0.9)',
    border: '1px solid rgba(148,163,184,0.4)',
    color: 'var(--color-text-primary)',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: '0.86rem',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--color-text-muted)',
  }

  return (
    <div className="card" style={{ padding: '18px 18px 20px' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: '1rem' }}>Log New Trade</h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Quickly capture your entries and exits.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, fontSize: '0.82rem', background: 'rgba(249,115,115,0.1)', color: 'var(--color-negative)', border: '1px solid rgba(249,115,115,0.3)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        
        {/* Symbol */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={labelStyle}>Symbol</label>
          <input name="symbol" type="text" required placeholder="e.g. XAUUSD" style={inputStyle} onChange={handlePreview} />
        </div>

        {/* Direction + Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Direction</label>
            <select name="direction" style={inputStyle}>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Date</label>
            <input name="date" type="date" required style={inputStyle} />
          </div>
        </div>

        {/* Entry + Exit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Entry Price</label>
            <input name="entry" type="number" step="0.01" required style={inputStyle} onChange={handlePreview} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Exit Price</label>
            <input name="exit" type="number" step="0.01" required style={inputStyle} onChange={handlePreview} />
          </div>
        </div>

        {/* Size + Fees */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Position Size</label>
            <input name="size" type="number" step="0.01" min="0.01" max="100" required style={inputStyle} onChange={handlePreview}/>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={labelStyle}>Fees (optional)</label>
            <input name="fees" type="number" step="0.01" placeholder="0" style={inputStyle} />
          </div>
        </div>

        {/* 🔥 NEW: Live PnL Preview */}
        <div style={{
          padding: '10px 12px',
          borderRadius: 8,
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Estimated PnL</span>
            <strong>${preview.pnl.toFixed(2)}</strong>
          </div>
        </div>

        {/* Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Setup, emotions, what you learned..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 4,
            padding: '9px 14px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#f9fafb',
            fontSize: '0.88rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 12px 30px rgba(34,197,94,0.35)',
            fontFamily: 'inherit',
          }}>
          {loading ? 'Saving...' : 'Add Trade'}
        </button>
      </form>
    </div>
  )
}