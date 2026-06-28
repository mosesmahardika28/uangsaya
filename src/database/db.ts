import Dexie, { type EntityTable } from 'dexie'

export interface Wallet {
  id: string
  name: string
  icon: string
  color: string
  initialBalance: number
  isArchived: boolean
  isGoal: boolean
  goalTarget?: number
  goalDeadline?: Date
  goalNote?: string
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  isArchived: boolean
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  walletId: string
  categoryId: string
  amount: number
  note: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface Transfer {
  id: string
  fromWalletId: string
  toWalletId: string
  amount: number
  note: string
  date: Date
}

export interface Budget {
  id: string
  categoryId: string
  amount: number
  period: 'monthly'
}

export interface Settings {
  id: string
  currency: string
  theme: 'light' | 'dark' | 'system'
  firstDayOfWeek: 0 | 1
}

class UangSayaDB extends Dexie {
  wallets!: EntityTable<Wallet, 'id'>
  categories!: EntityTable<Category, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  transfers!: EntityTable<Transfer, 'id'>
  budgets!: EntityTable<Budget, 'id'>
  settings!: EntityTable<Settings, 'id'>

  constructor() {
    super('UangSayaDB')
    this.version(1).stores({
      wallets: 'id, name, isArchived, isGoal, createdAt',
      categories: 'id, name, type, isArchived',
      transactions: 'id, type, walletId, categoryId, date, createdAt',
      transfers: 'id, fromWalletId, toWalletId, date',
      budgets: 'id, categoryId',
      settings: 'id',
    })
    this.version(2).stores({
      wallets: 'id, name, isArchived, isGoal, createdAt',
      categories: 'id, name, type, isArchived',
      transactions: 'id, type, walletId, categoryId, date, createdAt',
      transfers: 'id, fromWalletId, toWalletId, date',
      budgets: 'id, categoryId',
      settings: 'id',
    }).upgrade(async (tx) => {
      await tx.table('wallets').toCollection().modify((wallet) => {
        if (wallet.isGoal === undefined) wallet.isGoal = false
      })
    })
  }
}

export const db = new UangSayaDB()