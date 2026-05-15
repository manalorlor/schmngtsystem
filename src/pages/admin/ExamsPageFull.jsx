import { useState, useMemo } from 'react'
import { mockStudents, mockSubjects, mockClasses } from '../../lib/mockData'
import { useData } from '../../contexts/DataContext'
import { getInitials, getAvatarColor, getOrdinalSuffix } from '../../lib/utils'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { Info, ChevronRight, ArrowLeft, Save, Trash2, BookOpen, Users, Calendar, CheckCircle, FileText } from 'lucide-react'

const TERMS = ['Term 1', 'Term 2', 'Term 3']

export default function ExamsPageFull() {
  const { examScores, saveExamScoresBulk, deleteExamScore, addNotification } = useData()
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

  const getRecordCount = (term) => examScores.filter(r => r.term === term).length
  const getClassRecordCount = (className) => examScores.filter(r => r.class === className && r.term === selectedTerm).length
  const getSubjectRecordCount = (subjectName) => examScores.filter(r => r.class === selectedClass && r.subject === subjectName && r.term === selectedTerm).length

  const initializeScores = (subjectName) => {
    const newScores = {}
    classStudents.forEach(student => {
      const existing = examScores.find(
        r => r.studentId === student.id && r.subject === subjectName && r.term === selectedTerm
      )
      newScores[student.id] = existing
        ? { score: existing.score, _existingId: existing.id }
        : { score: '', _existingId: null }
    })
    setScores(newScores)
  }

  const handleSelectSubject = (subjectName) => {
    setSelectedSubject(subjectName)
    initializeScores(subjectName)
  }

  const handleScoreChange = (studentId, value) => {
    let num = value === '' ? '' : Math.min(100, Math.max(0, parseFloat(value) || 0))
    setScores(prev => ({ ...prev, [studentId]: { ...prev[studentId], score: num } }))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))

    const toSave = []
    const updatedScores = { ...scores }
    classStudents.forEach(student => {
      const s = scores[student.id]
      if (!s || s.score === '' || s.score === undefined) return

      const data = {
        studentId: student.id, studentName: student.name, class: selectedClass,
        subject: selectedSubject, term: selectedTerm,
        score: parseFloat(s.score) || 0,
      }

      if (s._existingId) {
        toSave.push({ ...data, id: s._existingId })
      } else {
        const newId = `es${Date.now()}_${student.id}`
        toSave.push({ ...data, id: newId })
        updatedScores[student.id] = { ...updatedScores[student.id], _existingId: newId }
      }
    })

    saveExamScoresBulk(toSave)
    setScores(updatedScores)
    addToast(`Exam scores saved for ${selectedSubject} — ${selectedClass}`, 'success')
    addNotification({ title: 'Exam Scores Updated', desc: `Scores for ${selectedSubject} in ${selectedClass} have been updated.`, type: 'info', audience: 'Admin' })
    setSaving(false)
  }

  const handleDeleteRecord = async () => {
    const { studentId } = deleteModal
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    const existingId = scores[studentId]?._existingId
    if (existingId) deleteExamScore(existingId)
    setScores(prev => ({ ...prev, [studentId]: { score: '', _existingId: null } }))
    addToast(`Exam score deleted for ${deleteModal.studentName}`, 'info')
    setSaving(false)
    setDeleteModal({ open: false, studentId: null, studentName: '' })
  }

  const goBack = () => {
    if (selectedSubject) { setSelectedSubject(''); setScores({}) }
    else if (selectedClass) setSelectedClass('')
    else setSelectedTerm('')
  }

  const currentStep = selectedSubject ? 3 : selectedClass ? 2 : selectedTerm ? 1 : 0

  const hoverIn = (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--accent-violet-light)' }
  const hoverOut = (e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)' }

  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Exam Results</h1>
          <p className="page-subtitle">Enter and manage end-of-term examination scores</p>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.875rem 1rem', background: 'var(--bg-card)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '10px', marginBottom: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
        <Info size={16} color="var(--accent-orange)" style={{ flexShrink: 0, marginTop: '1px' }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Exam Scores:</strong>{' '}
          Enter each student's exam mark out of <strong>100</strong>. The 50% of the exam score will automatically appear on the SBA Records page for final grading.
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
              const count = getRecordCount(term)
              return (
                <div key={term} className="card" onClick={() => setSelectedTerm(term)} style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem 1.5rem', transition: 'all 0.2s' }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}><Calendar size={22} color="var(--accent-orange)" /></div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>{term}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} score{count !== 1 ? 's' : ''} entered</div>
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
              const rc = getClassRecordCount(cls.name)
              return (
                <div key={cls.id} className="card" onClick={() => setSelectedClass(cls.name)} style={{ cursor: 'pointer', textAlign: 'center', padding: '1.75rem 1.5rem', transition: 'all 0.2s' }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}><Users size={22} color="var(--accent-orange)" /></div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>{cls.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sc} student{sc !== 1 ? 's' : ''}</div>
                  {rc > 0 && <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', marginTop: '0.25rem' }}>{rc} score{rc !== 1 ? 's' : ''} entered</div>}
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
              const rc = getSubjectRecordCount(subj.name)
              return (
                <div key={subj.id} className="card" onClick={() => handleSelectSubject(subj.name)} style={{ cursor: 'pointer', padding: '1.5rem', transition: 'all 0.2s' }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BookOpen size={18} color="var(--accent-orange)" /></div>
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

      {/* STEP 3: Score Entry Grid */}
      {currentStep === 3 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedSubject} <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.9rem' }}>— {selectedClass} · {selectedTerm}</span></h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{classStudents.length} student{classStudents.length !== 1 ? 's' : ''} in class</p>
            </div>
            <button id="save-exam-btn" className="btn btn-orange" onClick={handleSaveAll} disabled={saving}>
              <Save size={15} /> {saving ? 'Saving…' : 'Save All Scores'}
            </button>
          </div>

          {classStudents.length === 0 ? (
            <div className="empty-state"><Users size={40} /><p>No active students in {selectedClass}</p></div>
          ) : (() => {
            const currentExamScores = classStudents.map(student => {
              const s = scores[student.id] || {}
              const rawScore = parseFloat(s.score) || 0
              return { id: student.id, score: rawScore }
            })

            const getExamRank = (studentId) => {
              const scoreObj = currentExamScores.find(t => t.id === studentId)
              if (!scoreObj || scoreObj.score === 0) return '—'
              const validScores = currentExamScores.filter(t => t.score > 0).sort((a, b) => b.score - a.score)
              const rankIndex = validScores.findIndex(t => t.id === studentId)
              if (rankIndex === -1) return '—'
              return getOrdinalSuffix(rankIndex + 1)
            }

            return (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: '200px' }}>Student</th>
                    <th style={{ textAlign: 'center', minWidth: '120px' }}>
                      Exam Score<div style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>max 100</div>
                    </th>
                    <th style={{ textAlign: 'center', minWidth: '90px', background: 'rgba(249,115,22,0.04)' }}>
                      50% of Exam<div style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>auto</div>
                    </th>
                    <th style={{ textAlign: 'center', minWidth: '60px' }}>Pos</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map(student => {
                    const s = scores[student.id] || {}
                    const rawScore = parseFloat(s.score) || 0
                    const hasScore = s.score !== '' && s.score !== undefined
                    const exam50 = (rawScore / 100) * 50

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
                        <td style={{ padding: '0.5rem 0.35rem', textAlign: 'center' }}>
                          <input type="number" min="0" max="100" value={s.score ?? ''} onChange={e => handleScoreChange(student.id, e.target.value)} placeholder="—"
                            style={{ width: '100%', maxWidth: '90px', padding: '0.5rem 0.4rem', border: '1.5px solid var(--border)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', fontWeight: 600, textAlign: 'center', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent-orange)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)' }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.35rem', textAlign: 'center' }}>
                          {hasScore ? (
                            <div style={{ display: 'inline-block', width: '70px', padding: '0.5rem 0.4rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', background: 'rgba(249,115,22,0.08)', color: 'var(--text-primary)', border: '1.5px solid rgba(249,115,22,0.2)' }}>
                              {exam50.toFixed(1)}
                            </div>
                          ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                          {hasScore ? getExamRank(student.id) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td>
                          {hasScore && (
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
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, studentId: null, studentName: '' })} title="Delete Exam Score" size="sm"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setDeleteModal({ open: false, studentId: null, studentName: '' })}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDeleteRecord} disabled={saving} id="confirm-delete-exam-btn">{saving ? 'Deleting…' : 'Delete'}</button>
        </>}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Are you sure you want to delete the exam score for <strong style={{ color: 'var(--text-primary)' }}>{deleteModal.studentName}</strong> in {selectedSubject}?
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
        background: active ? 'var(--accent-orange)' : done ? 'rgba(249,115,22,0.1)' : 'var(--bg-primary)',
        color: active ? 'white' : done ? 'var(--accent-orange)' : 'var(--text-muted)',
        border: `1.5px solid ${active ? 'var(--accent-orange)' : done ? 'rgba(249,115,22,0.25)' : 'var(--border)'}`,
      }}>
      {icon}
      {value ? <span>{value}</span> : <span>{label}</span>}
    </div>
  )
}
