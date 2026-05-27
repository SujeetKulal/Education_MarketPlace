import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')

      // Import dynamically to avoid circular dependencies if any
      try {
        const { supabase } = await import('./supabase')
        await supabase.auth.signOut({ scope: 'local' })
      } catch (e) {
        console.error('Interceptor signout failed', e)
      }

      const path = window.location.pathname
      const isAuthScreen = path === '/login' || path === '/register'
      const requestUrl = String(error.config?.url || '')
      const isProfileBootstrapCall =
        requestUrl.includes('/auth/me/') || requestUrl.includes('/auth/setup/')

      // Avoid forcing redirect during registration/auth bootstrap flows.
      if (!isAuthScreen && !isProfileBootstrapCall) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
