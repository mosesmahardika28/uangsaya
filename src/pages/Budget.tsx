import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { db } from '@/database/db'
import type { Budget } from '@/database/db'
import { formatRupiah } from '@/utils/finance'

export default function Budget() {
  const navigate = useNavigate()
  const { categories, loadCategories } = useWalletStore()
  const { transactions, loadTransactions } = useTransactionStore()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [tab, setTab] = useState<'active' | 'done'>('active')

  useEffect(() => {
    loadCategories()
    loadTransactions()
    loadBudgets()
  }, [])

  async function loadBudgets() {
    const data = await db.budgets.toArray()
    setBudgets(data)
  }

  const now = new Date()

  function getSpent(categoryId: string) {
    return transactions
      .filter((t) => {
        const d = new Date(t.date)
        return (
          t.type === 'expense' &&
          t.categoryId === categoryId &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        )
      })
      .reduce((s, t) => s + t.amount, 0)
  }

  const activeBudgets = budgets.filter((b) => getSpent(b.categoryId) < b.amount)
  const doneBudgets = budgets.filter((b) => getSpent(b.categoryId) >= b.amount)
  const displayBudgets = tab === 'active' ? activeBudgets : doneBudgets

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Budget</h1>
          <button
            onClick={() => navigate('/budget/add')}
            style={{ background: '#7F77DD', border: 'none', borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Tambah
          </button>
        </div>

        {/* Tab */}
        <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', borderRadius: '10px', padding: '4px' }}>
          {([{ key: 'active', label: 'Aktif' }, { key: 'done', label: 'Selesai' }] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                background: tab === t.key ? '#7F77DD' : 'transparent',
                color: tab === t.key ? '#fff' : '#6B7280',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {displayBudgets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9CA3AF', fontSize: '14px' }}>
            {tab === 'active' ? 'Belum ada budget aktif' : 'Belum ada budget selesai'}
          </div>
        )}

        {displayBudgets.map((budget) => {
          const category = categories.find((c) => c.id === budget.categoryId)
          const spent = getSpent(budget.categoryId)
          const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100)
          const remaining = budget.amount - spent
          const isWarning = percentage >= 80
          const isOver = spent >= budget.amount

          return (
            <div
              key={budget.id}
              onClick={() => navigate(`/budget/${budget.id}`)}
              style={{
                background: '#fff', borderRadius: '16px', padding: '16px',
                marginBottom: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: (category?.color ?? '#7F77DD') + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: category?.color ?? '#7F77DD' }}>
                    {category?.name.charAt(0) ?? '?'}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>{category?.name ?? '-'}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Budget: {formatRupiah(budget.amount)}</div>
                </div>
                {isWarning && !isOver && (
                  <span style={{ fontSize: '11px', background: '#FFF3E0', color: '#FF9800', padding: '3px 8px', borderRadius: '10px', fontWeight: 500 }}>
                    ⚠️ Hampir habis
                  </span>
                )}
                {isOver && (
                  <span style={{ fontSize: '11px', background: '#FFEBEE', color: '#E74C3C', padding: '3px 8px', borderRadius: '10px', fontWeight: 500 }}>
                    🔴 Melebihi
                  </span>
                )}
              </div>

              {/* Progress */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px',
                    width: `${percentage}%`,
                    background: isOver ? '#E74C3C' : isWarning ? '#FF9800' : '#7F77DD',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#6B7280' }}>Terpakai: {formatRupiah(spent)}</span>
                <span style={{ color: isOver ? '#E74C3C' : '#2ECC71', fontWeight: 500 }}>
                  {isOver ? `Lebih ${formatRupiah(Math.abs(remaining))}` : `Sisa ${formatRupiah(remaining)}`}
                </span>
              </div>
            </div>
          )
        })}

        <button
          onClick={() => navigate('/budget/add')}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            border: '2px dashed #E5E7EB', background: 'transparent',
            fontSize: '14px', color: '#7F77DD', fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', marginTop: '4px',
          }}
        >
          <Plus size={18} /> Tambah Budget
        </button>
      </div>
    </div>
  )
}