import { useState } from 'react'
import { mockClasses, mockSubjects, mockTeachers, mockStudents } from '../../lib/mockData'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { Plus, Edit2, Trash2, School, BookOpen } from 'lucide-react'

export default function AcademicsPage() {
  const [tab, setTab] = useState('classes')
  const [classes, setClasses] = useState(mockClasses)
  const [subjects, setSubjects] = useState(mockSubjects)
  const [modal, setModal] = useState({ type: null, data: null, entity: null })
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const teacherNames = mockTeachers.map((t) => t.name)
  const classNames = classes.map((c) => c.name)

  const closeModal = () => setModal({ type: null, data: null, entity: null })

  const openAdd = (entity) => {
    setForm(entity === 'class'
      ? { name: '', level: '', classTeacher: '' }
      : { name: '', code: '', teacher: '', classes: [] }
    )
    setModal({ type: 'add', data: null, entity })
  }

  const openEdit = (entity, item) => {
    setForm({ ...item })
    setModal({ type: 'edit', data: item, entity })
  }

  const openDelete = (entity, item) => setModal({ type: 'delete', data: item, entity })

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    if (modal.entity === 'class') {
      if (modal.type === 'add') {
        const newClass = { ...form, id: `c${Date.now()}` }
        mockClasses.push(newClass)
        setClasses([...mockClasses])
        addToast(`Class ${form.name} added`, 'success')
      } else {
        const idx = mockClasses.findIndex(c => c.id === modal.data.id)
        if (idx >= 0) mockClasses[idx] = { ...mockClasses[idx], ...form }
        setClasses([...mockClasses])
        addToast(`Class updated`, 'success')
      }
    } else {
      if (modal.type === 'add') {
        const newSub = { ...form, id: `sub${Date.now()}` }
        mockSubjects.push(newSub)
        setSubjects([...mockSubjects])
        addToast(`Subject ${form.name} added`, 'success')
      } else {
        const idx = mockSubjects.findIndex(s => s.id === modal.data.id)
        if (idx >= 0) mockSubjects[idx] = { ...mockSubjects[idx], ...form }
        setSubjects([...mockSubjects])
        addToast(`Subject updated`, 'success')
      }
    }
    setSaving(false)
    closeModal()
  }

  const handleDelete = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    const name = modal.data?.name
    if (modal.entity === 'class') {
      const idx = mockClasses.findIndex(c => c.id === modal.data.id)
      if (idx >= 0) mockClasses.splice(idx, 1)
      setClasses([...mockClasses])
    } else {
      const idx = mockSubjects.findIndex(s => s.id === modal.data.id)
      if (idx >= 0) mockSubjects.splice(idx, 1)
      setSubjects([...mockSubjects])
    }
    setSaving(false)
    closeModal()
    addToast(`${modal.entity === 'class' ? 'Class' : 'Subject'} ${name} removed`, 'info')
  }

  const classColumns = [
    { key: 'name', label: 'Class', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
    { key: 'level', label: 'Level' },
    { key: 'classTeacher', label: 'Class Teacher' },
    { key: 'studentCount', label: 'Students', render: (r) => <span className="badge badge-blue">{mockStudents.filter(s => s.class === r.name && s.status === 'active').length}</span> },
    {
      key: 'actions', label: 'Actions', width: '90px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => openEdit('class', row)}><Edit2 size={14} /></button>
          <button className="btn btn-danger btn-sm" onClick={() => openDelete('class', row)}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  const subjectColumns = [
    { key: 'name', label: 'Subject', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
    { key: 'code', label: 'Code' },
    { key: 'teacher', label: 'Teacher' },
    {
      key: 'classes', label: 'Classes',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {(r.classes || []).slice(0, 3).map((c) => <span key={c} className="badge badge-gray">{c}</span>)}
          {r.classes?.length > 3 && <span className="badge badge-gray">+{r.classes.length - 3}</span>}
        </div>
      ),
    },
    {
      key: 'actions', label: 'Actions', width: '90px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => openEdit('subject', row)}><Edit2 size={14} /></button>
          <button className="btn btn-danger btn-sm" onClick={() => openDelete('subject', row)}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header">
        <h1 className="page-title">Academics</h1>
        <p className="page-subtitle">Manage class levels and subject assignments</p>
      </div>

      <div className="tabs" style={{ maxWidth: '320px', marginBottom: '1.5rem' }}>
        <button className={`tab ${tab === 'classes' ? 'active' : ''}`} onClick={() => setTab('classes')}>
          <School size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />Classes
        </button>
        <button className={`tab ${tab === 'subjects' ? 'active' : ''}`} onClick={() => setTab('subjects')}>
          <BookOpen size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />Subjects
        </button>
      </div>

      {tab === 'classes' && (
        <div className="card" style={{ padding: '1rem' }}>
          <DataTable
            columns={classColumns}
            data={classes}
            searchKeys={['name', 'classTeacher']}
            searchPlaceholder="Search classes…"
            actions={
              <button id="add-class-btn" className="btn btn-primary btn-sm" onClick={() => openAdd('class')}>
                <Plus size={14} /> Add Class
              </button>
            }
          />
        </div>
      )}

      {tab === 'subjects' && (
        <div className="card" style={{ padding: '1rem' }}>
          <DataTable
            columns={subjectColumns}
            data={subjects}
            searchKeys={['name', 'code', 'teacher']}
            searchPlaceholder="Search subjects…"
            actions={
              <button id="add-subject-btn" className="btn btn-primary btn-sm" onClick={() => openAdd('subject')}>
                <Plus size={14} /> Add Subject
              </button>
            }
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal.type === 'add' || modal.type === 'edit'}
        onClose={closeModal}
        title={`${modal.type === 'add' ? 'Add' : 'Edit'} ${modal.entity === 'class' ? 'Class' : 'Subject'}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        {modal.entity === 'class' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <div className="form-group">
              <label className="form-label">Class Name</label>
              <input className="form-input" value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-select" value={form.level || ''} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
                <option value="">Select Level</option>
                {['Preschool', 'Lower Primary', 'Upper Primary', 'Junior High'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Class Teacher</label>
              <select className="form-select" value={form.classTeacher || ''} onChange={(e) => setForm((f) => ({ ...f, classTeacher: e.target.value }))}>
                <option value="">Select teacher</option>
                {teacherNames.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}
        {modal.entity === 'subject' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <div className="form-group">
              <label className="form-label">Subject Name</label>
              <input className="form-input" value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Code</label>
              <input className="form-input" value={form.code || ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Teacher</label>
              <select className="form-select" value={form.teacher || ''} onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}>
                <option value="">Select teacher</option>
                {teacherNames.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Classes (select multiple)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {classNames.map((cn) => (
                  <label key={cn} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={(form.classes || []).includes(cn)}
                      onChange={(e) => {
                        const cur = form.classes || []
                        setForm((f) => ({
                          ...f,
                          classes: e.target.checked ? [...cur, cn] : cur.filter((c) => c !== cn)
                        }))
                      }}
                    />
                    {cn}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={modal.type === 'delete'}
        onClose={closeModal}
        title={`Delete ${modal.entity === 'class' ? 'Class' : 'Subject'}`}
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Delete <strong style={{ color: 'var(--text-primary)' }}>{modal.data?.name}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
