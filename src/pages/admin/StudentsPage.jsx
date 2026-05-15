import { useState } from 'react'
import { mockStudents, mockClasses } from '../../lib/mockData'
import { getInitials, getAvatarColor, formatDate, formatCurrency } from '../../lib/utils'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { UserPlus, Edit2, Trash2, Eye } from 'lucide-react'
import { useData } from '../../contexts/DataContext'

const EMPTY_STUDENT = {
  name: '', studentId: '', class: '', gender: '', dob: '', nationality: '', address: '',
  allergies: '', chronicConditions: '', photo: '',
  guardianName: '', guardianEmail: '', guardianPhone: '', enrollmentDate: '', status: 'active',
}

function StudentForm({ data, onChange, onGenerateId }) {
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange('photo', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const field = (label, key, type = 'text', opts, suffix) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {opts ? (
          <select className="form-select" style={{ flex: 1 }} value={data[key]} onChange={(e) => onChange(key, e.target.value)}>
            <option value="">Select {label}</option>
            {opts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} className="form-input" style={{ flex: 1 }} value={data[key]} onChange={(e) => onChange(key, e.target.value)} />
        )}
        {suffix && suffix}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
      {field('Full Name', 'name')}
      {field('Student ID', 'studentId', 'text', null, (
        <button type="button" className="btn btn-secondary" onClick={onGenerateId} title="Generate from Name & Date">
          Generate
        </button>
      ))}
      {field('Class', 'class', 'text', mockClasses.map((c) => c.name))}
      {field('Gender', 'gender', 'text', ['Male', 'Female'])}
      {field('Date of Birth', 'dob', 'date')}
      {field('Nationality', 'nationality')}
      {field('Residential Address', 'address')}
      {field('Allergies', 'allergies')}
      {field('Chronic Conditions', 'chronicConditions')}
      {field('Enrollment Date', 'enrollmentDate', 'date')}
      {field('Status', 'status', 'text', ['active', 'inactive'])}
      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
        <label className="form-label">Student Photo</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {data.photo ? (
            <img src={data.photo} alt="Preview" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="avatar" style={{ width: '48px', height: '48px', background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>📷</div>
          )}
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="form-input" style={{ flex: 1 }} />
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <div className="divider" />
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guardian Information</p>
      </div>
      {field('Guardian Name', 'guardianName')}
      {field('Guardian Email', 'guardianEmail', 'email')}
      {field('Guardian Phone', 'guardianPhone')}
    </div>
  )
}

export default function StudentsPage() {
  const [students, setStudents] = useState(mockStudents)
  const [modal, setModal] = useState({ type: null, data: null })
  const [form, setForm] = useState(EMPTY_STUDENT)
  const [saving, setSaving] = useState(false)
  const [filterClass, setFilterClass] = useState('')
  const { addToast } = useToast()
  const { addNotification, schoolInfo } = useData()
  const [filterStatus, setFilterStatus] = useState('')

  const openAdd = () => {
    const plan = schoolInfo?.plan || 'basic'
    if (plan === 'basic' && students.length >= 200) {
      addToast('Student limit reached for Basic Plan (Max 200). Please upgrade.', 'error')
      return
    }
    if (plan === 'standard' && students.length >= 500) {
      addToast('Student limit reached for Standard Plan (Max 500). Please upgrade.', 'error')
      return
    }
    setForm({ ...EMPTY_STUDENT })
    setModal({ type: 'add', data: null })
  }

  const openEdit = (student) => {
    setForm({ ...student })
    setModal({ type: 'edit', data: student })
  }

  const openView = (student) => {
    setModal({ type: 'view', data: student })
  }

  const openDelete = (student) => {
    setModal({ type: 'delete', data: student })
  }

  const closeModal = () => setModal({ type: null, data: null })

  const handleFieldChange = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleGenerateId = () => {
    if (!form.name || !form.enrollmentDate) {
      addToast('Please enter Full Name and Enrollment Date first', 'error');
      return;
    }
    const names = form.name.trim().split(' ');
    const firstLetter = names[0]?.[0]?.toUpperCase() || 'X';
    const lastLetter = names.length > 1 ? names[names.length - 1][0].toUpperCase() : 'X';
    
    const dateObj = new Date(form.enrollmentDate);
    if (isNaN(dateObj.getTime())) {
      addToast('Invalid Enrollment Date', 'error');
      return;
    }
    const year = dateObj.getFullYear().toString().slice(-2);
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    
    const randomNum = Math.floor(100 + Math.random() * 900); // 3 random digits
    
    const newId = `${firstLetter}${lastLetter}-${year}${month}${randomNum}`;
    setForm(f => ({ ...f, studentId: newId }));
    addToast('Student ID generated automatically', 'success');
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    if (modal.type === 'add') {
      const newStudent = { ...form, id: `s${Date.now()}` }
      mockStudents.push(newStudent)
      setStudents([...mockStudents])
      addToast(`${form.name} added successfully`, 'success')
      addNotification({ title: 'New Student Enrolled', desc: `${form.name} enrolled in ${form.class}`, type: 'info', audience: 'Admin', targetClass: form.class })
    } else {
      const idx = mockStudents.findIndex(st => st.id === modal.data.id)
      if (idx >= 0) mockStudents[idx] = { ...mockStudents[idx], ...form }
      setStudents([...mockStudents])
      addToast(`${form.name} updated successfully`, 'success')
    }
    setSaving(false)
    closeModal()
  }

  const handleDelete = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    const name = modal.data?.name
    const idx = mockStudents.findIndex(st => st.id === modal.data.id)
    if (idx >= 0) mockStudents.splice(idx, 1)
    setStudents([...mockStudents])
    setSaving(false)
    closeModal()
    addToast(`${name} removed`, 'info')
  }

  const filtered = students.filter((s) => {
    if (filterClass && s.class !== filterClass) return false
    if (filterStatus && s.status !== filterStatus) return false
    return true
  })

  const columns = [
    {
      key: 'name',
      label: 'Student',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div className="avatar" style={{ background: getAvatarColor(row.name), fontSize: '0.7rem' }}>
            {getInitials(row.name)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.studentId}</div>
          </div>
        </div>
      ),
    },
    { key: 'class', label: 'Class' },
    { key: 'gender', label: 'Gender' },
    { key: 'guardianName', label: 'Guardian' },
    { key: 'guardianEmail', label: 'Guardian Email' },
    {
      key: 'feeBalance',
      label: 'Fee Balance',
      render: (row) => (
        <span style={{ color: row.feeBalance > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600 }}>
          {row.feeBalance > 0 ? formatCurrency(row.feeBalance) : 'Cleared'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '110px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => openView(row)} title="View" aria-label="View student">
            <Eye size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(row)} title="Edit" aria-label="Edit student">
            <Edit2 size={14} />
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => openDelete(row)} title="Delete" aria-label="Delete student">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{students.length} students enrolled · {students.filter((s) => s.status === 'active').length} active</p>
        </div>
        <button id="add-student-btn" className="btn btn-primary" onClick={openAdd}>
          <UserPlus size={16} />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {!filterClass ? (
        <div>
          <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(139,92,246,0.06)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.15)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Please select a class below to view its students.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {mockClasses.map(c => {
               const count = students.filter(s => s.class === c.name && (!filterStatus || s.status === filterStatus)).length
               return (
                 <div key={c.id} className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem', transition: 'all 0.15s' }}
                   onClick={() => setFilterClass(c.name)}
                   onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--accent-violet-light)' }}
                   onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                 >
                   <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-violet)', marginBottom: '0.35rem' }}>{c.name}</div>
                   <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{count} student{count !== 1 ? 's' : ''}</div>
                 </div>
               )
            })}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{filterClass} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>({filtered.length} students)</span></h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setFilterClass('')}>Choose Another Class</button>
          </div>
          <DataTable
            columns={columns}
            data={filtered}
            searchKeys={['name', 'studentId', 'class', 'guardianEmail', 'guardianName']}
            searchPlaceholder={`Search within ${filterClass}…`}
            pageSize={8}
          />
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modal.type === 'add' || modal.type === 'edit'}
        onClose={closeModal}
        title={modal.type === 'add' ? 'Add New Student' : 'Edit Student'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-student-btn">
              {saving ? 'Saving…' : 'Save Student'}
            </button>
          </>
        }
      >
        <StudentForm data={form} onChange={handleFieldChange} onGenerateId={handleGenerateId} />
      </Modal>

      {/* View Modal */}
      <Modal isOpen={modal.type === 'view'} onClose={closeModal} title="Student Profile" size="md">
        {modal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-hover)', borderRadius: '10px' }}>
              {modal.data.photo ? (
                <img src={modal.data.photo} alt={modal.data.name} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="avatar" style={{ width: '52px', height: '52px', fontSize: '1rem', background: getAvatarColor(modal.data.name) }}>
                  {getInitials(modal.data.name)}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{modal.data.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{modal.data.studentId} · {modal.data.class}</div>
                <span className={`badge ${modal.data.status === 'active' ? 'badge-green' : 'badge-gray'}`} style={{ marginTop: '0.25rem' }}>
                  {modal.data.status}
                </span>
              </div>
            </div>
            {[
              ['Gender', modal.data.gender],
              ['Date of Birth', formatDate(modal.data.dob)],
              ['Nationality', modal.data.nationality],
              ['Residential Address', modal.data.address],
              ['Allergies', modal.data.allergies],
              ['Chronic Conditions', modal.data.chronicConditions],
              ['Enrollment Date', formatDate(modal.data.enrollmentDate)],
              ['Guardian', modal.data.guardianName],
              ['Guardian Email', modal.data.guardianEmail],
              ['Guardian Phone', modal.data.guardianPhone],
              ['Fee Balance', formatCurrency(modal.data.feeBalance)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: '0.83rem', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={modal.type === 'delete'}
        onClose={closeModal}
        title="Delete Student"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={saving} id="confirm-delete-student-btn">
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>{modal.data?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
