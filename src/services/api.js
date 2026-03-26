import axios from 'axios'

// ================= BASE URL =================
// Auto switch between local & production
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api'
    : 'https://social-media-tu4w.onrender.com/api')

// ================= AXIOS INSTANCE =================
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API ERROR:", error.response?.data || error.message)

    if (error.response?.status === 401) {
      // Skip redirect for auth endpoints (login, signup, etc.) to avoid infinite loop
      const requestUrl = error.config?.url || ''
      const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup') || requestUrl.includes('/auth/verify')
      if (!isAuthRequest) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// ================= AUTH =================
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyResetOTP: (data) => api.post('/auth/verify-reset-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
}

// ================= USERS =================
export const userAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) =>
    api.put('/users/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  followUnfollow: (userId) => api.post(`/users/${userId}/follow`),
  getUserPosts: (username, params) =>
    api.get(`/users/${username}/posts`, { params }),
  searchUsers: (q) => api.get('/users/search', { params: { q } }),
  getSuggestions: () => api.get('/users/suggestions'),
  getFollowers: (username) =>
    api.get(`/users/${username}/followers`),
  getFollowing: (username) =>
    api.get(`/users/${username}/following`),
}

// ================= POSTS =================
export const postAPI = {
  createPost: (data) =>
    api.post('/posts', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getFeed: (params) => api.get('/posts/feed', { params }),
  explorePosts: (params) =>
    api.get('/posts/explore', { params }),
  getPost: (postId) => api.get(`/posts/${postId}`),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likeUnlike: (postId) => api.post(`/posts/${postId}/like`),
  addComment: (postId, data) =>
    api.post(`/posts/${postId}/comments`, data),
  deleteComment: (postId, commentId) =>
    api.delete(`/posts/${postId}/comments/${commentId}`),
  sharePost: (postId) => api.post(`/posts/${postId}/share`),
  getByHashtag: (tag, params) =>
    api.get(`/posts/hashtag/${tag}`, { params }),
}

// ================= NOTIFICATIONS =================
export const notificationAPI = {
  getNotifications: (params) =>
    api.get('/notifications', { params }),
  markAsRead: (data) =>
    api.put('/notifications/mark-read', data),
  deleteNotification: (id) =>
    api.delete(`/notifications/${id}`),
}

// ================= ADMIN =================
export const adminAPI = {
  login: (data) => api.post('/admin/login', data),
  createAdmin: (data) => api.post('/admin/create', data),
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: (params) =>
    api.get('/admin/users', { params }),
  banUser: (userId, data) =>
    api.put(`/admin/users/${userId}/ban`, data),
  deleteUser: (userId) =>
    api.delete(`/admin/users/${userId}`),
  getAllPosts: (params) =>
    api.get('/admin/posts', { params }),
  deletePost: (postId, data) =>
    api.delete(`/admin/posts/${postId}`, { data }),
}

// ================= AI =================
export const aiAPI = {
  suggestCaption: (data) =>
    api.post('/ai/suggest-caption', data),

  generateImageCaption: (data) =>
    api.post('/ai/image-caption', data),

  generateHashtags: (data) =>
    api.post('/ai/generate-hashtags', data),

  chat: (data) =>
    api.post('/ai/chat', data),

  improveContent: (data) =>
    api.post('/ai/improve-content', data),
}

export default api
