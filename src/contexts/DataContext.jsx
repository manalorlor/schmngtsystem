import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { mockSBA as initialSBA, mockExamScores as initialExamScores, mockTimetable as initialTimetable } from '../lib/mockData'

const DataContext = createContext(null)

// ── Seed chat threads between admin and each teacher ──
const seedChats = () => {
  const now = new Date()
  const fmt = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const at = (minAgo) => { const d = new Date(now - minAgo * 60000); return { ts: d.getTime(), time: fmt(d) } }
  return {
    'admin_t1': {
      teacherId: 't1', teacherName: 'Mr. Emmanuel Adjei',
      messages: [
        { id: 'm1', sender: 'admin', senderName: 'Admin', text: 'Good morning Mr. Adjei. How are the JHS 3A Mathematics results looking?', ...at(120) },
        { id: 'm2', sender: 'teacher', senderName: 'Mr. Emmanuel Adjei', text: 'Good morning! Results are strong overall. A few students need extra support.', ...at(115) },
        { id: 'm3', sender: 'admin', senderName: 'Admin', text: 'Please flag those students in the SBA system. We\'ll arrange remedial classes.', ...at(110) },
        { id: 'm4', sender: 'teacher', senderName: 'Mr. Emmanuel Adjei', text: 'Understood. I\'ll update the records by end of day.', ...at(105) },
      ],
    },
    'admin_t2': {
      teacherId: 't2', teacherName: 'Mrs. Grace Amponsah',
      messages: [
        { id: 'm5', sender: 'teacher', senderName: 'Mrs. Grace Amponsah', text: 'The exam results for JHS 2B English are ready for your review.', ...at(60) },
        { id: 'm6', sender: 'admin', senderName: 'Admin', text: 'Thank you Grace. I\'ll review them this afternoon.', ...at(55) },
      ],
    },
    'admin_t3': {
      teacherId: 't3', teacherName: 'Mr. Samuel Owusu',
      messages: [
        { id: 'm7', sender: 'teacher', senderName: 'Mr. Samuel Owusu', text: 'Science lab equipment request has been submitted. Awaiting approval.', ...at(2880) },
      ],
    },
    'admin_t4': { teacherId: 't4', teacherName: 'Ms. Patricia Agyei', messages: [] },
    'admin_t5': { teacherId: 't5', teacherName: 'Mr. David Frimpong', messages: [] },
  }
}

