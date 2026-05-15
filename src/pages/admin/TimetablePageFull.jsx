import { useState, useMemo } from 'react'
import { mockClasses, mockSubjects, mockTeachers, TIMETABLE_DAYS, TIMETABLE_PERIODS } from '../../lib/mockData'
import { useData } from '../../contexts/DataContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { Edit2, Clock, BookOpen, User, Info, ChevronDown } from 'lucide-react'

// Consistent subject-to-color mapping
const SUBJECT_COLORS = {
  'Mathematics':               { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', text: '#7c3aed' },
  'English Language':          { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#c2410c' },
  'Integrated Science':        { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#047857' },
  'Social Studies':            { bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)',  text: '#0e7490' },
  'ICT':                       { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#4338ca' },
  'French':                    { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#b45309' },
  'Religious & Moral Education':{ bg: 'rgba(236,72,153,0.12)',border: 'rgba(236,72,153,0.3)', text: '#be185d' },
  'Free Period':               { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', text: '#64748b' },
}
const defaultColor = { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', text: 'var(--text-primary)' }
const getSubjectColor = (name) => SUBJECT_COLORS[name] || defaultColor

export default function TimetablePage() {
  const { timetable, updateTimetableSlot, updatePeriodLabel } = useData()
  const { addToast } = useToast()
  const [selectedClass, setSelectedClass] = useState(mockClasses[0]?.name || '')

  // Slot edit modal
  const [slotModal, setSlotModal] = useState({ open: false, day: '', periodId: '' })
  const [slotForm, setSlotForm] = useState({ subject: '', teacher: '', teacherId: '' })

  // Time edit modal
  const [timeModal, setTimeModal] = useState({ open: false, periodId: '', currentLabel: '' })
  const [timeForm, setTimeForm] = useState('')

  const classData = useMemo(() => timetable[selectedClass] || {}, [timetable, selectedClass])

  // Get an effective period label (may be overridden per slot)
  const getPeriodLabel = (periodId) => {
    // Check if any slot for this period has a label override (from the first day)
    const override = classData[TIMETABLE_DAYS[0]]?.[periodId]?._labelOverride
    return override || TIMETABLE_PERIODS.find(p => p.id === periodId)?.label || periodId
  }

  const openSlotEdit = (day, periodId) => {
    const slot = classData[day]?.[periodId]
    if (!slot || slot.type === 'break') return
    setSlotForm({ subject: slot.subject || '', teacher: slot.teacher || '', teacherId: slot.teacherId || '' })
    setSlotModal({ open: true, day, periodId })
  }

  const handleSlotSave = () => {
    // Always resolve teacherId from name to ensure consistency —
    // slotForm.teacherId may be stale if teacher dropdown wasn't touched
    const resolvedTeacher = mockTeachers.find(t => t.name === slotForm.teacher)
    const resolvedTeacherId = resolvedTeacher?.id || slotForm.teacherId || ''
    updateTimetableSlot(selectedClass, slotModal.day, slotModal.periodId, {
      subject: slotForm.subject,
      teacher: slotForm.teacher,
      teacherId: resolvedTeacherId,
    })
    setSlotModal({ open: false, day: '', periodId: '' })
    addToast(`Timetable updated — ${slotModal.day}, ${getPeriodLabel(slotModal.periodId)}`, 'success')
  }

  const openTimeEdit = (periodId) => {
    const label = getPeriodLabel(periodId)
    setTimeForm(label)
    setTimeModal({ open: true, periodId, currentLabel: label })
  }

  const handleTimeSave = () => {
    if (!timeForm.trim()) return
    // Apply label override to every slot of that period across all days
    TIMETABLE_DAYS.forEach(day => {
      updateTimetableSlot(selectedClass, day, timeModal.periodId, { _labelOverride: timeForm.trim() })
    })
    setTimeModal({ open: false, periodId: '', currentLabel: '' })
    addToast('Period time updated', 'success')
  }

  const handleTeacherChange = (teacherName) => {
    const t = mockTeachers.find(t => t.name === teacherName)
    setSlotForm(f => ({ ...f, teacher: teacherName, teacherId: t?.id || '' }))
  }

  // Period row summary: how many distinct subjects this period has across all days
  const getPeriodSummary = (periodId) => {
    const subjects = new Set()
    TIMETABLE_DAYS.forEach(day => {
      const s = classData[day]?.[periodId]?.subject
      if (s && s !== 'Free Period') subjects.add(s)
    })
    return subjects.size
  }

  return (
    <div>
      <div className="school-bg"></div>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Timetable Management</h1>
          <p className="page-subtitle">Configure weekly class schedules — click any slot to edit</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 'auto', fontWeight: 600 }}
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            {mockClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.75rem 1rem', background: 'var(--bg-card)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '10px', marginBottom: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        <Info size={15} color="var(--accent-violet)" style={{ flexShrink: 0, marginTop: '1px' }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Admin only:</strong>{' '}
          Click any coloured slot to change subject &amp; teacher. Click the <strong>clock icon</strong> next to a period time to edit the time label. Break and Lunch rows are locked.
        </div>
      </div>

      {/* Subject legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {Object.entries(SUBJECT_COLORS).filter(([k]) => k !== 'Free Period').map(([name, c]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.625rem', borderRadius: '20px', background: c.bg, border: `1px solid ${c.border}`, fontSize: '0.72rem', fontWeight: 600, color: c.text }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.text }} />
            {name}
          </div>
        ))}
      </div>

      {/* Timetable grid */}
      <div className="card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: '900px', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '155px' }} />
            {TIMETABLE_DAYS.map(d => <col key={d} />)}
          </colgroup>
          <thead>
            <tr>
              <th style={{ fontSize: '0.75rem' }}>Time / Period</th>
              {TIMETABLE_DAYS.map(d => (
                <th key={d} style={{ textAlign: 'center', fontWeight: 700 }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMETABLE_PERIODS.map(period => {
              const isBreak = period.type === 'break'
              const label = getPeriodLabel(period.id)
              return (
                <tr key={period.id} style={{ background: isBreak ? 'var(--bg-hover)' : undefined }}>
                  {/* Time column */}
                  <td style={{ verticalAlign: 'middle', padding: '0.5rem 0.625rem' }}>
                    {isBreak ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{period.display}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          title="Edit period time"
                          onClick={() => openTimeEdit(period.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', borderRadius: '4px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-violet)'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
                        >
                          <Clock size={11} />
                        </button>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{label}</span>
                      </div>
                    )}
                  </td>

                  {/* Day columns */}
                  {TIMETABLE_DAYS.map(day => {
                    const slot = classData[day]?.[period.id]
                    if (isBreak) {
                      return (
                        <td key={day} style={{ textAlign: 'center', padding: '0.4rem' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{period.display}</div>
                        </td>
                      )
                    }
                    const color = getSubjectColor(slot?.subject)
                    const isFree = !slot?.subject || slot.subject === 'Free Period'
                    return (
                      <td key={day} style={{ padding: '0.35rem', verticalAlign: 'top' }}>
                        <div
                          onClick={() => openSlotEdit(day, period.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && openSlotEdit(day, period.id)}
                          title={`Edit ${day} — ${label}`}
                          style={{
                            padding: '0.5rem 0.5rem 0.45rem',
                            borderRadius: '8px',
                            minHeight: '54px',
                            cursor: 'pointer',
                            background: isFree ? 'var(--bg-hover)' : color.bg,
                            border: `1.5px solid ${isFree ? 'var(--border)' : color.border}`,
                            transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                            position: 'relative',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.025)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                        >
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: isFree ? 'var(--text-muted)' : color.text, lineHeight: 1.3, marginBottom: '0.2rem' }}>
                            {slot?.subject || 'Free Period'}
                          </div>
                          {!isFree && slot?.teacher && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                              {slot.teacher.replace('Mr. ', '').replace('Mrs. ', '').replace('Ms. ', '')}
                            </div>
                          )}
                          <Edit2 size={9} style={{ position: 'absolute', top: '5px', right: '5px', color: 'var(--text-muted)', opacity: 0.5 }} />
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

      {/* Summary row */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: '200px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={17} color="var(--accent-violet)" />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-violet)' }}>
              {TIMETABLE_PERIODS.filter(p => p.type === 'class').length * TIMETABLE_DAYS.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Periods / Week</div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '200px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={17} color="var(--accent-green)" />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)' }}>
              {(() => {
                const teachers = new Set()
                TIMETABLE_DAYS.forEach(day => {
                  TIMETABLE_PERIODS.filter(p => p.type === 'class').forEach(p => {
                    const t = classData[day]?.[p.id]?.teacher
                    if (t) teachers.add(t)
                  })
                })
                return teachers.size
              })()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teachers Assigned</div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '200px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ChevronDown size={17} color="var(--accent-orange)" />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-orange)' }}>
              {(() => {
                let freePeriods = 0
                TIMETABLE_DAYS.forEach(day => {
                  TIMETABLE_PERIODS.filter(p => p.type === 'class').forEach(p => {
                    const s = classData[day]?.[p.id]?.subject
                    if (!s || s === 'Free Period') freePeriods++
                  })
                })
                return freePeriods
              })()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Free / Unassigned</div>
          </div>
        </div>
      </div>

      {/* ── Slot Edit Modal ── */}
      <Modal
        isOpen={slotModal.open}
        onClose={() => setSlotModal({ open: false, day: '', periodId: '' })}
        title={`Edit Slot — ${slotModal.day}${slotModal.periodId ? ', ' + getPeriodLabel(slotModal.periodId) : ''}`}
        size="sm"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setSlotModal({ open: false, day: '', periodId: '' })}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSlotSave} id="save-slot-btn">Save Changes</button>
        </>}
      >
        <div className="form-group">
          <label className="form-label"><BookOpen size={13} style={{ marginRight: '0.3rem' }} />Subject</label>
          <select className="form-select" value={slotForm.subject} onChange={e => setSlotForm(f => ({ ...f, subject: e.target.value }))}>
            <option value="">— Unassigned —</option>
            <option value="Free Period">Free Period</option>
            {mockSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label"><User size={13} style={{ marginRight: '0.3rem' }} />Teacher</label>
          <select className="form-select" value={slotForm.teacher} onChange={e => handleTeacherChange(e.target.value)}>
            <option value="">— No teacher —</option>
            {mockTeachers.map(t => <option key={t.id} value={t.name}>{t.name} ({t.subject})</option>)}
          </select>
        </div>
        {slotForm.subject && (
          <div style={{ marginTop: '0.875rem', padding: '0.625rem 0.875rem', borderRadius: '8px', background: getSubjectColor(slotForm.subject).bg, border: `1px solid ${getSubjectColor(slotForm.subject).border}`, fontSize: '0.8rem', color: getSubjectColor(slotForm.subject).text, fontWeight: 600 }}>
            Preview: {slotForm.subject}{slotForm.teacher ? ` · ${slotForm.teacher}` : ''}
          </div>
        )}
      </Modal>

      {/* ── Time Edit Modal ── */}
      <Modal
        isOpen={timeModal.open}
        onClose={() => setTimeModal({ open: false, periodId: '', currentLabel: '' })}
        title="Edit Period Time"
        size="sm"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setTimeModal({ open: false, periodId: '', currentLabel: '' })}>Cancel</button>
          <button className="btn btn-primary" onClick={handleTimeSave} id="save-time-btn">Save Time</button>
        </>}
      >
        <div className="form-group">
          <label className="form-label"><Clock size={13} style={{ marginRight: '0.3rem' }} />Period Time Label</label>
          <input
            type="text"
            className="form-input"
            value={timeForm}
            onChange={e => setTimeForm(e.target.value)}
            placeholder="e.g. 08:00 - 08:45"
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            This updates the time display for this period on the <strong>{selectedClass}</strong> timetable.
          </div>
        </div>
      </Modal>
    </div>
  )
}
