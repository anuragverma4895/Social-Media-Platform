import axios from 'axios';

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const BACKEND_URL = trimTrailingSlash(import.meta.env.VITE_BACKEND_URL || '');
const API_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL ||
    (BACKEND_URL
      ? `${BACKEND_URL}/api`
      : import.meta.env.DEV
        ? 'http://localhost:5000/api'
        : '/api')
);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/messages/${conversationId}`),
  sendMessage: (recipientId, content) => {
    if (recipientId instanceof FormData) {
      return api.post('/chat/send', recipientId);
    }
    return api.post('/chat/send', { recipientId, content });
  },
  getOrCreateConversation: (userId) => api.get(`/chat/getOrCreate/${userId}`),
};
