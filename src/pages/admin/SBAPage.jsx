import { useState, useMemo } from 'react'
import { mockStudents, mockSubjects, mockClasses } from '../../lib/mockData'
import { calculateSBA, getGrade, getInitials, getAvatarColor, getOrdinalSuffix } from '../../lib/utils'
import { useData } from '../../contexts/DataContext'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { Info, ChevronRight, ArrowLeft, Save, Trash2, BookOpen, Users, Calendar, CheckCircle } from 'lucide-react'

const TERMS = ['Term 1', 'Term 2', 'Term 3']
const SCORE_FIELDS = [
  { key: 'classEx1', label: 'Ex 1', max: 10 },
  { key: 'classEx2', label: 'Ex 2', max: 10 },
  { key: 'classEx3', label: 'Ex 3', max: 10 },
  { key: 'classTest', label: 'Test', max: 10 },
  { key: 'project', label: 'Project', max: 20 },
]

// Styled read-only computed box
const ComputedBox = ({ value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      width: '70px', padding: '0.5rem 0.4rem', borderRadius: '8px', fontWeight: 700,
      fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', textAlign: 'center',
      background: color || 'rgba(139,92,246,0.08)', color: 'var(--text-primary)',
      border: '1.5px solid rgba(139,92,246,0.2)',
    }}>{value}</div>
  </div>
)

