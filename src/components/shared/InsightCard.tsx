import type { Insight } from '@/services/insightEngine'

interface Props {
  insights: Insight[]
}

export default function InsightCard({ insights }: Props) {
  if (insights.length === 0) return null

  return (
    <div style={{ padding: '0 16px', marginBottom: '16px' }}>
      <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px' }}>💡 Insight</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {insights.map((insight) => (
          <div
            key={insight.id}
            style={{
              background: insight.type === 'warning' ? '#FFF8F0' : insight.type === 'success' ? '#F0FFF4' : '#F0F4FF',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderLeft: `3px solid ${insight.type === 'warning' ? '#FF9800' : insight.type === 'success' ? '#2ECC71' : '#7F77DD'}`,
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{insight.icon}</span>
            <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>{insight.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}