import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }} className={desktopCollapsed ? 'desktop-collapsed' : ''}>
      <style>{`
        @media (min-width: 769px) {
          .desktop-collapsed .sidebar {
            transform: translateX(-100%);
          }
          .desktop-collapsed .page-wrapper {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
        .page-wrapper {
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-wrapper">
        <Topbar onMenuClick={() => {
          if (window.innerWidth <= 768) {
            setSidebarOpen(true)
          } else {
            setDesktopCollapsed(v => !v)
          }
        }} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
