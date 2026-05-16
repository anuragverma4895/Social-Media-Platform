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
    <div className="min-h-screen flex bg-gray-50/50 relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-300/30 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-secondary-300/20 blur-[100px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-pink-300/20 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      {/* Sidebar - Floating Glass Pane */}
      <aside className="fixed left-4 top-4 bottom-4 w-64 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl flex flex-col z-40 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.15)] hover:bg-white/70 hover:-translate-y-1 transform preserve-3d">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-secondary-400 to-pink-400 opacity-80" />

        {/* Logo */}
        <div className="p-6 pb-2">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-secondary-500 tracking-tight drop-shadow-sm">SocialMERN</h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto scrollbar-hide">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-semibold transition-all duration-300 group relative overflow-hidden preserve-3d
              ${isActive
                ? 'bg-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] text-primary-600 border border-white'
                : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm'}`
            }>
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-r-full" />}
                  <div className="relative transform group-hover:translate-x-1 transition-transform duration-300">
                    <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {badge && (
                      (to === '/messages' && notifications.filter(n => n.type === 'chat').length > 0) ||
                      (to === '/notifications' && notifications.filter(n => n.type !== 'chat').length > 0)
                    ) && (
                      <span className={`absolute -top-1.5 -right-2 ${to === '/messages' ? 'min-w-[20px] h-[20px] px-1' : 'w-3.5 h-3.5'} bg-gradient-to-br from-red-400 to-red-600 border-2 border-white rounded-full flex items-center justify-center text-[11px] text-white font-bold shadow-md animate-bounce`}>
                        {to === '/messages' ? (notifications.filter(n => n.type === 'chat').length > 9 ? '9+' : notifications.filter(n => n.type === 'chat').length) : ''}
                      </span>
                    )}
                  </div>
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Profile Link */}
          <NavLink to={`/${user?.username}`} className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl mt-4 font-semibold transition-all duration-300 group relative overflow-hidden preserve-3d
            ${isActive
              ? 'bg-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] text-primary-600 border border-white'
              : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm'}`
          }>
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-r-full" />}
                <img
                  src={avatarSrc(user?.profilePicture, user?.username, 64)}
                  alt={user?.username}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-primary-300 group-hover:scale-110 group-hover:translate-x-1 transition-all duration-300 shadow-sm"
                  onError={(event) => useAvatarFallback(event, user?.username, 64)}
                />
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Profile</span>
              </>
            )}
          </NavLink>
        </nav>

        {/* User info + logout */}
        <div className="p-4 m-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-inner group">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={avatarSrc(user?.profilePicture, user?.username)}
              alt={user?.username}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-primary-100 shadow-sm group-hover:scale-105 transition-transform"
              onError={(event) => useAvatarFallback(event, user?.username)}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900 truncate tracking-tight">{user?.name || user?.username}</p>
              <p className="text-xs text-gray-500 truncate font-medium">@{user?.username}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-xl transition-all duration-300 hover:shadow-[0_8px_16px_-6px_rgba(239,68,68,0.5)] transform hover:-translate-y-0.5">
            <ArrowRightStartOnRectangleIcon className="w-5 h-5 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <main className="ml-72 flex-1 min-h-screen relative z-10 w-full">
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
