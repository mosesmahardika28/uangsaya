import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Transaction } from '@/database/db'
import { formatRupiah, getMonthComparison } from '@/utils/finance'

interface Props {
  transactions: Transaction[]
}

export default function SpendingChart({ transactions }: Props) {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)

  const days = eachDayOfInterval({ start, end })

  const data = days.map((day) => {
    const dayExpenses = transactions
      .filter((t) => {
        const d = new Date(t.date)
        return (
          t.type === 'expense' &&
          d.getDate() === day.getDate() &&
          d.getMonth() === day.getMonth()
        )
      })
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      label: format(day, 'd MMM', { locale: id }),
      amount: dayExpenses,
    }
  })

  const totalExpense = transactions
    .filter((t) => {
      const d = new Date(t.date)
      return t.type === 'expense' && d.getMonth() === now.getMonth()
    })
    .reduce((s, t) => s + t.amount, 0)

  const comparison = getMonthComparison(transactions, 'expense')

  return (
    <div style={{ padding: '0 16px', marginBottom: '16px' }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ marginBottom: '4px', fontSize: '13px', color: '#6B7280' }}>Pengeluaran Bulan Ini</div>
        <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '2px' }}>
          {formatRupiah(totalExpense)}
        </div>
        {comparison.percentage > 0 ? (
          <div style={{ fontSize: '12px', color: comparison.isUp ? '#E74C3C' : '#2ECC71', marginBottom: '12px' }}>
            {comparison.isUp ? '▲' : '▼'} {comparison.percentage}% dari bulan lalu
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '12px' }}>
            Tidak ada data bulan lalu
          </div>
        )}

        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7F77DD" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(days.length / 4)}
            />
            <YAxis hide />
            <Tooltip
              formatter={(val: unknown) => [formatRupiah(val as number), 'Pengeluaran']}
              contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#7F77DD"
              strokeWidth={2}
              fill="url(#spending)"
              dot={false}
              activeDot={{ r: 4, fill: '#7F77DD' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}