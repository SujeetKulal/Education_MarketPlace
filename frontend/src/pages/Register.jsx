import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthPageLayout from '../components/auth/AuthPageLayout'
import { Mail, Lock, User, GraduationCap, Building2, FileText, AlertCircle, CheckCircle } from 'lucide-react'

export default function Register() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [university, setUniversity] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')
  const { signUp, signIn, setupProfile, fetchProfile } = useAuth()
  const navigate = useNavigate()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const result = await signUp(email, password)

      const accessToken = result?.session?.access_token
      if (!accessToken) {
        try {
          await signIn(email, password)
        } catch {
          setInfo('Account created successfully. Please sign in to continue profile setup.')
          navigate('/login', { replace: true })
          return
        }
      }

      const profile = await fetchProfile()
      if (!profile) {
        setInfo('Account created. Please sign in to continue profile setup.')
        navigate('/login', { replace: true })
        return
      }

      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to create account.')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSetup = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const profile = await fetchProfile()
      if (!profile) {
        setInfo('Your session is not active. Please sign in to complete setup.')
        navigate('/login', { replace: true })
        return
      }

      await setupProfile({ full_name: fullName, role, university, bio })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to setup profile.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, label: 'Credentials' },
    { num: 2, label: 'Profile' },
  ]

  return (
    <AuthPageLayout
      title="Join EduMarket"
      description="Create an account to access premium study materials, connect with peers, and enhance your learning journey."
    >
      <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 32,
        }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: step >= s.num ? 'var(--primary)' : 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: step >= s.num ? 'white' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  margin: '0 auto 6px',
                }}>
                  {s.num}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: step >= s.num ? 600 : 400,
                  color: step >= s.num ? 'var(--primary)' : 'var(--text-muted)',
                }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 40,
                  height: 2,
                  background: step > s.num ? 'var(--primary)' : 'var(--bg-elevated)',
                  marginTop: 15,
                  flexShrink: 0,
                }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            marginBottom: 8,
            color: 'var(--text-primary)',
          }}>
            {step === 1 ? 'Create your account' : 'Your Profile'}
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
          }}>
            {step === 1 ? 'Step 1 of 2: Let\'s get your login details' : 'Step 2 of 2: Tell us about yourself'}
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
        {info && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: '12px',
            background: '#F0FDF4',
            border: '1px solid #DCFCE7',
            color: '#16A34A',
            fontSize: '0.9rem',
            marginBottom: 24,
          }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            {info}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSignUp}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
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
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
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
                  type="password"
                  className="form-input"
                  style={{
                    paddingLeft: '42px',
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                  }}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
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
              {loading ? 'Creating Account...' : 'Continue →'}
            </button>

            <p style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{
                color: 'var(--primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                Sign In
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleProfileSetup}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  className="form-input"
                  style={{
                    paddingLeft: '42px',
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                  }}
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ marginBottom: 12, display: 'block' }}>
                I am a...
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: 'STUDENT', label: 'Student', icon: GraduationCap },
                  { value: 'AUTHOR', label: 'Author', icon: FileText },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    style={{
                      flex: 1,
                      padding: 16,
                      borderRadius: '10px',
                      border: `2px solid ${role === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                      background: role === opt.value ? 'var(--primary-ultra-light)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                      fontSize: '0.95rem',
                    }}
                  >
                    <opt.icon
                      size={24}
                      style={{
                        margin: '0 auto 8px',
                        display: 'block',
                        color: role === opt.value ? 'var(--primary)' : 'var(--text-muted)',
                      }}
                    />
                    <div style={{ fontWeight: 600 }}>{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                University
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  className="form-input"
                  style={{
                    paddingLeft: '42px',
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.95rem',
                  }}
                  placeholder="Your university"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                Bio
              </label>
              <textarea
                className="form-textarea"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '0.95rem',
                  minHeight: '80px',
                  fontFamily: 'inherit',
                }}
                placeholder="About you..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {role === 'AUTHOR' && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                fontSize: '0.85rem',
                color: '#92400E',
                marginBottom: 20,
              }}>
                ⓘ Author accounts require admin verification.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              disabled={loading}
            >
              {loading ? 'Setting up...' : (
                <>
                  <CheckCircle size={18} />
                  Complete Setup
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </AuthPageLayout>
  )
}
