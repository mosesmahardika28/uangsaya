import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { db } from '@/database/db'

export default function AddBudget() {
  const navigate = useNavigate()
  const { categories, loadCategories } = useWalletStore()
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const expenseCategories = categories.filter((c) => c.type === 'expense' && !c.isArchived)
    if (expenseCategories.length > 0 && !categoryId) {
      setCategoryId(expenseCategories[0].id)
    }
  }, [categories])

  const expenseCategories = categories.filter((c) => c.type === 'expense' && !c.isArchived)

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '12px',
    border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box' as const, background: '#fff',
  }

  const labelStyle = {
    fontSize: '13px', fontWeight: 500, color: '#374151',
    marginBottom: '6px', display: 'block',
  }

  async function handleSave() {
    if (!categoryId) return alert('Pilih kategori')
    if (!amount || Number(amount) <= 0) return alert('Masukkan nominal budget')

    const existing = await db.budgets.where('categoryId').equals(categoryId).first()
    if (existing) return alert('Budget untuk kategori ini sudah ada')

    setSaving(true)
    try {
      await db.budgets.add({
        id: crypto.randomUUID(),
        categoryId,
        amount: Number(amount),
        period: 'monthly',
      })
      navigate(-1)
    } catch (e) {
      alert('Gagal menyimpan budget')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Tambah Budget</h1>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Kategori</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Nominal Budget (per bulan)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Rp</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              style={{ ...inputStyle, paddingLeft: '36px' }}
            />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Periode</div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>
            {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
            background: '#7F77DD', color: '#fff', fontSize: '15px', fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            marginTop: '8px',
          }}
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}