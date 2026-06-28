import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Transaction, Transfer, Category, Wallet } from '@/database/db'
import { formatRupiah } from '@/utils/finance'

interface Props {
  transactions: Transaction[]
  transfers: Transfer[]
  categories: Category[]
  wallets: Wallet[]
}

export default function RecentTransactions({ transactions, transfers, categories, wallets }: Props) {
  const navigate = useNavigate()

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? '-'

  const getWalletName = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.name ?? '-'

  const getFromWallet = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.name ?? '-'

  const getToWallet = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.name ?? '-'

  // Gabungkan transaksi dan transfer, urutkan by date
  const combined = [
    ...transactions.map((t) => ({ ...t, kind: 'transaction' as const })),
    ...transfers.map((t) => ({ ...t, kind: 'transfer' as const })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div style={{ padding: '0 16px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '15px', fontWeight: 600 }}>Transaksi Terbaru</span>
        <span
          style={{ fontSize: '13px', color: '#7F77DD', cursor: 'pointer' }}
          onClick={() => navigate('/transactions')}
        >
          Lihat Semua
        </span>
      </div>

      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden',
      }}>
        {combined.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
            Belum ada transaksi
          </div>
        )}

        {combined.map((item, i) => {
          const isTransfer = item.kind === 'transfer'
          const isIncome = !isTransfer && (item as Transaction).type === 'income'

          const title = isTransfer
            ? `Transfer ke ${getToWallet((item as Transfer).toWalletId)}`
            : getCategoryName((item as Transaction).categoryId)

          const subtitle = isTransfer
            ? `${getFromWallet((item as Transfer).fromWalletId)} → ${getToWallet((item as Transfer).toWalletId)}`
            : getWalletName((item as Transaction).walletId)

          const amountColor = isTransfer ? '#6B7280' : isIncome ? '#2ECC71' : '#E74C3C'
          const amountPrefix = isTransfer ? '' : isIncome ? '+' : '-'
          const amount = isTransfer
            ? (item as Transfer).amount
            : (item as Transaction).amount

          const bgColor = isTransfer ? '#E5E7EB' : isIncome ? '#E8F5E9' : '#FFEBEE'
          const textColor = isTransfer ? '#6B7280' : isIncome ? '#2ECC71' : '#E74C3C'
          const initial = isTransfer ? '⇄' : title.charAt(0)

          return (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px',
                borderBottom: i < combined.length - 1 ? '1px solid #F3F4F6' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/transactions')}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: bgColor, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
                  {initial}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>
                  {title}
                </div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  {format(new Date(item.date), 'dd MMM, HH:mm', { locale: id })} • {subtitle}
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: amountColor }}>
                  {amountPrefix}{formatRupiah(amount)}
                </div>
                {isTransfer && (
                  <span style={{
                    fontSize: '10px', background: '#E5E7EB', color: '#6B7280',
                    padding: '2px 6px', borderRadius: '10px',
                  }}>
                    Transfer
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}