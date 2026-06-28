import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { db } from '@/database/db'
import type { Wallet } from '@/database/db'
import { formatRupiah, calculateBalance } from '@/utils/finance'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useTransactionStore } from '@/stores/transactionStore'

type TabType = 'all' | 'active' | 'done'

export default function GoalPage() {
  const navigate = useNavigate()
  const { transactions, transfers, loadTransactions } = useTransactionStore()
  const [goals, setGoals] = useState<Wallet[]>([])
  const [tab, setTab] = useState<TabType>('all')

  useEffect(() => {
    loadGoals()
    loadTransactions()
  }, [])

  async function loadGoals() {
    const data = await db.wallets.filter((w) => w.isGoal).toArray()
    setGoals(data)
  }

  const filteredGoals = goals.filter((g) => {
    const current = calculateBalance(g, transactions, transfers)
    const isDone = current >= (g.goalTarget ?? 0)
    if (tab === 'active') return !isDone && !g.isArchived
    if (tab === 'done') return isDone
    return !g.isArchived
  })

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100dvh' }}>
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Goal</h1>
          <button
            onClick={() => navigate('/goal/add')}
            style={{ background: '#7F77DD', border: 'none', borderRadius: '10px', padding: '8px 14px', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Tambah
          </button>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', borderRadius: '10px', padding: '4px' }}>
          {([{ key: 'all', label: 'Semua' }, { key: 'active', label: 'Aktif' }, { key: 'done', label: 'Selesai' }] as const).map((t) => (
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

      <div style={{ padding: '16px' }}>
        {filteredGoals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#9CA3AF', fontSize: '14px' }}>
            Belum ada goal
          </div>
        )}

        {filteredGoals.map((goal) => {
          const current = calculateBalance(goal, transactions, transfers)
          const target = goal.goalTarget ?? 0
          const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
          const isDone = current >= target
          const remaining = target - current

          return (
            <div
              key={goal.id}
              onClick={() => navigate(`/goal/${goal.id}`)}
              style={{ background: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: goal.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: goal.color }}>{goal.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{goal.name}</div>
                    {goal.goalDeadline && (
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        Target: {format(new Date(goal.goalDeadline), 'dd MMM yyyy', { locale: id })}
                      </div>
                    )}
                  </div>
                </div>
                {isDone && (
                  <span style={{ fontSize: '11px', background: '#E8F5E9', color: '#2ECC71', padding: '3px 8px', borderRadius: '10px', fontWeight: 500 }}>
                    ✅ Tercapai
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '4px', width: `${percentage}%`, background: isDone ? '#2ECC71' : goal.color, transition: 'width 0.3s' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#6B7280' }}>
                  {formatRupiah(current)} / {formatRupiah(target)}
                </span>
                <span style={{ fontWeight: 600, color: isDone ? '#2ECC71' : goal.color }}>
                  {isDone ? 'Tercapai!' : `Sisa ${formatRupiah(remaining)}`}
                </span>
              </div>
            </div>
          )
        })}

        <button
          onClick={() => navigate('/goal/add')}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            border: '2px dashed #E5E7EB', background: 'transparent',
            fontSize: '14px', color: '#7F77DD', fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', marginTop: '4px',
          }}
        >
          <Plus size={18} /> Tambah Goal
        </button>
      </div>
    </div>
  )
}