import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { getFilteredTransactions } from '@/services/statisticsService'
import { formatRupiah } from '@/utils/finance'
import TransactionItem from '@/components/shared/TransactionItem'

export default function StatisticsCategoryDetail() {
  const navigate = useNavigate()
  const { categoryId } = useParams()
  const [searchParams] = useSearchParams()
  const period = (searchParams.get('period') ?? 'month') as 'week' | 'month' | 'year' | 'all'

  const { categories, wallets, loadCategories, loadWallets } = useWalletStore()
  const { transactions, transfers, loadTransactions } = useTransactionStore()

  useEffect(() => {
    loadCategories()
    loadWallets()
    loadTransactions()
  }, [])

  const category = categories.find((c) => c.id === categoryId)
  const filtered = getFilteredTransactions(transactions, period)

  const catTransactions = filtered
    .filter((t) => t.type === 'expense' && t.categoryId === categoryId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((t) => ({ ...t, kind: 'transaction' as const }))

  const total = catTransactions.reduce((s, t) => s + t.amount, 0)
  const average = catTransactions.length > 0 ? Math.round(total / catTransactions.length) : 0

  const periodLabel: Record<string, string> = {
    week: 'Minggu Ini', month: 'Bulan Ini', year: 'Tahun Ini', all: 'Semua Waktu',
  }

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{category?.name ?? 'Detail Kategori'}</h1>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Summary */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: (category?.color ?? '#7F77DD') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: category?.color ?? '#7F77DD' }}>{category?.name.charAt(0) ?? '?'}</span>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{category?.name ?? '-'}</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{periodLabel[period]}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Total</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#E74C3C' }}>{formatRupiah(total)}</div>
            </div>
            <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Transaksi</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{catTransactions.length}x</div>
            </div>
            <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Rata-rata</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{formatRupiah(average)}</div>
            </div>
          </div>
        </div>

        {/* Transaction list */}
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, borderBottom: '1px solid #F3F4F6' }}>
            Riwayat Transaksi ({catTransactions.length})
          </div>
          {catTransactions.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
              Tidak ada transaksi
            </div>
          ) : (
            catTransactions.map((t) => (
              <TransactionItem key={t.id} item={t} categories={categories} wallets={wallets} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}