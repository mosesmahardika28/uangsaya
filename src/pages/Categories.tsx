import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Archive } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { db } from '@/database/db'
import type { Category } from '@/database/db'

type TabType = 'expense' | 'income'

export default function Categories() {
  const navigate = useNavigate()
  const { categories, loadCategories } = useWalletStore()
  const [tab, setTab] = useState<TabType>('expense')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#7F77DD')
  const [saving, setSaving] = useState(false)

  const COLORS = [
    '#E74C3C', '#E91E63', '#FF9800', '#F1C40F',
    '#2ECC71', '#27AE60', '#2196F3', '#0066AE',
    '#7F77DD', '#9B59B6', '#1ABC9C', '#118EEA',
  ]

  useEffect(() => {
    loadCategories()
  }, [])

  const activeCategories = categories.filter(
    (c) => c.type === tab && !c.isArchived
  )

  async function handleArchive(cat: Category) {
    const usedCount = await db.transactions
      .where('categoryId').equals(cat.id).count()

    if (usedCount > 0) {
      alert(`Kategori "${cat.name}" digunakan di ${usedCount} transaksi. Kategori akan diarsipkan.`)
      await db.categories.update(cat.id, { isArchived: true })
    } else {
      await db.categories.delete(cat.id)
    }
    await loadCategories()
  }

  async function handleAdd() {
    if (!newName.trim()) return alert('Masukkan nama kategori')
    setSaving(true)
    try {
      await db.categories.add({
        id: crypto.randomUUID(),
        name: newName.trim(),
        type: tab,
        icon: newName.charAt(0).toUpperCase(),
        color: newColor,
        isArchived: false,
      })
      await loadCategories()
      setNewName('')
      setNewColor('#7F77DD')
      setShowAddModal(false)
    } catch (e) {
      alert('Gagal menyimpan kategori')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '12px',
    border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box' as const, background: '#fff',
  }

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Kategori</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ background: '#7F77DD', border: 'none', borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Tambah
          </button>
        </div>

        {/* Tab */}
        <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', borderRadius: '10px', padding: '4px' }}>
          {([
            { key: 'expense', label: 'Pengeluaran' },
            { key: 'income', label: 'Pemasukan' },
          ] as { key: TabType; label: string }[]).map((t) => (
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

      {/* List */}
      <div style={{ padding: '16px' }}>
        {activeCategories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9CA3AF', fontSize: '14px' }}>
            Belum ada kategori
          </div>
        )}

        {activeCategories.map((cat) => (
          <div key={cat.id} style={{
            background: '#fff', borderRadius: '14px', padding: '14px 16px',
            marginBottom: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: cat.color + '22', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: cat.color }}>
                {cat.name.charAt(0)}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>{cat.name}</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                {cat.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
              </div>
            </div>
            <button
              onClick={() => handleArchive(cat)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}
            >
              <Archive size={18} />
            </button>
          </div>
        ))}

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            border: '2px dashed #E5E7EB', background: 'transparent',
            fontSize: '14px', color: '#7F77DD', fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', marginTop: '4px',
          }}
        >
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '24px 16px', width: '100%', maxWidth: '430px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Tambah Kategori {tab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </h3>

            {/* Preview */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: newColor + '22', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                border: `3px solid ${newColor}`,
              }}>
                <span style={{ fontSize: '22px', fontWeight: 700, color: newColor }}>
                  {newName.charAt(0) || '?'}
                </span>
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>
                Nama Kategori
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Makan, Transportasi..."
                style={inputStyle}
                autoFocus
              />
            </div>

            {/* Color */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
                Warna
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: c, border: newColor === c ? '3px solid #1a1a2e' : '3px solid transparent',
                      cursor: 'pointer', outline: 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setShowAddModal(false); setNewName(''); }}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  border: '1px solid #E5E7EB', background: '#fff',
                  fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: '#7F77DD', color: '#fff', fontSize: '14px',
                  fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}