export default function SBAPage() {
  const { sbaRecords: records, examScores: examData, saveSbaRecordsBulk, deleteSbaRecord, addNotification } = useData()
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [scores, setScores] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, studentId: null, studentName: '' })
  const { addToast } = useToast()

  const classStudents = useMemo(() => {
    if (!selectedClass) return []
    return mockStudents.filter(s => s.class === selectedClass && s.status === 'active')
  }, [selectedClass])

  const classSubjects = useMemo(() => {
    if (!selectedClass) return []
    return mockSubjects.filter(s => s.classes.includes(selectedClass))
  }, [selectedClass])

  // Get exam score from shared context (read-only)
  const getExamScore = (studentId) => {
    const rec = examData.find(
      e => e.studentId === studentId && e.subject === selectedSubject && e.term === selectedTerm
    )
    return rec ? rec.score : null
  }

  const initializeScores = (subjectName) => {
    const newScores = {}
    classStudents.forEach(student => {
      const existing = records.find(
        r => r.studentId === student.id && r.class === selectedClass &&
          r.subject === subjectName && r.term === selectedTerm
      )
      newScores[student.id] = existing
        ? { classEx1: existing.classEx1, classEx2: existing.classEx2, classEx3: existing.classEx3, classTest: existing.classTest, project: existing.project, _existingId: existing.id }
        : { classEx1: '', classEx2: '', classEx3: '', classTest: '', project: '', _existingId: null }
    })
    setScores(newScores)
  }

  const handleSelectSubject = (subjectName) => {
    setSelectedSubject(subjectName)
    initializeScores(subjectName)
  }

  const handleScoreChange = (studentId, field, value) => {
    const fieldDef = SCORE_FIELDS.find(f => f.key === field)
    let num = value === '' ? '' : Math.min(fieldDef.max, Math.max(0, parseFloat(value) || 0))
    setScores(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: num } }))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const toSave = []
    const updatedScores = { ...scores }
    classStudents.forEach(student => {
      const s = scores[student.id]
      if (!s) return
      const hasAny = SCORE_FIELDS.some(f => s[f.key] !== '' && s[f.key] !== 0)
      if (!hasAny) return
      const data = {
        studentId: student.id, studentName: student.name, class: selectedClass,
        subject: selectedSubject, term: selectedTerm,
        classEx1: parseFloat(s.classEx1) || 0, classEx2: parseFloat(s.classEx2) || 0,
        classEx3: parseFloat(s.classEx3) || 0, classTest: parseFloat(s.classTest) || 0,
        project: parseFloat(s.project) || 0,
      }
      if (s._existingId) {
        toSave.push({ ...data, id: s._existingId })
      } else {
        const newId = `sba${Date.now()}_${student.id}`
        toSave.push({ ...data, id: newId })
        updatedScores[student.id] = { ...updatedScores[student.id], _existingId: newId }
      }
    })
    saveSbaRecordsBulk(toSave)
    setScores(updatedScores)
    addToast(`SBA scores saved for ${selectedSubject} — ${selectedClass}`, 'success')
    addNotification({ title: 'SBA Records Updated', desc: `Scores for ${selectedSubject} in ${selectedClass} have been updated.`, type: 'info', audience: 'Admin' })
    setSaving(false)
  }

  const handleDeleteRecord = async () => {
    const { studentId } = deleteModal
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    const existingId = scores[studentId]?._existingId
    if (existingId) deleteSbaRecord(existingId)
    setScores(prev => ({
      ...prev, [studentId]: { classEx1: '', classEx2: '', classEx3: '', classTest: '', project: '', _existingId: null }
    }))
    addToast(`SBA record deleted for ${deleteModal.studentName}`, 'info')
    setSaving(false)
    setDeleteModal({ open: false, studentId: null, studentName: '' })
  }

  const goBack = () => {
    if (selectedSubject) { setSelectedSubject(''); setScores({}) }
    else if (selectedClass) setSelectedClass('')
    else setSelectedTerm('')
  }

  const currentStep = selectedSubject ? 3 : selectedClass ? 2 : selectedTerm ? 1 : 0
  const subjectRecordCount = (name) => records.filter(r => r.class === selectedClass && r.subject === name && r.term === selectedTerm).length

  // Hover handlers for cards
  const hoverIn = (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--accent-violet-light)' }
  const hoverOut = (e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)' }

  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">SBA Records</h1>
          <p className="page-subtitle">School-Based Assessment — continuous assessment scores</p>
        </div>
      </div>

      {/* Formula Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.875rem 1rem', background: 'var(--bg-card)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', marginBottom: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        <Info size={16} color="var(--accent-violet)" style={{ flexShrink: 0, marginTop: '1px' }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>SBA Formula:</strong>{' '}
          Ex1(10) + Ex2(10) + Ex3(10) + Test(10) + Project(20) = <strong>60</strong> → 50% of class score + 50% of exam score = <strong>Total /100</strong>.
          Exam scores are pulled automatically from the Exam Results page.
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {currentStep > 0 && <button className="btn btn-ghost btn-sm" onClick={goBack} style={{ marginRight: '0.25rem' }}><ArrowLeft size={14} /> Back</button>}
        <StepBadge icon={<Calendar size={13} />} label="Term" value={selectedTerm} active={currentStep === 0} done={currentStep > 0} onClick={() => { setSelectedTerm(''); setSelectedClass(''); setSelectedSubject(''); setScores({}) }} />
        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        <StepBadge icon={<Users size={13} />} label="Class" value={selectedClass} active={currentStep === 1} done={currentStep > 1} onClick={() => { setSelectedClass(''); setSelectedSubject(''); setScores({}) }} />
        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        <StepBadge icon={<BookOpen size={13} />} label="Subject" value={selectedSubject} active={currentStep === 2} done={currentStep > 2} />
      </div>

      {/* STEP 0: Term */}
      {currentStep === 0 && (
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Select Term</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {TERMS.map(term => {
              const count = records.filter(r => r.term === term).length
              return (
                <div key={term} className="card" onClick={() => setSelectedTerm(term)} style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem 1.5rem', transition: 'all 0.2s' }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}><Calendar size={22} color="var(--accent-violet)" /></div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-violet)', marginBottom: '0.25rem' }}>{term}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} record{count !== 1 ? 's' : ''}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* STEP 1: Class */}
      {currentStep === 1 && (
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Select Class</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {mockClasses.map(cls => {
              const sc = mockStudents.filter(s => s.class === cls.name && s.status === 'active').length
              const rc = records.filter(r => r.class === cls.name && r.term === selectedTerm).length
              return (
                <div key={cls.id} className="card" onClick={() => setSelectedClass(cls.name)} style={{ cursor: 'pointer', textAlign: 'center', padding: '1.75rem 1.5rem', transition: 'all 0.2s' }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}><Users size={22} color="var(--accent-violet)" /></div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-violet)', marginBottom: '0.25rem' }}>{cls.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sc} student{sc !== 1 ? 's' : ''}</div>
                  {rc > 0 && <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', marginTop: '0.25rem' }}>{rc} SBA record{rc !== 1 ? 's' : ''}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Subject */}
      {currentStep === 2 && (
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Select Subject <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>— {selectedClass} · {selectedTerm}</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {classSubjects.map(subj => {
              const rc = subjectRecordCount(subj.name)
              return (
                <div key={subj.id} className="card" onClick={() => handleSelectSubject(subj.name)} style={{ cursor: 'pointer', padding: '1.5rem', transition: 'all 0.2s' }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BookOpen size={18} color="var(--accent-violet)" /></div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{subj.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{subj.code} · {subj.teacher}</div>
                    </div>
                  </div>
                  {rc > 0
                    ? <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-green)' }}><CheckCircle size={12} /> {rc} score{rc !== 1 ? 's' : ''} entered</div>
                    : <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No scores yet</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Score Grid */}
      {currentStep === 3 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedSubject} <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.9rem' }}>— {selectedClass} · {selectedTerm}</span></h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{classStudents.length} student{classStudents.length !== 1 ? 's' : ''} in class</p>
            </div>
            <button id="save-sba-btn" className="btn btn-primary" onClick={handleSaveAll} disabled={saving}>
              <Save size={15} /> {saving ? 'Saving…' : 'Save All Scores'}
            </button>
          </div>

          {classStudents.length === 0 ? (
            <div className="empty-state"><Users size={40} /><p>No active students in {selectedClass}</p></div>
          ) : (() => {
            const currentTotals = classStudents.map(student => {
              const s = scores[student.id] || {}
              const examRaw = getExamScore(student.id)
              const calc = calculateSBA({
                classEx1: parseFloat(s.classEx1) || 0, classEx2: parseFloat(s.classEx2) || 0,
                classEx3: parseFloat(s.classEx3) || 0, classTest: parseFloat(s.classTest) || 0,
                project: parseFloat(s.project) || 0, examScore: examRaw || 0,
              })
              return { id: student.id, total: calc.total }
            })

            const getDynamicRank = (studentId) => {
              const totalObj = currentTotals.find(t => t.id === studentId)
              if (!totalObj || totalObj.total === 0) return '—'
              const validTotals = currentTotals.filter(t => t.total > 0).sort((a, b) => b.total - a.total)
              const rankIndex = validTotals.findIndex(t => t.id === studentId)
              if (rankIndex === -1) return '—'
              return getOrdinalSuffix(rankIndex + 1)
            }

            return (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: '1000px' }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: '170px' }}>Student</th>
                    {SCORE_FIELDS.map(f => (
                      <th key={f.key} style={{ textAlign: 'center', minWidth: '72px' }}>
                        {f.label}<div style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>max {f.max}</div>
                      </th>
                    ))}
                    <th style={{ textAlign: 'center', minWidth: '70px', background: 'rgba(139,92,246,0.04)' }}>
                      50% Class<div style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>/60 → /50</div>
                    </th>
                    <th style={{ textAlign: 'center', minWidth: '70px', background: 'rgba(249,115,22,0.04)' }}>
                      50% Exam<div style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>from Exams</div>
                    </th>
                    <th style={{ textAlign: 'center', minWidth: '70px', background: 'rgba(16,185,129,0.04)' }}>
                      Total<div style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>/100</div>
                    </th>
                    <th style={{ textAlign: 'center', minWidth: '60px' }}>Grade</th>
                    <th style={{ textAlign: 'center', minWidth: '60px' }}>Pos</th>
                    <th style={{ width: '45px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map(student => {
                    const s = scores[student.id] || {}
                    const examRaw = getExamScore(student.id)
                    const hasScores = SCORE_FIELDS.some(f => s[f.key] !== '' && s[f.key] !== undefined)
                    const calc = calculateSBA({
                      classEx1: parseFloat(s.classEx1) || 0, classEx2: parseFloat(s.classEx2) || 0,
                      classEx3: parseFloat(s.classEx3) || 0, classTest: parseFloat(s.classTest) || 0,
                      project: parseFloat(s.project) || 0, examScore: examRaw || 0,
                    })
                    const { grade, color } = getGrade(calc.total, selectedClass)

                    return (
                      <tr key={student.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="avatar" style={{ background: getAvatarColor(student.name), width: '30px', height: '30px', fontSize: '0.65rem' }}>{getInitials(student.name)}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{student.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{student.studentId}</div>
                            </div>
                          </div>
                        </td>
                        {SCORE_FIELDS.map(f => (
                          <td key={f.key} style={{ padding: '0.5rem 0.35rem' }}>
                            <input type="number" min="0" max={f.max} value={s[f.key] ?? ''} onChange={e => handleScoreChange(student.id, f.key, e.target.value)} placeholder="—"
                              style={{ width: '100%', maxWidth: '70px', padding: '0.5rem 0.4rem', border: '1.5px solid var(--border)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', fontWeight: 600, textAlign: 'center', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                              onFocus={e => { e.target.style.borderColor = 'var(--accent-violet)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)' }}
                              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                            />
                          </td>
                        ))}
                        {/* 50% of Class Score */}
                        <td style={{ padding: '0.5rem 0.35rem', textAlign: 'center' }}>
                          {hasScores ? <ComputedBox value={calc.class50.toFixed(1)} color="rgba(139,92,246,0.08)" /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        {/* 50% of Exam Score */}
                        <td style={{ padding: '0.5rem 0.35rem', textAlign: 'center' }}>
                          {examRaw !== null
                            ? <ComputedBox value={calc.exam50.toFixed(1)} color="rgba(249,115,22,0.08)" />
                            : <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', fontWeight: 600 }}>No exam</span>}
                        </td>
                        {/* Total /100 */}
                        <td style={{ padding: '0.5rem 0.35rem', textAlign: 'center' }}>
                          {hasScores ? <ComputedBox value={calc.total.toFixed(1)} color="rgba(16,185,129,0.08)" /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        {/* Grade */}
                        <td style={{ textAlign: 'center' }}>
                          {hasScores ? <span className={`badge badge-${color}`}>{grade}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        {/* Position */}
                        <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                          {hasScores ? getDynamicRank(student.id) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td>
                          {hasScores && (
                            <button className="btn btn-danger btn-sm" title="Delete" onClick={() => setDeleteModal({ open: true, studentId: student.id, studentName: student.name })}><Trash2 size={13} /></button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )})()}
        </div>
      )}

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, studentId: null, studentName: '' })} title="Delete SBA Record" size="sm"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setDeleteModal({ open: false, studentId: null, studentName: '' })}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDeleteRecord} disabled={saving} id="confirm-delete-sba-btn">{saving ? 'Deleting…' : 'Delete'}</button>
        </>}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Are you sure you want to delete SBA scores for <strong style={{ color: 'var(--text-primary)' }}>{deleteModal.studentName}</strong> in {selectedSubject}?
        </p>
      </Modal>
    </div>
  )
}

function StepBadge({ icon, label, value, active, done, onClick }) {
  const canClick = done && onClick
  return (
    <div onClick={canClick ? onClick : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
        cursor: canClick ? 'pointer' : 'default', transition: 'all 0.2s',
        background: active ? 'var(--accent-violet)' : done ? 'rgba(139,92,246,0.1)' : 'var(--bg-primary)',
        color: active ? 'white' : done ? 'var(--accent-violet)' : 'var(--text-muted)',
        border: `1.5px solid ${active ? 'var(--accent-violet)' : done ? 'rgba(139,92,246,0.25)' : 'var(--border)'}`,
      }}>
      {icon}
      {value ? <span>{value}</span> : <span>{label}</span>}
    </div>
  )
}
