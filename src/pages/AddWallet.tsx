import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { db } from '@/database/db'

const COLORS = [
  '#E74C3C', '#E91E63', '#FF9800', '#F1C40F',
  '#2ECC71', '#27AE60', '#2196F3', '#0066AE',
  '#7F77DD', '#9B59B6', '#1ABC9C', '#118EEA',
]

const ICONS = ['B', 'D', 'O', 'C', 'M', 'G', 'S', 'T']

export default function AddWallet() {
  const navigate = useNavigate()
  const { loadWallets } = useWalletStore()

  const [name, setName] = useState('')
  const [color, setColor] = useState('#7F77DD')
  const [initialBalance, setInitialBalance] = useState('0')
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
    if (!name.trim()) return alert('Masukkan nama dompet')
    setSaving(true)
    try {
      await db.wallets.add({
        id: crypto.randomUUID(),
        name: name.trim(),
        icon: name.charAt(0).toUpperCase(),
        color,
        initialBalance: Number(initialBalance) || 0,
        isArchived: false,
        createdAt: new Date(),
      })
      await loadWallets()
      navigate(-1)
    } catch (e) {
      alert('Gagal menyimpan dompet')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Tambah Dompet</h1>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `3px solid ${color}`,
          }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color }}>{name.charAt(0) || '?'}</span>
          </div>
        </div>

        {/* Name */}
        <div>
          <label style={labelStyle}>Nama Dompet</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: BCA, DANA, Cash..."
            style={inputStyle}
          />
        </div>

        {/* Initial balance */}
        <div>
          <label style={labelStyle}>Saldo Awal</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Rp</span>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0"
              style={{ ...inputStyle, paddingLeft: '36px' }}
            />
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label style={labelStyle}>Warna</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: c, border: color === c ? `3px solid #1a1a2e` : '3px solid transparent',
                  cursor: 'pointer', outline: 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Save */}
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