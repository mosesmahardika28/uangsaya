import { useState } from 'react'
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react'
import { formatRupiah, calculateTotalBalance, getMonthSummary, getMonthComparison } from '@/utils/finance'
import type { Wallet, Transaction, Transfer } from '@/database/db'

interface Props {
  wallets: Wallet[]
  transactions: Transaction[]
  transfers: Transfer[]
}

export default function BalanceHeroCard({ wallets, transactions, transfers }: Props) {
  const [visible, setVisible] = useState(true)
  const totalBalance = calculateTotalBalance(wallets, transactions, transfers)
  const { income, expense, balance } = getMonthSummary(transactions)
  const balanceComparison = getMonthComparison(transactions, 'income')

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: '20px',
      padding: '20px',
      margin: '16px',
      color: '#fff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Total Saldo
            <button onClick={() => setVisible(!visible)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0, display: 'flex' }}>
              {visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
          <div style={{ fontSize: 'clamp(16px, 5vw, 28px)', fontWeight: 600, letterSpacing: '-0.5px', wordBreak: 'break-all' }}>
            {visible ? formatRupiah(totalBalance) : 'Rp ••••••'}
          </div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Semua dompet</div>
          {balanceComparison.percentage > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: balanceComparison.isUp ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
              borderRadius: '20px', padding: '3px 10px', fontSize: '12px',
              color: balanceComparison.isUp ? '#2ECC71' : '#E74C3C', marginTop: '4px'
            }}>
              {balanceComparison.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {balanceComparison.percentage}% dari bulan lalu
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>Ringkasan Bulan Ini</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', fontSize: '13px' }}>
              <span style={{ color: '#2ECC71', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ECC71', display: 'inline-block' }} />
                Pemasukan
              </span>
              <span style={{ fontWeight: 500 }}>{visible ? formatRupiah(income) : '••••'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', fontSize: '13px' }}>
              <span style={{ color: '#E74C3C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E74C3C', display: 'inline-block' }} />
                Pengeluaran
              </span>
              <span style={{ fontWeight: 500 }}>{visible ? formatRupiah(expense) : '••••'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', fontSize: '13px' }}>
              <span style={{ color: '#F1C40F', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F1C40F', display: 'inline-block' }} />
                Sisa
              </span>
              <span style={{ fontWeight: 500 }}>{visible ? formatRupiah(balance) : '••••'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}