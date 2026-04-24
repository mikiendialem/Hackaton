import { useState, useEffect, useCallback } from 'react'
import { Trade } from '@/types/index'

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/trades')
      const data = await res.json()
      setTrades(data.trades || [])
    } catch {
      setError('Failed to load trades')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])

  const addTrade = useCallback((trade: Trade) => {
    setTrades(prev => [...prev, trade])
  }, [])

  const deleteTrade = useCallback(async (id: string) => {
    const res = await fetch(`/api/trades/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTrades(prev => prev.filter(t => t.id !== id))
    }
  }, [])

  return { trades, loading, error, addTrade, deleteTrade, refetch: fetchTrades }
}