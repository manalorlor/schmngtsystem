import { useState } from 'react'
import { mockTeachers } from '../../lib/mockData'
import { getInitials, getAvatarColor, formatDate } from '../../lib/utils'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../contexts/AuthContext'
import { UserPlus, Edit2, Trash2, Eye, Shield, ShieldAlert } from 'lucide-react'

// Staff role categories
const STAFF_ROLES = [
  'Teacher',
  'Head Teacher',
  'Assistant Head Teacher',
  'Guidance Counsellor',
  'Librarian',
  'Accountant / Bursar',
  'Secretary / Admin Staff',
  'ICT Technician',
  'Laboratory Technician',
  'Kitchen Staff',
  'Security / Watchman',
  'Janitor / Cleaner',
  'Driver',
  'Other',
]

const TEACHER_ROLES = ['Teacher', 'Head Teacher', 'Assistant Head Teacher', 'Guidance Counsellor', 'Librarian', 'ICT Technician', 'Laboratory Technician']

const isTeacherRole = (role) => TEACHER_ROLES.includes(role)

const SUBJECTS = ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'ICT', 'French', 'Religious & Moral Education', 'Creative Arts', 'Career Technology', 'Ghanaian Language']
const CLASSES = ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A', 'JHS 3B']
const BANKS = ['GCB Bank', 'Absa Bank', 'Ecobank', 'Fidelity Bank', 'Stanbic Bank', 'Access Bank', 'Agricultural Development Bank', 'CAL Bank', 'First Atlantic Bank', 'Republic Bank', 'Zenith Bank', 'Other']

const EMPTY_STAFF = {
  name: '', employeeId: '', staffRole: 'Teacher',
  email: '', phone: '', gender: '', dob: '', nationality: 'Ghanaian', address: '',
  status: 'active', joinDate: '',
  // Academic (teachers only)
  subject: '', class: '', educationalQualification: '', professionalQualification: '',
  // HR / Legal
  ghanaCardNumber: '', ssnitId: '',
  // Bank
  bankName: '', bankBranch: '', accountNumber: '', accountName: '',
  // Next of Kin
  nokName: '', nokRelationship: '', nokPhone: '', nokAddress: '',
}

const SectionLabel = ({ children }) => (
  <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-violet)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
      {children}
    </p>
    <div style={{ height: '1px', background: 'var(--border)' }} />
  </div>
)

const Field = ({ label, children }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    {children}
  </div>
)

const TextInput = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <Field label={label}>
    <input type={type} className="form-input" value={value} onChange={onChange} placeholder={placeholder} />
  </Field>
)

const SelectInput = ({ label, value, onChange, options, placeholder }) => (
  <Field label={label}>
    <select className="form-select" value={value} onChange={onChange}>
      <option value="">{placeholder || `Select ${label}`}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </Field>
)

function StaffForm({ form, onChange }) {
  const isTeacher = isTeacherRole(form.staffRole)
  const f = (key) => (e) => onChange(key, e.target.value)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">

      {/* ── PERSONAL INFO ── */}
      <SectionLabel>Personal Information</SectionLabel>

      <TextInput label="Full Name" value={form.name} onChange={f('name')} />

      <Field label="Employee ID">
        <input className="form-input" value={form.employeeId} onChange={f('employeeId')} placeholder="Auto-generate or enter" />
      </Field>

      <SelectInput label="Staff Role / Position" value={form.staffRole} onChange={f('staffRole')} options={STAFF_ROLES} />
      <SelectInput label="Gender" value={form.gender} onChange={f('gender')} options={['Male', 'Female']} />
      <TextInput label="Date of Birth" value={form.dob} onChange={f('dob')} type="date" />
      <TextInput label="Nationality" value={form.nationality} onChange={f('nationality')} />
      <TextInput label="Residential Address" value={form.address} onChange={f('address')} />
      <TextInput label="Phone / Telephone" value={form.phone} onChange={f('phone')} placeholder="e.g. 0244-000-000" />
      <TextInput label="Email Address" value={form.email} onChange={f('email')} type="email" />
      <TextInput label="Join Date" value={form.joinDate} onChange={f('joinDate')} type="date" />
      <SelectInput label="Employment Status" value={form.status} onChange={f('status')} options={['active', 'inactive', 'on_leave']} />

      {/* ── ACADEMIC (TEACHERS ONLY) ── */}
      {isTeacher && (
        <>
          <SectionLabel>Academic / Teaching Information</SectionLabel>
          <SelectInput label="Subject Taught" value={form.subject} onChange={f('subject')} options={SUBJECTS} />
          <SelectInput label="Class / Form" value={form.class} onChange={f('class')} options={CLASSES} />
          <TextInput label="Educational Qualification" value={form.educationalQualification} onChange={f('educationalQualification')} placeholder="e.g. B.Ed Mathematics, B.Sc Education" />
          <TextInput label="Professional Qualification" value={form.professionalQualification} onChange={f('professionalQualification')} placeholder="e.g. PGDE, NTC Licence No." />
        </>
      )}

      {/* ── HR / LEGAL ── */}
      <SectionLabel>Government & Legal Identifiers</SectionLabel>
      <TextInput label="Ghana Card Number" value={form.ghanaCardNumber} onChange={f('ghanaCardNumber')} placeholder="GHA-XXXXXXXXX-X" />
      <TextInput label="SSNIT ID Number" value={form.ssnitId} onChange={f('ssnitId')} placeholder="e.g. 1234567890" />

      {/* ── BANK DETAILS ── */}
      <SectionLabel>Bank Details</SectionLabel>
      <SelectInput label="Bank Name" value={form.bankName} onChange={f('bankName')} options={BANKS} />
      <TextInput label="Branch" value={form.bankBranch} onChange={f('bankBranch')} placeholder="e.g. Accra Main Branch" />
      <TextInput label="Account Number" value={form.accountNumber} onChange={f('accountNumber')} />
      <TextInput label="Account Name" value={form.accountName} onChange={f('accountName')} />

      {/* ── NEXT OF KIN ── */}
      <SectionLabel>Next of Kin</SectionLabel>
      <TextInput label="Next of Kin Name" value={form.nokName} onChange={f('nokName')} />
      <SelectInput label="Relationship" value={form.nokRelationship} onChange={f('nokRelationship')} options={['Spouse', 'Parent', 'Sibling', 'Child', 'Relative', 'Friend', 'Other']} />
      <TextInput label="Next of Kin Phone" value={form.nokPhone} onChange={f('nokPhone')} placeholder="e.g. 0244-000-000" />
      <TextInput label="Next of Kin Address" value={form.nokAddress} onChange={f('nokAddress')} />

    </div>
  )
}

function ViewRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', flexShrink: 0, marginRight: '1rem' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function ViewSection({ title, children }) {
  return (
    <div>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-violet)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem', marginTop: '0.75rem' }}>{title}</p>
      {children}
    </div>
  )
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState(mockTeachers)
  const [modal, setModal] = useState({ type: null, data: null })
  const [form, setForm] = useState(EMPTY_STAFF)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()
  const { users, updateUserRole } = useAuth()

  const registeredUsers = Object.entries(users || {})
    .map(([email, u]) => ({ email, ...u }))
    .filter(u => u.role === 'teacher' || u.role === 'admin')

  const openAdd = () => { setForm({ ...EMPTY_STAFF }); setModal({ type: 'add', data: null }) }
  const openEdit = (t) => { setForm({ ...EMPTY_STAFF, ...t }); setModal({ type: 'edit', data: t }) }
  const openView = (t) => setModal({ type: 'view', data: t })
  const openDelete = (t) => setModal({ type: 'delete', data: t })
  const closeModal = () => setModal({ type: null, data: null })

  const handleFieldChange = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleGenerateId = () => {
    if (!form.name || !form.joinDate) { addToast('Enter Full Name and Join Date first', 'error'); return }
    const cleanNames = form.name.trim().split(' ').filter(n => !['Mr.', 'Mrs.', 'Ms.', 'Dr.'].includes(n))
    const first = cleanNames[0]?.[0]?.toUpperCase() || 'X'
    const last = cleanNames.length > 1 ? cleanNames[cleanNames.length - 1][0].toUpperCase() : 'X'
    const d = new Date(form.joinDate)
    if (isNaN(d.getTime())) { addToast('Invalid Join Date', 'error'); return }
    const yr = d.getFullYear().toString().slice(-2)
    const mo = (d.getMonth() + 1).toString().padStart(2, '0')
    const prefix = isTeacherRole(form.staffRole) ? 'TCH' : 'STF'
    setForm(f => ({ ...f, employeeId: `${prefix}-${first}${last}-${yr}${mo}${Math.floor(100 + Math.random() * 900)}` }))
    addToast('Employee ID generated', 'success')
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    if (modal.type === 'add') {
      const rec = { ...form, id: `t${Date.now()}` }
      mockTeachers.push(rec)
      setTeachers([...mockTeachers])
      addToast(`${form.name} added successfully`, 'success')
    } else {
      const idx = mockTeachers.findIndex(t => t.id === modal.data.id)
      if (idx >= 0) mockTeachers[idx] = { ...mockTeachers[idx], ...form }
      setTeachers([...mockTeachers])
      addToast(`${form.name} updated`, 'success')
    }
    setSaving(false)
    closeModal()
  }

  const handleDelete = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    const name = modal.data?.name
    const idx = mockTeachers.findIndex(t => t.id === modal.data.id)
    if (idx >= 0) mockTeachers.splice(idx, 1)
    setTeachers([...mockTeachers])
    setSaving(false)
    closeModal()
    addToast(`${name} removed`, 'info')
  }

  const columns = [
    {
      key: 'name', label: 'Staff Member',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div className="avatar" style={{ background: getAvatarColor(row.name), fontSize: '0.7rem' }}>{getInitials(row.name)}</div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.employeeId}</div>
          </div>
        </div>
      ),
    },
    { key: 'staffRole', label: 'Role / Position', render: r => r.staffRole || 'Teacher' },
    { key: 'subject', label: 'Subject', render: r => r.subject || '—' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <span className={`badge ${row.status === 'active' ? 'badge-green' : row.status === 'on_leave' ? 'badge-amber' : 'badge-gray'}`}>
          {row.status === 'on_leave' ? 'On Leave' : row.status}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions', width: '110px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => openView(row)}><Eye size={14} /></button>
          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(row)}><Edit2 size={14} /></button>
          <button className="btn btn-danger btn-sm" onClick={() => openDelete(row)}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Staff & Teachers</h1>
          <p className="page-subtitle">{teachers.length} staff members · {teachers.filter(t => t.status === 'active').length} active</p>
        </div>
        <button id="add-teacher-btn" className="btn btn-primary" onClick={openAdd}>
          <UserPlus size={16} /> Add Staff Member
        </button>
      </div>

      {/* System Access */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Shield size={18} color="var(--accent-violet)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>System Access & Permissions</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>System Role</th><th style={{ width: '150px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {registeredUsers.map(u => (
                <tr key={u.email}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-violet' : 'badge-orange'}`}>{u.role.toUpperCase()}</span></td>
                  <td>
                    {u.role === 'teacher' ? (
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--accent-violet)' }} onClick={() => { updateUserRole(u.email, 'admin'); addToast(`${u.name} is now an Admin`, 'success') }}>
                        <ShieldAlert size={14} /> Make Admin
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--text-muted)' }} onClick={() => { updateUserRole(u.email, 'teacher'); addToast(`${u.name} is now a Teacher`, 'info') }}>
                        <UserPlus size={14} /> Make Teacher
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {registeredUsers.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No registered users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Directory */}
      <div className="card" style={{ padding: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', padding: '0 0.5rem' }}>Staff Directory</h2>
        <DataTable columns={columns} data={teachers} searchKeys={['name', 'employeeId', 'subject', 'class', 'email', 'staffRole']} searchPlaceholder="Search staff…" pageSize={8} />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modal.type === 'add' || modal.type === 'edit'}
        onClose={closeModal}
        title={modal.type === 'add' ? 'Add Staff Member' : 'Edit Staff Member'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-ghost btn-sm" onClick={handleGenerateId} style={{ marginRight: 'auto' }}>Generate ID</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-teacher-btn">
              {saving ? 'Saving…' : 'Save Staff Member'}
            </button>
          </>
        }
      >
        <StaffForm form={form} onChange={handleFieldChange} />
      </Modal>

      {/* View Modal */}
      <Modal isOpen={modal.type === 'view'} onClose={closeModal} title="Staff Profile" size="md">
        {modal.data && (() => {
          const d = modal.data
          const isT = isTeacherRole(d.staffRole)
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-hover)', borderRadius: '10px', marginBottom: '0.5rem' }}>
                <div className="avatar" style={{ width: '52px', height: '52px', fontSize: '1rem', background: getAvatarColor(d.name) }}>{getInitials(d.name)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{d.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.employeeId} · {d.staffRole || 'Teacher'}</div>
                  <span className={`badge ${d.status === 'active' ? 'badge-green' : d.status === 'on_leave' ? 'badge-amber' : 'badge-gray'}`} style={{ marginTop: '0.25rem' }}>
                    {d.status === 'on_leave' ? 'On Leave' : d.status}
                  </span>
                </div>
              </div>

              <ViewSection title="Personal Information">
                <ViewRow label="Gender" value={d.gender} />
                <ViewRow label="Date of Birth" value={formatDate(d.dob)} />
                <ViewRow label="Nationality" value={d.nationality} />
                <ViewRow label="Address" value={d.address} />
                <ViewRow label="Phone" value={d.phone} />
                <ViewRow label="Email" value={d.email} />
                <ViewRow label="Join Date" value={formatDate(d.joinDate)} />
              </ViewSection>

              {isT && (
                <ViewSection title="Academic / Teaching">
                  <ViewRow label="Subject" value={d.subject} />
                  <ViewRow label="Class" value={d.class} />
                  <ViewRow label="Educational Qualification" value={d.educationalQualification || d.qualification} />
                  <ViewRow label="Professional Qualification" value={d.professionalQualification} />
                </ViewSection>
              )}

              <ViewSection title="Government & Legal">
                <ViewRow label="Ghana Card No." value={d.ghanaCardNumber} />
                <ViewRow label="SSNIT ID" value={d.ssnitId} />
              </ViewSection>

              <ViewSection title="Bank Details">
                <ViewRow label="Bank" value={d.bankName} />
                <ViewRow label="Branch" value={d.bankBranch} />
                <ViewRow label="Account Number" value={d.accountNumber} />
                <ViewRow label="Account Name" value={d.accountName} />
              </ViewSection>

              <ViewSection title="Next of Kin">
                <ViewRow label="Name" value={d.nokName} />
                <ViewRow label="Relationship" value={d.nokRelationship} />
                <ViewRow label="Phone" value={d.nokPhone} />
                <ViewRow label="Address" value={d.nokAddress} />
              </ViewSection>
            </div>
          )
        })()}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={modal.type === 'delete'} onClose={closeModal} title="Remove Staff Member" size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={saving} id="confirm-delete-teacher-btn">
              {saving ? 'Removing…' : 'Remove'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>{modal.data?.name}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
