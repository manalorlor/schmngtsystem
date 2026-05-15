import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { Eye, EyeOff, LogIn, AlertCircle, Shield, BookOpen, Wallet, Users, KeyRound, ShieldCheck, Mail, Lock } from 'lucide-react'
import { validatePassword } from '../../lib/utils'
import { useToast } from '../../components/ui/Toast'
import msssLogo from '../../assets/logo.jpg'

const DEMO_HINTS = [
  { role: 'Admin', email: 'admin@manatech.edu', pass: 'admin123' },
  { role: 'Teacher', email: 'teacher@manatech.edu', pass: 'teacher123' },
]

export default function LoginPage() {
  const { login, signup, users, resetPassword } = useAuth()
  const { validateSchoolCode, schoolInfo } = useData()
  const { addToast } = useToast()
  const navigate = useNavigate()
  
  // Views: 'login', 'signup', 'signup_otp', 'forgot_email', 'forgot_otp', 'forgot_new_pwd'
  const [view, setView] = useState('login')
  const [name, setName] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  
  // OTP State
  const [otp, setOtp] = useState('')
  const [expectedOtp, setExpectedOtp] = useState(null)
  const [otpExpiry, setOtpExpiry] = useState(null)

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    // calculate relative to right panel, but using window is fine for a general tilt
    const x = (e.clientX / window.innerWidth - 0.5) * 15
    const y = (e.clientY / window.innerHeight - 0.5) * 15
    setMousePos({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 })
  }

  const handleResendOTP = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setExpectedOtp(code)
    setOtp(code) // Auto-fill for testing
    setOtpExpiry(Date.now() + 10 * 60 * 1000)
    setError('')
    console.log(`[SIMULATED EMAIL/SMS] Resent OTP for ${email}: ${code}`)
    addToast(`New OTP Sent to ${email}: ${code}`, 'success')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (view === 'signup') {
      if (!validateSchoolCode(schoolCode)) { setLoading(false); setError('Invalid School Code. Please get the correct code from your school administrator.'); return }
      if (schoolInfo?.paymentStatus !== 'paid') { setLoading(false); setError('Your school\'s subscription payment has not been confirmed yet.'); return }
      if (!validatePassword(password)) { setLoading(false); setError('Password must be at least 8 chars, with uppercase, lowercase, numbers, and special characters.'); return }
      
      const teacherCount = Object.values(users).filter(u => u.role === 'teacher').length
      const plan = schoolInfo?.plan || 'basic'
      if (plan === 'basic' && teacherCount >= 10) { setLoading(false); setError('Teacher limit reached for Basic Plan (Max 10). Please contact your administrator.'); return }
      if (plan === 'standard' && teacherCount >= 30) { setLoading(false); setError('Teacher limit reached for Standard Plan (Max 30). Please contact your administrator.'); return }
      
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setExpectedOtp(code)
      setOtp(code) // Auto-fill for testing since there is no live email server yet
      setOtpExpiry(Date.now() + 10 * 60 * 1000)
      console.log(`[SIMULATED EMAIL/SMS] OTP for ${email}: ${code}`)
      addToast(`OTP Sent to ${email}: ${code}`, 'success')
      setLoading(false)
      setView('signup_otp')
      return
    }

    if (view === 'signup_otp') {
      if (Date.now() > otpExpiry) { setLoading(false); setError('OTP expired. Please go back and resubmit to generate a new code.'); return }
      if (otp !== expectedOtp) { setLoading(false); setError('Invalid OTP. Please try again.'); return }
      
      const { error: err } = await signup(email, password, name, 'teacher')
      setLoading(false)
      if (err) { setError(err.message); return }
      setSuccessMsg('Teacher account created successfully! You can now sign in.')
      setView('login')
      setPassword('')
      setSchoolCode('')
      setOtp('')
      return
    }

    if (view === 'forgot_email') {
      if (!users[email.toLowerCase()]) { setLoading(false); setError('No account found with this email address.'); return }
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setExpectedOtp(code)
      setOtp(code) // Auto-fill for testing
      setOtpExpiry(Date.now() + 10 * 60 * 1000)
      console.log(`[SIMULATED EMAIL/SMS] Password reset OTP for ${email}: ${code}`)
      addToast(`OTP Sent to ${email}: ${code}`, 'success')
      setLoading(false)
      setView('forgot_otp')
      return
    }

    if (view === 'forgot_otp') {
      if (Date.now() > otpExpiry) { setLoading(false); setError('OTP expired. Please go back and request a new one.'); return }
      if (otp !== expectedOtp) { setLoading(false); setError('Invalid OTP. Please try again.'); return }
      setLoading(false)
      setView('forgot_new_pwd')
      setOtp('')
      return
    }

    if (view === 'forgot_new_pwd') {
      if (!validatePassword(password)) { setLoading(false); setError('Password must be at least 8 chars, with uppercase, lowercase, numbers, and special characters.'); return }
      resetPassword(email, password)
      setLoading(false)
      setSuccessMsg('Password reset successfully! You can now sign in with your new password.')
      setView('login')
      setPassword('')
      return
    }

    // view === 'login'
    if (view === 'login') {
      const { data, error: err } = await login(email, password)
      setLoading(false)
      if (err) { setError(err.message); return }
      
      if (data.role === 'student') { setError('Student portal is temporarily disabled.'); return }

      // Block access if school payment not confirmed (skip for demo accounts)
      const isDemoAccount = email.toLowerCase().endsWith('@manatech.edu')
      if (!isDemoAccount && schoolInfo?.paymentStatus !== 'paid') {
        setError('Your school\'s subscription payment is pending. Please complete payment to access the platform.')
        return
      }

      const redirects = { admin: '/admin/dashboard', teacher: '/teacher/dashboard' }
      navigate(redirects[data.role] || '/admin/dashboard')
    }
  }

  const fillDemo = (hint) => {
    setEmail(hint.email)
    setPassword(hint.pass)
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f5f8' }}>
      {/* Left panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <img src={msssLogo} alt="MSSS Logo" style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'contain', background: 'white', boxShadow: '0 6px 24px rgba(139,92,246,0.3)', padding: '4px' }} />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1025', letterSpacing: '-0.02em', lineHeight: 1.1 }}>MANATECH SCHOOL</div>
              <div style={{ fontSize: '0.75rem', color: '#5c5470', fontWeight: 700 }}>SOFTWARE SOLUTIONS (MSSS)</div>
            </div>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.375rem', color: '#1a1025' }}>
            {view === 'signup' || view === 'signup_otp' ? 'Teacher Sign Up' 
            : view === 'forgot_email' ? 'Reset Password' 
            : view === 'forgot_otp' ? 'Verify OTP' 
            : view === 'forgot_new_pwd' ? 'New Password' 
            : 'Welcome back'}
          </h1>
          <p style={{ color: '#9490a3', fontSize: '0.9rem', marginBottom: '2rem' }}>
            {view === 'signup' ? 'Create your teacher account to join your school'
            : view === 'signup_otp' ? `Enter the code sent to ${email}`
            : view === 'forgot_email' ? 'Enter your email to receive a reset code'
            : view === 'forgot_otp' ? `Enter the reset code sent to ${email}`
            : view === 'forgot_new_pwd' ? 'Create a new secure password'
            : 'Sign in to your portal to continue'}
          </p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#ef4444' }}>
              <AlertCircle size={16} />{error}
            </div>
          )}
          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#10b981' }}>
              <AlertCircle size={16} />{successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {view === 'signup' && (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="signup-name">Full Name</label>
                  <input id="signup-name" type="text" className="form-input" placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} required style={{ background: 'white', border: '1.5px solid #e5e2ed' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="signup-school-code" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <KeyRound size={13} /> School Code
                  </label>
                  <input id="signup-school-code" type="text" className="form-input" placeholder="e.g. SCH-7X4K" value={schoolCode} onChange={(e) => setSchoolCode(e.target.value.toUpperCase())} required maxLength="8" style={{ background: 'white', border: '1.5px solid #e5e2ed', fontFamily: "'Inter', monospace", letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }} />
                  <div style={{ fontSize: '0.72rem', color: '#9490a3', marginTop: '0.3rem' }}>Get this code from your school administrator</div>
                </div>
              </>
            )}
            
            {(view === 'login' || view === 'signup' || view === 'forgot_email') && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="login-email">Email address</label>
                <input id="login-email" type="email" className="form-input" placeholder="you@manatech.edu" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={{ background: 'white', border: '1.5px solid #e5e2ed' }} />
              </div>
            )}
            
            {(view === 'login' || view === 'signup' || view === 'forgot_new_pwd') && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="login-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="login-password" type={showPass ? 'text' : 'password'} className="form-input" placeholder={view === 'forgot_new_pwd' ? "Create a secure password" : "Enter your password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={view === 'login' ? "current-password" : "new-password"} style={{ paddingRight: '2.75rem', background: 'white', border: '1.5px solid #e5e2ed' }} />
                  <button type="button" onClick={() => setShowPass((v) => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9490a3', display: 'flex' }} aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {(view === 'signup_otp' || view === 'forgot_otp') && (
              <>
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
                  <button type="button" onClick={handleResendOTP} style={{ background: 'none', border: 'none', color: '#8b5cf6', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                    Resend Code
                  </button>
                </div>
              </>
            )}

            {view === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#5c5470', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: '#8b5cf6' }} /> Remember me
                </label>
                <button type="button" onClick={() => { setView('forgot_email'); setError(''); setSuccessMsg(''); setPassword(''); }} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#8b5cf6', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Forgot password?</button>
              </div>
            )}
            
            <button id="login-submit-btn" type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: '0.25rem', fontSize: '0.95rem', padding: '0.875rem 1.5rem' }}>
              {loading ? <span className="animate-pulse">Processing…</span> 
              : view === 'login' ? <><LogIn size={18} /> Sign In</> 
              : view === 'signup' ? 'Sign Up' 
              : view === 'forgot_email' ? 'Send Reset Code'
              : (view === 'signup_otp' || view === 'forgot_otp') ? 'Verify & Proceed'
              : 'Reset Password'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
            {view !== 'login' ? (
              <button type="button" onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: '#8b5cf6', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                &larr; Back to Login
              </button>
            ) : (
              <>
                <span style={{ color: '#9490a3' }}>Are you a teacher?</span>{' '}
                <button type="button" onClick={() => { setView('signup'); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: '#8b5cf6', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                  Sign Up
                </button>
              </>
            )}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e2ed' }} />
              <span style={{ fontSize: '0.75rem', color: '#9490a3', whiteSpace: 'nowrap', fontWeight: 500 }}>Demo accounts</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e2ed' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {DEMO_HINTS.map((hint) => (
                <button key={hint.role} type="button" onClick={() => fillDemo(hint)} className="btn btn-secondary btn-sm" style={{ flex: 1, minWidth: '90px' }} id={`demo-${hint.role.toLowerCase()}-btn`}>{hint.role}</button>
              ))}
            </div>
          </div>

          {/* Register Link */}
          <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e2ed', textAlign: 'center' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1025', marginBottom: '0.25rem' }}>Register your school</div>
            <div style={{ fontSize: '0.8rem', color: '#9490a3', marginBottom: '1rem' }}>New to MSSS? Set up your school portal here.</div>
            <button type="button" onClick={() => navigate('/register')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Register Now</button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9490a3', marginTop: '2rem' }}>© 2026 MANATECH. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel */}
      <div 
        style={{ flex: '0 0 480px', background: '#1a1025', padding: '3rem 2.5rem', gap: '2rem', position: 'relative', overflow: 'hidden', perspective: '1200px' }} 
        className="hidden md:flex flex-col items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 3D Container */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          transform: `rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg)`, 
          transformStyle: 'preserve-3d', 
          transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
          zIndex: 1 
        }}>
          <div style={{ textAlign: 'center', position: 'relative', transform: 'translateZ(40px)', transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
            <img src={msssLogo} alt="MSSS Logo" style={{ width: '88px', height: '88px', borderRadius: '22px', background: 'white', objectFit: 'contain', padding: '6px', margin: '0 auto 1.75rem', boxShadow: '0 12px 32px rgba(255,255,255,0.1)' }} />
            <h2 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '0.875rem', color: 'white' }}>MSSS Platform</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: '340px' }}>
              A comprehensive multi-tenant school management solution for modern educational institutions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%', maxWidth: '360px', marginTop: '2.5rem', transform: 'translateZ(25px)', transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
            {[
              { icon: Users, label: 'Student Admin', color: '#8b5cf6' },
              { icon: BookOpen, label: 'Academics', color: '#f97316' },
              { icon: Wallet, label: 'Finance', color: '#10b981' },
              { icon: Shield, label: 'Security', color: '#f59e0b' },
            ].map((f) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', transition: 'background 0.2s' }}>
                <f.icon size={18} color={f.color} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
