import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const socketRef = useRef(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (isAuthenticated && user) {
      socketRef.current = io(SOCKET_URL, { transports: ['websocket'] })
      socketRef.current.emit('user_online', user._id)

      socketRef.current.on('new_notification', (notif) => {
        setNotifications((prev) => [notif, ...prev])
      })
      socketRef.current.on('initial_online_users', (users) => {
        setOnlineUsers(users)
      })
      socketRef.current.on('new_chat_notification', (data) => {
        // Only add to notifications if user is NOT on the chat page of this conversation
        if (!window.location.pathname.includes(data.conversationId)) {
          setNotifications((prev) => [{ ...data, type: 'chat' }, ...prev])
        }
      })

      socketRef.current.on('user_status_change', ({ userId, status }) => {
        setOnlineUsers((prev) =>
          status === 'online' ? [...new Set([...prev, userId])] : prev.filter(id => id !== userId)
        )
      })
      return () => socketRef.current?.disconnect()
    }
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      onlineUsers,
      notifications,
      clearNotifications: () => setNotifications([]),
      setNotifications,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}

export default SocketContext
