import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import TransactionItem from '@/components/shared/TransactionItem'
import type { Transaction, Transfer } from '@/database/db'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

type TabType = 'semua' | 'pemasukan' | 'pengeluaran' | 'transfer'
type PeriodType = 'hari_ini' | 'minggu_ini' | 'bulan_ini' | 'tahun_ini' | 'semua'

export default function Transactions() {
  const { wallets, categories, loadWallets, loadCategories } = useWalletStore()
  const { transactions, transfers, loadTransactions } = useTransactionStore()

  const [tab, setTab] = useState<TabType>('semua')
  const [period, setPeriod] = useState<PeriodType>('bulan_ini')
  const [search, setSearch] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('semua')

  useEffect(() => {
    loadWallets()
    loadCategories()
    loadTransactions()
  }, [])

  const now = new Date()

  function inPeriod(date: Date): boolean {
    const d = new Date(date)
    if (period === 'hari_ini') return d.toDateString() === now.toDateString()
    if (period === 'minggu_ini') {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      return d >= start
    }
    if (period === 'bulan_ini') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    if (period === 'tahun_ini') return d.getFullYear() === now.getFullYear()
    return true
  }

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? ''

  const getWalletName = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.name ?? ''

  const combined: ((Transaction & { kind: 'transaction' }) | (Transfer & { kind: 'transfer' }))[] = [
    ...transactions
      .filter((t) => {
        if (!inPeriod(t.date)) return false
        if (tab === 'pemasukan' && t.type !== 'income') return false
        if (tab === 'pengeluaran' && t.type !== 'expense') return false
        if (tab === 'transfer') return false
        if (selectedWallet !== 'semua' && t.walletId !== selectedWallet) return false
        if (search) {
          const q = search.toLowerCase()
          return (
            getCategoryName(t.categoryId).toLowerCase().includes(q) ||
            t.note?.toLowerCase().includes(q) ||
            getWalletName(t.walletId).toLowerCase().includes(q)
          )
        }
        return true
      })
      .map((t) => ({ ...t, kind: 'transaction' as const })),

    ...transfers
      .filter((t) => {
        if (!inPeriod(t.date)) return false
        if (tab === 'pemasukan' || tab === 'pengeluaran') return false
        if (selectedWallet !== 'semua' && t.fromWalletId !== selectedWallet && t.toWalletId !== selectedWallet) return false
        if (search) {
          const q = search.toLowerCase()
          return (
            t.note?.toLowerCase().includes(q) ||
            getWalletName(t.fromWalletId).toLowerCase().includes(q) ||
            getWalletName(t.toWalletId).toLowerCase().includes(q)
          )
        }
        return true
      })
      .map((t) => ({ ...t, kind: 'transfer' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Kelompokkan by tanggal
  const grouped = combined.reduce((acc, item) => {
    const dateKey = format(new Date(item.date), 'dd MMMM yyyy', { locale: id })
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(item)
    return acc
  }, {} as Record<string, typeof combined>)

  const tabs: { key: TabType; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'pemasukan', label: 'Pemasukan' },
    { key: 'pengeluaran', label: 'Pengeluaran' },
    { key: 'transfer', label: 'Transfer' },
  ]

  const periods: { key: PeriodType; label: string }[] = [
    { key: 'hari_ini', label: 'Hari ini' },
    { key: 'minggu_ini', label: 'Minggu ini' },
    { key: 'bulan_ini', label: 'Bulan ini' },
    { key: 'tahun_ini', label: 'Tahun ini' },
    { key: 'semua', label: 'Semua' },
  ]

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Transaksi</h1>
        </div>

        {/* Tab */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '6px 4px', borderRadius: '8px', border: 'none',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                background: tab === t.key ? '#7F77DD' : 'transparent',
                color: tab === t.key ? '#fff' : '#6B7280',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi atau catatan..."
            style={{
              width: '100%', padding: '8px 8px 8px 30px', borderRadius: '10px',
              border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none',
              boxSizing: 'border-box', background: '#F9FAFB',
            }}
          />
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {/* Wallet filter */}
          <select
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            style={{
              padding: '5px 10px', borderRadius: '20px', border: '1px solid #E5E7EB',
              fontSize: '12px', background: '#fff', cursor: 'pointer', outline: 'none',
              flexShrink: 0,
            }}
          >
            <option value="semua">Semua Dompet</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          {/* Period filter */}
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: '5px 12px', borderRadius: '20px', border: '1px solid #E5E7EB',
                fontSize: '12px', cursor: 'pointer', flexShrink: 0,
                background: period === p.key ? '#7F77DD' : '#fff',
                color: period === p.key ? '#fff' : '#6B7280',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '12px 0' }}>
        {Object.keys(grouped).length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9CA3AF', fontSize: '14px' }}>
            Tidak ada transaksi
          </div>
        )}

        {Object.entries(grouped).map(([dateKey, items]) => (
          <div key={dateKey} style={{ marginBottom: '8px' }}>
            <div style={{ padding: '4px 16px 6px', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
              {dateKey}
            </div>
            <div style={{ background: '#fff', borderRadius: '0' }}>
              {items.map((item) => (
                <TransactionItem
                  key={item.id}
                  item={item}
                  categories={categories}
                  wallets={wallets}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}