import { useState } from 'react'
import { mockStudents, mockClasses } from '../../lib/mockData'
import { getInitials, getAvatarColor, formatDate } from '../../lib/utils'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { UserPlus, CheckCircle2, XCircle, Eye, Clock, Trash2 } from 'lucide-react'

const STATUSES = ['pending', 'approved', 'rejected']

const initialApps = [
  { id: 'app1', name: 'Kwabena Owusu', dob: '2012-03-15', gender: 'Male', class: 'JHS 1A', guardianName: 'Mary Owusu', guardianPhone: '0244-111-000', prevSchool: 'Bright Star Academy', status: 'pending', appliedDate: '2024-05-01' },
  { id: 'app2', name: 'Adwoa Mensah', dob: '2011-07-22', gender: 'Female', class: 'JHS 2A', guardianName: 'James Mensah', guardianPhone: '0244-222-000', prevSchool: 'Grace International', status: 'pending', appliedDate: '2024-05-02' },
  { id: 'app3', name: 'Kofi Badu', dob: '2012-01-10', gender: 'Male', class: 'JHS 1B', guardianName: 'Esi Badu', guardianPhone: '0244-333-000', prevSchool: 'Hope Academy', status: 'approved', appliedDate: '2024-04-20' },
  { id: 'app4', name: 'Ama Sarpong', dob: '2011-11-05', gender: 'Female', class: 'JHS 2B', guardianName: 'Nana Sarpong', guardianPhone: '0244-444-000', prevSchool: 'Victory Prep', status: 'rejected', appliedDate: '2024-04-18' },
]

const EMPTY = { name: '', dob: '', gender: '', class: '', guardianName: '', guardianPhone: '', prevSchool: '', status: 'pending', appliedDate: new Date().toISOString().split('T')[0], admissionDate: '', prevClass: '', admissionFee: '', religion: '', hometown: '', guardianRelation: '' }

