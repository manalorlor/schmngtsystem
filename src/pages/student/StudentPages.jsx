import { mockAttendance, mockFees, mockSubjects, mockStudents, TIMETABLE_DAYS, TIMETABLE_PERIODS } from '../../lib/mockData'
import { useData } from '../../contexts/DataContext'
import { calculateSBA, getGrade, formatCurrency, formatDate, getSubjectRank } from '../../lib/utils'
import DataTable from '../../components/ui/DataTable'
import { useState } from 'react'
import { Download } from 'lucide-react'
import ReportCardTemplate, { buildReportPDF } from '../../components/ui/ReportCardTemplate'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Subject colour palette (read-only)
const SUBJECT_COLORS = {
  'Mathematics':                { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', text: '#7c3aed' },
  'English Language':           { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#c2410c' },
  'Integrated Science':         { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#047857' },
  'Social Studies':             { bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)',  text: '#0e7490' },
  'ICT':                        { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#4338ca' },
  'French':                     { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#b45309' },
  'Religious & Moral Education':{ bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', text: '#be185d' },
  'Free Period':                { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', text: '#64748b' },
}
const defColor = { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', text: 'var(--text-primary)' }
const getSubjectColor = (name) => SUBJECT_COLORS[name] || defColor


export function StudentDashboard() {
  const { sbaRecords } = useData()
  const myFee = mockFees[0]
  const mySBA = sbaRecords.filter(s => s.studentId === 's1')
  const myAtt = mockAttendance.filter(a => a.studentId === 's1')

  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header"><h1 className="page-title">My Dashboard</h1><p className="page-subtitle">Welcome back, Kofi! Here's your academic summary.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[{ label: 'Fee Balance', value: formatCurrency(myFee?.balance), color: myFee?.balance > 0 ? 'var(--accent-red)' : 'var(--accent-green)' },{ label: 'Subjects', value: mySBA.length, color: 'var(--accent-violet)' },{ label: 'Attendance', value: `${Math.round((myAtt.filter(a => a.status === 'present').length / Math.max(myAtt.length, 1)) * 100)}%`, color: 'var(--accent-green)' },{ label: 'My Class', value: 'JHS 3A', color: 'var(--accent-orange)' }].map(c => (
          <div key={c.label} className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.color }}>{c.value}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{c.label}</div></div>
        ))}
      </div>
      {mySBA.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>My SBA Scores</h2>
          {mySBA.map(r => { const { total } = calculateSBA(r); const { grade, label, color } = getGrade(total, 'JHS 3A'); return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border)' }}>
              <div><div style={{ fontWeight: 600 }}>{r.subject}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.term}</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem' }}>{total.toFixed(1)}</span><span className={`badge badge-${color}`}>{grade} — {label}</span></div>
            </div>
          )})}
        </div>
      )}
    </div>
  )
}

export function StudentReportsPage() {
  const { sbaRecords } = useData()
  const mySBA = sbaRecords.filter(s => s.studentId === 's1')
  return (
    <div>
      <div className="page-header"><h1 className="page-title">My Academic Reports</h1><p className="page-subtitle">View your SBA scores and grades</p></div>
      <div className="card" style={{ padding: '1rem' }}>
        <DataTable columns={[
          { key: 'subject', label: 'Subject' },{ key: 'term', label: 'Term' },
          { key: 'classEx1', label: 'Ex1' },{ key: 'classEx2', label: 'Ex2' },{ key: 'classEx3', label: 'Ex3' },
          { key: 'classTest', label: 'Test' },{ key: 'project', label: 'Project' },{ key: 'examScore', label: 'Exam' },
          { key: 'total', label: 'Total', render: r => { const { total } = calculateSBA(r); const { grade, color } = getGrade(total, 'JHS 3A'); return <span className={`badge badge-${color}`}>{total.toFixed(1)} ({grade})</span> }},
        ]} data={mySBA} searchKeys={['subject']} searchable={false} pageSize={10} />
      </div>
    </div>
  )
}

export function StudentAttendancePage() {
  const myAtt = mockAttendance.filter(a => a.studentId === 's1')
  return (
    <div>
      <div className="page-header"><h1 className="page-title">My Attendance</h1><p className="page-subtitle">Track your attendance history</p></div>
      <div className="card" style={{ padding: '1rem' }}>
        <DataTable columns={[
          { key: 'date', label: 'Date', render: r => formatDate(r.date) },
          { key: 'status', label: 'Status', render: r => <span className={`badge ${r.status === 'present' ? 'badge-green' : r.status === 'late' ? 'badge-amber' : 'badge-red'}`}>{r.status}</span> },
        ]} data={myAtt} searchable={false} pageSize={10} />
      </div>
    </div>
  )
}

