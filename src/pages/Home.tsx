import { useEffect } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import BalanceHeroCard from '@/components/shared/BalanceHeroCard'
import QuickActions from '@/components/shared/QuickActions'
import SpendingChart from '@/components/shared/SpendingChart'
import CategoryDonut from '@/components/shared/CategoryDonut'
import WalletList from '@/components/shared/WalletList'
import RecentTransactions from '@/components/shared/RecentTransactions'
import InsightCard from '@/components/shared/InsightCard'
import { generateInsights } from '@/services/insightEngine'
import { db } from '@/database/db'
import { useState } from 'react'
import type { Budget } from '@/database/db'

export default function Home() {
  const { wallets, categories, loadWallets, loadCategories } = useWalletStore()
  const { transactions, transfers, loadTransactions } = useTransactionStore()
  const [budgets, setBudgets] = useState<Budget[]>([])

  useEffect(() => {
    loadWallets()
    loadCategories()
    loadTransactions()
    db.budgets.toArray().then(setBudgets)
  }, [])

  const insights = generateInsights(transactions, transfers, budgets, categories, wallets)

  return (
    <div style={{ paddingTop: '16px', background: '#F9FAFB', minHeight: '100dvh' }}>
      <div style={{ padding: '0 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Halo! 👋</h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Kelola keuanganmu dengan bijak.</p>
        </div>
      </div>

      <BalanceHeroCard wallets={wallets} transactions={transactions} transfers={transfers} />
      <QuickActions />
      <SpendingChart transactions={transactions} />
      <CategoryDonut transactions={transactions} categories={categories} />
      <InsightCard insights={insights} />
      <WalletList wallets={wallets} transactions={transactions} transfers={transfers} />
      <RecentTransactions transactions={transactions} transfers={transfers} categories={categories} wallets={wallets} />
    </div>
  )
}