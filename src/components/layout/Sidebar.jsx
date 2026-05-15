import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { mockTeachers } from '../../lib/mockData'
import { getInitials } from '../../lib/utils'

// Strip honorifics strictly for initials generation
const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.', 'Prof.', 'Rev.', 'Sir']
function getNameWithoutTitle(fullName) {
  if (!fullName) return ''
  return fullName.trim().split(/\s+/).filter(p => !TITLES.includes(p)).join(' ') || fullName
}
import {
  LayoutDashboard, Users, GraduationCap,
  ClipboardList, BarChart3, Wallet, Settings,
  ChevronRight, X, UserCheck, CalendarDays, FileText,
  School, Receipt, MessageSquare, Package,
  Briefcase, CheckCircle2, Bell
} from 'lucide-react'

const NAV_CONFIG = {
  admin: [
    {
      section: 'Overview', items: [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
      ]
    },
    {
      section: 'Student Administration', items: [
        { label: 'Students', icon: GraduationCap, to: '/admin/students' },
        { label: 'Admissions', icon: UserCheck, to: '/admin/admissions' },
      ]
    },
    {
      section: 'Academic Management', items: [
        { label: 'Classes & Subjects', icon: School, to: '/admin/academics' },
        { label: 'SBA Records', icon: ClipboardList, to: '/admin/sba' },
        { label: 'Report Cards', icon: FileText, to: '/admin/reports' },
        { label: 'Timetable', icon: CalendarDays, to: '/admin/timetable' },
      ]
    },
    {
      section: 'Finance & Billing', items: [
        { label: 'Fee Ledger', icon: Wallet, to: '/admin/fees' },
      ]
    },
    {
      section: 'Exams & Reports', items: [
        { label: 'Exam Results', icon: BarChart3, to: '/admin/exams' },
      ]
    },
    {
      section: 'Attendance & Discipline', items: [
        { label: 'Attendance', icon: CheckCircle2, to: '/admin/attendance' },
      ]
    },
    {
      section: 'HR & Payroll', items: [
        { label: 'Staff / Teachers', icon: Briefcase, to: '/admin/teachers' },
        { label: 'Payroll', icon: Receipt, to: '/admin/payroll' },
      ]
    },
    {
      section: 'Communication', items: [
        { label: 'Messages', icon: MessageSquare, to: '/admin/messages' },
        { label: 'Notifications', icon: Bell, to: '/admin/notifications' },
      ]
    },
    {
      section: 'Inventory & Assets', items: [
        { label: 'Inventory', icon: Package, to: '/admin/inventory' },
      ]
    },
    {
      section: 'System', items: [
        { label: 'Settings & Security', icon: Settings, to: '/admin/settings' },
      ]
    },
  ],
  teacher: [
    {
      section: 'Overview', items: [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/teacher/dashboard' },
      ]
    },
    {
      section: 'My Classes', items: [
        { label: 'Attendance', icon: UserCheck, to: '/teacher/attendance' },
        { label: 'Exam Marks', icon: BarChart3, to: '/teacher/marks' },
        { label: 'SBA Records', icon: ClipboardList, to: '/teacher/sba' },
        { label: 'Report Cards', icon: FileText, to: '/teacher/reports' },
      ]
    },
    {
      section: 'Academics', items: [
        { label: 'Timetable', icon: CalendarDays, to: '/teacher/timetable' },
        { label: 'Students', icon: Users, to: '/teacher/students' },
      ]
    },
    {
      section: 'Communication', items: [
        { label: 'Messages', icon: MessageSquare, to: '/teacher/messages' },
      ]
    },
    {
      section: 'Finance', items: [
        { label: 'My Payslips', icon: Receipt, to: '/teacher/payslips' },
      ]
    },
  ],
  student: [
    {
      section: 'Overview', items: [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/student/dashboard' },
      ]
    },
    {
      section: 'Academics', items: [
        { label: 'My Report Card', icon: FileText, to: '/student/reports' },
        { label: 'Attendance', icon: UserCheck, to: '/student/attendance' },
        { label: 'Timetable', icon: CalendarDays, to: '/student/timetable' },
      ]
    },
    {
      section: 'Finance', items: [
        { label: 'Fee Balance', icon: Wallet, to: '/student/fees' },
      ]
    },
  ],
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const { schoolInfo, chatThreads, getUnreadCount } = useData()
  
  let navItems = NAV_CONFIG[user?.role] || []
  const plan = schoolInfo?.plan || 'basic'
  
  const basicRestricted = [
    '/admin/timetable', '/admin/inventory', '/admin/payroll', '/admin/fees', '/admin/attendance',
    '/teacher/attendance', '/teacher/timetable',
    '/student/attendance', '/student/timetable', '/student/fees'
  ]
  const standardRestricted = [
    '/admin/timetable', '/admin/inventory', '/admin/payroll',
    '/teacher/timetable',
    '/student/timetable'
  ]
  
  navItems = navItems.map(section => {
    const filteredItems = section.items.filter(item => {
      if (plan === 'basic' && basicRestricted.includes(item.to)) return false
      if (plan === 'standard' && standardRestricted.includes(item.to)) return false
      return true
    })
    return { ...section, items: filteredItems }
  }).filter(section => section.items.length > 0)

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          {schoolInfo?.logo ? (
            <img src={schoolInfo.logo} alt="School Logo" style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'contain', background: 'white', padding: '2px' }} />
          ) : (
            <div className="sidebar-logo-icon">
              <GraduationCap size={20} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-logo-text" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {schoolInfo?.name || 'ScholarFlow'}
            </div>
            {schoolInfo?.motto && (
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {schoolInfo.motto}
              </div>
            )}
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px', textTransform: 'capitalize', letterSpacing: '0.04em' }}>
              {user?.role} Portal
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm md:hidden" style={{ marginLeft: 'auto', display: 'flex', color: 'rgba(255,255,255,0.5)' }} aria-label="Close sidebar">
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section} style={{ marginBottom: '0.125rem' }}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map((item) => {
                let badge = 0
                if (item.label === 'Messages') {
                  if (user?.role === 'admin') {
                    badge = Object.keys(chatThreads).reduce((sum, tid) => sum + getUnreadCount(tid, 'admin'), 0)
                  } else if (user?.role === 'teacher') {
                    const tid = mockTeachers.find(t => t.name === user?.name)?.id || 't1'
                    badge = getUnreadCount(`admin_${tid}`, 'teacher')
                  }
                }

                return (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <item.icon className="nav-item-icon" />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {badge > 0 && (
                      <span style={{ background: 'var(--accent-violet)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '10px', minWidth: '1.25rem', textAlign: 'center', boxShadow: '0 0 0 2px var(--bg-sidebar, #0f172a)' }}>
                        {badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '0.625rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {getInitials(getNameWithoutTitle(user?.name))}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <ChevronRight size={12} color="rgba(255,255,255,0.3)" />
          </div>
        </div>
      </aside>
    </>
  )
}
