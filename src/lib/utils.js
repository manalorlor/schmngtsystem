// Utility helpers for ScholarFlow

/**
 * Generate initials from a full name
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Validate password strength (min 8 chars, uppercase, lowercase, number, special char)
 */
export function validatePassword(password) {
  if (!password) return false
  const minLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  return minLength && hasUpper && hasLower && hasNumber && hasSpecial
}

/**
 * Generate a consistent avatar background color from a string
 */
const AVATAR_COLORS = [
  '#8b5cf6', '#f97316', '#6d28d9', '#ea580c',
  '#10b981', '#06b6d4', '#a78bfa', '#fb923c',
]

export function getAvatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format currency (GHS)
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Truncate long strings
 */
export function truncate(str, maxLen = 40) {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

/**
 * Check if a class uses JHS-level grading (numeric 1-9)
 */
export function isJHSClass(className = '') {
  return className.toUpperCase().startsWith('JHS')
}

/**
 * Calculate grade from score (percentage)
 * JHS 1-3: Numeric grades 1-9 (Grade 1 = highest)
 * Basic 6 and below: Alphabetic grades A-F
 */
export function getGrade(score, studentClass = '') {
  if (isJHSClass(studentClass)) {
    // JHS grading: 1-9, Grade 1 is best
    if (score >= 80) return { grade: '1', label: 'Outstanding', color: 'green' }
    if (score >= 70) return { grade: '2', label: 'Meritorious', color: 'green' }
    if (score >= 60) return { grade: '3', label: 'Substantial', color: 'blue' }
    if (score >= 50) return { grade: '4', label: 'Adequate', color: 'cyan' }
    if (score >= 40) return { grade: '5', label: 'Moderate', color: 'amber' }
    if (score >= 30) return { grade: '6', label: 'Elementary', color: 'amber' }
    if (score >= 20) return { grade: '7', label: 'Minimal', color: 'red' }
    if (score >= 10) return { grade: '8', label: 'Below Minimum', color: 'red' }
    return { grade: '9', label: 'Not Achieved', color: 'red' }
  }
  // Basic / Primary grading: A-F
  if (score >= 80) return { grade: 'A', label: 'Excellent', color: 'green' }
  if (score >= 70) return { grade: 'B', label: 'Very Good', color: 'blue' }
  if (score >= 60) return { grade: 'C', label: 'Good', color: 'cyan' }
  if (score >= 50) return { grade: 'D', label: 'Satisfactory', color: 'amber' }
  if (score >= 40) return { grade: 'E', label: 'Pass', color: 'amber' }
  return { grade: 'F', label: 'Fail', color: 'red' }
}

/**
 * Calculate SBA total score
 * Class Score = classEx1(10) + classEx2(10) + classEx3(10) + classTest(10) + project(20) = 60
 * 50% of Class Score + 50% of Exam Score = Total out of 100
 */
export function calculateSBA({ classEx1 = 0, classEx2 = 0, classEx3 = 0, classTest = 0, project = 0, examScore = 0 }) {
  const classTotal = classEx1 + classEx2 + classEx3 + classTest + project  // out of 60
  const class50 = (classTotal / 60) * 50   // 50% of class score
  const exam50 = (examScore / 100) * 50     // 50% of exam score
  const total = class50 + exam50             // out of 100
  return { classTotal, class50, exam50, total }
}

/**
 * Get ordinal suffix for position (e.g. 1st, 2nd, 3rd)
 */
export function getOrdinalSuffix(i) {
  const j = i % 10, k = i % 100
  if (j === 1 && k !== 11) return i + "st"
  if (j === 2 && k !== 12) return i + "nd"
  if (j === 3 && k !== 13) return i + "rd"
  return i + "th"
}

/**
 * Calculate the rank of a student in a specific subject
 */
export function getSubjectRank(studentId, className, subjectName, term, sbaRecords, examScores, studentsList) {
  const classmates = studentsList.filter(s => s.class === className)
  const scores = classmates.map(s => {
    const sba = sbaRecords.find(r => r.studentId === s.id && r.subject === subjectName && r.term === term)
    if (!sba) return null
    const examRec = examScores.find(e => e.studentId === s.id && e.subject === subjectName && e.term === term)
    const examScore = examRec ? examRec.score : 0
    const { total } = calculateSBA({ ...sba, examScore })
    return { id: s.id, total }
  }).filter(Boolean)
  
  if (scores.length === 0) return ''
  scores.sort((a, b) => b.total - a.total)
  
  const rankIndex = scores.findIndex(s => s.id === studentId)
  if (rankIndex === -1) return ''
  
  return getOrdinalSuffix(rankIndex + 1)
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
