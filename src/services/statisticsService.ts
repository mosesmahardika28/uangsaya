import type { Transaction, Transfer, Category, Wallet } from '@/database/db'

export interface CategoryStat {
  categoryId: string
  name: string
  color: string
  amount: number
  percentage: number
  count: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expense: number
}

export interface WalletStat {
  walletId: string
  name: string
  color: string
  transactionCount: number
  totalAmount: number
}

export function getFilteredTransactions(
  transactions: Transaction[],
  period: 'week' | 'month' | 'year' | 'all',
  referenceDate: Date = new Date()
): Transaction[] {
  return transactions.filter((t) => {
    const d = new Date(t.date)
    if (period === 'week') {
      const start = new Date(referenceDate)
      start.setDate(referenceDate.getDate() - referenceDate.getDay())
      start.setHours(0, 0, 0, 0)
      return d >= start
    }
    if (period === 'month') {
      return (
        d.getMonth() === referenceDate.getMonth() &&
        d.getFullYear() === referenceDate.getFullYear()
      )
    }
    if (period === 'year') {
      return d.getFullYear() === referenceDate.getFullYear()
    }
    return true
  })
}

export function getCategoryStats(
  transactions: Transaction[],
  categories: Category[],
  type: 'expense' | 'income'
): CategoryStat[] {
  const filtered = transactions.filter((t) => t.type === type)
  const total = filtered.reduce((s, t) => s + t.amount, 0)

  return categories
    .filter((c) => c.type === type)
    .map((cat) => {
      const catTransactions = filtered.filter((t) => t.categoryId === cat.id)
      const amount = catTransactions.reduce((s, t) => s + t.amount, 0)
      return {
        categoryId: cat.id,
        name: cat.name,
        color: cat.color,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        count: catTransactions.length,
      }
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
}

export function getMonthlyTrend(
  transactions: Transaction[],
  months: number = 6
): MonthlyTrend[] {
  const result: MonthlyTrend[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
    })

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)

    result.push({
      month: date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      income,
      expense,
    })
  }

  return result
}

export function getWalletStats(
  transactions: Transaction[],
  transfers: Transfer[],
  wallets: Wallet[]
): WalletStat[] {
  return wallets
    .map((wallet) => {
      const walletTransactions = transactions.filter((t) => t.walletId === wallet.id)
      const walletTransfers = transfers.filter(
        (t) => t.fromWalletId === wallet.id || t.toWalletId === wallet.id
      )
      const totalAmount = walletTransactions.reduce((s, t) => s + t.amount, 0)

      return {
        walletId: wallet.id,
        name: wallet.name,
        color: wallet.color,
        transactionCount: walletTransactions.length + walletTransfers.length,
        totalAmount,
      }
    })
    .sort((a, b) => b.transactionCount - a.transactionCount)
}

export function getLargestExpenses(
  transactions: Transaction[],
  categories: Category[],
  limit: number = 5
): (Transaction & { categoryName: string })[] {
  return transactions
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((t) => ({
      ...t,
      categoryName: categories.find((c) => c.id === t.categoryId)?.name ?? '-',
    }))
}