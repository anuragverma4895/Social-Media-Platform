import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSocket } from '../../context/SocketContext.jsx'

const navItems = [
  { to: '/feed',          label: 'Home',          emoji: '🏠' },
  { to: '/explore',       label: 'Explore',       emoji: '🔭' },
  { to: '/create',        label: 'Create Post',   emoji: '➕' },
  { to: '/notifications', label: 'Notifications', emoji: '🔔', badge: true },
  { to: '/search',        label: 'Search',        emoji: '🔍' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { notifications } = useSocket()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold gradient-text">SocialMERN</h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3">
          {navItems.map(({ to, label, emoji, badge }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 font-medium transition-all duration-200
              ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }>
              <span className="text-xl">{emoji}</span>
              <span>{label}</span>
              {badge && notifications.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </NavLink>
          ))}

          {/* Profile */}
          <NavLink to={`/${user?.username}`} className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 font-medium transition-all duration-200
            ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
          }>
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=667eea&color=fff`}
              alt={user?.username}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>Profile</span>
          </NavLink>
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=667eea&color=fff`}
              alt={user?.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{user?.name || user?.username}</p>
              <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
