// Mock data for ScholarFlow — used during frontend development
// Replace with Supabase queries once DB schema is set up

export const mockStudents = [
  { id: 's1', name: 'Kofi Mensah', studentId: 'SF-2024-001', class: 'JHS 3A', gender: 'Male', dob: '2009-04-12', nationality: 'Ghanaian', address: '12 Mango Street, Accra', allergies: 'Peanuts', chronicConditions: 'None', phone: '0244-111-222', status: 'active', guardianName: 'Ama Mensah', guardianEmail: 'ama.mensah@example.com', guardianPhone: '0244-333-444', enrollmentDate: '2022-09-01', feeBalance: 500 },
  { id: 's2', name: 'Abena Asante', studentId: 'SF-2024-002', class: 'JHS 2B', gender: 'Female', dob: '2010-08-25', nationality: 'Ghanaian', address: '45 Osu Badu, Accra', allergies: 'None', chronicConditions: 'Asthma', phone: '0244-222-333', status: 'active', guardianName: 'Kwame Asante', guardianEmail: 'kwame.asante@example.com', guardianPhone: '0244-444-555', enrollmentDate: '2023-01-15', feeBalance: 0 },
  { id: 's3', name: 'Yaw Ofori', studentId: 'SF-2024-003', class: 'JHS 1A', gender: 'Male', dob: '2011-01-30', nationality: 'Ghanaian', address: 'Plot 7, East Legon', allergies: 'Dust', chronicConditions: 'None', phone: '0244-333-444', status: 'active', guardianName: 'Akua Ofori', guardianEmail: 'akua.ofori@example.com', guardianPhone: '0244-555-666', enrollmentDate: '2024-01-10', feeBalance: 1200 },
  { id: 's4', name: 'Akosua Boateng', studentId: 'SF-2024-004', class: 'JHS 3B', gender: 'Female', dob: '2009-11-05', nationality: 'Ghanaian', address: '18 Ring Road, Accra', allergies: 'None', chronicConditions: 'None', phone: '0244-444-555', status: 'active', guardianName: 'Kojo Boateng', guardianEmail: 'kojo.boateng@example.com', guardianPhone: '0244-666-777', enrollmentDate: '2022-09-01', feeBalance: 0 },
  { id: 's5', name: 'Kweku Darko', studentId: 'SF-2024-005', class: 'JHS 2A', gender: 'Male', dob: '2010-05-18', nationality: 'Ghanaian', address: '22 Cantonments, Accra', allergies: 'Seafood', chronicConditions: 'None', phone: '0244-555-666', status: 'inactive', guardianName: 'Esi Darko', guardianEmail: 'esi.darko@example.com', guardianPhone: '0244-777-888', enrollmentDate: '2023-09-05', feeBalance: 800 },
  { id: 's6', name: 'Ama Quaye', studentId: 'SF-2024-006', class: 'JHS 1B', gender: 'Female', dob: '2011-07-22', nationality: 'Ghanaian', address: '5 Independence Ave, Accra', allergies: 'None', chronicConditions: 'None', phone: '0244-666-777', status: 'active', guardianName: 'Nana Quaye', guardianEmail: 'nana.quaye@example.com', guardianPhone: '0244-888-999', enrollmentDate: '2024-01-10', feeBalance: 0 },
  { id: 's7', name: 'Fiifi Acheampong', studentId: 'SF-2024-007', class: 'JHS 3A', gender: 'Male', dob: '2009-02-14', nationality: 'Ghanaian', address: '10 Spintex Road, Accra', allergies: 'None', chronicConditions: 'None', phone: '0244-777-888', status: 'active', guardianName: 'Adwoa Acheampong', guardianEmail: 'adwoa.acheampong@example.com', guardianPhone: '0244-999-000', enrollmentDate: '2022-09-01', feeBalance: 0 },
  { id: 's8', name: 'Efua Koomson', studentId: 'SF-2024-008', class: 'JHS 2B', gender: 'Female', dob: '2010-09-09', nationality: 'Ghanaian', address: '33 Labone, Accra', allergies: 'Dairy', chronicConditions: 'None', phone: '0244-888-999', status: 'active', guardianName: 'Kojo Koomson', guardianEmail: 'kojo.koomson@example.com', guardianPhone: '0244-100-200', enrollmentDate: '2023-01-15', feeBalance: 350 },
]

