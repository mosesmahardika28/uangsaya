import { create } from 'zustand'
import { db } from '@/database/db'
import type { Transaction, Transfer } from '@/database/db'

interface TransactionStore {
  transactions: Transaction[]
  transfers: Transfer[]
  isLoading: boolean
  loadTransactions: () => Promise<void>
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  transfers: [],
  isLoading: false,
  loadTransactions: async () => {
    set({ isLoading: true })
    const [transactions, transfers] = await Promise.all([
      db.transactions.orderBy('date').reverse().toArray(),
      db.transfers.orderBy('date').reverse().toArray(),
    ])
    set({ transactions, transfers, isLoading: false })
  },
}))