import { useState, useEffect, useRef, useMemo } from 'react'
import { mockTeachers } from '../../lib/mockData'
import { useData } from '../../contexts/DataContext'
import { getInitials, getAvatarColor } from '../../lib/utils'
import { Send, Search, MessageSquare, Clock, Check, CheckCheck, Trash2 } from 'lucide-react'

const STATUS_COLORS = { active: '#10b981', on_leave: '#f59e0b' }

function formatThreadTime(messages) {
  if (!messages || messages.length === 0) return null
  const last = messages[messages.length - 1]
  const diffMin = Math.floor((Date.now() - last.ts) / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  return `${Math.floor(diffH / 24)}d ago`
}

export default function MessagesPageFull() {
  const { chatThreads, sendMessage, markThreadRead, getUnreadCount, deleteMessage } = useData()
  const [activeTeacherId, setActiveTeacherId] = useState('t1')
  const [draft, setDraft] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const msgEndRef = useRef(null)
  const inputRef = useRef(null)

  const threadId = `admin_${activeTeacherId}`
  const thread = chatThreads[threadId] || { messages: [] }
  const messages = thread.messages

  // Auto-scroll to latest message
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, activeTeacherId])

  // Mark thread read when opened, switched, or new messages arrive
  useEffect(() => {
    markThreadRead(threadId, 'admin')
  }, [threadId, markThreadRead, messages.length])

  const handleSend = () => {
    if (!draft.trim()) return
    sendMessage(threadId, 'admin', 'Admin', draft)
    setDraft('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeTeacher = mockTeachers.find(t => t.id === activeTeacherId)

  const filteredTeachers = useMemo(() =>
    mockTeachers.filter(t =>
      !searchQ || t.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQ.toLowerCase())
    ), [searchQ])

  const selectTeacher = (tid) => {
    setActiveTeacherId(tid)
    setDraft('')
  }

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = []
    let currentDate = null
    messages.forEach(m => {
      const date = new Date(m.ts).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
      if (date !== currentDate) {
        groups.push({ type: 'date', label: date })
        currentDate = date
      }
      groups.push({ type: 'msg', ...m })
    })
    return groups
  }, [messages])

  return (
    <div>
      <div className="school-bg"></div>
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">Direct messaging with your teaching staff</p>
      </div>

      <div className="card" style={{ padding: 0, height: '620px', display: 'flex', overflow: 'hidden', borderRadius: '14px' }}>

        {/* ── Sidebar: Teacher List ── */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
          {/* Search */}
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div className="search-wrapper" style={{ display: 'flex' }}>
              <Search className="search-icon" size={15} />
              <input
                className="search-input"
                style={{ width: '100%' }}
                placeholder="Search teachers…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
              />
            </div>
          </div>

          {/* Teacher threads */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredTeachers.map(teacher => {
              const tid = `admin_${teacher.id}`
              const tThread = chatThreads[tid] || { messages: [] }
              const lastMsg = tThread.messages[tThread.messages.length - 1]
              const unread = getUnreadCount(tid, 'admin')
              const isActive = teacher.id === activeTeacherId
              return (
                <div
                  key={teacher.id}
                  onClick={() => selectTeacher(teacher.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.75rem 1rem', cursor: 'pointer',
                    background: isActive ? 'rgba(139,92,246,0.08)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: isActive ? '3px solid var(--accent-violet)' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div className="avatar" style={{ background: getAvatarColor(teacher.name), fontSize: '0.68rem', width: '38px', height: '38px' }}>
                      {getInitials(teacher.name)}
                    </div>
                    <div style={{
                      position: 'absolute', bottom: '1px', right: '1px',
                      width: '9px', height: '9px', borderRadius: '50%',
                      background: STATUS_COLORS[teacher.status] || '#94a3b8',
                      border: '2px solid var(--bg-card)',
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: unread ? 700 : 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {teacher.name}
                      </span>
                      {tThread.messages.length > 0 && (
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                          {formatThreadTime(tThread.messages)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lastMsg
                        ? <>{lastMsg.sender === 'admin' ? 'You: ' : ''}{lastMsg.text}</>
                        : <span style={{ fontStyle: 'italic' }}>No messages yet — say hello!</span>}
                    </div>
                  </div>
                  {unread > 0 && (
                    <div style={{ minWidth: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent-violet)', color: 'white', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {unread}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Main Chat Area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Chat header */}
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card)' }}>
            <div style={{ position: 'relative' }}>
              <div className="avatar" style={{ background: getAvatarColor(activeTeacher?.name || ''), fontSize: '0.7rem', width: '38px', height: '38px' }}>
                {getInitials(activeTeacher?.name || '')}
              </div>
              <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '9px', height: '9px', borderRadius: '50%', background: STATUS_COLORS[activeTeacher?.status] || '#94a3b8', border: '2px solid var(--bg-card)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{activeTeacher?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {activeTeacher?.subject} · {activeTeacher?.class}
                {activeTeacher?.status === 'on_leave' && <span style={{ color: 'var(--accent-amber)', marginLeft: '0.35rem' }}>• On Leave</span>}
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MessageSquare size={12} />
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-primary)' }}>
            {groupedMessages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.75rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={24} color="var(--accent-violet)" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No messages yet</div>
                  <div style={{ fontSize: '0.8rem' }}>Start the conversation with {activeTeacher?.name}</div>
                </div>
              </div>
            ) : (
              groupedMessages.map((item, i) => {
                if (item.type === 'date') {
                  return (
                    <div key={`date-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', padding: '0.2rem 0.625rem', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                        {item.label}
                      </span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>
                  )
                }
                const isMe = item.sender === 'admin'
                return (
                  <div key={item.id} className="message-container" style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: '0.5rem', alignItems: 'flex-end', position: 'relative' }}>
                    {!isMe && (
                      <div className="avatar" style={{ background: getAvatarColor(item.senderName), fontSize: '0.6rem', width: '26px', height: '26px', flexShrink: 0, marginBottom: '2px' }}>
                        {getInitials(item.senderName)}
                      </div>
                    )}
                    <div style={{ maxWidth: '68%', position: 'relative' }} className="message-bubble-wrapper">
                      {!isMe && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>{item.senderName}</div>
                      )}
                      <div style={{
                        padding: '0.625rem 0.9rem',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? 'var(--accent-violet)' : 'var(--bg-card)',
                        color: isMe ? 'white' : 'var(--text-primary)',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        boxShadow: 'var(--shadow-sm)',
                        border: isMe ? 'none' : '1px solid var(--border)',
                        wordBreak: 'break-word',
                        position: 'relative'
                      }}>
                        {item.text}
                        <div style={{ fontSize: '0.6rem', opacity: 0.7, marginTop: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
                          <span style={{ opacity: 0.6 }}>{item.time}</span>
                          {isMe && (() => {
                            const lastRead = thread[`lastReadBy_teacher`] || 0
                            const seen = lastRead > item.ts
                            return seen
                              ? <CheckCheck size={13} color="#34d399" title="Read" />
                              : <Check size={12} color="rgba(255,255,255,0.55)" title="Sent" />
                          })()}
                        </div>

                        {/* Delete button on hover via CSS class */}
                        <button 
                          onClick={() => { if(confirm('Delete this message?')) deleteMessage(threadId, item.id) }}
                          className="msg-delete-btn"
                          title="Delete message"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {isMe && (
                      <div className="avatar" style={{ background: 'var(--accent-violet)', fontSize: '0.6rem', width: '26px', height: '26px', flexShrink: 0, marginBottom: '2px' }}>
                        AD
                      </div>
                    )}
                  </div>
                )
              })
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.625rem', alignItems: 'flex-end', background: 'var(--bg-card)' }}>
            <textarea
              ref={inputRef}
              className="form-input"
              rows={1}
              style={{ flex: 1, margin: 0, resize: 'none', minHeight: '40px', maxHeight: '120px', overflowY: 'auto', lineHeight: 1.5, borderRadius: '12px', padding: '0.5rem 0.875rem' }}
              placeholder={`Message ${activeTeacher?.name}…`}
              value={draft}
              onChange={e => { setDraft(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
              onKeyDown={handleKeyDown}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={!draft.trim()}
              style={{ borderRadius: '12px', minWidth: '44px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              title="Send (Enter)"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
