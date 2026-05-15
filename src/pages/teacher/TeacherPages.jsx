import { useState, useMemo, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { mockAttendance, mockStudents, mockClasses, TIMETABLE_DAYS, TIMETABLE_PERIODS, mockTeachers } from '../../lib/mockData'
import { useData } from '../../contexts/DataContext'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { getInitials, getAvatarColor, calculateSBA, getGrade, getSubjectRank, formatCurrency } from '../../lib/utils'
import { Eye, Download, Calendar, Users, Send, MessageSquare, Check, CheckCheck, Trash2, Receipt } from 'lucide-react'
import ReportCardTemplate, { buildReportPDF } from '../../components/ui/ReportCardTemplate'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Subject colour palette (read-only, matches admin)
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


export function TeacherDashboard() {
  const { sbaRecords } = useData()
  const myStudents = mockStudents.filter(s => s.class === 'JHS 3A' && s.status === 'active')
  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header"><h1 className="page-title">Teacher Dashboard</h1><p className="page-subtitle">Your classes, attendance, and SBA overview</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[{ label: 'My Students', value: myStudents.length, color: 'var(--accent-violet)' },{ label: 'Present Today', value: myStudents.length - 3, color: 'var(--accent-green)' },{ label: 'Absent Today', value: 3, color: 'var(--accent-red)' },{ label: 'SBA Records', value: sbaRecords.length, color: 'var(--accent-orange)' }].map(c => (
          <div key={c.label} className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.color }}>{c.value}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{c.label}</div></div>
        ))}
      </div>
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Today's Attendance (JHS 3A)</h2>
        <DataTable columns={[
          { key: 'studentName', label: 'Student', render: r => <span style={{ fontWeight: 600 }}>{r.studentName}</span> },
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Status', render: r => <span className={`badge ${r.status === 'present' ? 'badge-green' : r.status === 'late' ? 'badge-amber' : 'badge-red'}`}>{r.status}</span> },
        ]} data={mockAttendance} searchKeys={['studentName']} pageSize={5} />
      </div>
    </div>
  )
}

