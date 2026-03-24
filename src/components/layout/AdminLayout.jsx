import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', emoji: '📊' },
  { to: '/admin/users',     label: 'Users',     emoji: '👥' },
  { to: '/admin/posts',     label: 'Posts',     emoji: '📸' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <aside className="fixed left-0 top-0 h-full w-60 bg-gray-800 flex flex-col z-40">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">SocialMERN</h1>
          <p className="text-xs text-gray-400 mt-1">🛡️ Admin Panel</p>
        </div>

        <nav className="flex-1 py-4 px-3">
          {adminNav.map(({ to, label, emoji }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 font-medium transition-all
              ${isActive ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`
            }>
              <span>{emoji}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-3">@{user?.username}</p>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
