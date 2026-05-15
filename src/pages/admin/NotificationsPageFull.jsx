import { useState } from 'react'
import { useToast } from '../../components/ui/Toast'
import { Send, Plus, Trash2, Eye } from 'lucide-react'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { formatDate } from '../../lib/utils'
import { useData } from '../../contexts/DataContext'

export default function NotificationsPageFull() {
  const { addToast } = useToast()
  const { notifications, addNotification, deleteNotification } = useData()
  const [modal, setModal] = useState({ type: null, data: null })
  const [form, setForm] = useState({ title: '', message: '', audience: 'Everyone', type: 'announcement' })
  const [saving, setSaving] = useState(false)

  const closeModal = () => setModal({ type: null, data: null })

  const handleSave = async (status = 'sent') => {
    setSaving(true); await new Promise(r => setTimeout(r, 500))
    addNotification({ title: form.title, desc: form.message, type: 'info', audience: form.audience })
    setSaving(false); closeModal()
    addToast('Notification sent!', 'success')
  }

  const columns = [
    { key: 'title', label: 'Title', render: r => <span style={{ fontWeight: 600 }}>{r.title}</span> },
    { key: 'audience', label: 'Audience', render: r => <span className="badge badge-violet">{r.audience}</span> },
    { key: 'date', label: 'Date', render: r => formatDate(r.date) },
    { key: 'status', label: 'Status', render: r => <span className={`badge ${r.status === 'sent' ? 'badge-green' : r.status === 'scheduled' ? 'badge-amber' : 'badge-gray'}`}>{r.status}</span> },
    { key: 'actions', label: '', width: '90px', render: row => (
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'view', data: row })}><Eye size={14} /></button>
        {row.status !== 'sent' && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-green)' }} onClick={() => { setNotifs(p => p.map(n => n.id === row.id ? { ...n, status: 'sent' } : n)); addToast('Sent!', 'success') }}><Send size={14} /></button>}
        <button className="btn btn-danger btn-sm" onClick={() => { deleteNotification(row.id); addToast('Deleted', 'info') }}><Trash2 size={14} /></button>
      </div>
    )},
  ]

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 className="page-title">Notifications</h1><p className="page-subtitle">System-wide notifications and announcements</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ title: '', message: '', audience: 'Everyone', type: 'announcement' }); setModal({ type: 'add', data: null }) }}><Plus size={16} /> Create</button>
      </div>
      <div className="card" style={{ padding: '1rem' }}><DataTable columns={columns} data={notifications} searchKeys={['title', 'audience']} searchPlaceholder="Search…" pageSize={8} /></div>

      <Modal isOpen={modal.type === 'add'} onClose={closeModal} title="Create Notification" footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={() => handleSave('sent')} disabled={saving || !form.title}><Send size={14} /> Send</button></>}>
        <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Message</label><textarea className="form-input" rows={3} style={{ resize: 'vertical' }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Audience</label><select className="form-select" value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>{['All Staff','All Teachers','Everyone', 'Admin'].map(a => <option key={a}>{a}</option>)}</select></div>
      </Modal>

      <Modal isOpen={modal.type === 'view'} onClose={closeModal} title="Notification Details">
        {modal.data && <div><h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>{modal.data.title}</h3><p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{modal.data.message}</p></div>}
      </Modal>
    </div>
  )
}
