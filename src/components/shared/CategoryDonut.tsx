import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import type { Transaction, Category } from '@/database/db'
import { formatRupiah } from '@/utils/finance'

interface Props {
  transactions: Transaction[]
  categories: Category[]
}

const COLORS = ['#7F77DD', '#3498DB', '#2ECC71', '#F1C40F', '#E74C3C', '#9B59B6', '#1ABC9C']

export default function CategoryDonut({ transactions, categories }: Props) {
  const navigate = useNavigate()
  const now = new Date()

  const monthExpenses = transactions.filter((t) => {
    const d = new Date(t.date)
    return t.type === 'expense' && d.getMonth() === now.getMonth()
  })

  const total = monthExpenses.reduce((s, t) => s + t.amount, 0)

  const grouped = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const amount = monthExpenses
        .filter((t) => t.categoryId === cat.id)
        .reduce((s, t) => s + t.amount, 0)
      return { name: cat.name, amount }
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const top5 = grouped.slice(0, 5)
  const others = grouped.slice(5).reduce((s, c) => s + c.amount, 0)
  const chartData = others > 0 ? [...top5, { name: 'Lainnya', amount: others }] : top5

  return (
    <div style={{ padding: '0 16px', marginBottom: '16px' }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Kategori Terbesar</span>
          <button
            onClick={() => navigate('/statistics')}
            style={{ fontSize: '13px', color: '#7F77DD', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
          >Lihat Semua </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '140px', height: '140px', flexShrink: 0, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  dataKey="amount"
                  strokeWidth={2}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown) => [formatRupiah(val as number)]}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Total</div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>
                {formatRupiah(total).replace('Rp\u00a0', 'Rp')}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chartData.map((item, i) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: COLORS[i % COLORS.length], display: 'inline-block', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: '12px', color: '#374151' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>
                  {total > 0 ? Math.round((item.amount / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}