import { useNavigate } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, PiggyBank, Target } from 'lucide-react'

const actions = [
  { label: 'Masuk', icon: ArrowDownLeft, color: '#E8F5E9', iconColor: '#2ECC71', path: '/add?type=income' },
  { label: 'Keluar', icon: ArrowUpRight, color: '#FFEBEE', iconColor: '#E74C3C', path: '/add?type=expense' },
  { label: 'Transfer', icon: ArrowLeftRight, color: '#E3F2FD', iconColor: '#2196F3', path: '/add?type=transfer' },
  { label: 'Budget', icon: PiggyBank, color: '#FFF3E0', iconColor: '#FF9800', path: '/budget' },
  { label: 'Goal', icon: Target, color: '#EDE7F6', iconColor: '#7F77DD', path: '/goal' },
]

export default function QuickActions() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '0 16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '15px', fontWeight: 600 }}>Aksi Cepat</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <action.icon size={20} color={action.iconColor} />
            </div>
            <span style={{ fontSize: '11px', color: '#4B5563' }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}