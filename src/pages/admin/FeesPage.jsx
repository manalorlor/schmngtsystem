import { useState } from 'react'
import { mockFees, mockPayments, mockStudents } from '../../lib/mockData'
import { formatCurrency, formatDate } from '../../lib/utils'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { Plus, Download } from 'lucide-react'
import { useData } from '../../contexts/DataContext'

const PAYMENT_METHODS = ['cash', 'momo', 'bank', 'cheque']

export default function FeesPage() {
  const [tab, setTab] = useState('ledger')
  const [payments, setPayments] = useState(mockPayments)
  const [fees, setFees] = useState(() => mockFees.map(f => ({ ...f })))
  const [modal, setModal] = useState({ type: null, data: null })
  const [form, setForm] = useState({ studentId: '', amount: '', method: 'cash', term: 'Term 2', academicYear: '2023/2024', date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()
  const { addNotification } = useData()

  const openRecord = () => setModal({ type: 'payment', data: null })
  const closeModal = () => setModal({ type: null, data: null })

  const handlePayment = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    const student = mockStudents.find((s) => s.id === form.studentId)
    const paidAmount = parseFloat(form.amount) || 0
    const receiptNo = `RCP-${Date.now()}`

    // Push new entry to payments list
    setPayments((arr) => [
      { ...form, id: `p${Date.now()}`, receiptNo, studentName: student?.name || '—', class: student?.class || '—', recordedBy: 'Admin', amount: paidAmount },
      ...arr,
    ])

    // Update the matching fee ledger record (balance, amountPaid, status)
    setFees((prev) => prev.map((f) => {
      if (f.studentId !== form.studentId || f.term !== form.term) return f
      const newAmountPaid = f.amountPaid + paidAmount
      const newBalance = Math.max(0, f.totalFee - newAmountPaid)
      const newStatus = newBalance === 0 ? 'paid' : newAmountPaid > 0 ? 'partial' : 'pending'
      return { ...f, amountPaid: newAmountPaid, balance: newBalance, status: newStatus }
    }))

    setSaving(false)
    closeModal()
    setTab('payments') // Auto-switch so user immediately sees the new payment entry
    addToast(`Payment of ${formatCurrency(paidAmount)} recorded for ${student?.name}`, 'success')
    addNotification({ title: 'Fee Payment Received', desc: `${student?.name || 'A student'} paid ${formatCurrency(paidAmount)} for ${form.term}`, type: 'success', audience: 'Admin' })
  }

  const feeColumns = [
    { key: 'studentName', label: 'Student', render: (r) => <span style={{ fontWeight: 600 }}>{r.studentName}</span> },
    { key: 'class', label: 'Class' },
    { key: 'term', label: 'Term' },
    { key: 'totalFee', label: 'Total Fee', render: (r) => formatCurrency(r.totalFee) },
    { key: 'amountPaid', label: 'Paid', render: (r) => <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{formatCurrency(r.amountPaid)}</span> },
    {
      key: 'balance', label: 'Balance',
      render: (r) => <span style={{ color: r.balance > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600 }}>
        {formatCurrency(r.balance)}
      </span>,
    },
    { key: 'dueDate', label: 'Due Date', render: (r) => formatDate(r.dueDate) },
    {
      key: 'status', label: 'Status',
      render: (r) => (
        <span className={`badge ${r.status === 'paid' ? 'badge-green' : r.status === 'partial' ? 'badge-amber' : 'badge-red'}`}>
          {r.status}
        </span>
      ),
    },
  ]

  const paymentColumns = [
    { key: 'receiptNo', label: 'Receipt No.', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.receiptNo}</span> },
    { key: 'studentName', label: 'Student', render: (r) => <span style={{ fontWeight: 600 }}>{r.studentName}</span> },
    { key: 'class', label: 'Class' },
    { key: 'term', label: 'Term' },
    { key: 'amount', label: 'Amount', render: (r) => <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{formatCurrency(r.amount)}</span> },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    {
      key: 'method', label: 'Method',
      render: (r) => <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{r.method}</span>,
    },
    { key: 'recordedBy', label: 'Recorded By' },
    {
      key: 'actions', label: '', width: '50px',
      render: (row) => (
        <button className="btn btn-ghost btn-sm" title="Download receipt" onClick={() => addToast(`Receipt ${row.receiptNo} downloaded`, 'success')}>
          <Download size={14} />
        </button>
      ),
    },
  ]

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Finance</h1>
          <p className="page-subtitle">Fee ledger and payment records</p>
        </div>
        <button id="record-payment-btn" className="btn btn-primary" onClick={openRecord}>
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Payments', value: formatCurrency(totalPaid), color: 'var(--accent-green)' },
          { label: 'Students with Balance', value: fees.filter((f) => f.balance > 0).length, color: 'var(--accent-red)' },
          { label: 'Fully Paid', value: fees.filter((f) => f.status === 'paid').length, color: 'var(--accent-violet)' },
          { label: 'Payment Records', value: payments.length, color: 'var(--text-primary)' },
        ].map((c) => (
          <div key={c.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ maxWidth: '280px', marginBottom: '1.5rem' }}>
        <button className={`tab ${tab === 'ledger' ? 'active' : ''}`} onClick={() => setTab('ledger')}>Fee Ledger</button>
        <button className={`tab ${tab === 'payments' ? 'active' : ''}`} onClick={() => setTab('payments')}>Payments</button>
      </div>

      {tab === 'ledger' && (
        <div className="card" style={{ padding: '1rem' }}>
          <DataTable columns={feeColumns} data={fees} searchKeys={['studentName', 'class']} searchPlaceholder="Search student…" pageSize={8} />
        </div>
      )}

      {tab === 'payments' && (
        <div className="card" style={{ padding: '1rem' }}>
          <DataTable columns={paymentColumns} data={payments} searchKeys={['studentName', 'receiptNo', 'class']} searchPlaceholder="Search payment…" pageSize={8} />
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={modal.type === 'payment'}
        onClose={closeModal}
        title="Record Payment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePayment} disabled={saving || !form.studentId || !form.amount} id="save-payment-btn">
              {saving ? 'Recording…' : 'Record Payment'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div className="form-group">
            <label className="form-label">Student</label>
            <select className="form-select" value={form.studentId} onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}>
              <option value="">Select student</option>
              {mockStudents.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.class}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <div className="form-group">
              <label className="form-label">Amount (GHS)</label>
              <input type="number" className="form-input" placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-select" value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m} style={{ textTransform: 'capitalize' }}>{m.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Term</label>
              <select className="form-select" value={form.term} onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}>
                {['Term 1', 'Term 2', 'Term 3'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
