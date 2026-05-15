import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { useToast } from '../../components/ui/Toast'
import { Shield, School, Bell, Save, User, Lock } from 'lucide-react'

export default function SettingsPageFull() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const { schoolInfo: globalSchoolInfo, updateSchoolInfo, clearRecordsForNewTerm } = useData()
  const [tab, setTab] = useState('general')
  const defaults = {
    name: 'ScholarFlow Academy', address: '123 Education Road, Accra',
    phone: '0302-123-456', email: 'info@scholarflow.edu',
    motto: 'Excellence in Education', academicYear: '2023/2024', currentTerm: 'Term 2'
  }
  const [schoolInfo, setLocalSchoolInfo] = useState(
    globalSchoolInfo ? { ...defaults, ...globalSchoolInfo } : defaults
  )

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: '0244-100-000' })
  const [prefs, setPrefs] = useState({ emailNotifs: true, smsNotifs: false, autoBackup: true, language: 'English' })
  const [saving, setSaving] = useState(false)

  const handleSave = async (section) => {
    setSaving(true); await new Promise(r => setTimeout(r, 600))
    if (section === 'School') {
      const termChanged = globalSchoolInfo?.currentTerm !== schoolInfo.currentTerm || globalSchoolInfo?.academicYear !== schoolInfo.academicYear
      updateSchoolInfo(schoolInfo)
      if (termChanged) {
        clearRecordsForNewTerm()
        addToast('New academic term started. Previous payslips and records cleared.', 'success')
      }
    }
    setSaving(false)
    if (section !== 'School' || globalSchoolInfo?.currentTerm === schoolInfo.currentTerm) {
      addToast(`${section} settings saved successfully`, 'success')
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: School },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Settings & Security</h1><p className="page-subtitle">Configure school info, profile, and preferences</p></div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ width: '200px', flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.625rem 0.875rem', marginBottom: '0.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.83rem', fontWeight: tab === t.id ? 600 : 500, background: tab === t.id ? 'rgba(139,92,246,0.1)' : 'transparent', color: tab === t.id ? 'var(--accent-violet)' : 'var(--text-secondary)', transition: 'all 0.15s', textAlign: 'left' }}>
              <t.icon size={16} />{t.label}
            </button>
          ))}
        </div>

        <div className="card" style={{ flex: 1 }}>
          {tab === 'general' && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>School Information</h2>

              {/* School Code Status */}
              {globalSchoolInfo?.schoolCode && (
                globalSchoolInfo.paymentStatus === 'paid' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>School Code (share with teachers)</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-violet)', letterSpacing: '0.1em', fontFamily: "'Inter', monospace" }}>{globalSchoolInfo.schoolCode}</div>
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(globalSchoolInfo.schoolCode); addToast('School code copied!', 'success') }}>Copy</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '1.2rem' }}>🔑</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>School Code</div>
                      <div style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5 }}>
                        Your school code will be available after subscription payment is confirmed.
                      </div>
                    </div>
                    <span className="badge badge-amber">Pending Payment</span>
                  </div>
                )
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                {[['School Name','name'],['Address','address'],['Phone','phone'],['Email','email','email'],['Motto','motto'],['Academic Year','academicYear']].map(([l,k,t])=>
                  <div key={k} className="form-group"><label className="form-label">{l}</label><input type={t||'text'} className="form-input" value={schoolInfo[k] || ''} onChange={e => setLocalSchoolInfo(f => ({ ...f, [k]: e.target.value }))} /></div>
                )}
                <div className="form-group"><label className="form-label">Current Term</label><select className="form-select" value={schoolInfo.currentTerm || ''} onChange={e => setLocalSchoolInfo(f => ({ ...f, currentTerm: e.target.value }))}>{['Term 1','Term 2','Term 3'].map(t => <option key={t}>{t}</option>)}</select></div>
              </div>
              <button className="btn btn-primary" onClick={() => handleSave('School')} disabled={saving} style={{ marginTop: '0.5rem' }}><Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          )}

          {tab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>My Profile</h2>
              {[['Full Name','name'],['Email','email','email'],['Phone','phone']].map(([l,k,t])=>
                <div key={k} className="form-group"><label className="form-label">{l}</label><input type={t||'text'} className="form-input" value={profile[k]} onChange={e => setProfile(f => ({ ...f, [k]: e.target.value }))} /></div>
              )}
              <button className="btn btn-primary" onClick={() => handleSave('Profile')} disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save'}</button>
            </div>
          )}

          {tab === 'security' && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Security Settings</h2>
              <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" placeholder="Enter current password" /></div>
              <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" placeholder="Enter new password" /></div>
              <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" className="form-input" placeholder="Confirm new password" /></div>
              <button className="btn btn-primary" onClick={() => handleSave('Security')} disabled={saving}><Lock size={16} /> Update Password</button>
            </div>
          )}

          {tab === 'notifications' && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Notification Preferences</h2>
              {[['Email Notifications','emailNotifs'],['SMS Notifications','smsNotifs'],['Auto Backup','autoBackup']].map(([l,k])=>
                <label key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{l}</span>
                  <div onClick={() => setPrefs(f => ({ ...f, [k]: !f[k] }))} style={{ width: '44px', height: '24px', borderRadius: '12px', background: prefs[k] ? 'var(--accent-violet)' : 'var(--border)', transition: 'background 0.2s', cursor: 'pointer', position: 'relative' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: prefs[k] ? '22px' : '2px', transition: 'left 0.2s', boxShadow: 'var(--shadow-sm)' }} />
                  </div>
                </label>
              )}
              <button className="btn btn-primary" onClick={() => handleSave('Notifications')} disabled={saving} style={{ marginTop: '1rem' }}><Save size={16} /> Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
