/**
 * Plan Permissions & Feature Gating
 * 
 * This module defines what each subscription plan unlocks.
 * Any component can import `getPlanLimits` or use the `usePlan` hook
 * to check feature access for the current school.
 */

export const PLAN_DEFINITIONS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 'GHS 500',
    period: '/term',
    color: '#10b981',
    maxStudents: 200,
    maxTeachers: 10,
    features: [
      'students',
      'teachers',
      'academics',
      'attendance',
      'sba',
      'exams',
      'report_cards',
      'admissions',
      'settings',
    ],
    featureLabels: {
      students: 'Student Management (up to 200)',
      teachers: 'Teacher Management (up to 10)',
      academics: 'Academics',
      attendance: 'Attendance Tracking',
      sba: 'SBA Records',
      exams: 'Exam Results',
      report_cards: 'Report Cards',
      admissions: 'Admissions',
      settings: 'Settings',
    }
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 'GHS 1,200',
    period: '/term',
    color: '#8b5cf6',
    maxStudents: 500,
    maxTeachers: 30,
    features: [
      'students',
      'teachers',
      'academics',
      'attendance',
      'sba',
      'exams',
      'report_cards',
      'admissions',
      'payments',
      'fees',
      'messages',
      'notifications',
      'settings',
    ],
    featureLabels: {
      students: 'Student Management (up to 500)',
      teachers: 'Teacher Management (up to 30)',
      academics: 'Academics',
      attendance: 'Attendance Tracking',
      sba: 'SBA Records',
      exams: 'Exam Results',
      report_cards: 'Report Cards',
      admissions: 'Admissions',
      payments: 'Payment Tracking',
      fees: 'Fee Management',
      messages: 'Messaging',
      notifications: 'Notifications',
      settings: 'Settings',
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 'GHS 2,500',
    period: '/term',
    color: '#f97316',
    maxStudents: Infinity,
    maxTeachers: Infinity,
    features: [
      'students',
      'teachers',
      'academics',
      'attendance',
      'sba',
      'exams',
      'report_cards',
      'admissions',
      'payments',
      'fees',
      'timetable',
      'inventory',
      'payroll',
      'messages',
      'notifications',
      'settings',
    ],
    featureLabels: {
      students: 'Unlimited Students',
      teachers: 'Unlimited Teachers',
      academics: 'Academics',
      attendance: 'Attendance Tracking',
      sba: 'SBA Records',
      exams: 'Exam Results',
      report_cards: 'Report Cards',
      admissions: 'Admissions',
      payments: 'Payment Tracking',
      fees: 'Fee Management',
      timetable: 'Timetable & Scheduling',
      inventory: 'Inventory Management',
      payroll: 'Payroll Module',
      messages: 'Messaging',
      notifications: 'Notifications',
      settings: 'Settings',
    }
  }
}

/**
 * Get the plan limits/config for a given plan ID.
 * Falls back to 'basic' if plan is unknown.
 */
export function getPlanLimits(planId) {
  return PLAN_DEFINITIONS[planId] || PLAN_DEFINITIONS.basic
}

/**
 * Check if a specific feature is available on the given plan.
 * @param {string} planId - 'basic' | 'standard' | 'premium'
 * @param {string} featureKey - e.g. 'timetable', 'payroll', 'payments'
 * @returns {boolean}
 */
export function isFeatureAvailable(planId, featureKey) {
  const plan = getPlanLimits(planId)
  return plan.features.includes(featureKey)
}

/**
 * Get the minimum plan required for a feature.
 * Useful for showing "Upgrade to Standard" messages.
 */
export function getRequiredPlan(featureKey) {
  const order = ['basic', 'standard', 'premium']
  for (const planId of order) {
    if (PLAN_DEFINITIONS[planId].features.includes(featureKey)) {
      return PLAN_DEFINITIONS[planId]
    }
  }
  return PLAN_DEFINITIONS.premium
}

/**
 * Map sidebar nav item paths to feature keys for gating.
 */
export const ROUTE_FEATURE_MAP = {
  '/admin/students': 'students',
  '/admin/teachers': 'teachers',
  '/admin/academics': 'academics',
  '/admin/attendance': 'attendance',
  '/admin/sba': 'sba',
  '/admin/exams': 'exams',
  '/admin/report-cards': 'report_cards',
  '/admin/admissions': 'admissions',
  '/admin/payments': 'payments',
  '/admin/fees': 'fees',
  '/admin/timetable': 'timetable',
  '/admin/inventory': 'inventory',
  '/admin/payroll': 'payroll',
  '/admin/messages': 'messages',
  '/admin/notifications': 'notifications',
  '/admin/settings': 'settings',
}
