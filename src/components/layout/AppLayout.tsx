import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, List, Plus, PieChart, Settings } from 'lucide-react'

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const isSettingsActive = ['/settings', '/wallets', '/categories', '/budget', '/goal'].some(
    (path) => location.pathname.startsWith(path)
  )

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100dvh', position: 'relative', background: '#fff' }}>
      <main style={{ paddingBottom: '80px' }}>
        <Outlet />
      </main>

      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px', background: '#fff',
        borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center',
        justifyContent: 'space-around', height: '64px', zIndex: 50,
      }}>
        <NavLink to="/" end style={({ isActive }) => navStyle(isActive)}>
          <Home size={22} />
          <span style={{ fontSize: '11px', marginTop: '2px' }}>Beranda</span>
        </NavLink>

        <NavLink to="/transactions" style={({ isActive }) => navStyle(isActive)}>
          <List size={22} />
          <span style={{ fontSize: '11px', marginTop: '2px' }}>Transaksi</span>
        </NavLink>

        <NavLink to="/add" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', width: '52px', height: '52px',
          borderRadius: '50%', background: '#7F77DD', color: '#fff',
          marginBottom: '16px', textDecoration: 'none',
        }}>
          <Plus size={26} />
        </NavLink>

        <NavLink to="/statistics" style={({ isActive }) => navStyle(isActive)}>
          <PieChart size={22} />
          <span style={{ fontSize: '11px', marginTop: '2px' }}>Statistik</span>
        </NavLink>

        <button
          onClick={() => navigate('/settings')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '2px', background: 'none', border: 'none',
            cursor: 'pointer', color: isSettingsActive ? '#7F77DD' : '#9CA3AF',
            fontWeight: isSettingsActive ? 500 : 400, flex: 1, padding: '8px 0',
          }}
        >
          <Settings size={22} />
          <span style={{ fontSize: '11px', marginTop: '2px' }}>Pengaturan</span>
        </button>
      </nav>
    </div>
  )
}

function navStyle(isActive: boolean) {
  return {
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
    gap: '2px', textDecoration: 'none',
    color: isActive ? '#7F77DD' : '#9CA3AF',
    fontWeight: isActive ? 500 : 400,
    flex: 1, padding: '8px 0',
  }
}