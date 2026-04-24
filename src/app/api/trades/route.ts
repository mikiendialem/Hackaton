import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('trades')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ trades: data })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { symbol, direction, date, entry, exit, size, fees, notes, strategy, session: tradeSession } = body

    const priceDiff = direction === 'long' ? exit - entry : entry - exit
    const gross = priceDiff * size
    const pl = gross - (fees || 0)
    const riskPerUnit = entry * 0.01
    const risk = riskPerUnit * size || 1
    const r_multiple = pl / risk

    const { data, error } = await supabaseAdmin
      .from('trades')
      .insert({
        user_id: session.user.id,
        symbol, direction, date,
        entry, exit, size,
        fees: fees || 0,
        pl, r_multiple,
        notes: notes || '',
        strategy: strategy || 'None',
        session: tradeSession || 'None',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ trade: data }, { status: 201 })
  } catch (err) {
    console.error('Trade insert error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}