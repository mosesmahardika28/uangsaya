import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Legend,
  LineChart, Line,
} from 'recharts'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { formatRupiah } from '@/utils/finance'
import {
  getFilteredTransactions,
  getCategoryStats,
  getMonthlyTrend,
  getWalletStats,
  getLargestExpenses,
} from '@/services/statisticsService'
import { ChevronRight } from 'lucide-react'

type PeriodType = 'week' | 'month' | 'year' | 'all'
type ViewType = 'category' | 'wallet' | 'trend'

const PERIODS: { key: PeriodType; label: string }[] = [
  { key: 'week', label: 'Minggu' },
  { key: 'month', label: 'Bulan' },
  { key: 'year', label: 'Tahun' },
  { key: 'all', label: 'Semua' },
]

const VIEWS: { key: ViewType; label: string }[] = [
  { key: 'category', label: 'Kategori' },
  { key: 'wallet', label: 'Dompet' },
  { key: 'trend', label: 'Tren' },
]

export default function Statistics() {
  const navigate = useNavigate()
  const { wallets, categories, loadWallets, loadCategories } = useWalletStore()
  const { transactions, transfers, loadTransactions } = useTransactionStore()
  const [period, setPeriod] = useState<PeriodType>('month')
  const [view, setView] = useState<ViewType>('category')

  useEffect(() => {
    loadWallets()
    loadCategories()
    loadTransactions()
  }, [])

  const filtered = getFilteredTransactions(transactions, period)
  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const categoryStats = getCategoryStats(filtered, categories, 'expense')
  const monthlyTrend = getMonthlyTrend(transactions, 6)
  const walletStats = getWalletStats(filtered, transfers, wallets)
  const largestExpenses = getLargestExpenses(filtered, categories, 5)

  const tabStyle = (active: boolean) => ({
    flex: 1, padding: '7px 4px', borderRadius: '8px', border: 'none',
    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
    background: active ? '#7F77DD' : 'transparent',
    color: active ? '#fff' : '#6B7280',
  })

  const cardStyle = {
    background: '#fff', borderRadius: '16px',
    padding: '16px', marginBottom: '12px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
  }

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px' }}>Statistik</h1>

        {/* Period tabs */}
        <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', borderRadius: '10px', padding: '4px', marginBottom: '10px' }}>
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)} style={tabStyle(period === p.key)}>
              {p.label}
            </button>
          ))}
        </div>

        {/* View tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              style={{
                padding: '6px 16px', borderRadius: '20px', border: '1px solid #E5E7EB',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                background: view === v.key ? '#7F77DD' : '#fff',
                color: view === v.key ? '#fff' : '#6B7280',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Summary card */}
        <div style={{ ...cardStyle, background: '#1a1a2e', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Pemasukan</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#2ECC71' }}>{formatRupiah(totalIncome)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Pengeluaran</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#E74C3C' }}>{formatRupiah(totalExpense)}</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #2a2a3e', marginTop: '12px', paddingTop: '12px' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Sisa</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: totalIncome - totalExpense >= 0 ? '#2ECC71' : '#E74C3C' }}>
              {formatRupiah(totalIncome - totalExpense)}
            </div>
          </div>
        </div>

        {/* Category view */}
        {view === 'category' && (
          <>
            {categoryStats.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', color: '#9CA3AF', padding: '32px' }}>
                Tidak ada data pengeluaran
              </div>
            ) : (
              <>
                {/* Donut chart */}
                <div style={cardStyle}>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Pengeluaran per Kategori</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '150px', height: '150px', flexShrink: 0, position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryStats} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="amount" strokeWidth={2}>
                            {categoryStats.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val: unknown) => [formatRupiah(val as number)]} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1 }}>
                      {categoryStats.slice(0, 5).map((stat) => (
                        <div key={stat.categoryId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stat.color, display: 'inline-block', flexShrink: 0 }} />
                            <span style={{ fontSize: '12px' }}>{stat.name}</span>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>{stat.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category list */}
                <div style={cardStyle}>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Detail per Kategori</div>
                  {categoryStats.map((stat) => (
                    <div
                      key={stat.categoryId}
                      onClick={() => navigate(`/statistics/category/${stat.categoryId}?period=${period}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
                    >
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: stat.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: stat.color }}>{stat.name.charAt(0)}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{stat.name}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{formatRupiah(stat.amount)}</span>
                        </div>
                        <div style={{ height: '5px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${stat.percentage}%`, background: stat.color, borderRadius: '3px' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{stat.percentage}% • {stat.count} transaksi</div>
                      </div>
                      <ChevronRight size={16} color="#D1D5DB" />
                    </div>
                  ))}
                </div>

                {/* Largest expenses */}
                {largestExpenses.length > 0 && (
                  <div style={cardStyle}>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Pengeluaran Terbesar</div>
                    {largestExpenses.map((t, i) => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < largestExpenses.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF', minWidth: '20px' }}>#{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 500 }}>{t.categoryName}</div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{t.note || '-'}</div>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#E74C3C' }}>{formatRupiah(t.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Wallet view */}
        {view === 'wallet' && (
          <div style={cardStyle}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Dompet Paling Aktif</div>
            {walletStats.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '24px', fontSize: '14px' }}>Tidak ada data</div>
            ) : (
              walletStats.map((stat, i) => (
                <div key={stat.walletId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < walletStats.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: stat.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: stat.color }}>{stat.name.charAt(0)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{stat.name}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{stat.transactionCount} transaksi</div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{formatRupiah(stat.totalAmount)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Trend view */}
        {view === 'trend' && (
          <>
            <div style={cardStyle}>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Tren 6 Bulan Terakhir</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(val: unknown) => [formatRupiah(val as number)]} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="income" stroke="#2ECC71" strokeWidth={2} dot={false} name="Pemasukan" />
                  <Line type="monotone" dataKey="expense" stroke="#E74C3C" strokeWidth={2} dot={false} name="Pengeluaran" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Perbandingan Bulanan</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(val: unknown) => [formatRupiah(val as number)]} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="income" fill="#2ECC71" radius={[4, 4, 0, 0]} name="Pemasukan" />
                  <Bar dataKey="expense" fill="#E74C3C" radius={[4, 4, 0, 0]} name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}