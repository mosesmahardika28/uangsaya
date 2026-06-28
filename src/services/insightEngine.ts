import type { Transaction, Transfer, Budget, Wallet } from '@/database/db'
import type { Category } from '@/database/db'

export interface Insight {
  id: string
  type: 'warning' | 'info' | 'success'
  message: string
  icon: string
}

export function generateInsights(
  transactions: Transaction[],
  _transfers: Transfer[],
  budgets: Budget[],
  categories: Category[],
  wallets: Wallet[]
): Insight[] {
  const insights: Insight[] = []
  const now = new Date()

  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const lastMonth = transactions.filter((t) => {
    const d = new Date(t.date)
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear()
  })

  // 1. Pengeluaran kategori naik signifikan
  categories
    .filter((c) => c.type === 'expense')
    .forEach((cat) => {
      const thisSpend = thisMonth
        .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((s, t) => s + t.amount, 0)

      const lastSpend = lastMonth
        .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((s, t) => s + t.amount, 0)

      if (lastSpend > 0 && thisSpend > 0) {
        const pct = Math.round(((thisSpend - lastSpend) / lastSpend) * 100)
        if (pct >= 20) {
          insights.push({
            id: `cat-up-${cat.id}`,
            type: 'warning',
            message: `Pengeluaran ${cat.name} naik ${pct}% dibanding bulan lalu`,
            icon: '📈',
          })
        } else if (pct <= -20) {
          insights.push({
            id: `cat-down-${cat.id}`,
            type: 'success',
            message: `Pengeluaran ${cat.name} turun ${Math.abs(pct)}% dibanding bulan lalu`,
            icon: '📉',
          })
        }
      }
    })

  // 2. Budget hampir habis atau melebihi
  budgets.forEach((budget) => {
    const spent = thisMonth
      .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId)
      .reduce((s, t) => s + t.amount, 0)

    const cat = categories.find((c) => c.id === budget.categoryId)
    const pct = Math.round((spent / budget.amount) * 100)

    if (pct >= 100) {
      insights.push({
        id: `budget-over-${budget.id}`,
        type: 'warning',
        message: `Budget ${cat?.name ?? '-'} sudah melebihi batas bulan ini`,
        icon: '🔴',
      })
    } else if (pct >= 80) {
      const remaining = budget.amount - spent
      insights.push({
        id: `budget-warn-${budget.id}`,
        type: 'warning',
        message: `Budget ${cat?.name ?? '-'} tersisa Rp${remaining.toLocaleString('id-ID')}`,
        icon: '⚠️',
      })
    }
  })

  // 3. Dompet paling aktif minggu ini
  const thisWeek = transactions.filter((t) => {
    const d = new Date(t.date)
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    start.setHours(0, 0, 0, 0)
    return d >= start
  })

  const walletActivity = wallets
    .filter((w) => !w.isGoal)
    .map((w) => ({
      wallet: w,
      count: thisWeek.filter((t) => t.walletId === w.id).length,
    }))
    .sort((a, b) => b.count - a.count)

  if (walletActivity[0]?.count > 0) {
    insights.push({
      id: 'wallet-active',
      type: 'info',
      message: `${walletActivity[0].wallet.name} adalah dompet paling aktif minggu ini`,
      icon: '💳',
    })
  }

  // 4. Tidak ada pengeluaran hari ini
  const todayExpense = thisMonth.filter((t) => {
    const d = new Date(t.date)
    return t.type === 'expense' && d.toDateString() === now.toDateString()
  })

  if (todayExpense.length === 0) {
    insights.push({
      id: 'no-expense-today',
      type: 'success',
      message: 'Belum ada pengeluaran hari ini, pertahankan!',
      icon: '🎉',
    })
  }

  // 5. Total pengeluaran bulan ini vs pemasukan
  const totalIncome = thisMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  if (totalIncome > 0 && totalExpense > totalIncome * 0.9) {
    insights.push({
      id: 'high-expense-ratio',
      type: 'warning',
      message: `Pengeluaran sudah mencapai ${Math.round((totalExpense / totalIncome) * 100)}% dari pemasukan bulan ini`,
      icon: '💸',
    })
  }

  return insights.slice(0, 4)
}