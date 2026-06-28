import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Transaction, Transfer, Category, Wallet } from '@/database/db'
import { formatRupiah } from '@/utils/finance'

interface Props {
  item: (Transaction & { kind: 'transaction' }) | (Transfer & { kind: 'transfer' })
  categories: Category[]
  wallets: Wallet[]
}

export default function TransactionItem({ item, categories, wallets }: Props) {
  const navigate = useNavigate()

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? '-'

  const getWalletName = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.name ?? '-'

  const isTransfer = item.kind === 'transfer'
  const isIncome = !isTransfer && (item as Transaction).type === 'income'

  const title = isTransfer
    ? `Transfer ke ${getWalletName((item as Transfer).toWalletId)}`
    : getCategoryName((item as Transaction).categoryId)

  const subtitle = isTransfer
    ? `${getWalletName((item as Transfer).fromWalletId)} → ${getWalletName((item as Transfer).toWalletId)}`
    : getWalletName((item as Transaction).walletId)

  const amount = isTransfer ? (item as Transfer).amount : (item as Transaction).amount
  const amountColor = isTransfer ? '#6B7280' : isIncome ? '#2ECC71' : '#E74C3C'
  const amountPrefix = isTransfer ? '' : isIncome ? '+' : '-'
  const bgColor = isTransfer ? '#E5E7EB' : isIncome ? '#E8F5E9' : '#FFEBEE'
  const textColor = isTransfer ? '#6B7280' : isIncome ? '#2ECC71' : '#E74C3C'

  function handleClick() {
    navigate(`/transactions/${item.id}?kind=${item.kind}`)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px', cursor: 'pointer',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: bgColor, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
          {isTransfer ? '⇄' : title.charAt(0)}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
          {format(new Date(item.date), 'dd MMM, HH:mm', { locale: id })} • {subtitle}
        </div>
        {!isTransfer && (item as Transaction).note && (
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', fontStyle: 'italic' }}>
            {(item as Transaction).note}
          </div>
        )}
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
}