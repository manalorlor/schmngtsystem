import { useState, useMemo } from 'react'
import { mockStudents, mockClasses } from '../../lib/mockData'
import { getInitials, getAvatarColor } from '../../lib/utils'
import { useToast } from '../../components/ui/Toast'
import DataTable from '../../components/ui/DataTable'
import { Save, CheckSquare, Download, Plus } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function AttendancePageFull() {
  const { addToast } = useToast()
  const [selectedClass, setSelectedClass] = useState(mockClasses[0]?.name || '')
  const [availableWeeks, setAvailableWeeks] = useState([1])
  const [selectedWeek, setSelectedWeek] = useState(1)
  
  // Format: { `${studentId}-${week}`: { mon: true, tue: false, ... } }
  const [attendanceData, setAttendanceData] = useState({})

  const classStudents = useMemo(() => mockStudents.filter(s => s.class === selectedClass && s.status === 'active'), [selectedClass])

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
      return {
        ...prev,
        [key]: {
          ...existing,
          [day]: !existing[day]
        }
      }
    })
  }

  const markAllDay = (day) => {
    setAttendanceData(prev => {
      const next = { ...prev }
      classStudents.forEach(student => {
        const key = `${student.id}-${selectedWeek}`
        const existing = next[key] || { mon: false, tue: false, wed: false, thu: false, fri: false }
        next[key] = { ...existing, [day]: true }
      })
      return next
    })
    addToast(`All marked present for ${day.toUpperCase()}`, 'success')
  }

  const getWeekTotal = (studentId, week) => {
    const key = `${studentId}-${week}`
    const data = attendanceData[key]
    if (!data) return 0
    return Object.values(data).filter(Boolean).length
  }

  const getCumulativeTotal = (studentId, upToWeek) => {
    let total = 0
    for (let w = 1; w <= upToWeek; w++) {
      total += getWeekTotal(studentId, w)
    }
    return total
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(18)
    doc.text(`Term Attendance Report - ${selectedClass}`, 14, 22)
    
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

    doc.save(`Complete_Attendance_${selectedClass}.pdf`)
    addToast('Full PDF Report Exported Successfully', 'success')
  }

  const days = [
    { id: 'mon', label: 'Monday' },
    { id: 'tue', label: 'Tuesday' },
    { id: 'wed', label: 'Wednesday' },
    { id: 'thu', label: 'Thursday' },
    { id: 'fri', label: 'Friday' },
  ]

  const columns = [
    {
      label: 'Student',
      key: 'name',
      width: '250px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="avatar" style={{ background: getAvatarColor(row.name), fontSize: '0.7rem', width: '32px', height: '32px' }}>
            {getInitials(row.name)}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.studentId}</div>
          </div>
        </div>
      )
    },
    ...days.map(d => ({
      label: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <span>{d.label}</span>
          <button 
            onClick={() => markAllDay(d.id)} 
            className="btn btn-ghost btn-sm" 
            style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', height: 'auto', minHeight: 'auto', color: 'var(--accent-violet)' }}
            title={`Mark all present for ${d.label}`}
          >
            Mark All
          </button>
        </div>
      ),
      key: d.id,
      width: '80px',
      render: (row) => {
        const key = `${row.id}-${selectedWeek}`
        const currentData = attendanceData[key] || { mon: false, tue: false, wed: false, thu: false, fri: false }
        const isPresent = currentData[d.id]
        
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div 
              onClick={() => toggleDay(row.id, selectedWeek, d.id)}
              style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '6px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                background: isPresent ? 'var(--accent-green)' : 'var(--bg-secondary)',
                color: isPresent ? 'white' : 'var(--border)',
                border: isPresent ? 'none' : '1px solid var(--border)',
                transition: 'all 0.2s ease'
              }}
            >
              {isPresent && <CheckSquare size={14} />}
            </div>
          </div>
        )
      }
    })),
    {
      label: 'Wk Total',
      key: 'weekTotal',
      width: '90px',
      render: (row) => (
        <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent-violet)' }}>
          <span style={{ background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
            {getWeekTotal(row.id, selectedWeek)} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 5</span>
          </span>
        </div>
      )
    },
    {
      label: 'Cum. Total',
      key: 'cumTotal',
      width: '90px',
      render: (row) => (
        <div style={{ textAlign: 'center', fontWeight: 800, color: 'var(--text-primary)' }}>
          {getCumulativeTotal(row.id, selectedWeek)}
        </div>
      )
    }
  ]

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Weekly Attendance</h1>
        <p className="page-subtitle">Track, mark, and auto-calculate daily and weekly attendance records</p>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Class</label>
          <select className="form-select" style={{ minWidth: '150px' }} value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {mockClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Academic Week</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="form-select" style={{ minWidth: '150px' }} value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))}>
              {availableWeeks.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
            <button className="btn btn-secondary" onClick={createNextWeek} title="Add a new week for this term">
              <Plus size={16} /> New Week
            </button>
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export PDF
          </button>
          <button className="btn btn-primary" onClick={() => addToast('Attendance saved to database', 'success')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> Save Weekly Record
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <div style={{ minWidth: '800px' }}>
          <DataTable 
            columns={columns} 
            data={classStudents} 
            searchable={true} 
            searchKeys={['name', 'studentId']} 
            searchPlaceholder="Search students..."
            emptyMessage={`No active students found in ${selectedClass}.`}
            pageSize={50}
          />
        </div>
      </div>
    </div>
  )
}

