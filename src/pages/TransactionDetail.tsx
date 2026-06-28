import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { db } from '@/database/db'
import { format } from 'date-fns'
import { formatRupiah } from '@/utils/finance'
import type { Transaction, Transfer } from '@/database/db'

export default function TransactionDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const kind = searchParams.get('kind') as 'transaction' | 'transfer'

  const { wallets, categories, loadWallets, loadCategories } = useWalletStore()
  const { loadTransactions } = useTransactionStore()

  const [item, setItem] = useState<Transaction | Transfer | null>(null)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [walletId, setWalletId] = useState('')
  const [fromWalletId, setFromWalletId] = useState('')
  const [toWalletId, setToWalletId] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadWallets()
    loadCategories()
    loadItem()
  }, [id])

  async function loadItem() {
    if (!id) return
    if (kind === 'transfer') {
      const t = await db.transfers.get(id)
      if (!t) return
      setItem(t)
      setAmount(String(t.amount))
      setFromWalletId(t.fromWalletId)
      setToWalletId(t.toWalletId)
      setNote(t.note ?? '')
      setDate(format(new Date(t.date), 'yyyy-MM-dd'))
    } else {
      const t = await db.transactions.get(id)
      if (!t) return
      setItem(t)
      setAmount(String(t.amount))
      setCategoryId(t.categoryId)
      setWalletId(t.walletId)
      setNote(t.note ?? '')
      setDate(format(new Date(t.date), 'yyyy-MM-dd'))
    }
  }

  async function handleSave() {
    if (!id || !amount || Number(amount) <= 0) return
    setSaving(true)
    try {
      if (kind === 'transfer') {
        await db.transfers.update(id, {
          amount: Number(amount),
          fromWalletId,
          toWalletId,
          note,
          date: new Date(date),
        })
      } else {
        await db.transactions.update(id, {
          amount: Number(amount),
          categoryId,
          walletId,
          note,
          date: new Date(date),
          updatedAt: new Date(),
        })
      }
      await loadTransactions()
      navigate(-1)
    } catch (e) {
      alert('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    try {
      if (kind === 'transfer') {
        await db.transfers.delete(id)
      } else {
        await db.transactions.delete(id)
      }
      await loadTransactions()
      navigate('/transactions')
    } catch (e) {
      alert('Gagal menghapus')
    }
  }

  const filteredCategories = categories.filter((c) => {
    if (!item || kind === 'transfer') return true
    return c.type === (item as Transaction).type
  })

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '12px',
    border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box' as const, background: '#fff',
  }

  const labelStyle = {
    fontSize: '13px', fontWeight: 500, color: '#374151',
    marginBottom: '6px', display: 'block',
  }

  if (!item) return (
    <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Memuat...</div>
  )

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Detail Transaksi</h1>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C', display: 'flex', padding: 0 }}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Amount */}
        <div>
          <label style={labelStyle}>Nominal</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Rp</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '36px' }}
            />
          </div>
        </div>

        {/* Category */}
        {kind !== 'transfer' && (
          <div>
            <label style={labelStyle}>Kategori</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Wallet */}
        {kind !== 'transfer' && (
          <div>
            <label style={labelStyle}>Dompet</label>
            <select value={walletId} onChange={(e) => setWalletId(e.target.value)} style={inputStyle}>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Transfer wallets */}
        {kind === 'transfer' && (
          <>
            <div>
              <label style={labelStyle}>Dari</label>
              <select value={fromWalletId} onChange={(e) => setFromWalletId(e.target.value)} style={inputStyle}>
                {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ke</label>
              <select value={toWalletId} onChange={(e) => setToWalletId(e.target.value)} style={inputStyle}>
                {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Date */}
        <div>
          <label style={labelStyle}>Tanggal</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </div>

        {/* Note */}
        <div>
          <label style={labelStyle}>Catatan (Opsional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tambahkan catatan..."
            style={inputStyle}
          />
        </div>

        {/* Amount display */}
        <div style={{
          background: '#fff', borderRadius: '12px', padding: '14px 16px',
          border: '1px solid #E5E7EB', textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Total</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#7F77DD' }}>
            {formatRupiah(Number(amount) || 0)}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
            background: '#7F77DD', color: '#fff', fontSize: '15px', fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '24px 16px', width: '100%', maxWidth: '430px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>
              Hapus Transaksi?
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', marginBottom: '20px' }}>
              Transaksi ini akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  border: '1px solid #E5E7EB', background: '#fff',
                  fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: '#E74C3C', color: '#fff', fontSize: '14px',
                  fontWeight: 500, cursor: 'pointer',
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}