export const mockTeachers = [
  { id: 't1', name: 'Mr. Emmanuel Adjei', employeeId: 'TCH-001', email: 'e.adjei@sf.edu', phone: '0244-100-101', subject: 'Mathematics', class: 'JHS 3A', qualification: 'B.Ed Mathematics', status: 'active', joinDate: '2019-09-01' },
  { id: 't2', name: 'Mrs. Grace Amponsah', employeeId: 'TCH-002', email: 'g.amponsah@sf.edu', phone: '0244-100-102', subject: 'English Language', class: 'JHS 2B', qualification: 'B.Ed English', status: 'active', joinDate: '2020-01-10' },
  { id: 't3', name: 'Mr. Samuel Owusu', employeeId: 'TCH-003', email: 's.owusu@sf.edu', phone: '0244-100-103', subject: 'Science', class: 'JHS 1A', qualification: 'B.Sc Education', status: 'active', joinDate: '2021-09-01' },
  { id: 't4', name: 'Ms. Patricia Agyei', employeeId: 'TCH-004', email: 'p.agyei@sf.edu', phone: '0244-100-104', subject: 'Social Studies', class: 'JHS 3B', qualification: 'B.Ed Social Studies', status: 'active', joinDate: '2018-09-01' },
  { id: 't5', name: 'Mr. David Frimpong', employeeId: 'TCH-005', email: 'd.frimpong@sf.edu', phone: '0244-100-105', subject: 'ICT', class: 'JHS 2A', qualification: 'BSc Computer Science', status: 'on_leave', joinDate: '2022-01-15' },
]

export const mockClasses = [
  { id: 'c1', name: 'JHS 1A', level: 'JHS 1', section: 'A', classTeacher: 'Mr. Samuel Owusu', studentCount: 32, room: 'Room 101' },
  { id: 'c2', name: 'JHS 1B', level: 'JHS 1', section: 'B', classTeacher: 'Ms. Patricia Agyei', studentCount: 30, room: 'Room 102' },
  { id: 'c3', name: 'JHS 2A', level: 'JHS 2', section: 'A', classTeacher: 'Mr. David Frimpong', studentCount: 29, room: 'Room 201' },
  { id: 'c4', name: 'JHS 2B', level: 'JHS 2', section: 'B', classTeacher: 'Mrs. Grace Amponsah', studentCount: 31, room: 'Room 202' },
  { id: 'c5', name: 'JHS 3A', level: 'JHS 3', section: 'A', classTeacher: 'Mr. Emmanuel Adjei', studentCount: 28, room: 'Room 301' },
  { id: 'c6', name: 'JHS 3B', level: 'JHS 3', section: 'B', classTeacher: 'Ms. Patricia Agyei', studentCount: 27, room: 'Room 302' },
]

