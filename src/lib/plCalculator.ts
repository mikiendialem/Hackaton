export const INSTRUMENT_TYPES = [
  { value: 'forex_usd_base', label: 'Forex USD Base (EURUSD, GBPUSD, AUDUSD...)' },
  { value: 'forex_usd_quote', label: 'Forex USD Quote (USDJPY, USDCHF, USDCAD...)' },
  { value: 'gold', label: 'Gold (XAUUSD)' },
  { value: 'silver', label: 'Silver (XAGUSD)' },
  { value: 'nq', label: 'NQ (Nasdaq 100)' },
  { value: 'es', label: 'ES (S&P 500)' },
  { value: 'dax', label: 'DAX' },
  { value: 'oil', label: 'Oil (USOIL)' },
  { value: 'crypto', label: 'Crypto (BTCUSD, ETHUSD...)' },
  { value: 'other', label: 'Other' },
]

export function calculatePL(
  instrumentType: string,
  direction: 'long' | 'short',
  entry: number,
  exit: number,
  size: number,
  fees: number = 0
): number {
  const priceDiff = direction === 'long' ? exit - entry : entry - exit
  let gross = 0

  switch (instrumentType) {
    // EUR/USD, GBP/USD etc: pip = 0.0001, lot = 100,000 units
    // P&L = priceDiff × size × 100,000
    case 'forex_usd_base':
      gross = priceDiff * size * 100000
      break
    // USD/JPY, USD/CHF etc: pip = 0.01, lot = 100,000 units
    // P&L = (priceDiff / exit) × size × 100,000
    case 'forex_usd_quote':
      gross = (priceDiff / exit) * size * 100000
      break
    // Gold: 1 lot = 100 oz, price in USD per oz
    // P&L = priceDiff × size × 100
    case 'gold':
      gross = priceDiff * size * 100
      break
    // Silver: 1 lot = 5000 oz
    case 'silver':
      gross = priceDiff * size * 5000
      break
    // NQ: $20 per point per contract
    case 'nq':
      gross = priceDiff * size * 20
      break
    // ES: $50 per point per contract
    case 'es':
      gross = priceDiff * size * 50
      break
    // DAX: $25 per point
    case 'dax':
      gross = priceDiff * size * 25
      break
    // Oil: 1 lot = 1000 barrels
    case 'oil':
      gross = priceDiff * size * 1000
      break
    // Crypto: direct price × size
    case 'crypto':
      gross = priceDiff * size
      break
    default:
      gross = priceDiff * size
      break
  }
  return parseFloat((gross - fees).toFixed(2))
}

export function calculateR(
  pl: number,
  entry: number,
  size: number,
  instrumentType: string
): number {
  // Estimate risk as 1% of notional value
  let notional = entry * size

  switch (instrumentType) {
    case 'forex_usd_base':
    case 'forex_usd_quote':
      notional = size * 100000
      break
    case 'gold':
      notional = entry * size * 100
      break
    case 'nq':
      notional = entry * size * 20
      break
    case 'es':
      notional = entry * size * 50
      break
    default:
      notional = entry * size
      break
  }
  
  const risk = notional * 0.01 || 1
  return parseFloat((pl / risk).toFixed(4))
}