export function DataProvider({ children }) {
  const [sbaRecords, setSbaRecords] = useState([...initialSBA])
  const [examScores, setExamScores] = useState([...initialExamScores])
  const [timetable, setTimetable] = useState(() => JSON.parse(JSON.stringify(initialTimetable)))

  // ── Payroll State (persisted, cleared on term change) ──
  // Contains all configured or issued payslips for the term across all months.
  const [payrollRecords, setPayrollRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sf_payroll_records') || '[]') } catch { return [] }
  })
  useEffect(() => {
    localStorage.setItem('sf_payroll_records', JSON.stringify(payrollRecords))
  }, [payrollRecords])

  // Saves or updates a record for a specific teacher and period
  const savePayrollRecord = useCallback((record) => {
    setPayrollRecords(prev => {
      const exists = prev.find(p => p.teacherId === record.teacherId && p.period === record.period)
      if (exists) {
        return prev.map(p => p.teacherId === record.teacherId && p.period === record.period ? { ...p, ...record } : p)
      }
      return [...prev, { ...record, id: `pay_${Date.now()}_${record.teacherId}` }]
    })
  }, [])

  const issuePayrollRecord = useCallback((teacherId, period, meta) => {
    setPayrollRecords(prev => prev.map(p => 
      p.teacherId === teacherId && p.period === period 
        ? { ...p, status: 'issued', issuedDate: new Date().toISOString().split('T')[0], ...meta } 
        : p
    ))
  }, [])

  const issueAllReadyForPeriod = useCallback((period, meta) => {
    setPayrollRecords(prev => prev.map(p => 
      p.period === period && p.status === 'configured'
        ? { ...p, status: 'issued', issuedDate: new Date().toISOString().split('T')[0], ...meta }
        : p
    ))
  }, [])

  const deletePayrollRecord = useCallback((teacherId, period) => {
    setPayrollRecords(prev => prev.filter(p => !(p.teacherId === teacherId && p.period === period)))
  }, [])

  const clearRecordsForNewTerm = useCallback(() => {
    // Clear SBA records
    setSbaRecords([])
    // Clear Exam scores
    setExamScores([])
    // Clear Payroll records
    setPayrollRecords([])
    localStorage.removeItem('sf_payroll_records')
  }, [])

  // Shared chat threads: key = 'admin_<teacherId>'
  const [chatThreads, setChatThreads] = useState(() => seedChats())

  const generateSchoolCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = 'SCH-'
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return code
  }

  const defaultSchoolInfo = {
    name: 'MANATECH Academy',
    address: '',
    logo: null,
    schoolCode: null,
    paymentStatus: 'none'
  }
  const [schoolInfo, setSchoolInfo] = useState(() => {
    const saved = localStorage.getItem('sf_school')
    return saved ? JSON.parse(saved) : defaultSchoolInfo
  })

  const [notifications, setNotifications] = useState(() => [
    { id: 'n1', title: 'Fee Payment Received', desc: 'Kofi Mensah paid GHS 500.00 for Term 2', date: new Date(Date.now() - 120000).toISOString(), type: 'success', audience: 'Admin', readBy: [] },
    { id: 'n2', title: 'New Student Enrolled', desc: 'Ama Quaye enrolled in JHS 1B', date: new Date(Date.now() - 3600000).toISOString(), type: 'info', audience: 'Everyone', targetClass: 'JHS 1B', readBy: [] },
    { id: 'n3', title: 'Attendance Alert', desc: '3 students absent in JHS 3A today', date: new Date(Date.now() - 10800000).toISOString(), type: 'warning', audience: 'All Teachers', targetClass: 'JHS 3A', readBy: [] },
    { id: 'n4', title: 'SBA Deadline Approaching', desc: 'Term 2 SBA submissions due in 5 days', date: new Date(Date.now() - 18000000).toISOString(), type: 'info', audience: 'All Teachers', readBy: [] },
    { id: 'n5', title: 'Staff Meeting', desc: 'Staff meeting scheduled for tomorrow at 10:00 AM', date: new Date(Date.now() - 86400000).toISOString(), type: 'info', audience: 'All Staff', readBy: [] },
  ])

  const addNotification = useCallback(({ title, desc, type, audience, targetClass }) => {
    setNotifications(prev => [{
      id: `n_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
      title,
      desc,
      type: type || 'info',
      audience: audience || 'Everyone',
      targetClass: targetClass || null,
      date: new Date().toISOString(),
      readBy: [],
    }, ...prev])
  }, [])

  const markNotificationRead = useCallback((userId, notifId) => {
    setNotifications(prev => prev.map(n => {
      if (notifId && n.id !== notifId) return n
      const readBy = n.readBy || []
      if (readBy.includes(userId)) return n
      return { ...n, readBy: [...readBy, userId] }
    }))
  }, [])

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const updateSchoolInfo = useCallback((info) => {
    const finalInfo = info.schoolCode ? info : { ...info, schoolCode: generateSchoolCode() }
    if (!finalInfo.paymentStatus) finalInfo.paymentStatus = 'none'
    setSchoolInfo(finalInfo)
    localStorage.setItem('sf_school', JSON.stringify(finalInfo))
    return finalInfo
  }, [])

  const activateSchool = useCallback(() => {
    setSchoolInfo(prev => {
      const updated = { ...prev, paymentStatus: 'paid' }
      localStorage.setItem('sf_school', JSON.stringify(updated))
      return updated
    })
  }, [])

  const validateSchoolCode = useCallback((code) => {
    if (!schoolInfo?.schoolCode) return false
    return code.toUpperCase().trim() === schoolInfo.schoolCode.toUpperCase().trim()
  }, [schoolInfo])

  // ── SBA Operations ──
  const saveSbaRecord = useCallback((record) => {
    setSbaRecords(prev => {
      const idx = prev.findIndex(r => r.id === record.id)
      if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], ...record }; return u }
      return [...prev, record]
    })
  }, [])

  const saveSbaRecordsBulk = useCallback((records) => {
    setSbaRecords(prev => {
      const updated = [...prev]
      records.forEach(record => {
        const idx = updated.findIndex(r => r.id === record.id)
        if (idx >= 0) { updated[idx] = { ...updated[idx], ...record } } else { updated.push(record) }
      })
      return updated
    })
  }, [])

  const deleteSbaRecord = useCallback((id) => {
    setSbaRecords(prev => prev.filter(r => r.id !== id))
  }, [])

  // ── Exam Score Operations ──
  const saveExamScore = useCallback((record) => {
    setExamScores(prev => {
      const idx = prev.findIndex(r => r.id === record.id)
      if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], ...record }; return u }
      return [...prev, record]
    })
  }, [])

  const saveExamScoresBulk = useCallback((records) => {
    setExamScores(prev => {
      const updated = [...prev]
      records.forEach(record => {
        const idx = updated.findIndex(r => r.id === record.id)
        if (idx >= 0) { updated[idx] = { ...updated[idx], ...record } } else { updated.push(record) }
      })
      return updated
    })
  }, [])

  const deleteExamScore = useCallback((id) => {
    setExamScores(prev => prev.filter(r => r.id !== id))
  }, [])

  // ── Timetable Operations ──
  const updateTimetableSlot = useCallback((className, day, periodId, slotData) => {
    setTimetable(prev => ({
      ...prev,
      [className]: {
        ...prev[className],
        [day]: {
          ...prev[className]?.[day],
          [periodId]: { ...prev[className]?.[day]?.[periodId], ...slotData },
        },
      },
    }))
  }, [])

  const updatePeriodLabel = useCallback((periodId, newLabel) => {
    setTimetable(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(className => {
        const cls = { ...next[className] }
        Object.keys(cls).forEach(day => {
          if (cls[day]?.[periodId]) {
            cls[day] = { ...cls[day], [periodId]: { ...cls[day][periodId], _labelOverride: newLabel } }
          }
        })
        next[className] = cls
      })
      return next
    })
  }, [])

  // ── Chat / Messaging Operations ──
  // threadId convention: 'admin_<teacherId>'  e.g. 'admin_t1'
  // sender: 'admin' | 'teacher'
  const sendMessage = useCallback((threadId, sender, senderName, text) => {
    if (!text.trim()) return
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sender,
      senderName,
      text: text.trim(),
      ts: Date.now(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    setChatThreads(prev => ({
      ...prev,
      [threadId]: {
        ...prev[threadId],
        messages: [...(prev[threadId]?.messages || []), newMsg],
      },
    }))
  }, [])

  // Mark all messages in thread as read by a role
  const markThreadRead = useCallback((threadId, readerRole) => {
    setChatThreads(prev => {
      if (!prev[threadId]) return prev
      return {
        ...prev,
        [threadId]: { ...prev[threadId], [`lastReadBy_${readerRole}`]: Date.now() },
      }
    })
  }, [])

  // Count unread messages for a role in a thread
  // (messages sent by the OTHER party after lastReadBy_<role>)
  const getUnreadCount = useCallback((threadId, readerRole) => {
    const thread = chatThreads[threadId]
    if (!thread) return 0
    const lastRead = thread[`lastReadBy_${readerRole}`] || 0
    const otherSender = readerRole === 'admin' ? 'teacher' : 'admin'
    return thread.messages.filter(m => m.sender === otherSender && m.ts > lastRead).length
  }, [chatThreads])

  // Delete a message from a thread
  const deleteMessage = useCallback((threadId, messageId) => {
    setChatThreads(prev => {
      const thread = prev[threadId]
      if (!thread) return prev
      return {
        ...prev,
        [threadId]: {
          ...thread,
          messages: thread.messages.filter(m => m.id !== messageId),
        },
      }
    })
  }, [])

  return (
    <DataContext.Provider value={{
      sbaRecords, examScores,
      saveSbaRecord, saveSbaRecordsBulk, deleteSbaRecord,
      saveExamScore, saveExamScoresBulk, deleteExamScore,
      timetable, updateTimetableSlot, updatePeriodLabel,
      chatThreads, sendMessage, markThreadRead, getUnreadCount, deleteMessage,
      schoolInfo, updateSchoolInfo, validateSchoolCode, activateSchool,
      notifications, addNotification, markNotificationRead, deleteNotification, setNotifications,
      payrollRecords, savePayrollRecord, issuePayrollRecord, deletePayrollRecord, issueAllReadyForPeriod, clearRecordsForNewTerm
    }}>
      {children}
    </DataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
