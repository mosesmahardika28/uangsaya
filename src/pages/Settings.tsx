import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import {
  Wallet, Tag, Download, Upload, RotateCcw,
  Palette, Info, ChevronRight, Target, PiggyBank,
} from 'lucide-react'
import { exportJSON, exportCSV, importJSON, resetAllData } from '@/services/backupService'

export default function Settings() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [importing, setImporting] = useState(false)
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null)

  function showToast(message: string, success: boolean) {
    setToast({ message, success })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const result = await importJSON(file)
      showToast(result.message, result.success)
      if (result.success) setTimeout(() => window.location.reload(), 1500)
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  async function handleReset() {
    await resetAllData()
    setShowResetConfirm(false)
    showToast('Semua data berhasil direset', true)
    setTimeout(() => window.location.reload(), 1500)
  }

  function MenuItem({
    icon: Icon, label, value, onClick, color = '#6B7280', danger = false,
  }: {
    icon: React.ElementType
    label: string
    value?: string
    onClick: () => void
    color?: string
    danger?: boolean
  }) {
    return (
      <button
        onClick={onClick}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
          padding: '13px 16px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #F3F4F6',
        }}
      >
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={17} color={color} />
        </div>
        <span style={{ flex: 1, fontSize: '14px', color: danger ? '#E74C3C' : '#111827', fontWeight: 500 }}>{label}</span>
        {value && <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{value}</span>}
        <ChevronRight size={16} color="#D1D5DB" />
      </button>
    )
  }

  function SectionTitle({ title }: { title: string }) {
    return (
      <div style={{ padding: '14px 16px 6px', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </div>
    )
  }

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      <div style={{ padding: '16px', paddingBottom: '8px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Pengaturan</h1>
      </div>

      {/* Data & Backup */}
      <div style={{ background: '#fff', borderRadius: '16px', margin: '8px 16px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <SectionTitle title="Data & Backup" />
        <MenuItem
          icon={Download}
          label="Backup / Export Data"
          color="#2196F3"
          onClick={() => setShowExportMenu(true)}
        />
        <MenuItem
          icon={Upload}
          label={importing ? 'Mengimport...' : 'Import Data'}
          color="#2ECC71"
          onClick={() => fileInputRef.current?.click()}
        />
        <MenuItem
          icon={RotateCcw}
          label="Reset Data"
          color="#E74C3C"
          danger
          onClick={() => setShowResetConfirm(true)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>

      {/* Pengaturan Aplikasi */}
      <div style={{ background: '#fff', borderRadius: '16px', margin: '8px 16px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <SectionTitle title="Pengaturan Aplikasi" />
        <MenuItem icon={Palette} label="Tema" value="Sistem" color="#7F77DD" onClick={() => alert('Coming soon')} />
      </div>

      {/* Kelola */}
      <div style={{ background: '#fff', borderRadius: '16px', margin: '8px 16px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <SectionTitle title="Kelola" />
        <MenuItem icon={Wallet} label="Dompet" color="#0066AE" onClick={() => navigate('/wallets')} />
        <MenuItem icon={Tag} label="Kategori" color="#9B59B6" onClick={() => navigate('/categories')} />
        <MenuItem icon={PiggyBank} label="Budget" color="#FF9800" onClick={() => navigate('/budget')} />
        <MenuItem icon={Target} label="Goal" color="#2ECC71" onClick={() => navigate('/goal')} />
      </div>

      {/* Lainnya */}
      <div style={{ background: '#fff', borderRadius: '16px', margin: '8px 16px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <SectionTitle title="Lainnya" />
        <MenuItem icon={Info} label="Tentang Aplikasi" value="Versi 1.0.0" color="#6B7280" onClick={() => alert('UangSaya v1.0.0')} />
      </div>

      {/* Export menu modal */}
      {showExportMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 16px', width: '100%', maxWidth: '430px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Export Data</h3>
            <button
              onClick={async () => { await exportJSON(); setShowExportMenu(false); showToast('File JSON berhasil didownload', true) }}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <Download size={18} color="#2196F3" />
              Export JSON (Backup lengkap)
            </button>
            <button
              onClick={async () => { await exportCSV(); setShowExportMenu(false); showToast('File CSV berhasil didownload', true) }}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <Download size={18} color="#2ECC71" />
              Export CSV (Transaksi saja)
            </button>
            <button
              onClick={() => setShowExportMenu(false)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '14px', cursor: 'pointer' }}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Reset confirm modal */}
      {showResetConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 16px', width: '100%', maxWidth: '430px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>Reset Semua Data?</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', marginBottom: '20px' }}>
              Semua data termasuk transaksi, dompet, budget, dan goal akan dihapus permanen. Pastikan kamu sudah backup terlebih dahulu!
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowResetConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '14px', cursor: 'pointer' }}>Batal</button>
              <button onClick={handleReset} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#E74C3C', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: toast.success ? '#2ECC71' : '#E74C3C', color: '#fff',
          padding: '12px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 200, whiteSpace: 'nowrap',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  )
}