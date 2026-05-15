import { GraduationCap } from 'lucide-react'
import { isJHSClass } from '../../lib/utils'

const JHS_GRADING = [
  { level: '1', range: '80-100', label: 'Outstanding' },
  { level: '2', range: '70-79', label: 'Meritorious' },
  { level: '3', range: '60-69', label: 'Substantial' },
  { level: '4', range: '50-59', label: 'Adequate' },
  { level: '5', range: '40-49', label: 'Moderate' },
  { level: '6', range: '30-39', label: 'Elementary' },
  { level: '7', range: '20-29', label: 'Minimal' },
  { level: '8', range: '10-19', label: 'Below Minimum' },
  { level: '9', range: '0-9', label: 'Not Achieved' },
]

const BASIC_GRADING = [
  { level: 'A', range: '80-100', label: 'Excellent' },
  { level: 'B', range: '70-79', label: 'Very Good' },
  { level: 'C', range: '60-69', label: 'Good' },
  { level: 'D', range: '50-59', label: 'Satisfactory' },
  { level: 'E', range: '40-49', label: 'Pass' },
  { level: 'F', range: '0-39', label: 'Fail' },
]

function getGradingSystem(studentClass) {
  return isJHSClass(studentClass) ? JHS_GRADING : BASIC_GRADING
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '14px',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#1a1a2e',
    border: '1px solid #e2e8f0',
  },
  headerBar: {
    background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #8b5cf6 100%)',
    padding: '1.5rem 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  schoolName: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  schoolSub: {
    fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '2px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  body: {
    padding: '1.75rem 2rem 2rem',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: 800,
    color: '#4c1d95',
    marginBottom: '1.25rem',
    letterSpacing: '-0.01em',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  infoTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.82rem',
  },
  infoLabel: {
    background: '#6d28d9',
    color: '#fff',
    fontWeight: 600,
    padding: '0.5rem 0.75rem',
    border: '1px solid #4c1d95',
    whiteSpace: 'nowrap',
    width: '40%',
  },
  infoValue: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d9e6',
    fontWeight: 600,
    background: '#fff',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  subjectTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.82rem',
  },
  subjectHead: {
    background: '#4c1d95',
    color: '#fff',
    fontWeight: 700,
    padding: '0.55rem 0.6rem',
    border: '1px solid #4c1d95',
    textAlign: 'center',
  },
  subjectHeadLeft: {
    background: '#4c1d95',
    color: '#fff',
    fontWeight: 700,
    padding: '0.55rem 0.6rem',
    border: '1px solid #4c1d95',
    textAlign: 'left',
  },
  subjectCell: {
    padding: '0.5rem 0.6rem',
    border: '1px solid #d1d9e6',
    textAlign: 'center',
  },
  subjectName: {
    padding: '0.5rem 0.6rem',
    border: '1px solid #d1d9e6',
    fontWeight: 500,
    textAlign: 'left',
  },
  totalRow: {
    fontWeight: 700,
    background: '#f5f3ff',
  },
  gradingHead: {
    background: '#6d28d9',
    color: '#fff',
    fontWeight: 700,
    padding: '0.55rem 0.5rem',
    border: '1px solid #16537e',
    textAlign: 'center',
    fontSize: '0.82rem',
  },
  gradingHeadSpan: {
    background: '#16537e',
    color: '#fff',
    fontWeight: 700,
    padding: '0.55rem 0.5rem',
    border: '1px solid #16537e',
    textAlign: 'left',
    fontSize: '0.82rem',
  },
  gradingCell: {
    padding: '0.4rem 0.5rem',
    border: '1px solid #d1d9e6',
    textAlign: 'center',
    fontSize: '0.78rem',
    background: '#f0fafb',
  },
  gradingLabel: {
    padding: '0.4rem 0.5rem',
    border: '1px solid #d1d9e6',
    textAlign: 'left',
    fontSize: '0.78rem',
    background: '#f0fafb',
  },
  commentSection: {
    border: '2px solid #16537e',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '1.5rem',
  },
  commentHeader: {
    background: '#e0f2f1',
    padding: '0.65rem 1rem',
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#0f3460',
    borderBottom: '2px solid #16537e',
  },
  commentBody: {
    padding: '1rem',
    minHeight: '60px',
    fontSize: '0.85rem',
    color: '#4a5568',
    fontStyle: 'italic',
  },
  footer: {
    borderTop: '3px solid #4c1d95',
    padding: '0.75rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f8fafc',
  },
  footerSchool: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#6d28d9',
  },
  footerContact: {
    fontSize: '0.7rem',
    color: '#718096',
  },
}