export function StudentTimetablePage() {
  const { timetable } = useData()
  // Demo student is Kofi Mensah (s1) in JHS 3A
  const myStudent = mockStudents.find(s => s.id === 's1')
  const myClass = myStudent?.class || 'JHS 3A'
  const classData = timetable[myClass] || {}

  const getPeriodLabel = (periodId) => {
    const override = classData[TIMETABLE_DAYS[0]]?.[periodId]?._labelOverride
    return override || TIMETABLE_PERIODS.find(p => p.id === periodId)?.label || periodId
  }

  // Count distinct subjects (excluding break/lunch/free)
  const subjectSet = new Set()
  TIMETABLE_DAYS.forEach(day => {
    TIMETABLE_PERIODS.filter(p => p.type === 'class').forEach(p => {
      const s = classData[day]?.[p.id]?.subject
      if (s && s !== 'Free Period') subjectSet.add(s)
    })
  })

  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header">
        <h1 className="page-title">My Timetable</h1>
        <p className="page-subtitle">{myClass} — weekly class schedule</p>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-violet)' }}>
            {TIMETABLE_PERIODS.filter(p => p.type === 'class').length * TIMETABLE_DAYS.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Periods / Week</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-orange)' }}>{subjectSet.size}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Subjects</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>{myClass}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Your Class</div>
        </div>
      </div>

      {/* Subject legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[...subjectSet].map(name => {
          const c = getSubjectColor(name)
          return (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.625rem', borderRadius: '20px', background: c.bg, border: `1px solid ${c.border}`, fontSize: '0.72rem', fontWeight: 600, color: c.text }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.text }} />
              {name}
            </div>
          )
        })}
      </div>

      {/* Timetable grid */}
      <div className="card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: '800px', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '140px' }} />
            {TIMETABLE_DAYS.map(d => <col key={d} />)}
          </colgroup>
          <thead>
            <tr>
              <th>Time</th>
              {TIMETABLE_DAYS.map(d => <th key={d} style={{ textAlign: 'center' }}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {TIMETABLE_PERIODS.map(period => {
              const isBreak = period.type === 'break'
              const label = getPeriodLabel(period.id)
              return (
                <tr key={period.id} style={{ background: isBreak ? 'var(--bg-hover)' : undefined }}>
                  <td style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', padding: '0.5rem 0.625rem' }}>
                    {isBreak
                      ? <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}>{period.display}</span>
                      : label}
                  </td>
                  {TIMETABLE_DAYS.map(day => {
                    const slot = classData[day]?.[period.id]
                    if (isBreak) return (
                      <td key={day} style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{period.display}</td>
                    )
                    const c = getSubjectColor(slot?.subject)
                    const isFree = !slot?.subject || slot.subject === 'Free Period'
                    return (
                      <td key={day} style={{ padding: '0.35rem', verticalAlign: 'top' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '8px', background: isFree ? 'var(--bg-hover)' : c.bg, border: `1.5px solid ${isFree ? 'var(--border)' : c.border}`, minHeight: '54px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isFree ? 'var(--text-muted)' : c.text }}>
                            {slot?.subject || 'Free Period'}
                          </div>
                          {!isFree && slot?.teacher && (
                            <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {slot.teacher.replace('Mr. ', '').replace('Mrs. ', '').replace('Ms. ', '')}
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function StudentFeesPage() {
  const myFee = mockFees[0]
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Fee Balance</h1><p className="page-subtitle">Your current fee status</p></div>
      {myFee && (
        <div className="card" style={{ maxWidth: '480px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[['Student', myFee.studentName],['Class', myFee.class],['Term', myFee.term],['Academic Year', myFee.academicYear],['Total Fee', formatCurrency(myFee.totalFee)],['Amount Paid', formatCurrency(myFee.amountPaid)],['Balance', formatCurrency(myFee.balance)],['Due Date', formatDate(myFee.dueDate)]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{l}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: l === 'Balance' ? (myFee.balance > 0 ? 'var(--accent-red)' : 'var(--accent-green)') : 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
            <span className={`badge ${myFee.status === 'paid' ? 'badge-green' : myFee.status === 'partial' ? 'badge-amber' : 'badge-red'}`} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>{myFee.status}</span>
          </div>
        </div>
      )}
    </div>
  )
}
export function StudentReportCardPage() {
  const { sbaRecords, examScores, schoolInfo } = useData()
  const [selectedTerm, setSelectedTerm] = useState('Term 2')
  const myStudent = mockStudents.find(s => s.id === 's1')
  
  const generateReport = () => {
    if (!myStudent) return []
    const sba = sbaRecords.filter(r => r.studentId === myStudent.id && r.term === selectedTerm)
    return sba.map(r => {
      const examRec = examScores.find(e => e.studentId === myStudent.id && e.subject === r.subject && e.term === selectedTerm)
      const examScore = examRec ? examRec.score : 0
      const { classTotal, class50, exam50, total } = calculateSBA({ ...r, examScore })
      const { grade, color, label } = getGrade(total, myStudent.class)
      const position = getSubjectRank(myStudent.id, myStudent.class, r.subject, selectedTerm, sbaRecords, examScores, mockStudents)
      return { ...r, examScore, classTotal, class50, exam50, total, grade, gradeColor: color, label, position }
    })
  }

  const handleDownload = () => {
    const reports = generateReport()
    if (reports.length === 0) return

    const doc = new jsPDF()
    buildReportPDF(doc, autoTable, { student: myStudent, reports, term: selectedTerm, schoolInfo })
    doc.save(`${myStudent.name}_Report_Card_${selectedTerm}.pdf`)
  }

  const reports = generateReport()

  return (
    <div>
      <div className="page-header"><h1 className="page-title">My Report Card</h1><p className="page-subtitle">View and download your academic report for {selectedTerm}</p></div>
      
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <select className="form-select" style={{ width: 'auto' }} value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
          {['Term 1', 'Term 2', 'Term 3'].map(t => <option key={t}>{t}</option>)}
        </select>
        <button className="btn btn-primary" onClick={handleDownload} disabled={reports.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Download size={16} /> Download PDF</button>
      </div>

      {myStudent && (
        <ReportCardTemplate
          student={myStudent}
          reports={reports}
          term={selectedTerm}
          schoolInfo={schoolInfo}
        />
      )}
    </div>
  )
}
