import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { formatCurrency, getInitials, getAvatarColor } from '../../lib/utils'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { Download, Eye, ClipboardList, Receipt, CheckCircle, CalendarDays, Trash2 } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { mockTeachers } from '../../lib/mockData'

// jsPDF's default Helvetica font cannot render GH₵. Use 'GHS' prefix instead.
const pdfCurrency = (amount) => {
  const n = Number(amount) || 0
  return `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Ghana PAYE Tax Calculator (monthly) ──
function calcPAYE(monthlyGross) {
  const annual = monthlyGross * 12
  let tax = 0
  const brackets = [
    [4380, 0], [1320, 0.05], [1560, 0.10], [38000, 0.175], [192000, 0.25],
  ]
  let remaining = annual
  for (const [limit, rate] of brackets) {
    const taxable = Math.min(remaining, limit)
    tax += taxable * rate
    remaining -= taxable
    if (remaining <= 0) break
  }
  if (remaining > 0) tax += remaining * 0.30
  return parseFloat((tax / 12).toFixed(2))
}

function calcAll(f) {
  const gross = (+f.basicSalary||0) + (+f.transportAllowance||0) + (+f.housingAllowance||0) + (+f.medicalAllowance||0) + (+f.otherAllowance||0)
  const ssnitEmp = parseFloat(((+f.basicSalary||0) * 0.055).toFixed(2))
  const ssnitEmployer = parseFloat(((+f.basicSalary||0) * 0.13).toFixed(2))
  const incomeTax = calcPAYE(gross - ssnitEmp)
  const totalDed = ssnitEmp + incomeTax + (+f.otherDeductions||0)
  const net = parseFloat((gross - totalDed).toFixed(2))
  return { grossSalary: gross, ssnitEmployee: ssnitEmp, ssnitEmployer, incomeTax, totalDeductions: totalDed, netPay: net }
}

const getEmptyForm = () => ({
  period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  basicSalary: '', transportAllowance: '', housingAllowance: '',
  medicalAllowance: '', otherAllowance: '', otherDeductions: '',
})

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }) {
  const map = {
    not_configured: ['badge-gray', 'Not Configured'],
    configured:     ['badge-amber', 'Ready to Issue'],
    issued:         ['badge-green', 'Issued'],
  }
  const [cls, label] = map[status] || ['badge-gray', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

export default function PayrollPageFull() {
  const { addToast } = useToast()
  const { schoolInfo, payrollRecords, savePayrollRecord, issuePayrollRecord, deletePayrollRecord, issueAllReadyForPeriod } = useData()
  const [modal, setModal] = useState({ type: null, data: null })
  const [selectedPeriod, setSelectedPeriod] = useState(() => getEmptyForm().period)
  const [form, setForm] = useState(getEmptyForm())
  const [filterStatus, setFilterStatus] = useState('')

  // Generate a list of months for the dropdown (6 months back, 6 ahead)
  const availablePeriods = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 6 + i)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  })

  // Build the list of records for the currently selected month
  const currentMonthRecords = mockTeachers.map(t => {
    const existing = payrollRecords.find(p => p.teacherId === t.id && p.period === selectedPeriod)
    if (existing) return existing
    return {
      teacherId: t.id, name: t.name, employeeId: t.employeeId,
      period: selectedPeriod, status: 'not_configured',
      basicSalary: 0, transportAllowance: 0, housingAllowance: 0,
      medicalAllowance: 0, otherAllowance: 0, grossSalary: 0,
      ssnitEmployee: 0, ssnitEmployer: 0, incomeTax: 0,
      otherDeductions: 0, totalDeductions: 0, netPay: 0,
    }
  })

  const filtered = currentMonthRecords.filter(p => !filterStatus || p.status === filterStatus)
  const configured = currentMonthRecords.filter(p => p.status === 'configured').length
  const issued = currentMonthRecords.filter(p => p.status === 'issued').length

  const derived = calcAll(form)

  const openConfigure = (record) => {
    setForm({
      period: record.period || getEmptyForm().period,
      basicSalary: record.basicSalary || '',
      transportAllowance: record.transportAllowance || '',
      housingAllowance: record.housingAllowance || '',
      medicalAllowance: record.medicalAllowance || '',
      otherAllowance: record.otherAllowance || '',
      otherDeductions: record.otherDeductions || '',
    })
    setModal({ type: 'configure', data: record })
  }

  const handleSaveConfigure = (e) => {
    e.preventDefault()
    const calcs = calcAll(form)
    savePayrollRecord({
      ...modal.data,
      ...form,
      period: selectedPeriod,
      basicSalary: +form.basicSalary || 0,
      transportAllowance: +form.transportAllowance || 0,
      housingAllowance: +form.housingAllowance || 0,
      medicalAllowance: +form.medicalAllowance || 0,
      otherAllowance: +form.otherAllowance || 0,
      otherDeductions: +form.otherDeductions || 0,
      ...calcs,
      status: 'configured',
    })
    addToast('Salary details saved — ready to issue payslip', 'success')
    setModal({ type: null, data: null })
  }

  const handleIssueSingle = (record) => {
    issuePayrollRecord(record.teacherId, selectedPeriod, { term: schoolInfo?.currentTerm, academicYear: schoolInfo?.academicYear })
    addToast(`Payslip issued for ${record.name}`, 'success')
    setModal({ type: null, data: null })
  }

  const handleIssueAll = () => {
    if (configured === 0) { addToast('No configured payslips to issue', 'warning'); return }
    issueAllReadyForPeriod(selectedPeriod, { term: schoolInfo?.currentTerm, academicYear: schoolInfo?.academicYear })
    addToast(`${configured} payslip(s) issued successfully`, 'success')
  }

  const handleDeleteRecord = (record) => {
    if (window.confirm(`Are you sure you want to delete the payslip for ${record.name} for ${selectedPeriod}? This will remove it from their portal as well.`)) {
      deletePayrollRecord(record.teacherId, selectedPeriod)
      addToast(`Payslip for ${record.name} deleted`, 'info')
    }
  }

  const generatePDF = (r) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const w = doc.internal.pageSize.getWidth()
    const L = 14
    const R = w - 14

    const drawRow = (label, value, y, labelColor, valueColor, bold) => {
      doc.setFontSize(9.5)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(...(labelColor || [80, 90, 110]))
      doc.text(label, L + 4, y)
      doc.setFont(undefined, bold ? 'bold' : 'normal')
      doc.setTextColor(...(valueColor || [15, 23, 42]))
      doc.text(value, R, y, { align: 'right' })
    }

    const sectionHead = (label, y) => {
      doc.setFillColor(37, 55, 90)
      doc.rect(L, y, w - 28, 7, 'F')
      doc.setFontSize(8)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(label, L + 4, y + 5)
      return y + 13
    }

    // ── Header ──
    doc.setFillColor(28, 35, 51)
    doc.rect(0, 0, w, 42, 'F')
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
    if (r.issuedDate) doc.text(`Issued: ${fmtDate(r.issuedDate)}`, R, 31, { align: 'right' })

    // ── Employee Box ──
    let y = 50
    doc.setFillColor(245, 247, 250); doc.setDrawColor(210, 218, 230)
    doc.roundedRect(L, y, w - 28, 24, 2, 2, 'FD')
    doc.setFontSize(7.5); doc.setFont(undefined, 'bold'); doc.setTextColor(130, 145, 165)
    doc.text('EMPLOYEE NAME', L + 4, y + 6)
    doc.text('EMPLOYEE ID', w / 2 + 2, y + 6)
    doc.text('ROLE', L + 4, y + 17)
    doc.text('STATUS', w / 2 + 2, y + 17)
    doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.setTextColor(15, 23, 42)
    doc.text(r.name, L + 4, y + 13)
    doc.text(r.employeeId, w / 2 + 2, y + 13)
    doc.setFontSize(9); doc.setFont(undefined, 'normal')
    doc.text('Staff', L + 4, y + 22)
    doc.setTextColor(r.status === 'issued' ? 22 : 202, r.status === 'issued' ? 163 : 100, r.status === 'issued' ? 74 : 10)
    doc.text(r.status === 'issued' ? 'ISSUED' : 'PENDING', w / 2 + 2, y + 22)
    y += 32

    // ── Earnings ──
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
        drawRow(label, pdfCurrency(val), y)
        y += 8; alt = !alt
      }
    })
    doc.setDrawColor(200, 210, 225); doc.line(L, y, R, y); y += 6
    doc.setFillColor(235, 241, 255); doc.rect(L, y - 4.5, w - 28, 8, 'F')
    drawRow('GROSS SALARY', pdfCurrency(r.grossSalary || 0), y, [37, 99, 235], [37, 99, 235], true)
    y += 14

    // ── Deductions ──
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
        drawRow(label, `- ${pdfCurrency(val)}`, y, [80, 90, 110], [185, 28, 28])
        y += 8; alt = !alt
      }
    })
    doc.setDrawColor(200, 210, 225); doc.line(L, y, R, y); y += 6
    doc.setFillColor(255, 241, 241); doc.rect(L, y - 4.5, w - 28, 8, 'F')
    drawRow('TOTAL DEDUCTIONS', `- ${pdfCurrency(r.totalDeductions || 0)}`, y, [185, 28, 28], [185, 28, 28], true)
    y += 16

    // ── Net Pay ──
    doc.setFillColor(28, 35, 51); doc.roundedRect(L, y, w - 28, 18, 3, 3, 'F')
    doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.setTextColor(160, 185, 230)
    doc.text('NET PAY', L + 6, y + 12)
    doc.setFontSize(14); doc.setTextColor(255, 255, 255)
    doc.text(pdfCurrency(r.netPay || 0), R - 2, y + 12, { align: 'right' })
    y += 28

    // ── SSNIT Note ──
    doc.setFillColor(245, 249, 255); doc.setDrawColor(195, 215, 245)
    doc.roundedRect(L, y, w - 28, 14, 2, 2, 'FD')
    doc.setFontSize(7.5); doc.setFont(undefined, 'normal'); doc.setTextColor(60, 90, 140)
    doc.text(`Note: Employer SSNIT contribution of ${pdfCurrency(r.ssnitEmployer || 0)} (13%) is remitted by the school directly to SSNIT Trust.`, L + 4, y + 5)
    doc.text('This amount is not deducted from the employee net pay.', L + 4, y + 11)
    y += 22

    // ── Signatures ──
    const sigY = y + 8
    doc.setDrawColor(160, 170, 185)
    doc.line(L, sigY, L + 55, sigY)
    doc.line(R - 55, sigY, R, sigY)
    doc.setFontSize(8); doc.setFont(undefined, 'normal'); doc.setTextColor(130, 140, 160)
    doc.text('Employee Signature', L, sigY + 5)
    doc.text('Authorised Signatory', R - 55, sigY + 5)

    // ── Footer ──
    doc.setFontSize(7.5); doc.setTextColor(180, 190, 205)
    doc.text('This is a computer-generated payslip and does not require a physical signature.', w / 2, 287, { align: 'center' })
    doc.text(`Generated by ScholarFlow  •  ${new Date().toLocaleDateString('en-GB')}`, w / 2, 292, { align: 'center' })

    doc.save(`${r.name.replace(/\s+/g, '_')}_Payslip_${r.period.replace(/\s+/g, '_')}.pdf`)
    addToast('Payslip PDF downloaded', 'success')
  }

  return (
    <div>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem',alignItems:'flex-end'}}>
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-subtitle">Configure staff salary details and issue official payslips</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'var(--bg-primary)',padding:'0.4rem 0.75rem',borderRadius:'8px',border:'1px solid var(--border)'}}>
            <CalendarDays size={16} color="var(--text-muted)"/>
            <select className="form-select" style={{border:'none',background:'transparent',padding:0,fontWeight:600}} value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
              {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleIssueAll} disabled={configured===0}>
            <Receipt size={16}/> Issue All Ready ({configured})
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label:'Total Staff', value: currentMonthRecords.length, color:'var(--accent-blue)' },
          { label:'Pending Configuration', value: currentMonthRecords.length - configured - issued, color:'var(--accent-amber)' },
          { label:'Payslips Issued', value: issued, color:'var(--accent-green)' },
        ].map(c=>(
          <div key={c.label} className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:'1.75rem',fontWeight:800,color:c.color}}>{c.value}</div>
            <div style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:'0.25rem'}}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem'}}>
        <select className="form-select" style={{width:'auto'}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">All Staff</option>
          <option value="not_configured">Not Configured</option>
          <option value="configured">Ready to Issue</option>
          <option value="issued">Issued</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'var(--bg-primary)',borderBottom:'2px solid var(--border)'}}>
              {['Staff','Period','Gross Salary','SSNIT (Emp)','Tax (PAYE)','Net Pay','Status','Actions'].map(h=>(
                <th key={h} style={{padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r,i)=>(
              <tr key={r.id} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'transparent':'var(--bg-primary)'}}>
                <td style={{padding:'0.875rem 1rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                    <div className="avatar" style={{background:getAvatarColor(r.name),fontSize:'0.7rem'}}>{getInitials(r.name)}</div>
                    <div>
                      <div style={{fontWeight:600,fontSize:'0.85rem'}}>{r.name}</div>
                      <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{r.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'0.875rem 1rem',fontSize:'0.83rem'}}>{r.period}</td>
                <td style={{padding:'0.875rem 1rem',fontSize:'0.83rem',fontWeight:600}}>{r.grossSalary>0?formatCurrency(r.grossSalary):'—'}</td>
                <td style={{padding:'0.875rem 1rem',fontSize:'0.83rem',color:'var(--accent-amber)'}}>{r.ssnitEmployee>0?formatCurrency(r.ssnitEmployee):'—'}</td>
                <td style={{padding:'0.875rem 1rem',fontSize:'0.83rem',color:'var(--accent-red)'}}>{r.incomeTax>0?formatCurrency(r.incomeTax):'—'}</td>
                <td style={{padding:'0.875rem 1rem',fontSize:'0.9rem',fontWeight:700,color:'var(--accent-blue)'}}>{r.netPay>0?formatCurrency(r.netPay):'—'}</td>
                <td style={{padding:'0.875rem 1rem'}}><StatusBadge status={r.status}/></td>
                <td style={{padding:'0.875rem 1rem'}}>
                  <div style={{display:'flex',gap:'0.35rem',flexWrap:'wrap'}}>
                    <button className="btn btn-ghost btn-sm" title="Configure Salary" onClick={()=>openConfigure(r)}><ClipboardList size={14}/></button>
                    {r.status==='configured' && (
                      <button className="btn btn-primary btn-sm" onClick={()=>handleIssueSingle(r)}><Receipt size={14}/> Issue</button>
                    )}
                    {r.status==='issued' && (
                      <>
                        <button className="btn btn-ghost btn-sm" title="Preview" onClick={()=>setModal({type:'view',data:r})}><Eye size={14}/></button>
                        <button className="btn btn-secondary btn-sm" title="Download PDF" onClick={()=>generatePDF(r)}><Download size={14}/></button>
                      </>
                    )}
                    <button className="btn btn-ghost btn-sm" title="Delete Record" onClick={()=>handleDeleteRecord(r)} style={{color:'var(--accent-red)'}}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && (
          <div style={{padding:'3rem',textAlign:'center',color:'var(--text-muted)'}}>No records found</div>
        )}
      </div>

      {/* CONFIGURE MODAL */}
      <Modal isOpen={modal.type==='configure'} onClose={()=>setModal({type:null,data:null})} title={`Configure Payslip — ${modal.data?.name||''}`}>
        {modal.data && (
          <form onSubmit={handleSaveConfigure} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">Pay Period</label>
              <input className="form-input" value={form.period} onChange={e=>setForm(f=>({...f,period:e.target.value}))} placeholder="e.g. May 2025" required/>
            </div>

            <div style={{background:'var(--bg-primary)',borderRadius:'8px',padding:'1rem'}}>
              <div style={{fontSize:'0.78rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.75rem'}}>Earnings</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                {[['Basic Salary *','basicSalary'],['Transport Allowance','transportAllowance'],['Housing Allowance','housingAllowance'],['Medical Allowance','medicalAllowance'],['Other Allowance','otherAllowance']].map(([l,k])=>(
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <input type="number" className="form-input" min="0" step="0.01" placeholder="0.00" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} required={k==='basicSalary'}/>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:'var(--bg-primary)',borderRadius:'8px',padding:'1rem'}}>
              <div style={{fontSize:'0.78rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.75rem'}}>Additional Deductions</div>
              <div className="form-group">
                <label className="form-label">Other Deductions (Loans, Advances, etc.)</label>
                <input type="number" className="form-input" min="0" step="0.01" placeholder="0.00" value={form.otherDeductions} onChange={e=>setForm(f=>({...f,otherDeductions:e.target.value}))}/>
              </div>
            </div>

            {/* Auto-calculated preview */}
            <div style={{background:'var(--bg-hover)',border:'1px solid var(--border)',borderRadius:'10px',padding:'1rem'}}>
              <div style={{fontSize:'0.78rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.75rem'}}>Auto-Calculated Preview</div>
              {[
                ['Gross Salary', formatCurrency(derived.grossSalary), 'var(--text-primary)', true],
                ['SSNIT Employee (5.5%)', `- ${formatCurrency(derived.ssnitEmployee)}`, 'var(--accent-amber)', false],
                ['SSNIT Employer (13%)', formatCurrency(derived.ssnitEmployer), 'var(--text-muted)', false],
                ['Income Tax / PAYE', `- ${formatCurrency(derived.incomeTax)}`, 'var(--accent-red)', false],
                ['Other Deductions', `- ${formatCurrency(+form.otherDeductions||0)}`, 'var(--accent-red)', false],
              ].map(([l,v,c,bold])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'0.3rem 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{l}</span>
                  <span style={{fontSize:'0.8rem',fontWeight:bold?700:500,color:c}}>{v}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',padding:'0.625rem 0',marginTop:'0.25rem'}}>
                <span style={{fontWeight:700,fontSize:'0.95rem'}}>NET PAY</span>
                <span style={{fontWeight:800,fontSize:'1rem',color:'var(--accent-blue)'}}>{formatCurrency(derived.netPay)}</span>
              </div>
            </div>

            <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-ghost" onClick={()=>setModal({type:null,data:null})}>Cancel</button>
              <button type="submit" className="btn btn-primary"><CheckCircle size={16}/> Save Details</button>
            </div>
          </form>
        )}
      </Modal>

      {/* VIEW PAYSLIP MODAL */}
      <Modal isOpen={modal.type==='view'} onClose={()=>setModal({type:null,data:null})} title="Payslip Preview">
        {modal.data && (
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            <div style={{textAlign:'center',padding:'1rem',background:'var(--bg-hover)',borderRadius:'10px'}}>
              <Receipt size={26} color="var(--accent-blue)" style={{margin:'0 auto 0.5rem'}}/>
              <div style={{fontWeight:800,fontSize:'1rem'}}>{schoolInfo?.name||'ScholarFlow Academy'}</div>
              {schoolInfo?.motto && <div style={{fontSize:'0.72rem',color:'var(--text-muted)',fontStyle:'italic'}}>{schoolInfo.motto}</div>}
              <div style={{fontSize:'0.8rem',color:'var(--text-muted)',marginTop:'0.25rem',fontWeight:600}}>{modal.data.period}</div>
            </div>
            <div style={{border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
              {[
                ['Employee', modal.data.name, null],
                ['Employee ID', modal.data.employeeId, null],
                ['─ EARNINGS ─', '', 'header'],
                ['Basic Salary', formatCurrency(modal.data.basicSalary||0), null],
                ['Transport', formatCurrency(modal.data.transportAllowance||0), null],
                ['Housing', formatCurrency(modal.data.housingAllowance||0), null],
                ['Medical', formatCurrency(modal.data.medicalAllowance||0), null],
                ['Other Allow.', formatCurrency(modal.data.otherAllowance||0), null],
                ['Gross Salary', formatCurrency(modal.data.grossSalary||0), 'bold'],
                ['─ DEDUCTIONS ─', '', 'header'],
                ['SSNIT Emp (5.5%)', `- ${formatCurrency(modal.data.ssnitEmployee||0)}`, 'deduct'],
                ['Income Tax (PAYE)', `- ${formatCurrency(modal.data.incomeTax||0)}`, 'deduct'],
                ['Other Deductions', `- ${formatCurrency(modal.data.otherDeductions||0)}`, 'deduct'],
                ['NET PAY', formatCurrency(modal.data.netPay||0), 'net'],
              ].map(([l,v,type],i)=> type==='header' ? (
                <div key={i} style={{padding:'0.4rem 1rem',background:'var(--bg-primary)',fontSize:'0.72rem',fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.05em'}}>{l}</div>
              ) : (
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'0.6rem 1rem',background:i%2===0?'transparent':'var(--bg-primary)',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:'0.83rem',color:'var(--text-muted)'}}>{l}</span>
                  <span style={{fontSize:'0.83rem',fontWeight:type==='net'||type==='bold'?800:500,color:type==='net'?'var(--accent-blue)':type==='deduct'?'var(--accent-red)':undefined}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
              <button className="btn btn-ghost" onClick={()=>setModal({type:null,data:null})}>Close</button>
              <button className="btn btn-primary" onClick={()=>generatePDF(modal.data)}><Download size={15}/> Download PDF</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
