import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { PageLoader } from '@/components/common/PageLoader';
import GlobalError from '@/pages/GlobalError';

// ============================================================================
// Lazy-loaded pages — split per route for optimal bundle sizes
// ============================================================================

// Public
const LandingPage        = lazy(() => import('@/pages/Landing'));
const LoginPage          = lazy(() => import('@/pages/auth/Login'));
const RegisterPage       = lazy(() => import('@/pages/auth/Register'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPasswordPage  = lazy(() => import('@/pages/auth/ResetPassword'));
const VerifyEmailPage    = lazy(() => import('@/pages/auth/VerifyEmail'));
const VerifyEmailSent    = lazy(() => import('@/pages/auth/VerifyEmailSent'));

// Student
const DashboardRedirect = lazy(() => import('../pages/DashboardRedirect'));
const CourseBrowser = lazy(() => import('../pages/courses/CourseBrowser'));
const CourseDetails = lazy(() => import('../pages/courses/CourseDetails'));
const LessonViewer = lazy(() => import('../pages/courses/LessonViewer'));
const StudentDashboard   = lazy(() => import('@/pages/student/Dashboard'));
const StudentCourses     = lazy(() => import('@/pages/student/Courses'));
const StudentCourseViewer = lazy(() => import('@/pages/student/CourseViewer'));
const StudentCourseView  = lazy(() => import('@/pages/student/CourseView'));
const StudentQuizzes     = lazy(() => import('@/pages/student/Quizzes'));
const StudentQuizAttempt = lazy(() => import('@/pages/student/QuizAttempt'));
const StudentAssignments = lazy(() => import('@/pages/student/Assignments'));
const StudentLeaderboard = lazy(() => import('@/pages/student/Leaderboard'));
const StudentAchievements= lazy(() => import('@/pages/student/Achievements'));
const StudentProfile     = lazy(() => import('@/pages/student/Profile'));

// Teacher
const TeacherDashboard   = lazy(() => import('@/pages/teacher/Dashboard'));
const TeacherCourses     = lazy(() => import('@/pages/teacher/Courses'));
const TeacherCourseEdit  = lazy(() => import('@/pages/teacher/CourseEdit'));
const TeacherQuizBuilder = lazy(() => import('@/pages/teacher/QuizBuilder'));
const TeacherGrading     = lazy(() => import('@/pages/teacher/Grading'));
const TeacherAttendance  = lazy(() => import('@/pages/teacher/Attendance'));
const TeacherAnalytics   = lazy(() => import('@/pages/teacher/Analytics'));

// Admin
const AdminDashboard     = lazy(() => import('@/pages/admin/Dashboard'));
const AdminUsers         = lazy(() => import('@/pages/admin/Users'));
const AdminClasses       = lazy(() => import('@/pages/admin/Classes'));
const AdminSubjects      = lazy(() => import('@/pages/admin/Subjects'));
const AdminBadges        = lazy(() => import('@/pages/admin/Badges'));
const AdminSettings      = lazy(() => import('@/pages/admin/Settings'));
const AdminAuditLogs     = lazy(() => import('@/pages/admin/AuditLogs'));
const AdminReports       = lazy(() => import('@/pages/admin/Reports'));

// Error
const NotFoundPage       = lazy(() => import('@/pages/NotFound'));

// ============================================================================
// Router definition
// ============================================================================

const router = createBrowserRouter([
  {
    errorElement: <GlobalError />,
    children: [
      // Public
      { path: '/', element: <LandingPage /> },
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/register', element: <RegisterPage /> },
  { path: '/auth/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/auth/reset-password', element: <ResetPasswordPage /> },
  { path: '/auth/verify-email', element: <VerifyEmailPage /> },
  { path: '/auth/verify-email-sent', element: <VerifyEmailSent /> },

  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: '/courses',
    element: (
      <ProtectedRoute>
        <CourseBrowser />
      </ProtectedRoute>
    ),
  },
  {
    path: '/courses/:id',
    element: (
      <ProtectedRoute>
        <CourseDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: '/courses/:id/learn',
    element: (
      <ProtectedRoute>
        <LessonViewer />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute>
        <RoleRoute roles={['STUDENT']}>
          <StudentDashboard />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/courses',
    element: (
      <ProtectedRoute>
        <RoleRoute roles={['STUDENT']}>
          <StudentCourses />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/courses/:courseId',
    element: (
      <ProtectedRoute>
        <RoleRoute roles={['STUDENT']}>
          <StudentCourseViewer />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/courses/:courseId/view',
    element: (
      <ProtectedRoute>
        <RoleRoute roles={['STUDENT']}>
          <StudentCourseView />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/quizzes',
    element: (
      <ProtectedRoute>
        <RoleRoute roles={['STUDENT']}>
          <StudentQuizzes />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/quizzes/:courseId/:quizId/attempt',
    element: (
      <ProtectedRoute>
        <RoleRoute roles={['STUDENT']}>
          <StudentQuizAttempt />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/assignments',
    element: (
      <ProtectedRoute>
        <RoleRoute roles={['STUDENT']}>
          <StudentAssignments />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/leaderboard',
    element: (
      <ProtectedRoute>
        <RoleRoute roles={['STUDENT']}>
          <StudentLeaderboard />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/achievements',
    element: (
      <ProtectedRoute>
        <RoleRoute roles={['STUDENT']}>
          <StudentAchievements />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/profile',
    element: (
      <ProtectedRoute>
        <RoleRoute roles={['STUDENT']}>
          <StudentProfile />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },

  // Teacher routes
  { path: '/teacher',
    element: (<ProtectedRoute><RoleRoute roles={['TEACHER']}><TeacherDashboard /></RoleRoute></ProtectedRoute>) },
  { path: '/teacher/courses',
    element: (<ProtectedRoute><RoleRoute roles={['TEACHER']}><TeacherCourses /></RoleRoute></ProtectedRoute>) },
  { path: '/teacher/courses/:courseId/edit',
    element: (<ProtectedRoute><RoleRoute roles={['TEACHER']}><TeacherCourseEdit /></RoleRoute></ProtectedRoute>) },
  { path: '/teacher/courses/:courseId/quizzes/:quizId/builder',
    element: (<ProtectedRoute><RoleRoute roles={['TEACHER']}><TeacherQuizBuilder /></RoleRoute></ProtectedRoute>) },
  { path: '/teacher/grading',
    element: (<ProtectedRoute><RoleRoute roles={['TEACHER']}><TeacherGrading /></RoleRoute></ProtectedRoute>) },

  { path: '/teacher/analytics',
    element: (<ProtectedRoute><RoleRoute roles={['TEACHER']}><TeacherAnalytics /></RoleRoute></ProtectedRoute>) },

  // Admin routes
  { path: '/admin',
    element: (<ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminDashboard /></RoleRoute></ProtectedRoute>) },
  { path: '/admin/users',
    element: (<ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminUsers /></RoleRoute></ProtectedRoute>) },
  { path: '/admin/classes',
    element: (<ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminClasses /></RoleRoute></ProtectedRoute>) },
  { path: '/admin/subjects',
    element: (<ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminSubjects /></RoleRoute></ProtectedRoute>) },
  { path: '/admin/badges',
    element: (<ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminBadges /></RoleRoute></ProtectedRoute>) },
  { path: '/admin/settings',
    element: (<ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminSettings /></RoleRoute></ProtectedRoute>) },
  { path: '/admin/audit-logs',
    element: (<ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminAuditLogs /></RoleRoute></ProtectedRoute>) },
  { path: '/admin/reports',
    element: (<ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminReports /></RoleRoute></ProtectedRoute>) },

      // Fallback
      { path: '*', element: <NotFoundPage /> },
    ],
  }
]);

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
