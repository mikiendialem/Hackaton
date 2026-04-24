import { Trade, StrategyStats, RiskMetrics } from '@/types/index'

// ─── Format Helpers ───────────────────────────────────────────────
export function formatCurrency(value: number): string {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

// ─── Core Metrics ─────────────────────────────────────────────────
export function calcWinRate(trades: Trade[]): number {
  if (!trades.length) return 0
  const wins = trades.filter(t => t.pl > 0).length
  return (wins / trades.length) * 100
}

export function calcProfitFactor(trades: Trade[]): number {
  const grossProfit = trades.filter(t => t.pl > 0).reduce((s, t) => s + t.pl, 0)
  const grossLoss = Math.abs(trades.filter(t => t.pl < 0).reduce((s, t) => s + t.pl, 0))
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0
  return grossProfit / grossLoss
}

export function calcAvgR(trades: Trade[]): number {
  if (!trades.length) return 0
  return trades.reduce((s, t) => s + t.r_multiple, 0) / trades.length
}

export function calcTotalPL(trades: Trade[]): number {
  return trades.reduce((s, t) => s + t.pl, 0)
}

// ─── Equity Curve ─────────────────────────────────────────────────
export function buildEquityCurve(trades: Trade[]): {
  labels: string[]
  equity: number[]
  drawdown: number[]
  drawdownPct: number[]
} {
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date))
  const labels: string[] = []
  const equity: number[] = []
  const drawdown: number[] = []
  const drawdownPct: number[] = []

  let running = 0
  let peak = 0

  sorted.forEach((t, i) => {
    running += t.pl
    if (running > peak) peak = running

    const dd = running - peak
    const ddPct = peak !== 0 ? (dd / peak) * 100 : 0

    const d = new Date(t.date + 'T00:00:00')
    labels.push(
      d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) || `Trade ${i + 1}`
    )
    equity.push(parseFloat(running.toFixed(2)))
    drawdown.push(parseFloat(dd.toFixed(2)))
    drawdownPct.push(parseFloat(ddPct.toFixed(2)))
  })

  return { labels, equity, drawdown, drawdownPct }
}

// ─── Drawdown ─────────────────────────────────────────────────────
export function calcMaxDrawdown(trades: Trade[]): { absolute: number; percentage: number } {
  const { drawdown, drawdownPct } = buildEquityCurve(trades)
  const absolute = Math.min(0, ...drawdown)
  const percentage = Math.min(0, ...drawdownPct)
  return { absolute, percentage }
}

// ─── Strategy Analytics ───────────────────────────────────────────
export function calcStrategyStats(trades: Trade[]): StrategyStats[] {
  const map = new Map<string, Trade[]>()

  trades.forEach(t => {
    const key = t.strategy || 'None'
    const existing = map.get(key) || []
    map.set(key, [...existing, t])
  })

  return Array.from(map.entries())
    .map(([name, stratTrades]) => {
      const wins = stratTrades.filter(t => t.pl > 0).length
      const losses = stratTrades.filter(t => t.pl < 0).length
      const totalPL = calcTotalPL(stratTrades)
      const winRate = calcWinRate(stratTrades)
      const profitFactor = calcProfitFactor(stratTrades)
      const avgR = calcAvgR(stratTrades)

      return {
        name,
        trades: stratTrades.length,
        wins,
        losses,
        winRate,
        totalPL,
        profitFactor,
        avgR,
      }
    })
    .sort((a, b) => b.trades - a.trades)
}

// ─── Session Analytics ────────────────────────────────────────────
export function calcSessionStats(trades: Trade[]) {
  const sessions = ['London', 'New York', 'Asia', 'None']
  return sessions.map(session => {
    const sessionTrades = trades.filter(t => (t.session || 'None') === session)
    return {
      session,
      trades: sessionTrades.length,
      winRate: calcWinRate(sessionTrades),
      totalPL: calcTotalPL(sessionTrades),
      profitFactor: calcProfitFactor(sessionTrades),
    }
  }).filter(s => s.trades > 0)
}

// ─── Weekday Analytics ────────────────────────────────────────────
export function calcWeekdayStats(trades: Trade[]) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days.map((day, idx) => {
    const dayTrades = trades.filter(t => {
      const d = new Date(t.date + 'T00:00:00')
      return d.getDay() === idx
    })
    return {
      day,
      trades: dayTrades.length,
      winRate: calcWinRate(dayTrades),
      totalPL: calcTotalPL(dayTrades),
    }
  }).filter(d => d.trades > 0)
}

// ─── Risk Metrics ─────────────────────────────────────────────────
export function calcRiskMetrics(trades: Trade[]): RiskMetrics {
  if (!trades.length) {
    return {
      avgRisk: 0,
      maxConsecutiveLosses: 0,
      dailyLossLimit: 0,
      riskOfRuin: 0,
      maxDrawdown: 0,
      maxDrawdownPct: 0,
    }
  }

  // Average risk per trade (1% of entry * size approximation)
  const avgRisk = trades.reduce((s, t) => s + (t.entry * 0.01 * t.size), 0) / trades.length

  // Max consecutive losses
  let maxConsec = 0
  let currentConsec = 0
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date))
  sorted.forEach(t => {
    if (t.pl < 0) {
      currentConsec++
      if (currentConsec > maxConsec) maxConsec = currentConsec
    } else {
      currentConsec = 0
    }
  })

  // Daily loss limit (worst single day)
  const dayMap = new Map<string, number>()
  trades.forEach(t => {
    dayMap.set(t.date, (dayMap.get(t.date) || 0) + t.pl)
  })
  const dailyLossLimit = Math.min(0, ...Array.from(dayMap.values()))

  // Risk of ruin (simplified Kelly-based)
  const winRate = calcWinRate(trades) / 100
  const avgWin = trades.filter(t => t.pl > 0).reduce((s, t) => s + t.pl, 0) /
    (trades.filter(t => t.pl > 0).length || 1)
  const avgLoss = Math.abs(trades.filter(t => t.pl < 0).reduce((s, t) => s + t.pl, 0) /
    (trades.filter(t => t.pl < 0).length || 1))
  const rr = avgLoss > 0 ? avgWin / avgLoss : 1
  const riskOfRuin = winRate > 0 && rr > 0
    ? Math.pow((1 - winRate) / winRate, 10) * 100
    : 100

  const { absolute, percentage } = calcMaxDrawdown(trades)

  return {
    avgRisk,
    maxConsecutiveLosses: maxConsec,
    dailyLossLimit,
    riskOfRuin: Math.min(100, Math.max(0, riskOfRuin)),
    maxDrawdown: absolute,
    maxDrawdownPct: percentage,
  }
}

// ─── R Multiple Distribution ──────────────────────────────────────
export function calcRDistribution(trades: Trade[]) {
  const buckets = [
    { label: '< -2R', min: -Infinity, max: -2 },
    { label: '-2R to -1R', min: -2, max: -1 },
    { label: '-1R to 0R', min: -1, max: 0 },
    { label: '0R to 1R', min: 0, max: 1 },
    { label: '1R to 2R', min: 1, max: 2 },
    { label: '> 2R', min: 2, max: Infinity },
  ]

  return buckets.map(bucket => ({
    label: bucket.label,
    count: trades.filter(t => t.r_multiple >= bucket.min && t.r_multiple < bucket.max).length,
  }))
}