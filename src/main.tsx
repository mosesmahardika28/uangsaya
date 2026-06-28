// @ts-ignore
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { seedDatabase } from './database/seed'

const root = createRoot(document.getElementById('root')!)

root.render(
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100dvh', background: '#F9FAFB', flexDirection: 'column', gap: '16px',
  }}>
    <div style={{
      width: '56px', height: '56px', borderRadius: '16px',
      background: '#7F77DD', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: '#fff',
    }}>U</div>
    <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>UangSaya</div>
    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#7F77DD', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

seedDatabase().then(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})