import { createContext, useContext, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Demo accounts for development (remove when Supabase auth is live)
const DEMO_ACCOUNTS = {
  'admin@manatech.edu': { role: 'admin', name: 'Mr. Isaac Asante', password: 'admin123' },
  'teacher@manatech.edu': { role: 'teacher', name: 'Mr. Emmanuel Adjei', password: 'teacher123' },
  'student@manatech.edu': { role: 'student', name: 'Kofi Mensah', password: 'student123' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sf_user')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { console.error(e) }
    }
    return null
  })

  // Local state for registered users (useful for demo/offline mode)
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('sf_users')
    return saved ? JSON.parse(saved) : DEMO_ACCOUNTS
  })

  const [loading] = useState(false)

  const login = async (email, password) => {
    const account = users[email.toLowerCase()]
    if (account && account.password === password) {
      const userData = { email, role: account.role, name: account.name, id: `user-${Date.now()}` }
      setUser(userData)
      localStorage.setItem('sf_user', JSON.stringify(userData))
      return { data: userData, error: null }
    }

    if (import.meta.env.VITE_SUPABASE_URL) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { data: null, error }
      const profile = data.user?.user_metadata || {}
      const userData = { email, role: profile.role || 'student', name: profile.name || email, id: data.user.id }
      setUser(userData)
      localStorage.setItem('sf_user', JSON.stringify(userData))
      return { data: userData, error: null }
    }

    return { data: null, error: { message: 'Invalid email or password.' } }
  }

  const signup = async (email, password, name, role) => {
    const lowerEmail = email.toLowerCase()
    if (users[lowerEmail]) {
      return { data: null, error: { message: 'User already exists.' } }
    }
    
    const newUser = { role, name, password }
    const updatedUsers = { ...users, [lowerEmail]: newUser }
    setUsers(updatedUsers)
    localStorage.setItem('sf_users', JSON.stringify(updatedUsers))
    
    return { data: newUser, error: null }
  }

  const updateUserRole = (email, newRole) => {
    const lowerEmail = email.toLowerCase()
    if (users[lowerEmail]) {
      const updatedUsers = { ...users, [lowerEmail]: { ...users[lowerEmail], role: newRole } }
      setUsers(updatedUsers)
      localStorage.setItem('sf_users', JSON.stringify(updatedUsers))
      return true
    }
    return false
  }

  const updateUserProfile = (updates) => {
    // Update active user session
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('sf_user', JSON.stringify(updatedUser))

    // If changing password or details, update the demo account store too
    const lowerEmail = user.email.toLowerCase()
    if (users[lowerEmail]) {
      const updatedUsers = { 
        ...users, 
        [lowerEmail]: { ...users[lowerEmail], ...updates } 
      }
      setUsers(updatedUsers)
      localStorage.setItem('sf_users', JSON.stringify(updatedUsers))
    }
    return true
  }

  const resetPassword = (email, newPassword) => {
    const lowerEmail = email.toLowerCase()
    if (users[lowerEmail]) {
      const updatedUsers = { 
        ...users, 
        [lowerEmail]: { ...users[lowerEmail], password: newPassword } 
      }
      setUsers(updatedUsers)
      localStorage.setItem('sf_users', JSON.stringify(updatedUsers))
      return true
    }
    return false
  }

  const logout = async () => {
    if (import.meta.env.VITE_SUPABASE_URL) {
      await supabase.auth.signOut()
    }
    setUser(null)
    localStorage.removeItem('sf_user')
  }

  return (
    <AuthContext.Provider value={{ user, users, loading, login, signup, updateUserRole, updateUserProfile, resetPassword, logout }}>
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
