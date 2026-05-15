import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { Building2, MapPin, Upload, Image as ImageIcon, ArrowLeft, AlignLeft, User, Mail, Lock, CheckCircle, CreditCard, ArrowRight, Copy, KeyRound, Check, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { validatePassword } from '../../lib/utils'
import { useToast } from '../../components/ui/Toast'

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'GHS 500',
    period: 'One-time Setup',
    features: ['+ GHS 1 per student / term', 'Up to 200 Students', 'Up to 10 Teachers', 'SBA & Exams Integration', 'Report Card Generation', 'Email Support'],
    color: '#10b981',
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 'GHS 1,200',
    period: 'One-time Setup',
    features: ['+ GHS 1 per student / term', 'Up to 500 Students', 'Up to 30 Teachers', 'Attendance Tracking', 'Payment Tracking', 'Priority Support'],
    color: '#8b5cf6',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'GHS 2,500',
    period: 'One-time Setup',
    features: ['+ GHS 1 per student / term', 'Unlimited Students', 'Unlimited Teachers', 'All Standard Features', 'Timetable & Scheduling', 'Inventory Management', 'Payroll Module', 'Dedicated Support'],
    color: '#f97316',
    popular: false,
  },
]

export default function RegisterSchool() {
  const navigate = useNavigate()
  const { updateSchoolInfo, activateSchool } = useData()
  const { signup } = useAuth()
  const [step, setStep] = useState(1) // 1=school, 2=admin, 3=payment, 4=success
  const [form, setForm] = useState({ name: '', motto: '', address: '', logo: null, adminName: '', adminEmail: '', adminPassword: '' })
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('standard')
  const [paying, setPaying] = useState(false)
  const [generatedCode, setGeneratedCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const { addToast } = useToast()
  
  // OTP State
  const [otp, setOtp] = useState('')
  const [expectedOtp, setExpectedOtp] = useState(null)
  const [otpExpiry, setOtpExpiry] = useState(null)
  
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
        setForm(f => ({ ...f, logo: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStep1Submit = (e) => {
    e.preventDefault()
    setError(null)
    setStep(2)
  }

  const handleStep2Submit = (e) => {
    e.preventDefault()
    setError(null)
    
    if (!validatePassword(form.adminPassword)) {
      setError('Password must be at least 8 characters, with a mix of uppercase, lowercase, numbers, and special characters.')
      return
    }

    // Generate and send OTP (simulated via toast)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setExpectedOtp(code)
    setOtp(code) // Auto-fill for testing
    setOtpExpiry(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
    
    // Simulate sending email/sms
    console.log(`[SIMULATED EMAIL/SMS] OTP for ${form.adminEmail}: ${code}`)
    addToast(`OTP Sent to ${form.adminEmail}: ${code}`, 'success')
    setStep(2.5)
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault()
    setError(null)
    if (Date.now() > otpExpiry) {
      setError('OTP has expired. Please click "Back" and resubmit to generate a new code.')
      return
    }
    if (otp !== expectedOtp) {
      setError('Invalid OTP code. Please check and try again.')
      return
    }
    setStep(3)
  }

  const handleResendOTP = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setExpectedOtp(code)
    setOtp(code) // Auto-fill for testing
    setOtpExpiry(Date.now() + 10 * 60 * 1000)
    setError(null)
    console.log(`[SIMULATED EMAIL/SMS] Resent OTP for ${form.adminEmail}: ${code}`)
    addToast(`New OTP Sent to ${form.adminEmail}: ${code}`, 'success')
  }

  const handlePayment = async () => {
    setPaying(true)
    setError(null)

    // Create admin account
    const res = await signup(form.adminEmail, form.adminPassword, form.adminName, 'admin')
    if (res.error) {
      setError(res.error.message)
      setPaying(false)
      return
    }

    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000))

    // Save school info and activate
    const savedInfo = updateSchoolInfo({ name: form.name, motto: form.motto, address: form.address, logo: form.logo, plan: selectedPlan })
    activateSchool()
    setGeneratedCode(savedInfo.schoolCode)
    setPaying(false)
    setStep(4)
  }

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const stepIndicator = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
      {[1, 2, 3].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.3s',
            background: step > s ? '#10b981' : step === s ? '#8b5cf6' : '#e5e2ed',
            color: step >= s ? 'white' : '#9490a3',
            boxShadow: step === s ? '0 4px 14px rgba(139,92,246,0.35)' : 'none',
          }}>
            {step > s ? <Check size={14} /> : s}
          </div>
          {i < 2 && <div style={{ width: '40px', height: '2px', background: step > s ? '#10b981' : '#e5e2ed', borderRadius: '2px', transition: 'all 0.3s' }} />}
        </div>
      ))}
    </div>
  )

  // ── STEP 4: SUCCESS ──
  if (step === 4 && generatedCode) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f5f8', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ width: '100%', maxWidth: '500px', background: 'white', borderRadius: '18px', padding: '2.5rem', boxShadow: '0 8px 32px rgba(26,16,37,0.06)', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle size={36} color="#10b981" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1025', marginBottom: '0.5rem' }}>Payment Successful!</h1>
          <p style={{ color: '#6b657d', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '0.5rem' }}>
            <strong>{form.name}</strong> is now fully activated on the MSSS platform.
          </p>
          <p style={{ color: '#6b657d', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Your School Code has been generated. Share it with your teachers so they can sign up.
          </p>

          {/* School Code */}
          <div style={{ background: '#f8f7fb', border: '2px dashed #8b5cf6', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: '#6b657d' }}>
              <KeyRound size={14} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your School Code</span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '0.12em', color: '#8b5cf6', fontFamily: "'Inter', monospace", marginBottom: '0.75rem' }}>
              {generatedCode}
            </div>
            <button onClick={handleCopyCode} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem',
              borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              border: '1px solid rgba(139,92,246,0.3)',
              background: copied ? 'rgba(16,185,129,0.08)' : 'white',
              color: copied ? '#10b981' : '#8b5cf6', transition: 'all 0.2s'
            }}>
              {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
            </button>
          </div>

          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.75rem', textAlign: 'left' }}>
            <div style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: 1.6 }}>
              <strong>⚠ Important:</strong> Save this code! Teachers will need it to sign up for your school portal. You can also find it later in your <strong>Settings</strong> page.
            </div>
          </div>

          <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f5f8', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: step === 3 ? '720px' : '500px', background: 'white', borderRadius: '18px', padding: '2.5rem', boxShadow: '0 8px 32px rgba(26,16,37,0.06)', transition: 'max-width 0.3s' }}>
        <button
          onClick={() => {
            if (step === 1) navigate('/login')
            else if (step === 2.5) setStep(2)
            else setStep(Math.floor(step - 1))
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#9490a3', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> {step === 1 ? 'Back to Login' : 'Back'}
        </button>

        {stepIndicator}

        {/* ── STEP 1: SCHOOL INFO ── */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#8b5cf6' }}>
                <Building2 size={28} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1025', marginBottom: '0.35rem' }}>School Information</h1>
              <p style={{ color: '#9490a3', fontSize: '0.9rem' }}>Enter your school details to get started</p>
            </div>

            <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Building2 size={14} /> School Name</label>
                <input type="text" className="form-input" placeholder="e.g. Cambridge International School" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><AlignLeft size={14} /> School Motto</label>
                <input type="text" className="form-input" placeholder="e.g. Knowledge is Power" value={form.motto} onChange={(e) => setForm(f => ({ ...f, motto: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={14} /> Address</label>
                <input type="text" className="form-input" placeholder="Enter school address" value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ImageIcon size={14} /> School Logo</label>
                <div
                  style={{ border: '2px dashed #e5e2ed', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: preview ? '#f8f9fa' : 'white' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                  {preview ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                      <img src={preview} alt="School Logo" style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px', background: 'white', border: '1px solid #e5e2ed', padding: '3px' }} />
                      <span style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 600 }}>Click to change</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: '#9490a3' }}>
                      <Upload size={22} />
                      <span style={{ fontSize: '0.82rem' }}>Upload school logo</span>
                    </div>
                  )}
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                Next: Admin Account <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}

        {/* ── STEP 2: ADMIN ACCOUNT ── */}
        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#8b5cf6' }}>
                <User size={28} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1025', marginBottom: '0.35rem' }}>Admin Account</h1>
              <p style={{ color: '#9490a3', fontSize: '0.9rem' }}>Set up the administrator account for {form.name}</p>
            </div>

            <form onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '6px' }}>{error}</div>}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} /> Full Name</label>
                <input type="text" className="form-input" placeholder="Enter admin name" value={form.adminName} onChange={(e) => setForm(f => ({ ...f, adminName: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={14} /> Email Address</label>
                <input type="email" className="form-input" placeholder="admin@school.com" value={form.adminEmail} onChange={(e) => setForm(f => ({ ...f, adminEmail: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={14} /> Password</label>
                <input type="password" className="form-input" placeholder="Create a secure password" value={form.adminPassword} onChange={(e) => setForm(f => ({ ...f, adminPassword: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                Next: Verification <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}

        {/* ── STEP 2.5: OTP VERIFICATION ── */}
        {step === 2.5 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#10b981' }}>
                <ShieldCheck size={28} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1025', marginBottom: '0.35rem' }}>Verify Your Email</h1>
              <p style={{ color: '#9490a3', fontSize: '0.9rem' }}>We've sent a 6-digit confirmation code to <strong>{form.adminEmail}</strong>.</p>
            </div>

            <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '6px' }}>{error}</div>}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Enter 6-digit OTP</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="------" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                  maxLength={6} 
                  style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem', fontWeight: 700 }} 
                />
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: '#9490a3' }}>Didn't receive the code?</span>{' '}
                <button type="button" onClick={handleResendOTP} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                  Resend Code
                </button>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                Verify & Proceed <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}

        {/* ── STEP 3: PAYMENT ── */}
        {step === 3 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#8b5cf6' }}>
                <CreditCard size={28} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1025', marginBottom: '0.35rem' }}>Choose Your Plan</h1>
              <p style={{ color: '#9490a3', fontSize: '0.9rem' }}>Select a subscription plan for {form.name}</p>
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {PLANS.map(plan => {
                const isSelected = selectedPlan === plan.id
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    style={{
                      border: `2px solid ${isSelected ? plan.color : '#e5e2ed'}`,
                      borderRadius: '14px', padding: '1.25rem', cursor: 'pointer',
                      background: isSelected ? `${plan.color}08` : 'white',
                      transition: 'all 0.2s', position: 'relative',
                      transform: isSelected ? 'scale(1.02)' : 'none',
                    }}
                  >
                    {plan.popular && (
                      <div style={{
                        position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                        background: plan.color, color: 'white', fontSize: '0.65rem', fontWeight: 700,
                        padding: '0.2rem 0.75rem', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        Most Popular
                      </div>
                    )}
                    <div style={{ textAlign: 'center', marginBottom: '0.75rem', marginTop: plan.popular ? '0.5rem' : 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: plan.color, marginBottom: '0.25rem' }}>{plan.name}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1a1025' }}>{plan.price}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9490a3' }}>{plan.period}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#3f3950' }}>
                          <Check size={12} color={plan.color} style={{ flexShrink: 0 }} /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Payment notice */}
            <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: 1.6 }}>
                <strong>💳 Note:</strong> Payment gateway integration is coming soon. Click below to simulate payment and activate your portal immediately.
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={paying}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', background: paying ? '#a78bfa' : undefined }}
            >
              {paying ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="animate-pulse">Processing Payment...</span>
                </span>
              ) : (
                <>
                  <CreditCard size={18} /> Pay {PLANS.find(p => p.id === selectedPlan)?.price} & Activate
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
