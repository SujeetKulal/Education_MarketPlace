import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  BookOpen, LogOut, User, ShoppingBag, Home,
  PenTool, Shield, MessageSquare, GraduationCap, Menu, X
} from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { isAuthenticated, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const isHome = location.pathname === '/'

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { to: '/forums', label: 'Forums', icon: MessageSquare },
  ]

  const authLinks = isAuthenticated ? [
    { to: '/library', label: 'My Library', icon: BookOpen, roles: ['STUDENT'] },
    { to: '/author', label: 'Author Dashboard', icon: PenTool, roles: ['AUTHOR'] },
    { to: '/admin', label: 'Admin Panel', icon: Shield, roles: ['ADMIN'] },
  ].filter(link => !link.roles || link.roles.includes(profile?.role)) : []

  return (
    <nav style={{
      position: isHome ? 'absolute' : 'sticky',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: isHome ? 'transparent' : 'var(--bg-hero)',
      backdropFilter: isHome ? 'none' : 'blur(20px)',
      borderBottom: isHome ? 'none' : '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          color: 'white',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <GraduationCap size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>
            EduMarket
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: location.pathname === link.to ? 'white' : 'rgba(255,255,255,0.75)',
                background: location.pathname === link.to ? 'rgba(255,255,255,0.15)' : 'transparent',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
          {authLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: location.pathname === link.to ? 'white' : 'rgba(255,255,255,0.75)',
                background: location.pathname === link.to ? 'rgba(255,255,255,0.15)' : 'transparent',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated ? (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
              }}>
                <User size={16} style={{ color: 'white' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'white' }}>
                  {profile?.full_name || profile?.email || 'User'}
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {profile?.role}
                </span>
              </div>
              <button onClick={handleSignOut} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.2s',
              }} title="Sign Out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                padding: '8px 18px',
                borderRadius: 999,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}>Sign In</Link>
              <Link to="/marketplace" style={{
                padding: '8px 20px',
                borderRadius: 999,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'white',
                textDecoration: 'none',
                border: '2px solid rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
                background: 'rgba(255,255,255,0.1)',
              }}>Browse Materials</Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 6,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              color: 'white',
            }}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {[...navLinks, ...authLinks].map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
              }}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          #mobile-menu-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
