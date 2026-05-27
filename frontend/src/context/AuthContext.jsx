import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session on first load and restore auth state.
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.access_token) {
        setUser(session.user)
        localStorage.setItem('access_token', session.access_token)
        await fetchProfile(session.access_token)
      } else {
        setUser(null)
        setProfile(null)
        localStorage.removeItem('access_token')
      }
      setLoading(false)
    }
    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.access_token) {
          setUser(session.user)
          localStorage.setItem('access_token', session.access_token)
          await fetchProfile(session.access_token)
        } else {
          setUser(null)
          setProfile(null)
          localStorage.removeItem('access_token')
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(tokenOverride = null) {
    try {
      let token = tokenOverride
      if (!token) {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        token = session?.access_token || localStorage.getItem('access_token')
      }

      if (!token) {
        setProfile(null)
        return null
      }

      localStorage.setItem('access_token', token)
      const { data } = await api.get('/auth/me/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setProfile(data)
      return data
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setProfile(null)
      return null
    }
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const token = data?.session?.access_token
    if (!token) {
      throw new Error('Login succeeded but no session token was returned. Please verify your email and try again.')
    }

    localStorage.setItem('access_token', token)
    if (data?.user) setUser(data.user)

    const profileData = await fetchProfile(token)
    if (!profileData) {
      // Keep client state consistent if backend auth/profile bootstrap fails.
      await signOut()
      throw new Error('Authenticated with Supabase, but backend authentication failed. Please try again.')
    }

    return data
  }

  async function signOut() {
    try {
      // Local sign-out guarantees browser session is cleared even if remote revoke fails.
      await supabase.auth.signOut({ scope: 'local' })
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      // Defensive cleanup for stale browser sessions (seen in some Chrome profiles).
      try {
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith('sb-') ||
            key.includes('supabase') ||
            key.includes('auth-token')
          ) {
            localStorage.removeItem(key)
          }
        })
      } catch (err) {
        console.error('Local storage cleanup error:', err)
      }

      try {
        Object.keys(sessionStorage).forEach((key) => {
          if (
            key.startsWith('sb-') ||
            key.includes('supabase') ||
            key.includes('auth-token')
          ) {
            sessionStorage.removeItem(key)
          }
        })
      } catch (err) {
        console.error('Session storage cleanup error:', err)
      }

      setUser(null)
      setProfile(null)
      localStorage.removeItem('access_token')
    }
  }

  async function setupProfile(profileData) {
    try {
      const { data } = await api.post('/auth/setup/', profileData)
      setProfile(data)
      return data
    } catch (err) {
      throw err
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    setupProfile,
    fetchProfile,
    isAuthenticated: !!user,
    isStudent: profile?.role === 'STUDENT',
    isAuthor: profile?.role === 'AUTHOR',
    isAdmin: profile?.role === 'ADMIN',
    isVerifiedAuthor: profile?.role === 'AUTHOR' && profile?.is_verified,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
