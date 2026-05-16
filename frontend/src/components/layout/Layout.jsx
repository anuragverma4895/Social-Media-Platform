import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSocket } from '../../context/SocketContext.jsx'
import { avatarSrc, useAvatarFallback } from '../../utils/media.js'
import {
  HomeIcon, GlobeAltIcon, PlusCircleIcon, BellIcon,
  MagnifyingGlassIcon, ArrowRightStartOnRectangleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { to: '/feed',          label: 'Home',          icon: HomeIcon },
  { to: '/explore',       label: 'Explore',       icon: GlobeAltIcon },
  { to: '/messages',      label: 'Messages',      icon: ChatBubbleLeftRightIcon, badge: true },
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
              <div className="relative">
                <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                {badge && (
                  (to === '/messages' && notifications.filter(n => n.type === 'chat').length > 0) ||
                  (to === '/notifications' && notifications.filter(n => n.type !== 'chat').length > 0)
                ) && (
                  <span className={`absolute -top-1.5 -right-2 ${to === '/messages' ? 'min-w-[18px] h-[18px] px-1' : 'w-3.5 h-3.5'} bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pulse shadow-sm`}>
                    {to === '/messages' ? (notifications.filter(n => n.type === 'chat').length > 9 ? '9+' : notifications.filter(n => n.type === 'chat').length) : ''}
                  </span>
                )}
              </div>
              <span>{label}</span>
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
              src={avatarSrc(user?.profilePicture, user?.username, 64)}
              alt={user?.username}
              className="w-6 h-6 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all"
              onError={(event) => useAvatarFallback(event, user?.username, 64)}
            />
            <span>Profile</span>
          </NavLink>
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-gray-100/80">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={avatarSrc(user?.profilePicture, user?.username)}
              alt={user?.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100"
              onError={(event) => useAvatarFallback(event, user?.username)}
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
