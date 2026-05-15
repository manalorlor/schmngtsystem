import { useState, useRef, useEffect } from 'react'
import { Menu, Bell, Search, LogOut, ChevronDown, X, User, Settings, HelpCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { mockStudents, mockTeachers } from '../../lib/mockData'
import { getInitials, getAvatarColor } from '../../lib/utils'
import { useData } from '../../contexts/DataContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'

// Strip honorifics strictly for initials generation
const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.', 'Prof.', 'Rev.', 'Sir']
function getNameWithoutTitle(fullName) {
  if (!fullName) return ''
  return fullName.trim().split(/\s+/).filter(p => !TITLES.includes(p)).join(' ') || fullName
}

// NOTIFICATIONS removed, using DataContext

function SearchDropdown({ query, onClose }) {
  const results = []
  if (query.length >= 2) {
    const q = query.toLowerCase()
    mockStudents.filter((s) => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q)).slice(0, 4).forEach((s) =>
      results.push({ type: 'Student', name: s.name, sub: `${s.studentId} · ${s.class}`, id: s.id, avatar: s.name })
    )
    mockTeachers.filter((t) => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)).slice(0, 3).forEach((t) =>
      results.push({ type: 'Teacher', name: t.name, sub: `${t.employeeId} · ${t.subject}`, id: t.id, avatar: t.name })
    )
  }

  if (query.length < 2) return null

  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.35rem',
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
      boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden',
      animation: 'slideUp 0.2s ease',
    }}>
      {results.length === 0 ? (
        <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No results found for "{query}"
        </div>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {results.map((r, i) => (
            <div key={`${r.type}-${r.id}`}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.65rem', background: getAvatarColor(r.avatar) }}>
                {getInitials(r.avatar)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.sub}</div>
              </div>
              <span className={`badge ${r.type === 'Student' ? 'badge-violet' : 'badge-orange'}`}>{r.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationPanel({ notifications, onClose, onMarkRead, onClearAll, userId }) {
  const unreadCount = notifications.filter((n) => !(n.readBy || []).includes(userId)).length

  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
      width: '380px', background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '14px', boxShadow: 'var(--shadow-xl)', zIndex: 200,
      animation: 'slideUp 0.2s ease', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</h3>
          {unreadCount > 0 && <span className="badge badge-violet">{unreadCount} new</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {unreadCount > 0 && (
            <button onClick={onClearAll} className="btn btn-ghost btn-sm" style={{ fontSize: '0.72rem', color: 'var(--accent-violet)' }}>Mark all read</button>
          )}
          <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={14} /></button>
        </div>
      </div>
      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        {notifications.map((n) => {
          const isRead = (n.readBy || []).includes(userId)
          return (
          <div key={n.id}
            onClick={() => onMarkRead(n.id)}
            style={{
              display: 'flex', gap: '0.75rem', padding: '0.875rem 1.25rem',
              borderBottom: '1px solid var(--border)', cursor: 'pointer',
              background: isRead ? 'transparent' : 'rgba(139,92,246,0.03)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = isRead ? 'transparent' : 'rgba(139,92,246,0.03)'}
          >
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '0.375rem',
              background: isRead ? 'transparent' : n.type === 'success' ? 'var(--accent-green)' : n.type === 'warning' ? 'var(--accent-amber)' : 'var(--accent-violet)',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.83rem', fontWeight: isRead ? 500 : 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{n.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.desc}</div>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

function UserDropdown({ user, roleLabel, onLogout, onClose, onOpenProfile }) {
  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
      width: '240px', background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '14px', boxShadow: 'var(--shadow-xl)', zIndex: 200,
      animation: 'slideUp 0.2s ease', overflow: 'hidden',
    }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{user?.email}</div>
        <span className="badge badge-violet" style={{ marginTop: '0.5rem' }}>{roleLabel}</span>
      </div>
      <div style={{ padding: '0.375rem' }}>
        {[
          { icon: User, label: 'My Profile', action: () => { onClose(); onOpenProfile('profile') } },
          { icon: Settings, label: 'Settings', action: () => { onClose(); onOpenProfile('security') } },
          { icon: HelpCircle, label: 'Help & Support', action: () => { onClose(); window.open('https://wa.me/233599455836', '_blank') } },
        ].map((item) => (
          <button key={item.label} onClick={item.action}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%',
              padding: '0.625rem 0.875rem', background: 'none', border: 'none',
              borderRadius: '8px', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 500,
              color: 'var(--text-secondary)', transition: 'all 0.15s', textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--accent-violet)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '0.375rem', borderTop: '1px solid var(--border)' }}>
        <button onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%',
            padding: '0.625rem 0.875rem', background: 'none', border: 'none',
            borderRadius: '8px', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600,
            color: 'var(--accent-red)', transition: 'all 0.15s', textAlign: 'left',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default function Topbar({ onMenuClick }) {
  const { user, logout, updateUserProfile } = useAuth()
  const { notifications, markNotificationRead } = useData()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Profile Modal State
  const [profileModal, setProfileModal] = useState({ open: false, tab: 'profile' })
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', photo: '' })
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' })
  
  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  let userClass = null
  if (user?.role === 'teacher') {
    const t = mockTeachers.find(t => t.email === user.email || t.name === user.name)
    if (t) userClass = t.class
  }

  const visibleNotifications = notifications.filter(n => {
    if (user?.role === 'admin') {
      return n.audience === 'Admin' || n.audience === 'Everyone' || n.audience === 'All Staff'
    } else if (user?.role === 'teacher') {
      if (n.targetClass && n.targetClass === userClass) return true
      return n.audience === 'All Teachers' || n.audience === 'Everyone' || n.audience === 'All Staff'
    }
    return false
  })

  const unreadCount = visibleNotifications.filter((n) => !(n.readBy || []).includes(user?.id)).length

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const roleLabel = {
    admin: 'Administrator',
    teacher: 'Teacher',
    student: 'Student / Parent',
  }[user?.role] || user?.role

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Profile logic
  const handleOpenProfile = (tab) => {
    setProfileForm({ name: user?.name || '', phone: user?.phone || '', photo: user?.photo || '' })
    setPwdForm({ current: '', newPwd: '', confirm: '' })
    setProfileModal({ open: true, tab })
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => setProfileForm(prev => ({ ...prev, photo: event.target.result }))
    reader.readAsDataURL(file)
  }

  const saveProfile = () => {
    if (!profileForm.name.trim()) return addToast('Name cannot be empty', 'error')
    updateUserProfile(profileForm)
    addToast('Profile updated successfully', 'success')
  }

  const savePassword = () => {
    if (!pwdForm.current || !pwdForm.newPwd) return addToast('Please fill all fields', 'error')
    if (pwdForm.newPwd !== pwdForm.confirm) return addToast('New passwords do not match', 'error')
    // In a real app we'd verify the current password here. For this demo, we just update it.
    updateUserProfile({ password: pwdForm.newPwd })
    addToast('Password changed successfully', 'success')
    setPwdForm({ current: '', newPwd: '', confirm: '' })
  }

  return (
    <>
    <header className="topbar">
      <button onClick={onMenuClick} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} aria-label="Open menu" id="topbar-menu-btn">
        <Menu size={20} />
      </button>
      <div style={{ flex: 1 }} />

      {/* Search */}
      <div ref={searchRef} style={{ position: 'relative' }}>
        <div className="search-wrapper" style={{ display: 'flex' }}>
          <Search className="search-icon" />
          <input
            className="search-input"
            placeholder="Search students, teachers…"
            id="topbar-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchFocused(false) }}
              style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        {searchFocused && searchQuery.length >= 2 && (
          <SearchDropdown query={searchQuery} onClose={() => { setSearchFocused(false); setSearchQuery('') }} />
        )}
      </div>

      {/* Notifications */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ position: 'relative' }}
          aria-label="Notifications"
          onClick={() => { setShowNotifications((v) => !v); setShowUserMenu(false) }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '4px', right: '4px', minWidth: '16px', height: '16px',
              borderRadius: '50%', background: 'var(--accent-orange)', border: '2px solid var(--bg-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6rem', fontWeight: 700, color: 'white',
            }}>
              {unreadCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <NotificationPanel
            notifications={visibleNotifications}
            userId={user?.id}
            onClose={() => setShowNotifications(false)}
            onMarkRead={(id) => markNotificationRead(user?.id, id)}
            onClearAll={() => {
              visibleNotifications.forEach(n => markNotificationRead(user?.id, n.id))
            }}
          />
        )}
      </div>

      {/* User menu */}
      <div ref={userRef} style={{ position: 'relative' }}>
        <div
          onClick={() => { setShowUserMenu((v) => !v); setShowNotifications(false) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.375rem 0.75rem', borderRadius: '10px',
            border: '1px solid var(--border)', cursor: 'pointer',
            transition: 'all 0.2s', background: showUserMenu ? 'var(--bg-hover)' : 'var(--bg-primary)',
          }}
          title={`${user?.name} — ${roleLabel}`}
        >
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white', overflow: 'hidden' }}>
            {user?.photo ? <img src={user.photo} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(getNameWithoutTitle(user?.name))}
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{roleLabel}</div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" style={{ transition: 'transform 0.2s', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)' }} />
        </div>
        {showUserMenu && (
          <UserDropdown
            user={user}
            roleLabel={roleLabel}
            onLogout={handleLogout}
            onClose={() => setShowUserMenu(false)}
            onOpenProfile={handleOpenProfile}
          />
        )}
      </div>
    </header>

    <Modal isOpen={profileModal.open} onClose={() => setProfileModal({ open: false, tab: 'profile' })} title="Account Settings">
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
        <button onClick={() => setProfileModal(prev => ({ ...prev, tab: 'profile' }))} style={{ padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', borderBottom: profileModal.tab === 'profile' ? '2px solid var(--accent-violet)' : '2px solid transparent', color: profileModal.tab === 'profile' ? 'var(--accent-violet)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>My Profile</button>
        <button onClick={() => setProfileModal(prev => ({ ...prev, tab: 'security' }))} style={{ padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', borderBottom: profileModal.tab === 'security' ? '2px solid var(--accent-violet)' : '2px solid transparent', color: profileModal.tab === 'security' ? 'var(--accent-violet)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Security</button>
      </div>

      {profileModal.tab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'white', overflow: 'hidden' }}>
              {profileForm.photo ? <img src={profileForm.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(getNameWithoutTitle(profileForm.name))}
            </div>
            <div>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                Change Photo
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
              </label>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>JPG, PNG or GIF. Max 2MB.</div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <input className="form-input" value={user?.email || ''} readOnly style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" placeholder="e.g. 0244-100-000" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
          </div>
        </div>
      )}

      {profileModal.tab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" placeholder="Enter current password" value={pwdForm.current} onChange={e => setPwdForm(f => ({ ...f, current: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" placeholder="Enter new password" value={pwdForm.newPwd} onChange={e => setPwdForm(f => ({ ...f, newPwd: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" placeholder="Confirm new password" value={pwdForm.confirm} onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn btn-primary" onClick={savePassword}>Update Password</button>
          </div>
        </div>
      )}
    </Modal>
    </>
  )
}
