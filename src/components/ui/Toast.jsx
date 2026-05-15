import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const COLORS = {
  success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#10b981' },
  error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#ef4444' },
  info: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', color: '#8b5cf6' },
}

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false)
  const Icon = ICONS[toast.type] || Info
  const colors = COLORS[toast.type] || COLORS.info

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(toast.id), 300)
    }, toast.duration || 3000)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(26,16,37,0.15)',
        animation: exiting ? 'toastOut 0.3s ease forwards' : 'toastIn 0.3s ease forwards',
        minWidth: '300px',
        maxWidth: '440px',
      }}
    >
      <Icon size={18} color={colors.color} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
        {toast.message}
      </span>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 300) }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.length > 0 && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
