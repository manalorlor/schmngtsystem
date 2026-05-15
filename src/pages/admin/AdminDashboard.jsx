import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { mockAnalytics, mockStudents, mockFees } from '../../lib/mockData'
import { formatCurrency, getInitials, getAvatarColor } from '../../lib/utils'
import {
  UserCheck, Wallet, TrendingUp,
  GraduationCap, School, AlertTriangle, ArrowUpRight,
  Activity, Clock,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const CHART_TOOLTIP_STYLE = {
  background: '#1c2333',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '0.78rem',
  padding: '7px 11px',
}

// Removed getDisplayName as user wants titles included.

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return (
    <div className="live-clock">
      <div style={{ fontSize: '0.72rem', opacity: 0.7, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
        {dayNames[time.getDay()]}, {monthNames[time.getMonth()]} {time.getDate()}, {time.getFullYear()}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Clock size={18} />
        <span style={{ fontSize: '1.375rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.03em' }}>
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color = 'violet', trend }) {
  return (
    <div className={`stat-card ${color}`}>
      <div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
        <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }} className="animate-count">{value}</p>
        {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{sub}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        <div className={`stat-icon ${color}`}>
          <Icon size={22} />
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 700 }}>
            <ArrowUpRight size={12} />{trend}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
      {action}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { schoolInfo } = useData()

  const { totalStudents, activeStaff, monthlyRevenue, attendanceRate, revenueByMonth, attendanceByWeek, studentsByClass, feeStats } = mockAnalytics
  const unpaidFees = mockFees.filter((f) => f.status !== 'paid')
  const recentStudents = mockStudents.slice(0, 5)

  // Dynamic values from schoolInfo
  const displayName = user?.name || 'there'
  const academicYear = schoolInfo?.academicYear || '2023/2024'
  const currentTerm = schoolInfo?.currentTerm || 'Term 2'
  const schoolName = schoolInfo?.name || 'ScholarFlow Academy'

  return (
    <div style={{ width: '100%' }}>
      {/* Welcome Banner */}
      <div className="welcome-banner" style={{ marginBottom: '1.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
              Welcome back, {displayName}
            </h1>
            <p style={{ opacity: 0.8, fontSize: '0.82rem', fontWeight: 400 }}>
              {schoolName} · {currentTerm}, {academicYear}
            </p>
          </div>
          <LiveClock />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={GraduationCap} label="Total Students" value={totalStudents} sub="6 classes enrolled" color="violet" trend="+3.2%" />
        <StatCard icon={UserCheck} label="Active Staff" value={activeStaff} sub="5 teachers, 7 staff" color="orange" trend="+1" />
        <StatCard icon={Wallet} label="Monthly Revenue" value={formatCurrency(monthlyRevenue)} sub={`${currentTerm} · ${academicYear}`} color="green" trend="+12.4%" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Activity} label="Attendance Rate" value={`${attendanceRate}%`} sub="This week average" color="cyan" trend="+1.8%" />
        <StatCard icon={TrendingUp} label="Fee Collection" value={`${feeStats.collectionRate}%`} sub={`${formatCurrency(feeStats.totalCollected)} collected`} color="amber" />
        <StatCard icon={AlertTriangle} label="Pending Fees" value={unpaidFees.length} sub="Students with balance" color="red" />
      </div>

      {/* Financial Overview */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <SectionHeader
          title="Financial Overview"
          action={<span className="badge badge-violet">{currentTerm.toUpperCase()} · {academicYear}</span>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Total Billed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{formatCurrency(feeStats.totalExpected)}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{currentTerm}</div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Collection Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-orange)', letterSpacing: '-0.02em' }}>{feeStats.collectionRate}%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{formatCurrency(feeStats.totalCollected)} collected</div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Remaining Balance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-red)', letterSpacing: '-0.02em' }}>{formatCurrency(feeStats.outstanding)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--accent-red)', marginTop: '0.2rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-red)' }} /> Pending Collection
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <SectionHeader title="Revenue Overview" action={<span className="badge badge-green">{academicYear}</span>} />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueByMonth} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9eaec" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `₵${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`₵${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revenueGrad)" dot={{ fill: '#2563eb', r: 3, strokeWidth: 2, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <SectionHeader title="Weekly Attendance" action={<span className="badge badge-violet">{currentTerm}</span>} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceByWeek} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9eaec" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={36} domain={[80, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Rate']} />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {attendanceByWeek.map((entry, index) => (
                  <Cell key={index} fill={entry.rate >= 94 ? '#16a34a' : entry.rate >= 90 ? '#ea580c' : '#dc2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Students by Class + Fee Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <SectionHeader title="Students by Class" action={<span className="badge badge-gray"><School size={11} /> 6 classes</span>} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {studentsByClass.map((item) => (
              <div key={item.class}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.class}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(item.count / totalStudents) * 100 * 6}%`, background: '#2563eb', maxWidth: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <SectionHeader title="Fee Status" action={<span className="badge badge-orange">{currentTerm}</span>} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'Total Expected', value: formatCurrency(feeStats.totalExpected), color: 'var(--text-primary)' },
              { label: 'Total Collected', value: formatCurrency(feeStats.totalCollected), color: 'var(--accent-green)' },
              { label: 'Outstanding', value: formatCurrency(feeStats.outstanding), color: 'var(--accent-red)' },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: row.color }}>{row.value}</span>
              </div>
            ))}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Collection rate</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-green)' }}>{feeStats.collectionRate}%</span>
              </div>
              <div className="progress-bar" style={{ height: '8px' }}>
                <div className="progress-fill" style={{ width: `${feeStats.collectionRate}%`, background: 'var(--accent-green)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Students */}
      <div className="card">
        <SectionHeader title="Recent Students" action={
          <a href="/admin/students" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            View all <ArrowUpRight size={13} />
          </a>
        } />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {recentStudents.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: '8px', transition: 'background 0.15s', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="avatar" style={{ background: getAvatarColor(s.name), fontSize: '0.75rem' }}>{getInitials(s.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.studentId}</div>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.class}</span>
              <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{s.status}</span>
              <span style={{ fontSize: '0.8rem', color: s.feeBalance > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 700 }}>
                {s.feeBalance > 0 ? `–${formatCurrency(s.feeBalance)}` : 'Paid'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
