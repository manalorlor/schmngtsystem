import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadUserProfile(authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, role, school_id, avatar_url, phone')
      .eq('id', authUser.id)
      .single()

    if (profile) {
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: profile.name,
        role: profile.role,
        schoolId: profile.school_id,
        avatarUrl: profile.avatar_url,
        phone: profile.phone,
      })
    }
  }

  // On mount, restore session from Supabase and fetch profile
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user)
      }
      setLoading(false)
    }
    restoreSession()

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── LOGIN ──
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { data: null, error }
    
    // Explicitly load the profile and wait for it
    if (data?.user) {
      await loadUserProfile(data.user)
    }
    
    return { data, error: null }
  }

  // ── TEACHER SIGNUP (called from LoginPage after OTP verified) ──
  const signup = async (email, password, name, role, schoolId) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, school_id: schoolId },
        emailRedirectTo: window.location.origin + '/login',
      },
    })
    if (error) return { data: null, error }

    // If email confirmation is disabled in Supabase, insert profile immediately
    if (data.user && !data.user.identities?.length === 0) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        school_id: schoolId,
        name,
        role,
      })
    }

    return { data, error: null }
  }

  // ── ADMIN SCHOOL REGISTRATION (called from RegisterSchool after payment) ──
  const registerSchoolAdmin = async ({ email, password, name, schoolId }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'admin', school_id: schoolId },
        emailRedirectTo: window.location.origin + '/login',
      },
    })
    if (error) return { data: null, error }
    return { data, error: null }
  }

  // ── UPDATE OWN PROFILE ──
  const updateUserProfile = async (updates) => {
    if (!user) return false
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        phone: updates.phone,
        avatar_url: updates.avatarUrl,
      })
      .eq('id', user.id)

    if (error) return false
    setUser(prev => ({ ...prev, ...updates }))
    return true
  }

  // ── CHANGE PASSWORD (from Settings page) ──
  const resetPassword = async (email, newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return false
    return true
  }

  // ── SEND PASSWORD RESET EMAIL ──
  const sendPasswordResetEmail = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login?view=forgot_new_pwd',
    })
    if (error) return { error }
    return { error: null }
  }

  // ── LOGOUT ──
  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      setUser(null)
      localStorage.removeItem('sf_user')
      localStorage.removeItem('sf_school')
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      registerSchoolAdmin,
      updateUserProfile,
      resetPassword,
      sendPasswordResetEmail,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
