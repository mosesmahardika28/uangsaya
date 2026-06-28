import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { db } from '@/database/db'
import type { Budget } from '@/database/db'
import { formatRupiah } from '@/utils/finance'
import TransactionItem from '@/components/shared/TransactionItem'

export default function BudgetDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { categories, wallets, loadCategories, loadWallets } = useWalletStore()
  const { transactions, transfers, loadTransactions } = useTransactionStore()
  const [budget, setBudget] = useState<Budget | null>(null)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    loadCategories()
    loadWallets()
    loadTransactions()
    loadBudget()
  }, [id])

  async function loadBudget() {
    if (!id) return
    const data = await db.budgets.get(id)
    if (data) {
      setBudget(data)
      setAmount(String(data.amount))
    }
  }

  const now = new Date()
  const category = categories.find((c) => c.id === budget?.categoryId)

  const relatedTransactions = transactions
    .filter((t) => {
      const d = new Date(t.date)
      return (
        t.type === 'expense' &&
        t.categoryId === budget?.categoryId &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      )
    })
    .map((t) => ({ ...t, kind: 'transaction' as const }))

  const spent = relatedTransactions.reduce((s, t) => s + t.amount, 0)
  const percentage = budget ? Math.min(Math.round((spent / budget.amount) * 100), 100) : 0
  const remaining = (budget?.amount ?? 0) - spent
  const isOver = remaining < 0

  async function handleSave() {
    if (!id || !amount || Number(amount) <= 0) return
    setSaving(true)
    try {
      await db.budgets.update(id, { amount: Number(amount) })
      navigate(-1)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    await db.budgets.delete(id)
    navigate('/budget')
  }

  if (!budget) return <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Memuat...</div>

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Detail Budget</h1>
          </div>
          <button onClick={() => setShowDelete(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C', display: 'flex', padding: 0 }}>
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Category header */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: (category?.color ?? '#7F77DD') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: category?.color ?? '#7F77DD' }}>{category?.name.charAt(0) ?? '?'}</span>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{category?.name ?? '-'}</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                {now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ height: '10px', background: '#F3F4F6', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '5px', width: `${percentage}%`, background: isOver ? '#E74C3C' : percentage >= 80 ? '#FF9800' : '#7F77DD', transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#6B7280' }}>Terpakai: <strong>{formatRupiah(spent)}</strong></span>
            <span style={{ color: isOver ? '#E74C3C' : '#2ECC71', fontWeight: 600 }}>
              {isOver ? `Lebih ${formatRupiah(Math.abs(remaining))}` : `Sisa ${formatRupiah(remaining)}`}
            </span>
          </div>
        </div>

        {/* Edit amount */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Nominal Budget</div>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Rp</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#7F77DD', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>

        {/* Related transactions */}
        {relatedTransactions.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, borderBottom: '1px solid #F3F4F6' }}>
              Riwayat Transaksi
            </div>
            {relatedTransactions.map((t) => (
              <TransactionItem key={t.id} item={t} categories={categories} wallets={wallets} />
            ))}
          </div>
        )}
      </div>

      {/* Delete modal */}
      {showDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 16px', width: '100%', maxWidth: '430px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>Hapus Budget?</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', marginBottom: '20px' }}>Budget ini akan dihapus permanen.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowDelete(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '14px', cursor: 'pointer' }}>Batal</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#E74C3C', color: '#fff', fontSize: '14px', cursor: 'pointer' }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}