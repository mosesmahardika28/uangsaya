interface ParseResult {
  amount: number
  categoryName: string
  walletName: string
  note: string
  isValid: boolean
  error?: string
}

export function parseQuickAdd(input: string): ParseResult {
  const text = input.trim().toLowerCase()

  if (!text) {
    return { amount: 0, categoryName: '', walletName: '', note: '', isValid: false, error: 'Input kosong' }
  }

  const tokens = text.split(/\s+/)

  if (tokens.length < 2) {
    return { amount: 0, categoryName: '', walletName: '', note: '', isValid: false, error: 'Format: [nominal] [kategori] [dompet]' }
  }

  // Parse nominal — bisa 25000, 25rb, 25k, 1.5jt
  const rawAmount = tokens[0]
    .replace(/\./g, '')
    .replace(/,/g, '')
  
  let amount = 0
  if (/^\d+$/.test(rawAmount)) {
    amount = parseInt(rawAmount)
  } else if (/^\d+(rb|k)$/i.test(rawAmount)) {
    amount = parseInt(rawAmount) * 1000
  } else if (/^\d+(jt|m)$/i.test(rawAmount)) {
    amount = parseInt(rawAmount) * 1000000
  } else if (/^\d+\.\d+(jt|m)$/i.test(rawAmount)) {
    amount = parseFloat(rawAmount) * 1000000
  } else if (/^\d+\.\d+(rb|k)$/i.test(rawAmount)) {
    amount = parseFloat(rawAmount) * 1000
  } else {
    return { amount: 0, categoryName: '', walletName: '', note: '', isValid: false, error: 'Nominal tidak valid' }
  }

  if (amount <= 0) {
    return { amount: 0, categoryName: '', walletName: '', note: '', isValid: false, error: 'Nominal harus lebih dari 0' }
  }

  const categoryName = tokens[1] ?? ''
  const walletName = tokens[2] ?? ''
  const note = tokens.slice(3).join(' ')

  return {
    amount,
    categoryName,
    walletName,
    note,
    isValid: true,
  }
}

export function findBestMatch(input: string, options: string[]): string {
  const lower = input.toLowerCase()
  const exact = options.find((o) => o.toLowerCase() === lower)
  if (exact) return exact

  const starts = options.find((o) => o.toLowerCase().startsWith(lower))
  if (starts) return starts

  const includes = options.find((o) => o.toLowerCase().includes(lower))
  if (includes) return includes

  return ''
}