export default function AdmissionsPage() {
  const [apps, setApps] = useState(initialApps)
  const [modal, setModal] = useState({ type: null, data: null })
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const { addToast } = useToast()

  const openAdd = () => { setForm({ ...EMPTY }); setModal({ type: 'add', data: null }) }
  const openView = (a) => setModal({ type: 'view', data: a })
  const openDelete = (a) => setModal({ type: 'delete', data: a })
  const closeModal = () => setModal({ type: null, data: null })

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    setApps((arr) => [...arr, { ...form, id: `app${Date.now()}` }])
    setSaving(false)
    closeModal()
    addToast(`Application for ${form.name} submitted successfully`, 'success')
  }

  const handleStatus = async (id, status) => {
    setApps((arr) => arr.map((a) => a.id === id ? { ...a, status } : a))
    addToast(`Application ${status}`, status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info')
  }

  const handleDelete = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    const name = modal.data?.name
    setApps((arr) => arr.filter((a) => a.id !== modal.data.id))
    setSaving(false)
    closeModal()
    addToast(`Application for ${name} deleted`, 'info')
  }

  const filtered = apps.filter((a) => !filterStatus || a.status === filterStatus)
  const stats = { total: apps.length, pending: apps.filter(a => a.status === 'pending').length, approved: apps.filter(a => a.status === 'approved').length, rejected: apps.filter(a => a.status === 'rejected').length }

  const columns = [
    { key: 'name', label: 'Applicant', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div className="avatar" style={{ background: getAvatarColor(r.name), fontSize: '0.7rem' }}>{getInitials(r.name)}</div>
        <div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.gender}</div></div>
      </div>
    )},
    { key: 'class', label: 'Applied Class' },
    { key: 'guardianName', label: 'Guardian' },
    { key: 'prevSchool', label: 'Previous School' },
    { key: 'appliedDate', label: 'Applied', render: (r) => formatDate(r.appliedDate) },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`badge ${r.status === 'approved' ? 'badge-green' : r.status === 'rejected' ? 'badge-red' : 'badge-amber'}`}>{r.status}</span>
    )},
    { key: 'actions', label: 'Actions', width: '140px', render: (row) => (
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => openView(row)} title="View"><Eye size={14} /></button>
        {row.status === 'pending' && <>
          <button className="btn btn-ghost btn-sm" onClick={() => handleStatus(row.id, 'approved')} title="Approve" style={{ color: 'var(--accent-green)' }}><CheckCircle2 size={14} /></button>
          <button className="btn btn-danger btn-sm" onClick={() => handleStatus(row.id, 'rejected')} title="Reject"><XCircle size={14} /></button>
        </>}
        <button className="btn btn-danger btn-sm" onClick={() => openDelete(row)} title="Delete"><Trash2 size={14} /></button>
      </div>
    )},
  ]

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 className="page-title">Admissions</h1><p className="page-subtitle">Manage student admissions and enrollment applications</p></div>
        <button className="btn btn-primary" onClick={openAdd}><UserPlus size={16} /> New Application</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[{ label: 'Total', value: stats.total, color: 'var(--accent-violet)' }, { label: 'Pending', value: stats.pending, color: 'var(--accent-amber)' }, { label: 'Approved', value: stats.approved, color: 'var(--accent-green)' }, { label: 'Rejected', value: stats.rejected, color: 'var(--accent-red)' }].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <DataTable columns={columns} data={filtered} searchKeys={['name', 'guardianName', 'class', 'prevSchool']} searchPlaceholder="Search applications…" pageSize={8} />
      </div>

      <Modal isOpen={modal.type === 'add'} onClose={closeModal} title="New Admission Application" size="lg" footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name}>{saving ? 'Submitting…' : 'Submit Application'}</button></>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          {[['Full Name','name'],['Date of Birth','dob','date']].map(([l,k,t])=><div key={k} className="form-group"><label className="form-label">{l}</label><input type={t||'text'} className="form-input" value={form[k] || ''} onChange={(e)=>setForm(f=>({...f,[k]:e.target.value}))} /></div>)}
          <div className="form-group"><label className="form-label">Gender</label><select className="form-select" value={form.gender || ''} onChange={(e)=>setForm(f=>({...f,gender:e.target.value}))}><option value="">Select</option><option>Male</option><option>Female</option></select></div>
          <div className="form-group"><label className="form-label">Class</label><select className="form-select" value={form.class || ''} onChange={(e)=>setForm(f=>({...f,class:e.target.value}))}><option value="">Select</option>{mockClasses.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Date of Admission</label><input type="date" className="form-input" value={form.admissionDate || ''} onChange={(e)=>setForm(f=>({...f,admissionDate:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Admission Fee (₵)</label><input type="number" className="form-input" value={form.admissionFee || ''} onChange={(e)=>setForm(f=>({...f,admissionFee:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Previous School</label><input className="form-input" value={form.prevSchool || ''} onChange={(e)=>setForm(f=>({...f,prevSchool:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Previous Class</label><input className="form-input" value={form.prevClass || ''} onChange={(e)=>setForm(f=>({...f,prevClass:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Religious Denomination</label><select className="form-select" value={form.religion || ''} onChange={(e)=>setForm(f=>({...f,religion:e.target.value}))}><option value="">Select</option>{['Christianity', 'Islam', 'Traditional', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Hometown</label><input className="form-input" value={form.hometown || ''} onChange={(e)=>setForm(f=>({...f,hometown:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Guardian Name</label><input className="form-input" value={form.guardianName || ''} onChange={(e)=>setForm(f=>({...f,guardianName:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Guardian Phone</label><input className="form-input" value={form.guardianPhone || ''} onChange={(e)=>setForm(f=>({...f,guardianPhone:e.target.value}))} /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Relation with Guardian</label><select className="form-select" value={form.guardianRelation || ''} onChange={(e)=>setForm(f=>({...f,guardianRelation:e.target.value}))}><option value="">Select</option>{['Father', 'Mother', 'Uncle', 'Aunt', 'Grandparent', 'Sibling', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}</select></div>
        </div>
      </Modal>

      <Modal isOpen={modal.type === 'view'} onClose={closeModal} title="Application Details">
        {modal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-hover)', borderRadius: '10px' }}>
              <div className="avatar" style={{ width: '52px', height: '52px', fontSize: '1rem', background: getAvatarColor(modal.data.name) }}>{getInitials(modal.data.name)}</div>
              <div><div style={{ fontWeight: 700, fontSize: '1rem' }}>{modal.data.name}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{modal.data.gender} · {modal.data.class}</div>
              <span className={`badge ${modal.data.status === 'approved' ? 'badge-green' : modal.data.status === 'rejected' ? 'badge-red' : 'badge-amber'}`} style={{ marginTop: '0.25rem' }}>{modal.data.status}</span></div>
            </div>
            {[['Date of Birth', formatDate(modal.data.dob)],['Date of Admission', formatDate(modal.data.admissionDate)],['Admission Fee', modal.data.admissionFee ? `₵${modal.data.admissionFee}` : ''],['Religious Denomination', modal.data.religion],['Hometown', modal.data.hometown],['Guardian', modal.data.guardianName],['Relation', modal.data.guardianRelation],['Guardian Phone', modal.data.guardianPhone],['Previous School', modal.data.prevSchool],['Previous Class', modal.data.prevClass],['Applied Date', formatDate(modal.data.appliedDate)]].map(([l,v])=>(
              v ? <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}><span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{l}</span><span style={{ fontSize: '0.83rem', fontWeight: 500 }}>{v}</span></div> : null
            ))}
            {modal.data.status === 'pending' && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { handleStatus(modal.data.id, 'approved'); closeModal() }}><CheckCircle2 size={16} /> Approve</button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { handleStatus(modal.data.id, 'rejected'); closeModal() }}><XCircle size={16} /> Reject</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={modal.type === 'delete'} onClose={closeModal} title="Delete Application" size="sm" footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancel</button><button className="btn btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</button></>}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Are you sure you want to completely delete the admission application for <strong style={{ color: 'var(--text-primary)' }}>{modal.data?.name}</strong>?</p>
      </Modal>
    </div>
  )
}
