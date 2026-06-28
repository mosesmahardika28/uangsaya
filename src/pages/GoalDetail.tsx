import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, ArrowDownLeft } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { db } from '@/database/db'
import type { Wallet } from '@/database/db'
import { formatRupiah, calculateBalance } from '@/utils/finance'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function GoalDetail() {
  const navigate = useNavigate()
  const { id: goalId } = useParams()
  const { wallets, loadWallets } = useWalletStore()
  const { transactions, transfers, loadTransactions } = useTransactionStore()

  const [goal, setGoal] = useState<Wallet | null>(null)
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  // Transfer dana state
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [fromWalletId, setFromWalletId] = useState('')
  const [transferSaving, setTransferSaving] = useState(false)

  useEffect(() => {
    loadWallets()
    loadTransactions()
    loadGoal()
  }, [goalId])

  async function loadGoal() {
    if (!goalId) return
    const data = await db.wallets.get(goalId)
    if (data) {
      setGoal(data)
      setName(data.name)
      setTargetAmount(String(data.goalTarget ?? 0))
      setDeadline(data.goalDeadline ? format(new Date(data.goalDeadline), 'yyyy-MM-dd') : '')
      setNote(data.goalNote ?? '')
    }
  }

  const regularWallets = wallets.filter((w) => !w.isGoal && !w.isArchived)

  useEffect(() => {
    if (regularWallets.length > 0 && !fromWalletId) {
      setFromWalletId(regularWallets[0].id)
    }
  }, [wallets])

  async function handleSave() {
    if (!goalId) return
    setSaving(true)
    try {
      await db.wallets.update(goalId, {
        name,
        goalTarget: Number(targetAmount),
        goalDeadline: deadline ? new Date(deadline) : undefined,
        goalNote: note,
      })
      await loadWallets()
      navigate(-1)
    } finally {
      setSaving(false)
    }
  }

  async function handleTransfer() {
    if (!goalId || !transferAmount || Number(transferAmount) <= 0) return alert('Masukkan nominal')
    if (!fromWalletId) return alert('Pilih dompet asal')

    const sourceWallet = wallets.find((w) => w.id === fromWalletId)
    const sourceBalance = sourceWallet ? calculateBalance(sourceWallet, transactions, transfers) : 0
    if (Number(transferAmount) > sourceBalance) return alert(`Saldo ${sourceWallet?.name} tidak cukup`)

    setTransferSaving(true)
    try {
      await db.transfers.add({
        id: crypto.randomUUID(),
        fromWalletId,
        toWalletId: goalId,
        amount: Number(transferAmount),
        note: `Tabungan ke ${goal?.name}`,
        date: new Date(),
      })
      await loadTransactions()
      setTransferAmount('')
      setShowTransfer(false)
    } catch (e) {
      alert('Gagal transfer dana')
    } finally {
      setTransferSaving(false)
    }
  }

  async function handleDelete() {
    if (!goalId) return
    const hasTransfers = await db.transfers
      .filter((t) => t.fromWalletId === goalId || t.toWalletId === goalId)
      .count()
    if (hasTransfers > 0) {
      await db.wallets.update(goalId, { isArchived: true })
    } else {
      await db.wallets.delete(goalId)
    }
    await loadWallets()
    navigate('/goal')
  }

  if (!goal) return <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Memuat...</div>

  const current = calculateBalance(goal, transactions, transfers)
  const target = goal.goalTarget ?? 0
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
  const isDone = current >= target
  const remaining = target - current

  // Riwayat transfer masuk ke goal
  const goalTransfers = transfers
    .filter((t) => t.toWalletId === goalId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Detail Goal</h1>
          </div>
          <button onClick={() => setShowDelete(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C', display: 'flex', padding: 0 }}>
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Progress card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: goal.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: goal.color }}>{goal.name.charAt(0)}</span>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{goal.name}</div>
              {goal.goalDeadline && (
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Target: {format(new Date(goal.goalDeadline), 'dd MMM yyyy', { locale: id })}
                </div>
              )}
            </div>
            {isDone && (
              <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#E8F5E9', color: '#2ECC71', padding: '3px 8px', borderRadius: '10px' }}>
                ✅ Tercapai
              </span>
            )}
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={{ height: '10px', background: '#F3F4F6', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '5px', width: `${percentage}%`, background: isDone ? '#2ECC71' : goal.color, transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
            <span style={{ color: '#6B7280' }}>Terkumpul: <strong>{formatRupiah(current)}</strong></span>
            <span style={{ fontWeight: 600, color: isDone ? '#2ECC71' : goal.color }}>{percentage}%</span>
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>
            Target: <strong>{formatRupiah(target)}</strong>
            {!isDone && <span style={{ marginLeft: '8px', color: '#E74C3C' }}>• Sisa {formatRupiah(remaining)}</span>}
          </div>

          {/* Tombol tambah dana */}
          {!isDone && (
            <button
              onClick={() => setShowTransfer(true)}
              style={{
                width: '100%', marginTop: '14px', padding: '11px', borderRadius: '12px',
                border: 'none', background: goal.color, color: '#fff',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <ArrowDownLeft size={16} /> Tambah Dana
            </button>
          )}
        </div>

        {/* Riwayat transfer */}
        {goalTransfers.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, borderBottom: '1px solid #F3F4F6' }}>
              Riwayat Tabungan
            </div>
            {goalTransfers.map((t, i) => {
              const fromWallet = wallets.find((w) => w.id === t.fromWalletId)
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: i < goalTransfers.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ArrowDownLeft size={16} color="#2ECC71" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>Dari {fromWallet?.name ?? '-'}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      {format(new Date(t.date), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#2ECC71' }}>+{formatRupiah(t.amount)}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Edit form */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Edit Goal</div>
          <div>
            <label style={labelStyle}>Nama Goal</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Target Nominal</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#6B7280' }}>Rp</span>
              <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} style={{ ...inputStyle, paddingLeft: '36px' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Target Tanggal</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Catatan</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#7F77DD', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Modal tambah dana */}
      {showTransfer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 16px', width: '100%', maxWidth: '430px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Tambah Dana ke {goal.name}</h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Dari Dompet</label>
              <select value={fromWalletId} onChange={(e) => setFromWalletId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', background: '#fff' }}>
                {regularWallets.map((w) => {
                  const bal = calculateBalance(w, transactions, transfers)
                  return <option key={w.id} value={w.id}>{w.name} — {formatRupiah(bal)}</option>
                })}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Nominal</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#6B7280' }}>Rp</span>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0"
                  autoFocus
                  style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowTransfer(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '14px', cursor: 'pointer' }}>Batal</button>
              <button onClick={handleTransfer} disabled={transferSaving} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: goal.color, color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                {transferSaving ? 'Memproses...' : 'Tambah Dana'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hapus */}
      {showDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 16px', width: '100%', maxWidth: '430px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>Hapus Goal?</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', marginBottom: '20px' }}>Goal ini akan dihapus permanen.</p>
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