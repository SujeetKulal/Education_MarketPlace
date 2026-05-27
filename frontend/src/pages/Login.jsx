import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthPageLayout from '../components/auth/AuthPageLayout'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageLayout
      title="Welcome Back to EduMarket"
      description="Continue your learning journey. Access premium study materials, connect with peers, and enhance your education."
    >
      <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            marginBottom: 8,
            color: 'var(--text-primary)',
          }}>
            Sign In
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
          }}>
            Welcome back! Please enter your details below.
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: '12px',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            color: '#DC2626',
            fontSize: '0.9rem',
            marginBottom: 24,
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="login-email" style={{ marginBottom: 8, display: 'block' }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }} />
              <input
                id="login-email"
                type="email"
                className="form-input"
                style={{
                  paddingLeft: '42px',
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '0.95rem',
                }}
                placeholder="hello@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" htmlFor="login-password" style={{ marginBottom: 8, display: 'block' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{
                  paddingLeft: '42px',
                  paddingRight: '42px',
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '0.95rem',
                }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: 24,
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <p style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </AuthPageLayout>
  )
}
