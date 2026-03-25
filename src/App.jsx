import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'

// Auth pages
import LoginPage         from './pages/auth/LoginPage.jsx'
import SignupPage        from './pages/auth/SignupPage.jsx'
import VerifyEmailPage   from './pages/auth/VerifyEmailPage.jsx'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx'

// User pages
import FeedPage          from './pages/user/FeedPage.jsx'
import ExplorePage       from './pages/user/ExplorePage.jsx'
import ProfilePage       from './pages/user/ProfilePage.jsx'
import PostDetailPage    from './pages/user/PostDetailPage.jsx'
import CreatePostPage    from './pages/user/CreatePostPage.jsx'
import NotificationsPage from './pages/user/NotificationsPage.jsx'
import SearchPage        from './pages/user/SearchPage.jsx'
import HashtagPage       from './pages/user/HashtagPage.jsx'
import SettingsPage      from './pages/user/SettingsPage.jsx'

// Admin pages
import AdminLoginPage     from './pages/admin/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import AdminUsersPage     from './pages/admin/AdminUsersPage.jsx'
import AdminPostsPage     from './pages/admin/AdminPostsPage.jsx'

// Layouts
import Layout      from './components/layout/Layout.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
  </div>
)

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Spinner />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/admin/login" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return !isAuthenticated ? children : <Navigate to="/feed" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup"          element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/verify-email"    element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Private user routes */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index                 element={<Navigate to="/feed" replace />} />
        <Route path="feed"           element={<FeedPage />} />
        <Route path="explore"        element={<ExplorePage />} />
        <Route path="create"         element={<CreatePostPage />} />
        <Route path="notifications"  element={<NotificationsPage />} />
        <Route path="search"         element={<SearchPage />} />
        <Route path="hashtag/:tag"   element={<HashtagPage />} />
        <Route path="settings"       element={<SettingsPage />} />
        <Route path="posts/:postId"  element={<PostDetailPage />} />
        <Route path=":username"      element={<ProfilePage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index              element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard"   element={<AdminDashboardPage />} />
        <Route path="users"       element={<AdminUsersPage />} />
        <Route path="posts"       element={<AdminPostsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '10px', background: '#333', color: '#fff' },
            }}
          />
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}
