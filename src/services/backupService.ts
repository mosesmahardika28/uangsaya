import { db } from '@/database/db'

export interface BackupData {
  version: number
  exportedAt: string
  wallets: object[]
  categories: object[]
  transactions: object[]
  transfers: object[]
  budgets: object[]
  settings: object[]
}

export async function exportJSON(): Promise<void> {
  const [wallets, categories, transactions, transfers, budgets, settings] =
    await Promise.all([
      db.wallets.toArray(),
      db.categories.toArray(),
      db.transactions.toArray(),
      db.transfers.toArray(),
      db.budgets.toArray(),
      db.settings.toArray(),
    ])

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    wallets,
    categories,
    transactions,
    transfers,
    budgets,
    settings,
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `uangsaya-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportCSV(): Promise<void> {
  const [transactions, wallets, categories] = await Promise.all([
    db.transactions.toArray(),
    db.wallets.toArray(),
    db.categories.toArray(),
  ])

  const getWalletName = (id: string) => wallets.find((w) => w.id === id)?.name ?? '-'
  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '-'

  const rows = [
    ['Tanggal', 'Tipe', 'Kategori', 'Dompet', 'Nominal', 'Catatan'],
    ...transactions.map((t) => [
      new Date(t.date).toLocaleDateString('id-ID'),
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      getCategoryName(t.categoryId),
      getWalletName(t.walletId),
      t.amount,
      t.note ?? '',
    ]),
  ]

  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `uangsaya-transaksi-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importJSON(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text()
    const data: BackupData = JSON.parse(text)

    if (!data.version || !data.wallets || !data.transactions) {
      return { success: false, message: 'File backup tidak valid' }
    }

    // Clear semua data lama
    await Promise.all([
      db.wallets.clear(),
      db.categories.clear(),
      db.transactions.clear(),
      db.transfers.clear(),
      db.budgets.clear(),
      db.settings.clear(),
    ])

    // Import data baru
    await Promise.all([
      db.wallets.bulkAdd(data.wallets as never[]),
      db.categories.bulkAdd(data.categories as never[]),
      db.transactions.bulkAdd(data.transactions as never[]),
      db.transfers.bulkAdd(data.transfers as never[]),
      db.budgets.bulkAdd(data.budgets as never[]),
      data.settings?.length ? db.settings.bulkAdd(data.settings as never[]) : Promise.resolve(),
    ])

    return { success: true, message: 'Data berhasil diimport!' }
  } catch (e) {
    return { success: false, message: 'Gagal membaca file backup' }
  }
}

export async function resetAllData(): Promise<void> {
  await Promise.all([
    db.wallets.clear(),
    db.categories.clear(),
    db.transactions.clear(),
    db.transfers.clear(),
    db.budgets.clear(),
    db.settings.clear(),
  ])
}