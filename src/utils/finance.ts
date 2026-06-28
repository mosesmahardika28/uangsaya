import type { Wallet, Transaction, Transfer } from '@/database/db'

export function calculateBalance(
  wallet: Wallet,
  transactions: Transaction[],
  transfers: Transfer[]
): number {
  let balance = wallet.initialBalance

  transactions.forEach((t) => {
    if (t.walletId !== wallet.id) return
    if (t.type === 'income') balance += t.amount
    if (t.type === 'expense') balance -= t.amount
  })

  transfers.forEach((t) => {
    if (t.fromWalletId === wallet.id) balance -= t.amount
    if (t.toWalletId === wallet.id) balance += t.amount
  })

  return balance
}

export function calculateTotalBalance(
  wallets: Wallet[],
  transactions: Transaction[],
  transfers: Transfer[]
): number {
  return wallets.reduce((total, wallet) => {
    return total + calculateBalance(wallet, transactions, transfers)
  }, 0)
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function getMonthSummary(transactions: Transaction[], month?: Date) {
  const now = month || new Date()
  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const income = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return { income, expense, balance: income - expense }
}

export function getMonthComparison(
  transactions: Transaction[],
  type: 'income' | 'expense'
): { percentage: number; isUp: boolean } {
  const now = new Date()
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date)
    return (
      t.type === type &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    )
  }).reduce((s, t) => s + t.amount, 0)

  const lastMonth = transactions.filter((t) => {
    const d = new Date(t.date)
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return (
      t.type === type &&
      d.getMonth() === last.getMonth() &&
      d.getFullYear() === last.getFullYear()
    )
  }).reduce((s, t) => s + t.amount, 0)

  if (lastMonth === 0) return { percentage: 0, isUp: true }
  const percentage = Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
  return { percentage: Math.abs(percentage), isUp: percentage >= 0 }
}