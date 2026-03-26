import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS': return { ...state, user: action.payload.user, token: action.payload.token, loading: false, isAuthenticated: true }
    case 'LOGOUT':        return { ...state, user: null, token: null, loading: false, isAuthenticated: false }
    case 'UPDATE_USER':   return { ...state, user: { ...state.user, ...action.payload } }
    case 'SET_LOADING':   return { ...state, loading: action.payload }
    default: return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: true,
    isAuthenticated: false,
  })

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) { dispatch({ type: 'SET_LOADING', payload: false }); return }
      try {
        const { data } = await authAPI.getMe()
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.data, token } })
      } catch {
        localStorage.removeItem('token')
        dispatch({ type: 'LOGOUT' })
      }
    }
    loadUser()
  }, [])

  const login = useCallback(async (credentials) => {
    try {
      const { data } = await authAPI.login(credentials)
      localStorage.setItem('token', data.data.token)
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.data })
      toast.success('Welcome back!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message, data: error.response?.data }
    }
  }, [])

  const loginWithToken = useCallback((userData, token) => {
    localStorage.setItem('token', token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userData, token } })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }, [])

  const updateUser = useCallback((userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithToken, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
