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

export interface User {
  id: string
  name: string
  email: string
}