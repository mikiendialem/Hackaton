export interface Trade {
  id: string
  user_id: string
  symbol: string
  direction: 'long' | 'short'
  date: string
  entry: number
  exit: number
  size: number
  fees: number
  pl: number
  r_multiple: number
  notes: string
  strategy: string
  session: string
  entry_time?: string
  exit_time?: string
  created_at: string
}

export interface DaySummary {
  date: string
  trades: Trade[]
  totalPL: number
  wins: number
  losses: number
  winRate: number
  totalTrades: number
}

export interface StrategyStats {
  name: string
  trades: number
  wins: number
  losses: number
  winRate: number
  totalPL: number
  profitFactor: number
  avgR: number
}

export interface RiskMetrics {
  avgRisk: number
  maxConsecutiveLosses: number
  dailyLossLimit: number
  riskOfRuin: number
  maxDrawdown: number
  maxDrawdownPct: number
}

export interface User {
  id: string
  name: string
  email: string
}