import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { RequireAuth, RedirectByRole } from './routes/ProtectedRoute'

import LoginPage from './pages/auth/LoginPage'
import RegisterSchool from './pages/auth/RegisterSchool'
import DashboardLayout from './components/layout/DashboardLayout'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import StudentsPage from './pages/admin/StudentsPage'
import TeachersPage from './pages/admin/TeachersPage'
import AcademicsPage from './pages/admin/AcademicsPage'
import SBAPage from './pages/admin/SBAPage'
import FeesPage from './pages/admin/FeesPage'
import AdmissionsPage from './pages/admin/AdmissionsPage'
import ReportCardsPage from './pages/admin/ReportCardsPage'
import TimetablePage from './pages/admin/TimetablePageFull'
import PaymentsPage from './pages/admin/PaymentsPageFull'
import ExamsPage from './pages/admin/ExamsPageFull'
import AttendanceDisciplinePage from './pages/admin/AttendancePageFull'
import PayrollPage from './pages/admin/PayrollPageFull'
import MessagesPage from './pages/admin/MessagesPageFull'
import NotificationsPage from './pages/admin/NotificationsPageFull'
import InventoryPage from './pages/admin/InventoryPageFull'
import SettingsPage from './pages/admin/SettingsPageFull'

// Teacher pages
import {
  TeacherDashboard, AttendancePage,
  TeacherStudentsPage, TeacherTimetablePage, TeacherReportCardsPage,
  TeacherMessagesPage, TeacherPayslipsPage
} from './pages/teacher/TeacherPages'

// Student pages
import {
  StudentDashboard, StudentAttendancePage,
  StudentTimetablePage, StudentFeesPage, StudentReportCardPage
} from './pages/student/StudentPages'

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterSchool />} />

          {/* Root redirect */}
          <Route path="/" element={<RedirectByRole />} />

          {/* Admin routes */}
          <Route element={<RequireAuth allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              {/* Dashboard */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              
              {/* Student Administration */}
              <Route path="/admin/students" element={<StudentsPage />} />
              <Route path="/admin/admissions" element={<AdmissionsPage />} />
              
              {/* Academic Management */}
              <Route path="/admin/academics" element={<AcademicsPage />} />
              <Route path="/admin/sba" element={<SBAPage />} />
              <Route path="/admin/reports" element={<ReportCardsPage />} />
              <Route path="/admin/timetable" element={<TimetablePage />} />
              
              {/* Finance & Billing */}
              <Route path="/admin/fees" element={<FeesPage />} />
              <Route path="/admin/payments" element={<PaymentsPage />} />
              
              {/* Exams & Reports */}
              <Route path="/admin/exams" element={<ExamsPage />} />
              
              {/* Attendance & Discipline */}
              <Route path="/admin/attendance" element={<AttendanceDisciplinePage />} />
              
              {/* HR & Payroll */}
              <Route path="/admin/teachers" element={<TeachersPage />} />
              <Route path="/admin/payroll" element={<PayrollPage />} />
              
              {/* Communication */}
              <Route path="/admin/messages" element={<MessagesPage />} />
              <Route path="/admin/notifications" element={<NotificationsPage />} />
              
              {/* Inventory & Assets */}
              <Route path="/admin/inventory" element={<InventoryPage />} />
              
              {/* Settings & Security */}
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Teacher routes */}
          <Route element={<RequireAuth allowedRoles={['teacher']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/attendance" element={<AttendancePage />} />
              <Route path="/teacher/marks" element={<ExamsPage />} />
              <Route path="/teacher/sba" element={<SBAPage />} />
              <Route path="/teacher/reports" element={<TeacherReportCardsPage />} />
              <Route path="/teacher/students" element={<TeacherStudentsPage />} />
              <Route path="/teacher/timetable" element={<TeacherTimetablePage />} />
              <Route path="/teacher/messages" element={<TeacherMessagesPage />} />
              <Route path="/teacher/payslips" element={<TeacherPayslipsPage />} />
            </Route>
          </Route>

          {/* Student routes */}
          <Route element={<RequireAuth allowedRoles={['student']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/reports" element={<StudentReportCardPage />} />
              <Route path="/student/attendance" element={<StudentAttendancePage />} />
              <Route path="/student/timetable" element={<StudentTimetablePage />} />
              <Route path="/student/fees" element={<StudentFeesPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  )
}
