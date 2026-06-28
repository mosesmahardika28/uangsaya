import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Archive } from 'lucide-react'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { db } from '@/database/db'
import { calculateBalance, formatRupiah } from '@/utils/finance'

export default function Wallets() {
  const navigate = useNavigate()
  const { wallets, loadWallets } = useWalletStore()
  const { transactions, transfers, loadTransactions } = useTransactionStore()
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    loadWallets()
    loadTransactions()
  }, [])

  async function handleArchive(walletId: string) {
    const hasTransactions = await db.transactions.where('walletId').equals(walletId).count()
    const hasTransfers = await db.transfers
      .filter((t) => t.fromWalletId === walletId || t.toWalletId === walletId)
      .count()

    if (hasTransactions > 0 || hasTransfers > 0) {
      alert('Dompet tidak dapat dihapus karena memiliki transaksi. Dompet akan diarsipkan.')
      await db.wallets.update(walletId, { isArchived: true })
    } else {
      await db.wallets.delete(walletId)
    }
    await loadWallets()
  }

  const activeWallets = wallets.filter((w) => !w.isArchived && !w.isGoal)
  const totalBalance = activeWallets.reduce(
    (sum, w) => sum + calculateBalance(w, transactions, transfers), 0
  )

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Dompet</h1>
          </div>
          <button
            onClick={() => navigate('/wallets/add')}
            style={{ background: '#7F77DD', border: 'none', borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Tambah
          </button>
        </div>

        {/* Total saldo */}
        <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '16px 20px', color: '#fff' }}>
          <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px' }}>Total Saldo</div>
          <div style={{ fontSize: '26px', fontWeight: 700 }}>{formatRupiah(totalBalance)}</div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Active wallets */}
        <div style={{ marginBottom: '16px' }}>
          {activeWallets.map((wallet) => {
            const balance = calculateBalance(wallet, transactions, transfers)
            return (
              <div key={wallet.id} style={{
                background: '#fff', borderRadius: '14px', padding: '14px 16px',
                marginBottom: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: wallet.color + '22', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: wallet.color }}>
                    {wallet.name.charAt(0)}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>{wallet.name}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{formatRupiah(balance)}</div>
                </div>
                <button
                  onClick={() => handleArchive(wallet.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}
                >
                  <Archive size={18} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Add wallet button */}
        <button
          onClick={() => navigate('/wallets/add')}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            border: '2px dashed #E5E7EB', background: 'transparent',
            fontSize: '14px', color: '#7F77DD', fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
          }}
        >
          <Plus size={18} /> Tambah Dompet
        </button>
      </div>
    </div>
  )
}