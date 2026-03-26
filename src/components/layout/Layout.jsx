import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSocket } from '../../context/SocketContext.jsx'
import {
  HomeIcon, GlobeAltIcon, PlusCircleIcon, BellIcon,
  MagnifyingGlassIcon, ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { to: '/feed',          label: 'Home',          icon: HomeIcon },
  { to: '/explore',       label: 'Explore',       icon: GlobeAltIcon },
  { to: '/create',        label: 'Create Post',   icon: PlusCircleIcon },
  { to: '/notifications', label: 'Notifications', icon: BellIcon, badge: true },
  { to: '/search',        label: 'Search',        icon: MagnifyingGlassIcon },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { notifications } = useSocket()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100/80 flex flex-col z-40 shadow-sm">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500" />

        {/* Logo */}
        <div className="p-6 border-b border-gray-100/80">
          <h1 className="text-2xl font-bold gradient-text">SocialMERN</h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-gradient-to-r from-primary-50 to-purple-50 text-primary-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }>
              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              <span>{label}</span>
              {badge && notifications.length > 0 && (
                <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm animate-pulse">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </NavLink>
          ))}

          {/* Profile */}
          <NavLink to={`/${user?.username}`} className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 font-medium transition-all duration-200 group
            ${isActive
              ? 'bg-gradient-to-r from-primary-50 to-purple-50 text-primary-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
          }>
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=667eea&color=fff`}
              alt={user?.username}
              className="w-6 h-6 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all"
            />
            <span>Profile</span>
          </NavLink>
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-gray-100/80">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=667eea&color=fff`}
              alt={user?.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{user?.name || user?.username}</p>
              <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 group">
            <ArrowRightStartOnRectangleIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            Logout
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
