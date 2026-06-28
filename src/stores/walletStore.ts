import { create } from 'zustand'
import { db } from '@/database/db'
import type { Wallet, Category } from '@/database/db'

interface WalletStore {
  wallets: Wallet[]
  categories: Category[]
  isLoading: boolean
  loadWallets: () => Promise<void>
  loadCategories: () => Promise<void>
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallets: [],
  categories: [],
  isLoading: false,
  loadWallets: async () => {
    set({ isLoading: true })
    const wallets = await db.wallets.toArray()
    const active = wallets.filter((w) => !w.isArchived)
    set({ wallets: active, isLoading: false })
  },
  loadCategories: async () => {
    const categories = await db.categories.toArray()
    set({ categories })
  },
}))