export const mockSubjects = [
  { id: 'sub1', name: 'Mathematics', code: 'MTH', classes: ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A', 'JHS 3B'], teacher: 'Mr. Emmanuel Adjei' },
  { id: 'sub2', name: 'English Language', code: 'ENG', classes: ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A', 'JHS 3B'], teacher: 'Mrs. Grace Amponsah' },
  { id: 'sub3', name: 'Integrated Science', code: 'SCI', classes: ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A', 'JHS 3B'], teacher: 'Mr. Samuel Owusu' },
  { id: 'sub4', name: 'Social Studies', code: 'SST', classes: ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A', 'JHS 3B'], teacher: 'Ms. Patricia Agyei' },
  { id: 'sub5', name: 'ICT', code: 'ICT', classes: ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A', 'JHS 3B'], teacher: 'Mr. David Frimpong' },
  { id: 'sub6', name: 'Religious & Moral Education', code: 'RME', classes: ['JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A', 'JHS 3B'], teacher: 'Mrs. Grace Amponsah' },
  { id: 'sub7', name: 'French', code: 'FRE', classes: ['JHS 2A', 'JHS 2B', 'JHS 3A', 'JHS 3B'], teacher: 'Mr. Emmanuel Adjei' },
]

export const mockAttendance = [
  { id: 'a1', studentId: 's1', studentName: 'Kofi Mensah', class: 'JHS 3A', date: '2024-05-03', status: 'present' },
  { id: 'a2', studentId: 's2', studentName: 'Abena Asante', class: 'JHS 2B', date: '2024-05-03', status: 'present' },
  { id: 'a3', studentId: 's3', studentName: 'Yaw Ofori', class: 'JHS 1A', date: '2024-05-03', status: 'absent' },
  { id: 'a4', studentId: 's4', studentName: 'Akosua Boateng', class: 'JHS 3B', date: '2024-05-03', status: 'present' },
  { id: 'a5', studentId: 's5', studentName: 'Kweku Darko', class: 'JHS 2A', date: '2024-05-03', status: 'late' },
]

export const mockFees = [
  { id: 'f1', studentId: 's1', studentName: 'Kofi Mensah', class: 'JHS 3A', term: 'Term 2', academicYear: '2023/2024', totalFee: 1500, amountPaid: 1000, balance: 500, dueDate: '2024-04-30', status: 'partial' },
  { id: 'f2', studentId: 's2', studentName: 'Abena Asante', class: 'JHS 2B', term: 'Term 2', academicYear: '2023/2024', totalFee: 1500, amountPaid: 1500, balance: 0, dueDate: '2024-04-30', status: 'paid' },
  { id: 'f3', studentId: 's3', studentName: 'Yaw Ofori', class: 'JHS 1A', term: 'Term 2', academicYear: '2023/2024', totalFee: 1200, amountPaid: 0, balance: 1200, dueDate: '2024-04-30', status: 'pending' },
  { id: 'f4', studentId: 's4', studentName: 'Akosua Boateng', class: 'JHS 3B', term: 'Term 2', academicYear: '2023/2024', totalFee: 1500, amountPaid: 1500, balance: 0, dueDate: '2024-04-30', status: 'paid' },
  { id: 'f5', studentId: 's5', studentName: 'Kweku Darko', class: 'JHS 2A', term: 'Term 2', academicYear: '2023/2024', totalFee: 1500, amountPaid: 700, balance: 800, dueDate: '2024-04-30', status: 'partial' },
  { id: 'f6', studentId: 's6', studentName: 'Ama Quaye', class: 'JHS 1B', term: 'Term 2', academicYear: '2023/2024', totalFee: 1200, amountPaid: 1200, balance: 0, dueDate: '2024-04-30', status: 'paid' },
  { id: 'f7', studentId: 's7', studentName: 'Fiifi Acheampong', class: 'JHS 3A', term: 'Term 2', academicYear: '2023/2024', totalFee: 1500, amountPaid: 1500, balance: 0, dueDate: '2024-04-30', status: 'paid' },
  { id: 'f8', studentId: 's8', studentName: 'Efua Koomson', class: 'JHS 2B', term: 'Term 2', academicYear: '2023/2024', totalFee: 1500, amountPaid: 1150, balance: 350, dueDate: '2024-04-30', status: 'partial' },
]

export const mockSBA = [
  { id: 'sba1', studentId: 's1', studentName: 'Kofi Mensah', class: 'JHS 3A', subject: 'Mathematics', term: 'Term 2', classEx1: 8, classEx2: 9, classEx3: 7, classTest: 8, project: 16 },
  { id: 'sba2', studentId: 's2', studentName: 'Abena Asante', class: 'JHS 2B', subject: 'Mathematics', term: 'Term 2', classEx1: 9, classEx2: 10, classEx3: 8, classTest: 9, project: 18 },
  { id: 'sba3', studentId: 's3', studentName: 'Yaw Ofori', class: 'JHS 1A', subject: 'Mathematics', term: 'Term 2', classEx1: 6, classEx2: 5, classEx3: 7, classTest: 6, project: 12 },
  { id: 'sba4', studentId: 's4', studentName: 'Akosua Boateng', class: 'JHS 3B', subject: 'Mathematics', term: 'Term 2', classEx1: 10, classEx2: 10, classEx3: 9, classTest: 10, project: 19 },
]

// Exam scores — entered from the Exams page, referenced by SBA page (read-only)
export const mockExamScores = [
  { id: 'es1', studentId: 's1', studentName: 'Kofi Mensah', class: 'JHS 3A', subject: 'Mathematics', term: 'Term 2', score: 72 },
  { id: 'es2', studentId: 's1', studentName: 'Kofi Mensah', class: 'JHS 3A', subject: 'English Language', term: 'Term 2', score: 65 },
  { id: 'es3', studentId: 's2', studentName: 'Abena Asante', class: 'JHS 2B', subject: 'Mathematics', term: 'Term 2', score: 85 },
  { id: 'es4', studentId: 's3', studentName: 'Yaw Ofori', class: 'JHS 1A', subject: 'Mathematics', term: 'Term 2', score: 55 },
  { id: 'es5', studentId: 's4', studentName: 'Akosua Boateng', class: 'JHS 3B', subject: 'Mathematics', term: 'Term 2', score: 90 },
  { id: 'es6', studentId: 's7', studentName: 'Fiifi Acheampong', class: 'JHS 3A', subject: 'Mathematics', term: 'Term 2', score: 68 },
  { id: 'es7', studentId: 's7', studentName: 'Fiifi Acheampong', class: 'JHS 3A', subject: 'English Language', term: 'Term 2', score: 74 },
  { id: 'es8', studentId: 's5', studentName: 'Kweku Darko', class: 'JHS 2A', subject: 'Mathematics', term: 'Term 2', score: 60 },
  { id: 'es9', studentId: 's6', studentName: 'Ama Quaye', class: 'JHS 1B', subject: 'Mathematics', term: 'Term 2', score: 78 },
  { id: 'es10', studentId: 's8', studentName: 'Efua Koomson', class: 'JHS 2B', subject: 'Mathematics', term: 'Term 2', score: 70 },
]

export const mockPayments = [
  { id: 'p1', receiptNo: 'RCP-20240503-001', studentId: 's1', studentName: 'Kofi Mensah', class: 'JHS 3A', amount: 500, term: 'Term 2', academicYear: '2023/2024', date: '2024-05-03', method: 'cash', recordedBy: 'Admin' },
  { id: 'p2', receiptNo: 'RCP-20240502-001', studentId: 's2', studentName: 'Abena Asante', class: 'JHS 2B', amount: 1500, term: 'Term 2', academicYear: '2023/2024', date: '2024-05-02', method: 'momo', recordedBy: 'Admin' },
  { id: 'p3', receiptNo: 'RCP-20240430-001', studentId: 's5', studentName: 'Kweku Darko', class: 'JHS 2A', amount: 700, term: 'Term 2', academicYear: '2023/2024', date: '2024-04-30', method: 'bank', recordedBy: 'Admin' },
]

export const mockAnalytics = {
  totalStudents: 177,
  activeStaff: 12,
  monthlyRevenue: 18500,
  attendanceRate: 94.2,
  revenueByMonth: [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 16500 },
    { month: 'May', revenue: 18500 },
    { month: 'Jun', revenue: 0 },
  ],
  attendanceByWeek: [
    { day: 'Mon', rate: 96 },
    { day: 'Tue', rate: 94 },
    { day: 'Wed', rate: 91 },
    { day: 'Thu', rate: 95 },
    { day: 'Fri', rate: 89 },
  ],
  studentsByClass: [
    { class: 'JHS 1A', count: 32 },
    { class: 'JHS 1B', count: 30 },
    { class: 'JHS 2A', count: 29 },
    { class: 'JHS 2B', count: 31 },
    { class: 'JHS 3A', count: 28 },
    { class: 'JHS 3B', count: 27 },
  ],
  feeStats: {
    totalExpected: 265500,
    totalCollected: 198750,
    outstanding: 66750,
    collectionRate: 74.9,
  },
}

export const TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
export const TIMETABLE_PERIODS = [
  { id: 'p1', label: '08:00 - 08:45', type: 'class' },
  { id: 'p2', label: '08:45 - 09:30', type: 'class' },
  { id: 'p3', label: '09:30 - 10:15', type: 'class' },
  { id: 'brk', label: '10:15 - 10:30', type: 'break', display: 'Break' },
  { id: 'p4', label: '10:30 - 11:15', type: 'class' },
  { id: 'p5', label: '11:15 - 12:00', type: 'class' },
  { id: 'p6', label: '12:00 - 12:45', type: 'class' },
  { id: 'lnch', label: '12:45 - 01:30', type: 'break', display: 'Lunch' },
  { id: 'p7', label: '01:30 - 02:15', type: 'class' },
  { id: 'p8', label: '02:15 - 03:00', type: 'class' },
]

// Helper: build a week of slots for a class given a rotation pattern
// pattern: array of { subject, teacherId } for 8 class periods (non-break)
function buildWeek(patterns) {
  // patterns = { Monday: [...8 slots], Tuesday: [...] ... }
  const week = {}
  TIMETABLE_DAYS.forEach(day => {
    week[day] = {}
    const dayPattern = patterns[day] || []
    let classIdx = 0
    TIMETABLE_PERIODS.forEach(period => {
      if (period.type === 'break') {
        week[day][period.id] = { type: 'break', display: period.display, subject: '', teacher: '', teacherId: '' }
      } else {
        const slot = dayPattern[classIdx] || { subject: 'Free Period', teacher: '', teacherId: '' }
        week[day][period.id] = { type: 'class', subject: slot.subject, teacher: slot.teacher, teacherId: slot.teacherId }
        classIdx++
      }
    })
  })
  return week
}

// Teacher references: t1=Mr. Emmanuel Adjei (Maths), t2=Mrs. Grace Amponsah (Eng/RME), t3=Mr. Samuel Owusu (Science),
// t4=Ms. Patricia Agyei (Social/RME), t5=Mr. David Frimpong (ICT)
export const mockTimetable = {
  'JHS 1A': buildWeek({
    Monday:    [{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'}],
    Tuesday:   [{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'}],
    Wednesday: [{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'}],
    Thursday:  [{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'}],
    Friday:    [{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Free Period',teacher:'',teacherId:''}],
  }),
  'JHS 1B': buildWeek({
    Monday:    [{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'}],
    Tuesday:   [{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'}],
    Wednesday: [{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'}],
    Thursday:  [{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'}],
    Friday:    [{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Free Period',teacher:'',teacherId:''}],
  }),
  'JHS 2A': buildWeek({
    Monday:    [{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'}],
    Tuesday:   [{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'}],
    Wednesday: [{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'}],
    Thursday:  [{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'}],
    Friday:    [{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Free Period',teacher:'',teacherId:''}],
  }),
  'JHS 2B': buildWeek({
    Monday:    [{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'}],
    Tuesday:   [{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'}],
    Wednesday: [{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'}],
    Thursday:  [{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'}],
    Friday:    [{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Free Period',teacher:'',teacherId:''}],
  }),
  'JHS 3A': buildWeek({
    Monday:    [{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'}],
    Tuesday:   [{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'}],
    Wednesday: [{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'}],
    Thursday:  [{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'}],
    Friday:    [{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Free Period',teacher:'',teacherId:''}],
  }),
  'JHS 3B': buildWeek({
    Monday:    [{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'}],
    Tuesday:   [{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'}],
    Wednesday: [{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'}],
    Thursday:  [{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'}],
    Friday:    [{subject:'Integrated Science',teacher:'Mr. Samuel Owusu',teacherId:'t3'},{subject:'English Language',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'Mathematics',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'Social Studies',teacher:'Ms. Patricia Agyei',teacherId:'t4'},{subject:'Religious & Moral Education',teacher:'Mrs. Grace Amponsah',teacherId:'t2'},{subject:'French',teacher:'Mr. Emmanuel Adjei',teacherId:'t1'},{subject:'ICT',teacher:'Mr. David Frimpong',teacherId:'t5'},{subject:'Free Period',teacher:'',teacherId:''}],
  }),
}
