import { db } from './db'
import type { Wallet, Category, Transaction } from './db'

export async function seedDatabase() {
  // Cek flag di settings
  const settings = await db.settings.get('app-settings')
  
  // Kalau settings sudah ada, berarti app sudah pernah diinisialisasi
  if (settings) return

  const wallets: Wallet[] = [
    { id: 'w1', name: 'BCA', icon: 'B', color: '#0066AE', initialBalance: 0, isArchived: false, isGoal: false, createdAt: new Date() },
    { id: 'w2', name: 'DANA', icon: 'D', color: '#118EEA', initialBalance: 0, isArchived: false, isGoal: false, createdAt: new Date() },
    { id: 'w3', name: 'OVO', icon: 'O', color: '#4C3494', initialBalance: 0, isArchived: false, isGoal: false, createdAt: new Date() },
    { id: 'w4', name: 'Cash', icon: 'C', color: '#2ECC71', initialBalance: 0, isArchived: false, isGoal: false, createdAt: new Date() },
  ]

  const categories: Category[] = [
    { id: 'c1', name: 'Makan & Minum', type: 'expense', icon: 'M', color: '#E74C3C', isArchived: false },
    { id: 'c2', name: 'Transportasi', type: 'expense', icon: 'T', color: '#E67E22', isArchived: false },
    { id: 'c3', name: 'Kuliah', type: 'expense', icon: 'K', color: '#27AE60', isArchived: false },
    { id: 'c4', name: 'Belanja', type: 'expense', icon: 'B', color: '#9B59B6', isArchived: false },
    { id: 'c5', name: 'Hiburan', type: 'expense', icon: 'H', color: '#3498DB', isArchived: false },
    { id: 'c6', name: 'Organisasi', type: 'expense', icon: 'O', color: '#1ABC9C', isArchived: false },
    { id: 'c7', name: 'Beasiswa', type: 'income', icon: 'B', color: '#F1C40F', isArchived: false },
    { id: 'c8', name: 'Orang Tua', type: 'income', icon: 'O', color: '#E91E63', isArchived: false },
    { id: 'c9', name: 'Freelance', type: 'income', icon: 'F', color: '#00BCD4', isArchived: false },
  ]

  await db.wallets.bulkAdd(wallets)
  await db.categories.bulkAdd(categories)

  await db.settings.add({
    id: 'app-settings',
    currency: 'IDR',
    theme: 'system',
    firstDayOfWeek: 1,
  })

  console.log('Database seeded!')
}