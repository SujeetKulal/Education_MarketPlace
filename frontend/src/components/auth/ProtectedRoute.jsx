import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
