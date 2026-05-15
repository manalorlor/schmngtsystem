import { useState } from 'react'
import { mockPayments, mockStudents } from '../../lib/mockData'
import { useData } from '../../contexts/DataContext'
import { formatCurrency, formatDate } from '../../lib/utils'
import DataTable from '../../components/ui/DataTable'
import { useToast } from '../../components/ui/Toast'
import { Download, Eye } from 'lucide-react'
import Modal from '../../components/ui/Modal'

export default function PaymentsPageFull() {
  const { addToast } = useToast()
  const { schoolInfo } = useData()
  const [payments] = useState(mockPayments)
  const [modal, setModal] = useState({ open: false, data: null })
  const [filterMethod, setFilterMethod] = useState('')

  const filtered = payments.filter(p => !filterMethod || p.method === filterMethod)
  const totalAmount = filtered.reduce((s, p) => s + (p.amount || 0), 0)

  const columns = [
    { key: 'receiptNo', label: 'Receipt', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.receiptNo}</span> },
    { key: 'studentName', label: 'Student', render: (r) => <span style={{ fontWeight: 600 }}>{r.studentName}</span> },
    { key: 'class', label: 'Class' },
    { key: 'amount', label: 'Amount', render: (r) => <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{formatCurrency(r.amount)}</span> },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'method', label: 'Method', render: (r) => <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{r.method}</span> },
    { key: 'actions', label: '', width: '90px', render: (row) => (
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setModal({ open: true, data: row })}><Eye size={14} /></button>
        <button className="btn btn-ghost btn-sm" onClick={() => addToast(`Receipt ${row.receiptNo} downloaded`, 'success')}><Download size={14} /></button>
      </div>
    )},
  ]

  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header"><h1 className="page-title">Payment History</h1><p className="page-subtitle">All recorded fee transactions</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[{ label: 'Total Payments', value: formatCurrency(totalAmount), color: 'var(--accent-green)' }, { label: 'Transactions', value: filtered.length, color: 'var(--accent-violet)' }, { label: 'Methods Used', value: [...new Set(payments.map(p => p.method))].length, color: 'var(--accent-orange)' }].map(c => (
          <div key={c.label} className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.color }}>{c.value}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{c.label}</div></div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <select className="form-select" style={{ width: 'auto' }} value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
          <option value="">All Methods</option>{['cash', 'momo', 'bank', 'cheque'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
        </select>
      </div>
      <div className="card" style={{ padding: '1rem' }}><DataTable columns={columns} data={filtered} searchKeys={['studentName', 'receiptNo']} searchPlaceholder="Search payments…" pageSize={8} /></div>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title="Payment Receipt">
        {modal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-hover)', borderRadius: '10px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{schoolInfo?.name || 'ScholarFlow Academy'}</div>
              {schoolInfo?.motto && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '4px' }}>{schoolInfo.motto}</div>}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Payment Receipt</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--accent-violet)' }}>{modal.data.receiptNo}</div>
            </div>
            {[['Student', modal.data.studentName], ['Class', modal.data.class], ['Amount', formatCurrency(modal.data.amount)], ['Term', modal.data.term], ['Date', formatDate(modal.data.date)], ['Method', modal.data.method?.toUpperCase()], ['Recorded By', modal.data.recordedBy]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}><span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{l}</span><span style={{ fontSize: '0.83rem', fontWeight: 600 }}>{v}</span></div>
            ))}
            <button className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => { addToast('Receipt downloaded', 'success'); setModal({ open: false, data: null }) }}><Download size={16} /> Download Receipt</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