export default function ReportCardTemplate({ student, reports, term, comment, position, classSize, schoolInfo }) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const avgScore = reports.length > 0
    ? reports.reduce((s, r) => s + r.total, 0) / reports.length
    : 0

  const schoolName = schoolInfo?.name || 'ScholarFlow Academy'
  const schoolMotto = schoolInfo?.motto || 'Excellence in Education'
  const schoolContact = schoolInfo?.email ? `${schoolInfo.email}  ·  ${schoolInfo.address || 'Address not provided'}` : 'info@scholarflow.edu  ·  www.scholarflow.edu  ·  +233 244 000 000'

  return (
    <div style={styles.card}>
      {/* ─── Header Bar ─── */}
      <div style={styles.headerBar}>
        <div style={styles.logoCircle}>
          {schoolInfo?.logo ? <img src={schoolInfo.logo} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain' }} alt="Logo" /> : <GraduationCap size={28} color="#fff" />}
        </div>
        <div>
          <div style={styles.schoolName}>{schoolName}</div>
          <div style={styles.schoolSub}>{schoolMotto}</div>
        </div>
      </div>

      <div style={styles.body}>
        {/* ─── Title ─── */}
        <div style={styles.title}>Progress Report Card</div>

        {/* ─── Student Info Grid + Photo ─── */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ ...styles.infoGrid, flex: 1, marginBottom: 0 }}>
          <table style={styles.infoTable}>
            <tbody>
              <tr>
                <td style={styles.infoLabel}>Student Name</td>
                <td style={styles.infoValue}>{student.name}</td>
              </tr>
              <tr>
                <td style={styles.infoLabel}>Student ID</td>
                <td style={styles.infoValue}>{student.studentId}</td>
              </tr>
              <tr>
                <td style={styles.infoLabel}>Class</td>
                <td style={styles.infoValue}>{student.class}</td>
              </tr>
            </tbody>
          </table>

          <table style={styles.infoTable}>
            <tbody>
              <tr>
                <td style={styles.infoLabel}>Gender</td>
                <td style={styles.infoValue}>{student.gender || '—'}</td>
              </tr>
              <tr>
                <td style={styles.infoLabel}>Academic Year</td>
                <td style={styles.infoValue}>2023/2024 ({term})</td>
              </tr>
              <tr>
                <td style={styles.infoLabel}>Date of Issue</td>
                <td style={styles.infoValue}>{today}</td>
              </tr>
            </tbody>
          </table>
        </div>
          
          {/* Photograph Container */}
          <div style={{ width: '115px', height: '140px', border: '2px solid #4c1d95', borderRadius: '8px', padding: '4px', background: '#fff', flexShrink: 0, alignSelf: 'flex-start' }}>
            <div style={{ width: '100%', height: '100%', background: '#f5f3ff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4c1d95', fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden' }}>
              {student.photo ? <img src={student.photo} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'Photo'}
            </div>
          </div>
        </div>

        {/* ─── Subjects + Grading Grid ─── */}
        <div style={styles.contentGrid}>
          {/* Subjects Table */}
          <table style={styles.subjectTable}>
            <thead>
              <tr>
                <th style={styles.subjectHeadLeft}>Subjects</th>
                <th style={styles.subjectHead}>50% Class</th>
                <th style={styles.subjectHead}>50% Exam</th>
                <th style={styles.subjectHead}>Total</th>
                <th style={styles.subjectHead}>Grade</th>
                <th style={styles.subjectHead}>Position</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td style={styles.subjectName}>{r.subject}</td>
                  <td style={styles.subjectCell}>{r.class50.toFixed(1)}</td>
                  <td style={styles.subjectCell}>{r.exam50.toFixed(1)}</td>
                  <td style={{ ...styles.subjectCell, fontWeight: 700 }}>{r.total.toFixed(1)}</td>
                  <td style={{ ...styles.subjectCell, fontWeight: 700 }}>{r.grade}</td>
                  <td style={{ ...styles.subjectCell, fontWeight: 700 }}>{r.position || '—'}</td>
                </tr>
              ))}
              {reports.length > 0 && (
                <tr style={styles.totalRow}>
                  <td style={{ ...styles.subjectName, fontWeight: 700, color: '#0f3460' }}>Average</td>
                  <td style={styles.subjectCell}></td>
                  <td style={styles.subjectCell}></td>
                  <td style={{ ...styles.subjectCell, fontWeight: 800, color: '#0f3460' }}>{avgScore.toFixed(1)}</td>
                  <td style={styles.subjectCell}></td>
                  <td style={styles.subjectCell}></td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Grading System Table */}
          {(() => {
            const gradingRows = getGradingSystem(student.class)
            return (
              <table style={{ ...styles.subjectTable, alignSelf: 'start' }}>
                <thead>
                  <tr>
                    <th colSpan={3} style={styles.gradingHeadSpan}>Grading System</th>
                  </tr>
                </thead>
                <tbody>
                  {gradingRows.map(g => (
                    <tr key={g.level}>
                      <td style={{ ...styles.gradingCell, fontWeight: 700, width: '30px' }}>{g.level}</td>
                      <td style={{ ...styles.gradingCell, width: '60px' }}>{g.range}</td>
                      <td style={styles.gradingLabel}>{g.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          })()}
        </div>

        {/* ─── Teacher's Comments ─── */}
        <div style={styles.commentSection}>
          <div style={styles.commentHeader}>Teacher's Comments and Feedback</div>
          <div style={styles.commentBody}>
            {comment || (avgScore >= 80
              ? 'Outstanding performance! Keep up the excellent work and continue to aim high.'
              : avgScore >= 60
                ? 'Good effort this term. With continued focus and dedication, even better results are within reach.'
                : avgScore >= 40
                  ? 'Satisfactory progress shown. More consistent effort and study habits are encouraged.'
                  : reports.length > 0
                    ? 'Extra support and attention is needed. Please work closely with your teachers to improve.'
                    : 'No academic records available for this term.')}
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <div style={styles.footer}>
        <div>
          <div style={styles.footerSchool}>{schoolName}</div>
          <div style={{ fontSize: '0.72rem', color: '#6d28d9', fontStyle: 'italic', marginTop: '1px' }}>{schoolMotto}</div>
        </div>
        <div style={styles.footerContact}>
          {schoolContact}
        </div>
      </div>
    </div>
  )
}

/**
 * Build the styled PDF from the parent
 */
export function buildReportPDF(doc, autoTableFn, { student, reports, term, comment, position, classSize, schoolInfo }) {
  const w = doc.internal.pageSize.getWidth()
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const schoolName = schoolInfo?.name || 'ScholarFlow Academy'
  const schoolMotto = schoolInfo?.motto || 'Excellence in Education'
  const schoolContact = schoolInfo?.email ? `${schoolInfo.email}  ·  ${schoolInfo.address || 'Address not provided'}` : 'info@scholarflow.edu  ·  www.scholarflow.edu  ·  +233 244 000 000'

  // Header bar
  doc.setFillColor(76, 29, 149)
  doc.rect(0, 0, w, 35, 'F')
  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.setFont(undefined, 'bold')
  doc.text(schoolName, 14, 18)
  doc.setFontSize(9)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(237, 233, 254)
  doc.text(schoolMotto.toUpperCase(), 14, 26)

  // Title
  doc.setTextColor(76, 29, 149)
  doc.setFontSize(15)
  doc.setFont(undefined, 'bold')
  doc.text('Progress Report Card', 14, 48)

  // Student info tables
  autoTableFn(doc, {
    startY: 54,
    theme: 'grid',
    tableWidth: 72,
    margin: { left: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    head: [],
    body: [
      [{ content: 'Student Name', styles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' } }, student.name],
      [{ content: 'Student ID', styles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' } }, student.studentId],
      [{ content: 'Class', styles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' } }, student.class],
    ],
    columnStyles: { 0: { cellWidth: 28 } }
  })

  autoTableFn(doc, {
    startY: 54,
    theme: 'grid',
    tableWidth: 72,
    margin: { left: 92 },
    styles: { fontSize: 9, cellPadding: 3 },
    head: [],
    body: [
      [{ content: 'Gender', styles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' } }, student.gender || '—'],
      [{ content: 'Academic Year', styles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' } }, `2023/2024 (${term})`],
      [{ content: 'Date of Issue', styles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' } }, today],
    ],
    columnStyles: { 0: { cellWidth: 28 } }
  })

  // Student Photo Placeholder
  doc.setDrawColor(76, 29, 149)
  doc.setFillColor(245, 243, 255)
  doc.setLineWidth(0.5)
  doc.roundedRect(170, 54, 25, 30, 1, 1, 'FD')
  doc.setTextColor(76, 29, 149)
  doc.setFontSize(8)
  doc.text('Photo', 176, 70)
  // Subjects table
  const subjectData = reports.map(r => [
    r.subject,
    r.class50.toFixed(1),
    r.exam50.toFixed(1),
    r.total.toFixed(1),
    r.grade,
    r.position || '—'
  ])

  const avgScore = reports.length > 0
    ? (reports.reduce((s, r) => s + r.total, 0) / reports.length)
    : 0

  subjectData.push([
    { content: 'Average', styles: { fontStyle: 'bold' } },
    '', '',
    { content: avgScore.toFixed(1), styles: { fontStyle: 'bold' } },
    '', ''
  ])

  autoTableFn(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    theme: 'grid',
    tableWidth: 120,
    margin: { left: 14 },
    headStyles: { fillColor: [76, 29, 149], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 3, halign: 'center' },
    columnStyles: { 0: { halign: 'left', cellWidth: 35 } },
    head: [['Subjects', '50% Class', '50% Exam', 'Total', 'Grade', 'Position']],
    body: subjectData,
  })

  // Grading system — class-aware
  const gradingData = isJHSClass(student.class)
    ? [
        ['1', '80-100', 'Outstanding'],
        ['2', '70-79', 'Meritorious'],
        ['3', '60-69', 'Substantial'],
        ['4', '50-59', 'Adequate'],
        ['5', '40-49', 'Moderate'],
        ['6', '30-39', 'Elementary'],
        ['7', '20-29', 'Minimal'],
        ['8', '10-19', 'Below Minimum'],
        ['9', '0-9', 'Not Achieved'],
      ]
    : [
        ['A', '80-100', 'Excellent'],
        ['B', '70-79', 'Very Good'],
        ['C', '60-69', 'Good'],
        ['D', '50-59', 'Satisfactory'],
        ['E', '40-49', 'Pass'],
        ['F', '0-39', 'Fail'],
      ]

  autoTableFn(doc, {
    startY: 85,
    theme: 'grid',
    tableWidth: 62,
    margin: { left: 140 },
    headStyles: { fillColor: [22, 83, 126], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2.5, fillColor: [240, 250, 251] },
    columnStyles: { 0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' }, 1: { cellWidth: 15, halign: 'center' } },
    head: [[{ content: 'Grading System', colSpan: 3 }]],
    body: gradingData,
  })

  // Teacher's Comments
  const commentY = doc.lastAutoTable.finalY + 12
  doc.setDrawColor(22, 83, 126)
  doc.setLineWidth(0.5)
  doc.roundedRect(14, commentY, w - 28, 38, 3, 3, 'S')

  doc.setFillColor(224, 242, 241)
  doc.rect(14, commentY, w - 28, 10, 'F')
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(15, 52, 96)
  doc.text("Teacher's Comments and Feedback", 18, commentY + 7)

  doc.setFontSize(9)
  doc.setFont(undefined, 'italic')
  doc.setTextColor(80, 80, 80)
  const feedbackText = comment || (avgScore >= 80
    ? 'Outstanding performance! Keep up the excellent work.'
    : avgScore >= 60
      ? 'Good effort this term. Continued focus will yield even better results.'
      : avgScore >= 40
        ? 'Satisfactory progress. More consistent effort is encouraged.'
        : 'Extra support is needed. Please work closely with your teachers.')
  doc.text(feedbackText, 18, commentY + 20, { maxWidth: w - 36 })

  // Footer bar
  const footerY = commentY + 46
  doc.setFillColor(15, 52, 96)
  doc.rect(0, footerY, w, 22, 'F')
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(schoolName, 14, footerY + 7)
  doc.setFontSize(7.5)
  doc.setFont(undefined, 'italic')
  doc.setTextColor(200, 220, 255)
  doc.text(schoolMotto, 14, footerY + 13)
  doc.setFontSize(7)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(160, 190, 240)
  doc.text(schoolContact, 14, footerY + 19)
}