export function AttendancePage() {
  const { addToast } = useToast()
  const [availableWeeks, setAvailableWeeks] = useState([1])
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [attendanceData, setAttendanceData] = useState({})
  
  const classStudents = mockStudents.filter(s => s.class === 'JHS 3A' && s.status === 'active')

  const createNextWeek = () => {
    const nextWeek = availableWeeks.length + 1
    setAvailableWeeks(prev => [...prev, nextWeek])
    setSelectedWeek(nextWeek)
    addToast(`Week ${nextWeek} created successfully`, 'success')
  }

  const toggleDay = (studentId, week, day) => {
    const key = `${studentId}-${week}`
    setAttendanceData(prev => {
      const existing = prev[key] || { mon: false, tue: false, wed: false, thu: false, fri: false }
      return { ...prev, [key]: { ...existing, [day]: !existing[day] } }
    })
  }

  const getWeekTotal = (studentId, week) => {
    const data = attendanceData[`${studentId}-${week}`]
    return data ? Object.values(data).filter(Boolean).length : 0
  }

  const getCumulativeTotal = (studentId, upToWeek) => {
    let total = 0
    for (let w = 1; w <= upToWeek; w++) total += getWeekTotal(studentId, w)
    return total
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(`Term Attendance Report - JHS 3A`, 14, 22)
    
    let currentY = 32

    availableWeeks.forEach((week) => {
      if (currentY > 260) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(12)
      doc.text(`Week ${week}`, 14, currentY)

      const tableData = classStudents.map(student => {
        const currentData = attendanceData[`${student.id}-${week}`] || {}
        return [
          student.name,
          student.studentId,
          currentData.mon ? 'P' : 'A',
          currentData.tue ? 'P' : 'A',
          currentData.wed ? 'P' : 'A',
          currentData.thu ? 'P' : 'A',
          currentData.fri ? 'P' : 'A',
          getWeekTotal(student.id, week),
          getCumulativeTotal(student.id, week)
        ]
      })

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Student', 'ID', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Wk Total', 'Cum. Total']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [139, 92, 246] }
      })

      currentY = doc.lastAutoTable.finalY + 12
    })

    doc.save(`Complete_Attendance_JHS_3A.pdf`)
    addToast('Full PDF Report Exported Successfully', 'success')
  }

  const days = [
    { id: 'mon', label: 'Mon' },
    { id: 'tue', label: 'Tue' },
    { id: 'wed', label: 'Wed' },
    { id: 'thu', label: 'Thu' },
    { id: 'fri', label: 'Fri' },
  ]

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Weekly Attendance</h1>
        <p className="page-subtitle">Record and calculate weekly attendance for JHS 3A</p>
      </div>
      
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Academic Week</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="form-select" value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))}>
              {availableWeeks.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
            <button className="btn btn-secondary" onClick={createNextWeek}>New Week</button>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export PDF
          </button>
          <button className="btn btn-primary" onClick={() => addToast('Attendance saved', 'success')}>Save Records</button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '250px' }}>Student</th>
              {days.map(d => <th key={d.id} style={{ width: '80px', textAlign: 'center' }}>{d.label}</th>)}
              <th style={{ width: '90px', textAlign: 'center' }}>Wk Total</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Cum. Total</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.map(student => {
              const currentData = attendanceData[`${student.id}-${selectedWeek}`] || { mon: false, tue: false, wed: false, thu: false, fri: false }
              return (
                <tr key={student.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ background: getAvatarColor(student.name), fontSize: '0.7rem', width: '32px', height: '32px' }}>{getInitials(student.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{student.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  {days.map(d => (
                    <td key={d.id} style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={currentData[d.id]} 
                        onChange={() => toggleDay(student.id, selectedWeek, d.id)}
                        style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent-violet)', cursor: 'pointer' }}
                      />
                    </td>
                  ))}
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent-violet)' }}>
                    <span style={{ background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                      {getWeekTotal(student.id, selectedWeek)} / 5
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 800 }}>{getCumulativeTotal(student.id, selectedWeek)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TeacherStudentsPage() {
  const myStudents = mockStudents.filter(s => s.class === 'JHS 3A')
  const [modal, setModal] = useState({ open: false, data: null })

  return (
    <div>
      <div className="page-header"><h1 className="page-title">My Students</h1><p className="page-subtitle">Students in JHS 3A — {myStudents.length} enrolled</p></div>
      <div className="card" style={{ padding: '1rem' }}>
        <DataTable columns={[
          { key: 'name', label: 'Student', render: r => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div className="avatar" style={{ background: getAvatarColor(r.name), fontSize: '0.7rem' }}>{getInitials(r.name)}</div>
              <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.studentId}</div></div>
            </div>
          )},
          { key: 'gender', label: 'Gender' },
          { key: 'guardianName', label: 'Guardian' },
          { key: 'status', label: 'Status', render: r => <span className={`badge ${r.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{r.status}</span> },
          { key: 'actions', label: '', width: '50px', render: row => <button className="btn btn-ghost btn-sm" onClick={() => setModal({ open: true, data: row })}><Eye size={14} /></button> },
        ]} data={myStudents} searchKeys={['name','studentId']} pageSize={8} />
      </div>
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title="Student Profile">
        {modal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-hover)', borderRadius: '10px' }}>
              <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1rem', background: getAvatarColor(modal.data.name) }}>{getInitials(modal.data.name)}</div>
              <div><div style={{ fontWeight: 700 }}>{modal.data.name}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{modal.data.studentId}</div></div>
            </div>
            {[['Gender', modal.data.gender],['Email', modal.data.email],['Guardian', modal.data.guardianName],['Guardian Phone', modal.data.guardianPhone]].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}><span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{l}</span><span style={{ fontSize: '0.83rem', fontWeight: 500 }}>{v}</span></div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export function TeacherTimetablePage() {
  const { timetable } = useData()
  // The demo teacher is Mr. Emmanuel Adjei (teacherId = 't1'), class teacher of JHS 3A
  const myTeacherId = 't1'
  const myTeacherName = 'Mr. Emmanuel Adjei'
  const myClass = mockClasses.find(c => c.classTeacher === myTeacherName)?.name || 'JHS 3A'
  const [view, setView] = useState('periods') // 'periods' | 'class'

  // Collect all periods across all classes where this teacher teaches
  // Match by BOTH teacherId AND teacher name so admin edits always propagate
  const myPeriods = useMemo(() => {
    const result = []
    Object.entries(timetable).forEach(([className, days]) => {
      TIMETABLE_DAYS.forEach(day => {
        TIMETABLE_PERIODS.forEach(period => {
          if (period.type === 'break') return
          const slot = days[day]?.[period.id]
          if (!slot || slot.type === 'break') return
          const isMySlot =
            (slot.teacherId && slot.teacherId === myTeacherId) ||
            (slot.teacher && slot.teacher === myTeacherName)
          if (isMySlot && slot.subject && slot.subject !== 'Free Period') {
            result.push({
              className,
              day,
              periodId: period.id,
              label: slot._labelOverride || period.label,
              subject: slot.subject,
            })
          }
        })
      })
    })
    return result
  }, [timetable, myTeacherId, myTeacherName])

  // Group by day — derived from memoized myPeriods
  const byDay = useMemo(() => {
    const map = {}
    TIMETABLE_DAYS.forEach(d => { map[d] = myPeriods.filter(p => p.day === d) })
    return map
  }, [myPeriods])

  const myClassData = timetable[myClass] || {}
  const getPeriodLabel = (periodId) => {
    const override = myClassData[TIMETABLE_DAYS[0]]?.[periodId]?._labelOverride
    return override || TIMETABLE_PERIODS.find(p => p.id === periodId)?.label || periodId
  }

  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Timetable</h1>
          <p className="page-subtitle">{myTeacherName} — weekly teaching schedule</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${view === 'periods' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setView('periods')}>
            <Calendar size={14} /> My Periods
          </button>
          <button className={`btn ${view === 'class' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setView('class')}>
            <Users size={14} /> {myClass} Timetable
          </button>
        </div>
      </div>

      {/* ── VIEW: My Periods (consolidated across all classes) ── */}
      {view === 'periods' && (
        <div>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-violet)' }}>{myPeriods.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Periods / Week</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-orange)' }}>{new Set(myPeriods.map(p => p.className)).size}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Classes Taught</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-green)' }}>{new Set(myPeriods.map(p => p.subject)).size}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Subjects Taught</div>
            </div>
          </div>

          {/* Day-by-day breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {TIMETABLE_DAYS.map(day => {
              const dayPeriods = byDay[day]
              return (
                <div key={day} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-violet)', flexShrink: 0 }} />
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{day}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{dayPeriods.length} period{dayPeriods.length !== 1 ? 's' : ''}</span>
                  </div>
                  {dayPeriods.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '1rem' }}>No periods assigned</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                      {dayPeriods.map((p, i) => {
                        const c = getSubjectColor(p.subject)
                        return (
                          <div key={i} style={{ padding: '0.5rem 0.875rem', borderRadius: '10px', background: c.bg, border: `1.5px solid ${c.border}`, minWidth: '160px', flex: '1 1 160px', maxWidth: '260px' }}>
                            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: c.text }}>{p.subject}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{p.className} · {p.label}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── VIEW: Full class timetable grid ── */}
      {view === 'class' && (
        <div>
          <div style={{ marginBottom: '0.875rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Full weekly timetable for your class — <strong>{myClass}</strong>. Contact your admin to request changes.
          </div>
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
                        {isBreak ? <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}>{period.display}</span> : label}
                      </td>
                      {TIMETABLE_DAYS.map(day => {
                        const slot = myClassData[day]?.[period.id]
                        if (isBreak) return <td key={day} style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{period.display}</td>
                        const c = getSubjectColor(slot?.subject)
                        const isFree = !slot?.subject || slot.subject === 'Free Period'
                        const isMyPeriod = slot?.teacherId === myTeacherId
                        return (
                          <td key={day} style={{ padding: '0.35rem', verticalAlign: 'top' }}>
                            <div style={{ padding: '0.45rem', borderRadius: '8px', background: isFree ? 'var(--bg-hover)' : c.bg, border: `${isMyPeriod ? '2px' : '1.5px'} solid ${isMyPeriod ? c.text : (isFree ? 'var(--border)' : c.border)}`, minHeight: '50px' }}>
                              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: isFree ? 'var(--text-muted)' : c.text }}>{slot?.subject || 'Free Period'}</div>
                              {!isFree && slot?.teacher && (
                                <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                  {isMyPeriod ? <strong style={{ color: c.text }}>You</strong> : slot.teacher.replace('Mr. ', '').replace('Mrs. ', '').replace('Ms. ', '')}
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.625rem' }}>
            <strong style={{ color: 'var(--accent-violet)' }}>Highlighted slots</strong> indicate periods you teach in {myClass}.
          </div>
        </div>
      )}
    </div>
  )
}
export function TeacherReportCardsPage() {
  const { addToast } = useToast()
  const { sbaRecords, examScores, schoolInfo } = useData()
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('Term 2')
  const [modal, setModal] = useState({ open: false, student: null })

  const myClass = 'JHS 3A'
  const classStudents = mockStudents.filter(s => s.class === myClass && s.status === 'active')

  const generateReport = (student) => {
    const sba = sbaRecords.filter(r => r.studentId === student.id && r.term === selectedTerm)
    return sba.map(r => {
      const examRec = examScores.find(e => e.studentId === student.id && e.subject === r.subject && e.term === selectedTerm)
      const examScore = examRec ? examRec.score : 0
      const { classTotal, class50, exam50, total } = calculateSBA({ ...r, examScore })
      const { grade, color, label } = getGrade(total, student.class)
      const position = getSubjectRank(student.id, student.class, r.subject, selectedTerm, sbaRecords, examScores, mockStudents)
      return { ...r, examScore, classTotal, class50, exam50, total, grade, gradeColor: color, label, position }
    })
  }

  const handleDownload = (student) => {
    const reports = generateReport(student)
    if (reports.length === 0) {
      addToast(`No records found for ${student.name}`, 'error')
      return
    }

    const doc = new jsPDF()
    buildReportPDF(doc, autoTable, { student, reports, term: selectedTerm, schoolInfo })
    doc.save(`${student.name}_Report_Card_${selectedTerm}.pdf`)
    addToast(`Report card for ${student.name} downloaded successfully`, 'success')
  }

  const filteredStudents = classStudents.filter(s => !selectedStudent || s.id === selectedStudent)

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Class Report Cards</h1><p className="page-subtitle">Manage academic reports for {myClass}</p></div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select className="form-select" style={{ width: 'auto' }} value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
          <option value="">All Students</option>
          {classStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
          {['Term 1', 'Term 2', 'Term 3'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {!selectedStudent ? (
        <div className="card" style={{ padding: '0' }}>
          <DataTable
            columns={[
              { key: 'name', label: 'Student', render: s => (
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.studentId}</div>
                </div>
              )},
              { key: 'subjects', label: 'Subjects', render: s => <span>{generateReport(s).length}</span> },
              { key: 'actions', label: 'Actions', width: '100px', render: s => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal({ open: true, student: s })}><Eye size={14} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDownload(s)}><Download size={14} /></button>
                </div>
              )}
            ]}
            data={filteredStudents} searchKeys={['name', 'studentId']} pageSize={10}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredStudents.map(student => {
            return (
              <div key={student.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ fontWeight: 700 }}>{student.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.studentId}</div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setModal({ open: true, student })}><Eye size={14} /> View</button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => handleDownload(student)}><Download size={14} /> Download</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, student: null })} title="Report Card Preview" size="lg">
        {modal.student && (() => {
          const reports = generateReport(modal.student)
          return (
            <ReportCardTemplate
              student={modal.student}
              reports={reports}
              term={selectedTerm}
              schoolInfo={schoolInfo}
            />
          )
        })()}
      </Modal>
    </div>
  )
}


export function TeacherMessagesPage() {
  const { user } = useAuth()
  const { chatThreads, sendMessage, markThreadRead, deleteMessage, schoolInfo } = useData()
  
  // Resolve ID based on name (matching sidebar logic)
  const MY_TEACHER_NAME = user?.name || 'Mr. Emmanuel Adjei'
  const MY_TEACHER_ID = mockTeachers.find(t => t.name === MY_TEACHER_NAME)?.id || 't1'
  const THREAD_ID = `admin_${MY_TEACHER_ID}`

  const [draft, setDraft] = useState('')
  const msgEndRef = useRef(null)
  const inputRef = useRef(null)

  const thread = chatThreads[THREAD_ID] || { messages: [] }
  const messages = thread.messages

  // Auto-scroll
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Mark as read when page mounts or new messages arrive
  useEffect(() => {
    markThreadRead(THREAD_ID, 'teacher')
  }, [THREAD_ID, markThreadRead, messages.length])

  const handleSend = () => {
    if (!draft.trim()) return
    sendMessage(THREAD_ID, 'teacher', MY_TEACHER_NAME, draft)
    setDraft('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // Group by date
  const groupedMessages = useMemo(() => {
    const groups = []
    let currentDate = null
    messages.forEach(m => {
      const date = new Date(m.ts).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
      if (date !== currentDate) { groups.push({ type: 'date', label: date }); currentDate = date }
      groups.push({ type: 'msg', ...m })
    })
    return groups
  }, [messages])

  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">Your conversation with the school administrator</p>
      </div>

      <div className="card" style={{ padding: 0, height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '14px' }}>

        {/* Chat header */}
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card)', flexShrink: 0 }}>
          <div className="avatar" style={{ background: 'var(--accent-violet)', fontSize: '0.68rem', width: '40px', height: '40px', fontWeight: 700 }}>AD</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{schoolInfo?.name || 'School Administration'}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{schoolInfo?.motto || 'Admin Portal'}</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MessageSquare size={12} />
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-primary)' }}>
          {groupedMessages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.75rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={24} color="var(--accent-violet)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No messages yet</div>
                <div style={{ fontSize: '0.8rem' }}>Send a message to the school administration</div>
              </div>
            </div>
          ) : (
            groupedMessages.map((item, i) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', padding: '0.2rem 0.625rem', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                      {item.label}
                    </span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  </div>
                )
              }
              // teacher = right (me), admin = left (them)
              const isMe = item.sender === 'teacher'
              return (
                <div key={item.id} className="message-container" style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: '0.5rem', alignItems: 'flex-end', position: 'relative' }}>
                  {!isMe && (
                    <div className="avatar" style={{ background: 'var(--accent-violet)', fontSize: '0.6rem', width: '26px', height: '26px', flexShrink: 0, marginBottom: '2px', fontWeight: 700 }}>AD</div>
                  )}
                  <div style={{ maxWidth: '68%', position: 'relative' }} className="message-bubble-wrapper">
                    {!isMe && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>Admin</div>
                    )}
                    <div style={{
                      padding: '0.625rem 0.9rem',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMe ? 'var(--accent-violet)' : 'var(--bg-card)',
                      color: isMe ? 'white' : 'var(--text-primary)',
                      fontSize: '0.85rem', lineHeight: 1.5,
                      boxShadow: 'var(--shadow-sm)',
                      border: isMe ? 'none' : '1px solid var(--border)',
                      wordBreak: 'break-word',
                      position: 'relative'
                    }}>
                      {item.text}
                      <div style={{ fontSize: '0.6rem', opacity: 0.7, marginTop: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
                        <span style={{ opacity: 0.6 }}>{item.time}</span>
                        {isMe && (() => {
                          const lastRead = thread[`lastReadBy_admin`] || 0
                          const seen = lastRead > item.ts
                          return seen
                            ? <CheckCheck size={13} color="#34d399" title="Read" />
                            : <Check size={12} color="rgba(255,255,255,0.55)" title="Sent" />
                        })()}
                      </div>

                      {/* Delete button on hover via CSS class */}
                      <button 
                        onClick={() => { if(confirm('Delete this message?')) deleteMessage(THREAD_ID, item.id) }}
                        className="msg-delete-btn"
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {isMe && (
                    <div className="avatar" style={{ background: getAvatarColor(MY_TEACHER_NAME), fontSize: '0.6rem', width: '26px', height: '26px', flexShrink: 0, marginBottom: '2px' }}>
                      {getInitials(MY_TEACHER_NAME)}
                    </div>
                  )}
                </div>
              )
            })
          )}
          <div ref={msgEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.625rem', alignItems: 'flex-end', background: 'var(--bg-card)', flexShrink: 0 }}>
          <textarea
            ref={inputRef}
            className="form-input"
            rows={1}
            style={{ flex: 1, margin: 0, resize: 'none', minHeight: '40px', maxHeight: '120px', overflowY: 'auto', lineHeight: 1.5, borderRadius: '12px', padding: '0.5rem 0.875rem' }}
            placeholder="Type a message to Admin…"
            value={draft}
            onChange={e => { setDraft(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!draft.trim()}
            style={{ borderRadius: '12px', minWidth: '44px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── PDF-safe currency (avoids GH₵ which jsPDF Helvetica cannot render) ──
const pdfCcy = (amount) => {
  const n = Number(amount) || 0
  return `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function TeacherPayslipsPage() {
  const { user } = useAuth()
  const { payrollRecords, schoolInfo } = useData()
  const { addToast } = useToast()
  const [selected, setSelected] = useState(null)

  // Match payslips issued to this teacher by name from all periods
  const myPayslips = payrollRecords.filter(
    (p) => p.name === user?.name && p.status === 'issued'
  ).reverse()

  const generatePDF = (r) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const w = doc.internal.pageSize.getWidth()
    const L = 14, R = w - 14

    const drawRow = (label, value, y, labelColor, valueColor, bold) => {
      doc.setFontSize(9.5); doc.setFont(undefined, 'normal')
      doc.setTextColor(...(labelColor || [80, 90, 110]))
      doc.text(label, L + 4, y)
      doc.setFont(undefined, bold ? 'bold' : 'normal')
      doc.setTextColor(...(valueColor || [15, 23, 42]))
      doc.text(value, R, y, { align: 'right' })
    }

    const sectionHead = (label, y) => {
      doc.setFillColor(37, 55, 90); doc.rect(L, y, w - 28, 7, 'F')
      doc.setFontSize(8); doc.setFont(undefined, 'bold'); doc.setTextColor(255, 255, 255)
      doc.text(label, L + 4, y + 5)
      return y + 13
    }

    // Header
    doc.setFillColor(28, 35, 51); doc.rect(0, 0, w, 42, 'F')
    doc.setFontSize(20); doc.setFont(undefined, 'bold'); doc.setTextColor(255, 255, 255)
    doc.text(schoolInfo?.name || 'ScholarFlow Academy', L, 18)
    if (schoolInfo?.motto) {
      doc.setFontSize(8.5); doc.setFont(undefined, 'italic'); doc.setTextColor(180, 200, 240)
      doc.text(schoolInfo.motto, L, 26)
    }
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('OFFICIAL PAYSLIP', R, 16, { align: 'right' })
    doc.setFontSize(9); doc.setFont(undefined, 'normal'); doc.setTextColor(160, 185, 230)
    doc.text(`Period: ${r.period}`, R, 24, { align: 'right' })
    doc.text(`Issued: ${fmtDate(r.issuedDate)}`, R, 31, { align: 'right' })

    // Employee Box
    let y = 50
    doc.setFillColor(245, 247, 250); doc.setDrawColor(210, 218, 230)
    doc.roundedRect(L, y, w - 28, 24, 2, 2, 'FD')
    doc.setFontSize(7.5); doc.setFont(undefined, 'bold'); doc.setTextColor(130, 145, 165)
    doc.text('EMPLOYEE NAME', L + 4, y + 6); doc.text('EMPLOYEE ID', w / 2 + 2, y + 6)
    doc.text('ROLE', L + 4, y + 17); doc.text('STATUS', w / 2 + 2, y + 17)
    doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.setTextColor(15, 23, 42)
    doc.text(r.name, L + 4, y + 13); doc.text(r.employeeId, w / 2 + 2, y + 13)
    doc.setFontSize(9); doc.setFont(undefined, 'normal')
    doc.text('Staff', L + 4, y + 22)
    doc.setTextColor(22, 163, 74); doc.text('ISSUED', w / 2 + 2, y + 22)
    y += 32

    // Earnings
    y = sectionHead('EARNINGS', y)
    const earnings = [
      ['Basic Salary', r.basicSalary || 0],
      ['Transport Allowance', r.transportAllowance || 0],
      ['Housing Allowance', r.housingAllowance || 0],
      ['Medical Allowance', r.medicalAllowance || 0],
      ['Other Allowance', r.otherAllowance || 0],
    ]
    let alt = false
    earnings.forEach(([label, val]) => {
      if ((val || 0) > 0) {
        if (alt) { doc.setFillColor(248, 250, 252); doc.rect(L, y - 4.5, w - 28, 8, 'F') }
        drawRow(label, pdfCcy(val), y); y += 8; alt = !alt
      }
    })
    doc.setDrawColor(200, 210, 225); doc.line(L, y, R, y); y += 6
    doc.setFillColor(235, 241, 255); doc.rect(L, y - 4.5, w - 28, 8, 'F')
    drawRow('GROSS SALARY', pdfCcy(r.grossSalary || 0), y, [37, 99, 235], [37, 99, 235], true)
    y += 14

    // Deductions
    y = sectionHead('DEDUCTIONS', y)
    const deductions = [
      ['SSNIT Employee Contribution (5.5%)', r.ssnitEmployee || 0],
      ['SSNIT Employer Contribution (13%)', r.ssnitEmployer || 0],
      ['Income Tax / PAYE', r.incomeTax || 0],
      ['Other Deductions (Loans / Advances)', r.otherDeductions || 0],
    ]
    alt = false
    deductions.forEach(([label, val]) => {
      if ((val || 0) > 0) {
        if (alt) { doc.setFillColor(255, 249, 249); doc.rect(L, y - 4.5, w - 28, 8, 'F') }
        drawRow(label, `- ${pdfCcy(val)}`, y, [80, 90, 110], [185, 28, 28]); y += 8; alt = !alt
      }
    })
    doc.setDrawColor(200, 210, 225); doc.line(L, y, R, y); y += 6
    doc.setFillColor(255, 241, 241); doc.rect(L, y - 4.5, w - 28, 8, 'F')
    drawRow('TOTAL DEDUCTIONS', `- ${pdfCcy(r.totalDeductions || 0)}`, y, [185, 28, 28], [185, 28, 28], true)
    y += 16

    // Net Pay
    doc.setFillColor(28, 35, 51); doc.roundedRect(L, y, w - 28, 18, 3, 3, 'F')
    doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.setTextColor(160, 185, 230)
    doc.text('NET PAY', L + 6, y + 12)
    doc.setFontSize(14); doc.setTextColor(255, 255, 255)
    doc.text(pdfCcy(r.netPay || 0), R - 2, y + 12, { align: 'right' })
    y += 28

    // SSNIT Note
    doc.setFillColor(245, 249, 255); doc.setDrawColor(195, 215, 245)
    doc.roundedRect(L, y, w - 28, 14, 2, 2, 'FD')
    doc.setFontSize(7.5); doc.setFont(undefined, 'normal'); doc.setTextColor(60, 90, 140)
    doc.text(`Note: Employer SSNIT contribution of ${pdfCcy(r.ssnitEmployer || 0)} (13%) is remitted by the school directly to SSNIT Trust.`, L + 4, y + 5)
    doc.text('This amount is not deducted from the employee net pay.', L + 4, y + 11)
    y += 22

    // Signatures
    const sigY = y + 8
    doc.setDrawColor(160, 170, 185)
    doc.line(L, sigY, L + 55, sigY); doc.line(R - 55, sigY, R, sigY)
    doc.setFontSize(8); doc.setFont(undefined, 'normal'); doc.setTextColor(130, 140, 160)
    doc.text('Employee Signature', L, sigY + 5)
    doc.text('Authorised Signatory', R - 55, sigY + 5)

    // Footer
    doc.setFontSize(7.5); doc.setTextColor(180, 190, 205)
    doc.text('This is a computer-generated payslip and does not require a physical signature.', w / 2, 287, { align: 'center' })
    doc.text(`Generated by ScholarFlow  •  ${new Date().toLocaleDateString('en-GB')}`, w / 2, 292, { align: 'center' })

    doc.save(`${r.name.replace(/\s+/g, '_')}_Payslip_${r.period.replace(/\s+/g, '_')}.pdf`)
    addToast('Payslip downloaded', 'success')
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Payslips</h1>
        <p className="page-subtitle">View and download your issued payslips</p>
      </div>

      {myPayslips.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Receipt size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No Payslips Yet</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your payslips will appear here once they are issued by the administrator.</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-primary)', borderBottom: '2px solid var(--border)' }}>
                {['Period', 'Issued Date', 'Gross Salary', 'Net Pay', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myPayslips.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-primary)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Receipt size={16} color="var(--accent-blue)" />
                      </div>
                      {p.period}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{fmtDate(p.issuedDate)}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{formatCurrency(p.grossSalary || 0)}</td>
                  <td style={{ padding: '1rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{formatCurrency(p.netPay || 0)}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm" title="View Payslip" onClick={() => setSelected(p)}>
                        <Eye size={15} />
                      </button>
                      <button className="btn btn-secondary btn-sm" title="Download PDF" onClick={() => generatePDF(p)}>
                        <Download size={15} /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Payslip — ${selected?.period || ''}`}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-hover)', borderRadius: '10px' }}>
              <Receipt size={26} color="var(--accent-blue)" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{schoolInfo?.name || 'ScholarFlow Academy'}</div>
              {schoolInfo?.motto && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{schoolInfo.motto}</div>}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{selected.period}</div>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              {[
                ['Employee', selected.name, null, null],
                ['Employee ID', selected.employeeId, null, null],
                ['─ EARNINGS ─', '', 'header', null],
                ['Basic Salary', formatCurrency(selected.basicSalary || 0), null, null],
                ['Transport Allowance', formatCurrency(selected.transportAllowance || 0), null, null],
                ['Housing Allowance', formatCurrency(selected.housingAllowance || 0), null, null],
                ['Medical Allowance', formatCurrency(selected.medicalAllowance || 0), null, null],
                ['Other Allowance', formatCurrency(selected.otherAllowance || 0), null, null],
                ['Gross Salary', formatCurrency(selected.grossSalary || 0), 'bold', 'var(--accent-blue)'],
                ['─ DEDUCTIONS ─', '', 'header', null],
                ['SSNIT Employee (5.5%)', `- ${formatCurrency(selected.ssnitEmployee || 0)}`, null, 'var(--accent-red)'],
                ['Income Tax (PAYE)', `- ${formatCurrency(selected.incomeTax || 0)}`, null, 'var(--accent-red)'],
                ['Other Deductions', `- ${formatCurrency(selected.otherDeductions || 0)}`, null, 'var(--accent-red)'],
                ['NET PAY', formatCurrency(selected.netPay || 0), 'net', 'var(--accent-blue)'],
              ].map(([l, v, type, color], i) =>
                type === 'header' ? (
                  <div key={i} style={{ padding: '0.4rem 1rem', background: 'var(--bg-primary)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{l}</div>
                ) : (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: i % 2 === 0 ? 'transparent' : 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ fontSize: type === 'net' ? '0.95rem' : '0.83rem', fontWeight: type === 'net' || type === 'bold' ? 800 : 500, color: color || undefined }}>{v}</span>
                  </div>
                )
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => generatePDF(selected)}><Download size={15} /> Download PDF</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
