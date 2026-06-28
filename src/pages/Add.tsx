import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Zap } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { db } from '@/database/db'
import { format } from 'date-fns'
import { parseQuickAdd, findBestMatch } from '@/services/quickAddParser'
import { formatRupiah } from '@/utils/finance'

type FormType = 'income' | 'expense' | 'transfer'
type ModeType = 'quick' | 'form'

export default function Add() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialType = (searchParams.get('type') as FormType) || 'expense'

  const { wallets, categories, loadWallets, loadCategories } = useWalletStore()
  const { loadTransactions } = useTransactionStore()

  const [mode, setMode] = useState<ModeType>('quick')
  const [type, setType] = useState<FormType>(initialType)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [walletId, setWalletId] = useState('')
  const [fromWalletId, setFromWalletId] = useState('')
  const [toWalletId, setToWalletId] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)

  // Quick add state
  const [quickInput, setQuickInput] = useState('')
  const [quickPreview, setQuickPreview] = useState<{
    amount: number
    categoryName: string
    walletName: string
    note: string
    isValid: boolean
    error?: string
    resolvedCategoryId?: string
    resolvedWalletId?: string
  } | null>(null)

  useEffect(() => {
    loadWallets()
    loadCategories()
  }, [])

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      const regular = wallets.filter((w) => !w.isGoal)
      setWalletId(regular[0]?.id ?? '')
      setFromWalletId(regular[0]?.id ?? '')
      setToWalletId(regular[1]?.id ?? regular[0]?.id ?? '')
    }
  }, [wallets])

  useEffect(() => {
    const filtered = categories.filter((c) =>
      type === 'income' ? c.type === 'income' : c.type === 'expense'
    )
    if (filtered.length > 0) setCategoryId(filtered[0].id)
  }, [type, categories])

  // Quick add preview
  useEffect(() => {
    if (!quickInput.trim()) { setQuickPreview(null); return }

    const parsed = parseQuickAdd(quickInput)
    if (!parsed.isValid) {
      setQuickPreview({ ...parsed, isValid: false })
      return
    }

    const expenseCategories = categories.filter((c) => c.type === 'expense')
    const categoryNames = expenseCategories.map((c) => c.name)
    const walletNames = wallets.filter((w) => !w.isGoal).map((w) => w.name)

    const matchedCatName = findBestMatch(parsed.categoryName, categoryNames)
    const matchedWalletName = findBestMatch(parsed.walletName, walletNames)

    const resolvedCat = expenseCategories.find((c) => c.name === matchedCatName)
    const resolvedWallet = wallets.find((w) => w.name === matchedWalletName)

    setQuickPreview({
      ...parsed,
      categoryName: matchedCatName || parsed.categoryName,
      walletName: matchedWalletName || parsed.walletName,
      resolvedCategoryId: resolvedCat?.id,
      resolvedWalletId: resolvedWallet?.id,
    })
  }, [quickInput, categories, wallets])

  async function handleQuickSave() {
    if (!quickPreview?.isValid) return
    if (!quickPreview.resolvedCategoryId) return alert(`Kategori "${quickPreview.categoryName}" tidak ditemukan`)
    if (!quickPreview.resolvedWalletId) return alert(`Dompet "${quickPreview.walletName}" tidak ditemukan`)

    setSaving(true)
    try {
      const now2 = new Date()
      await db.transactions.add({
        id: crypto.randomUUID(),
        type: 'expense',
        walletId: quickPreview.resolvedWalletId,
        categoryId: quickPreview.resolvedCategoryId,
        amount: quickPreview.amount,
        note: quickPreview.note,
        date: now2,
        createdAt: now2,
        updatedAt: now2,
      })
      await loadTransactions()
      navigate('/', { replace: true })
    } catch {
      alert('Gagal menyimpan transaksi')
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    if (!amount || Number(amount) <= 0) return alert('Masukkan nominal yang valid')
    if (type !== 'transfer' && !categoryId) return alert('Pilih kategori')
    if (type !== 'transfer' && !walletId) return alert('Pilih dompet')
    if (type === 'transfer' && fromWalletId === toWalletId) return alert('Dompet asal dan tujuan tidak boleh sama')

    setSaving(true)
    try {
      const now2 = new Date()
      const dateObj = new Date(date)
      dateObj.setHours(now2.getHours(), now2.getMinutes(), now2.getSeconds())

      if (type === 'transfer') {
        await db.transfers.add({
          id: crypto.randomUUID(),
          fromWalletId,
          toWalletId,
          amount: Number(amount),
          note,
          date: dateObj,
        })
      } else {
        await db.transactions.add({
          id: crypto.randomUUID(),
          type,
          walletId,
          categoryId,
          amount: Number(amount),
          note,
          date: dateObj,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      await loadTransactions()
      navigate('/', { replace: true })
    } catch {
      alert('Gagal menyimpan transaksi')
    } finally {
      setSaving(false)
    }
  }

  const filteredCategories = categories.filter((c) =>
    type === 'income' ? c.type === 'income' : c.type === 'expense'
  )

  const regularWallets = wallets.filter((w) => !w.isGoal)

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '12px',
    border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box' as const, background: '#fff',
  }

  const labelStyle = {
    fontSize: '13px', fontWeight: 500, color: '#374151',
    marginBottom: '6px', display: 'block',
  }

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Tambah Transaksi</h1>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', borderRadius: '10px', padding: '4px' }}>
          <button
            onClick={() => setMode('quick')}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: mode === 'quick' ? '#7F77DD' : 'transparent', color: mode === 'quick' ? '#fff' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Zap size={14} /> Tambah Cepat
          </button>
          <button
            onClick={() => setMode('form')}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: mode === 'form' ? '#7F77DD' : 'transparent', color: mode === 'form' ? '#fff' : '#6B7280' }}
          >
            Form Lengkap
          </button>
        </div>
      </div>

      {/* Quick Add Mode */}
      {mode === 'quick' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="25000 makan dana"
              autoFocus
              style={{ ...inputStyle, fontSize: '16px', padding: '14px' }}
            />
          </div>

          {/* Preview */}
          {quickPreview && (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              {quickPreview.isValid ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>Preview</span>
                    {quickPreview.resolvedCategoryId && quickPreview.resolvedWalletId
                      ? <span style={{ fontSize: '12px', background: '#E8F5E9', color: '#2ECC71', padding: '3px 8px', borderRadius: '10px' }}>✓ Siap disimpan</span>
                      : <span style={{ fontSize: '12px', background: '#FFEBEE', color: '#E74C3C', padding: '3px 8px', borderRadius: '10px' }}>⚠ Tidak cocok</span>
                    }
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>Nominal</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#E74C3C' }}>-{formatRupiah(quickPreview.amount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>Kategori</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: quickPreview.resolvedCategoryId ? '#111827' : '#E74C3C' }}>
                        {quickPreview.categoryName || '-'}
                        {!quickPreview.resolvedCategoryId && ' (tidak ditemukan)'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>Dompet</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: quickPreview.resolvedWalletId ? '#111827' : '#E74C3C' }}>
                        {quickPreview.walletName || '-'}
                        {!quickPreview.resolvedWalletId && ' (tidak ditemukan)'}
                      </span>
                    </div>
                    {quickPreview.note && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#6B7280' }}>Catatan</span>
                        <span style={{ fontSize: '13px' }}>{quickPreview.note}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ color: '#E74C3C', fontSize: '13px' }}>⚠ {quickPreview.error}</div>
              )}
            </div>
          )}

          {/* Tips */}
          <div style={{ background: '#F3F0FF', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#7F77DD', marginBottom: '8px' }}>
              💡 Tips Quick Add
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>Format: <strong>[nominal] [kategori] [dompet]</strong></span>
              <span>• 25000 makan dana</span>
              <span>• 15rb transportasi ovo</span>
              <span>• 500000 beasiswa bca</span>
              <span>• 1.5jt belanja cash catatan</span>
            </div>
          </div>

          <button
            onClick={handleQuickSave}
            disabled={saving || !quickPreview?.isValid || !quickPreview?.resolvedCategoryId || !quickPreview?.resolvedWalletId}
            style={{
              width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
              background: '#7F77DD', color: '#fff', fontSize: '15px', fontWeight: 600,
              cursor: 'pointer', opacity: (!quickPreview?.isValid || !quickPreview?.resolvedCategoryId || !quickPreview?.resolvedWalletId) ? 0.4 : 1,
              marginTop: '8px',
            }}
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      )}

      {/* Form Mode */}
      {mode === 'form' && (
        <div style={{ padding: '16px' }}>
          {/* Type toggle */}
          <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', borderRadius: '10px', padding: '4px', marginBottom: '16px' }}>
            {(['expense', 'income', 'transfer'] as FormType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: type === t ? '#7F77DD' : 'transparent', color: type === t ? '#fff' : '#6B7280' }}
              >
                {t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Transfer'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Amount */}
            <div>
              <label style={labelStyle}>Nominal</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Rp</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" style={{ ...inputStyle, paddingLeft: '36px' }} />
              </div>
            </div>

            {type !== 'transfer' && (
              <div>
                <label style={labelStyle}>Kategori</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
                  {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {type !== 'transfer' && (
              <div>
                <label style={labelStyle}>Dompet</label>
                <select value={walletId} onChange={(e) => setWalletId(e.target.value)} style={inputStyle}>
                  {regularWallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            )}

            {type === 'transfer' && (
              <>
                <div>
                  <label style={labelStyle}>Dari</label>
                  <select value={fromWalletId} onChange={(e) => setFromWalletId(e.target.value)} style={inputStyle}>
                    {wallets.map((w) => <option key={w.id} value={w.id}>{w.isGoal ? `🎯 ${w.name}` : w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Ke</label>
                  <select value={toWalletId} onChange={(e) => setToWalletId(e.target.value)} style={inputStyle}>
                    {wallets.map((w) => <option key={w.id} value={w.id}>{w.isGoal ? `🎯 ${w.name}` : w.name}</option>)}
                  </select>
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>Tanggal</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Catatan (Opsional)</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tambahkan catatan..." style={inputStyle} />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: '#7F77DD', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: '8px' }}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}