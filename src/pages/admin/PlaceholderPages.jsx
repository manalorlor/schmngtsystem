// Placeholder pages for routes not yet fully built
import { Construction, GraduationCap, CheckCircle2, BarChart3, Receipt, MessageSquare, Bell, Package, Settings } from 'lucide-react'

function ComingSoon({ title, subtitle, icon: Icon = Construction, accentColor = 'var(--accent-violet)' }) {
  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '18px',
          background: accentColor === 'var(--accent-violet)' ? 'rgba(139,92,246,0.1)' : accentColor === 'var(--accent-orange)' ? 'rgba(249,115,22,0.1)' : 'rgba(16,185,129,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <Icon size={32} color={accentColor} style={{ opacity: 0.8 }} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--text-primary)' }}>Coming Soon</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto', lineHeight: 1.7 }}>
          This module is under development. It will be available once the database schema is fully connected and integrated.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <span className="badge badge-violet">In Development</span>
          <span className="badge badge-orange">ScholarFlow v2.0</span>
        </div>
      </div>
    </div>
  )
}

// Student Administration
export function AdmissionsPage() {
  return <ComingSoon title="Admissions" subtitle="Manage student admissions and enrollment" icon={GraduationCap} accentColor="var(--accent-violet)" />
}

// Academic Management
export function ReportCardsPage() {
  return <ComingSoon title="Report Cards" subtitle="Auto-generated student academic reports" icon={Construction} accentColor="var(--accent-violet)" />
}

export function TimetablePage() {
  return <ComingSoon title="Timetable" subtitle="Class schedule management" icon={Construction} accentColor="var(--accent-orange)" />
}

// Finance & Billing
export function PaymentsPage() {
  return <ComingSoon title="Payment History" subtitle="All recorded fee transactions" icon={Receipt} accentColor="var(--accent-green)" />
}

// Exams & Reports
export function ExamsPage() {
  return <ComingSoon title="Exam Results" subtitle="Manage exam scores, grading, and report cards" icon={BarChart3} accentColor="var(--accent-violet)" />
}

// Attendance & Discipline
export function AttendanceDisciplinePage() {
  return <ComingSoon title="Attendance & Discipline" subtitle="Track daily student attendance and manage disciplinary records" icon={CheckCircle2} accentColor="var(--accent-orange)" />
}

// HR & Payroll
export function PayrollPage() {
  return <ComingSoon title="Payroll" subtitle="Staff salary management and payroll processing" icon={Receipt} accentColor="var(--accent-green)" />
}

// Communication
export function MessagesPage() {
  return <ComingSoon title="Messages" subtitle="Internal messaging for staff, parents and students" icon={MessageSquare} accentColor="var(--accent-violet)" />
}

export function NotificationsPage() {
  return <ComingSoon title="Notifications" subtitle="System-wide notifications and announcements" icon={Bell} accentColor="var(--accent-orange)" />
}

// Inventory & Assets
export function InventoryPage() {
  return <ComingSoon title="Inventory & Assets" subtitle="Track school assets, supplies and inventory management" icon={Package} accentColor="var(--accent-violet)" />
}

// Settings & Security
export function SettingsPage() {
  return <ComingSoon title="Settings & Security" subtitle="Configure school information, user roles, and security preferences" icon={Settings} accentColor="var(--accent-violet)" />
}
