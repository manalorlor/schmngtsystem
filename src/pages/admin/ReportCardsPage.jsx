import { useState } from 'react'
import { mockStudents, mockClasses } from '../../lib/mockData'
import { useData } from '../../contexts/DataContext'
import DataTable from '../../components/ui/DataTable'
import { calculateSBA, getGrade, getSubjectRank } from '../../lib/utils'
import { useToast } from '../../components/ui/Toast'
import { FileText, Download, Eye } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ReportCardTemplate, { buildReportPDF } from '../../components/ui/ReportCardTemplate'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ReportCardsPage() {
  const { addToast } = useToast()
  const { sbaRecords, examScores, schoolInfo } = useData()
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('Term 2')
  const [modal, setModal] = useState({ open: false, student: null })

  const students = mockStudents.filter(s => s.status === 'active')

  const generateReport = (student) => {
    const sba = sbaRecords.filter(r => r.studentId === student.id && r.term === selectedTerm)
    return sba.map(r => {
      const examRec = examScores.find(e => e.studentId === student.id && e.subject === r.subject && e.term === selectedTerm)
      const examScore = examRec ? examRec.score : 0
      
      const { classTotal, class50, exam50, total } = calculateSBA({ ...r, examScore })
      const { grade, color, label } = getGrade(total, student.class)
      const position = getSubjectRank(student.id, student.class, r.subject, selectedTerm, sbaRecords, examScores, students)
      return { ...r, examScore, classTotal, class50, exam50, total, grade, gradeColor: color, label, position }
    })
  }

  const viewReport = (student) => {
    setModal({ open: true, student })
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

  const filteredByClass = students.filter(s => !selectedClass || s.class === selectedClass)
  const filteredStudents = filteredByClass.filter(s => !selectedStudent || s.id === selectedStudent)

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Report Cards</h1><p className="page-subtitle">Generate and manage student academic reports</p></div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select className="form-select" style={{ width: 'auto' }} value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent('') }}>
          <option value="">Select Class</option>
          {mockClasses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        
        {selectedClass && (
          <select className="form-select" style={{ width: 'auto' }} value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
            <option value="">All Students in {selectedClass}</option>
            {filteredByClass.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}

        <select className="form-select" style={{ width: 'auto' }} value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
          {['Term 1', 'Term 2', 'Term 3'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {!selectedClass ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5, margin: '0 auto' }} />
          <p>Please select a class to view student report cards.</p>
        </div>
      ) : (
        <>
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
                  { key: 'class', label: 'Class' },
                  { key: 'subjects', label: 'Subjects', render: s => {
                    const reports = generateReport(s)
                    return <span>{reports.length}</span>
                  }},
                  { key: 'actions', label: 'Actions', width: '100px', render: s => (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-ghost btn-sm" title="View Report" onClick={() => viewReport(s)}><Eye size={14} /></button>
                      <button className="btn btn-ghost btn-sm" title="Download PDF" onClick={() => handleDownload(s)}><Download size={14} /></button>
                    </div>
                  )}
                ]}
                data={filteredStudents}
                searchKeys={['name', 'studentId', 'class']}
                pageSize={10}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {filteredStudents.map(student => {
                const reports = generateReport(student)
                return (
                  <div key={student.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.studentId} · {student.class}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {reports.length === 0 && <span className="badge badge-gray">No Records</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{reports.length} subject{reports.length !== 1 ? 's' : ''} · {selectedTerm}</div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => viewReport(student)}><Eye size={14} /> View</button>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => handleDownload(student)}><Download size={14} /> Download</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
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
