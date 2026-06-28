import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { Wallet, Transaction, Transfer } from '@/database/db'
import { calculateBalance, formatRupiah } from '@/utils/finance'

interface Props {
  wallets: Wallet[]
  transactions: Transaction[]
  transfers: Transfer[]
}

export default function WalletList({ wallets, transactions, transfers }: Props) {
  const navigate = useNavigate()
  const activeWallets = wallets.filter((w) => !w.isGoal)

  return (
    <div style={{ padding: '0 16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '15px', fontWeight: 600 }}>Dompet Saya</span>
        <span style={{ fontSize: '13px', color: '#7F77DD', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
          Lihat Semua
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {wallets.map((wallet) => {
          const balance = calculateBalance(wallet, transactions, transfers)
          return (
            <div key={wallet.id} style={{
              minWidth: '110px', background: '#fff', borderRadius: '14px',
              padding: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
              flexShrink: 0, cursor: 'pointer',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: wallet.color + '22', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: '8px',
              }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: wallet.color }}>
                  {wallet.name.charAt(0)}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{wallet.name}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>{formatRupiah(balance)}</div>
            </div>
          )
        })}

        <div
          onClick={() => navigate('/settings')}
          style={{
            minWidth: '80px', background: '#F9FAFB', borderRadius: '14px',
            padding: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
            flexShrink: 0, cursor: 'pointer', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
          }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plus size={18} color="#9CA3AF" />
          </div>
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Tambah</span>
        </div>
      </div>
    </div>
  )
}