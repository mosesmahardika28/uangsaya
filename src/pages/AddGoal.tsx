import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { db } from '@/database/db'
import { format } from 'date-fns'

const COLORS = [
  '#E74C3C', '#E91E63', '#FF9800', '#F1C40F',
  '#2ECC71', '#27AE60', '#2196F3', '#0066AE',
  '#7F77DD', '#9B59B6', '#1ABC9C', '#118EEA',
]

export default function AddGoal() {
  const navigate = useNavigate()
  const { loadWallets } = useWalletStore()
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [initialAmount, setInitialAmount] = useState('0')
  const [deadline, setDeadline] = useState(
    format(new Date(new Date().setMonth(new Date().getMonth() + 3)), 'yyyy-MM-dd')
  )
  const [note, setNote] = useState('')
  const [color, setColor] = useState('#7F77DD')
  const [saving, setSaving] = useState(false)

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
    if (!name.trim()) return alert('Masukkan nama goal')
    if (!targetAmount || Number(targetAmount) <= 0) return alert('Masukkan target nominal')

    setSaving(true)
    try {
      await db.wallets.add({
        id: crypto.randomUUID(),
        name: name.trim(),
        icon: name.charAt(0).toUpperCase(),
        color,
        initialBalance: Number(initialAmount) || 0,
        isArchived: false,
        isGoal: true,
        goalTarget: Number(targetAmount),
        goalDeadline: new Date(deadline),
        goalNote: note.trim(),
        createdAt: new Date(),
      })
      await loadWallets()
      navigate(-1)
    } catch (e) {
      alert('Gagal menyimpan goal')
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
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Tambah Goal</h1>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${color}` }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color }}>{name.charAt(0) || '?'}</span>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Nama Goal</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Laptop, Dana Darurat..." style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Target Nominal</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#6B7280' }}>Rp</span>
            <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0" style={{ ...inputStyle, paddingLeft: '36px' }} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Dana Awal (opsional)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#6B7280' }}>Rp</span>
            <input type="number" value={initialAmount} onChange={(e) => setInitialAmount(e.target.value)} placeholder="0" style={{ ...inputStyle, paddingLeft: '36px' }} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Target Tanggal</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Catatan (opsional)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan tambahan..." style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Warna</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} style={{ width: '34px', height: '34px', borderRadius: '50%', background: c, border: color === c ? '3px solid #1a1a2e' : '3px solid transparent', cursor: 'pointer', outline: 'none' }} />
            ))}
          </div>
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
  )
}