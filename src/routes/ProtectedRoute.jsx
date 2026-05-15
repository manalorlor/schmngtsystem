import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GraduationCap } from 'lucide-react'

export function RequireAuth({ allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f5f8' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: '#8b5cf6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse 1.5s ease-in-out infinite',
            boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
          }}>
            <GraduationCap size={26} color="white" />
          </div>
          <span style={{ color: '#9490a3', fontSize: '0.875rem', fontWeight: 500 }}>Loading ScholarFlow…</span>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirects = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' }
    return <Navigate to={redirects[user.role] || '/login'} replace />
  }

  return <Outlet />
}

export function RedirectByRole() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  const redirects = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' }
  return <Navigate to={redirects[user.role] || '/login'} replace />
}
