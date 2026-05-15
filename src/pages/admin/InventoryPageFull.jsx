import { useState } from 'react'
import { useToast } from '../../components/ui/Toast'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { Plus, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react'

const initialItems = [
  { id: 'i1', name: 'Student Desks', category: 'Furniture', quantity: 200, condition: 'good', location: 'Classrooms', lastChecked: '2024-04-15' },
  { id: 'i2', name: 'Science Lab Equipment', category: 'Equipment', quantity: 15, condition: 'fair', location: 'Science Lab', lastChecked: '2024-04-10' },
  { id: 'i3', name: 'Textbooks (Mathematics)', category: 'Books', quantity: 180, condition: 'good', location: 'Library', lastChecked: '2024-04-20' },
  { id: 'i4', name: 'Computers', category: 'Electronics', quantity: 25, condition: 'good', location: 'ICT Lab', lastChecked: '2024-04-01' },
  { id: 'i5', name: 'Sports Equipment', category: 'Sports', quantity: 40, condition: 'poor', location: 'Storeroom', lastChecked: '2024-03-20' },
  { id: 'i6', name: 'Projectors', category: 'Electronics', quantity: 4, condition: 'good', location: 'Admin Office', lastChecked: '2024-04-25' },
]

export default function InventoryPageFull() {
  const { addToast } = useToast()
  const [items, setItems] = useState(initialItems)
  const [modal, setModal] = useState({ type: null, data: null })
  const [form, setForm] = useState({ name: '', category: '', quantity: 0, condition: 'good', location: '' })
  const [saving, setSaving] = useState(false)

  const closeModal = () => setModal({ type: null, data: null })

  const handleSave = async () => {
    setSaving(true); await new Promise(r => setTimeout(r, 500))
    if (modal.type === 'add') setItems(arr => [...arr, { ...form, id: `i${Date.now()}`, lastChecked: new Date().toISOString().split('T')[0] }])
    else setItems(arr => arr.map(i => i.id === modal.data.id ? { ...i, ...form } : i))
    setSaving(false); closeModal()
    addToast('Item saved', 'success')
  }

  const handleDelete = (id) => { setItems(arr => arr.filter(i => i.id !== id)); addToast('Item removed', 'info') }

  const low = items.filter(i => i.quantity < 20).length
  const poor = items.filter(i => i.condition === 'poor').length

  const columns = [
    { key: 'name', label: 'Item', render: r => <span style={{ fontWeight: 600 }}>{r.name}</span> },
    { key: 'category', label: 'Category', render: r => <span className="badge badge-violet">{r.category}</span> },
    { key: 'quantity', label: 'Qty', render: r => <span style={{ fontWeight: 700, color: r.quantity < 20 ? 'var(--accent-red)' : 'var(--text-primary)' }}>{r.quantity}</span> },
    { key: 'condition', label: 'Condition', render: r => <span className={`badge ${r.condition === 'good' ? 'badge-green' : r.condition === 'fair' ? 'badge-amber' : 'badge-red'}`}>{r.condition}</span> },
    { key: 'location', label: 'Location' },
    { key: 'actions', label: '', width: '90px', render: row => (
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ ...row }); setModal({ type: 'edit', data: row }) }}><Edit2 size={14} /></button>
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}><Trash2 size={14} /></button>
      </div>
    )},
  ]

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 className="page-title">Inventory & Assets</h1><p className="page-subtitle">Track school assets and supplies</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', category: '', quantity: 0, condition: 'good', location: '' }); setModal({ type: 'add', data: null }) }}><Plus size={16} /> Add Item</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[{ label: 'Total Items', value: items.length, color: 'var(--accent-violet)' }, { label: 'Low Stock', value: low, color: 'var(--accent-amber)' }, { label: 'Poor Condition', value: poor, color: 'var(--accent-red)' }].map(c => (
          <div key={c.label} className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.color }}>{c.value}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{c.label}</div></div>
        ))}
      </div>

      <div className="card" style={{ padding: '1rem' }}><DataTable columns={columns} data={items} searchKeys={['name', 'category', 'location']} searchPlaceholder="Search inventory…" pageSize={8} /></div>

      <Modal isOpen={modal.type === 'add' || modal.type === 'edit'} onClose={closeModal} title={modal.type === 'add' ? 'Add Item' : 'Edit Item'}
        footer={<><button className="btn btn-secondary" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <div className="form-group"><label className="form-label">Item Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}><option value="">Select</option>{['Furniture','Equipment','Books','Electronics','Sports','Stationery'].map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Quantity</label><input type="number" className="form-input" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} /></div>
          <div className="form-group"><label className="form-label">Condition</label><select className="form-select" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>{['good','fair','poor'].map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
        </div>
      </Modal>
    </div>
  )
}
