import { Link } from 'react-router-dom'
import { GraduationCap, Mail } from 'lucide-react'
import { ScrollReveal, StaggerContainer, StaggerItem } from '../animations/ScrollReveal'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-footer)',
      padding: '60px 24px 32px',
      color: 'rgba(255,255,255,0.65)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <StaggerContainer stagger={0.1} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 40,
          marginBottom: 48,
        }}>
          {/* Brand */}
          <StaggerItem>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GraduationCap size={18} color="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>
                EduMarket
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              Your trusted platform for curriculum-aligned educational materials.
            </p>
          </StaggerItem>

          {/* Information */}
          <StaggerItem>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: '0.9rem' }}>Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/" style={linkStyle}>Home</Link>
              <Link to="/marketplace" style={linkStyle}>Marketplace</Link>
              <Link to="/forums" style={linkStyle}>Forums</Link>
              <Link to="/library" style={linkStyle}>My Library</Link>
            </div>
          </StaggerItem>

          {/* Categories */}
          <StaggerItem>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: '0.9rem' }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/marketplace?type=PDF" style={linkStyle}>PDF E-books</Link>
              <Link to="/marketplace?type=VIDEO" style={linkStyle}>Video Lessons</Link>
              <Link to="/marketplace?type=MCQ" style={linkStyle}>MCQ Tests</Link>
            </div>
          </StaggerItem>

          {/* Help */}
          <StaggerItem>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: '0.9rem' }}>Help</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/forums" style={linkStyle}>
                <Mail size={13} style={{ verticalAlign: -2, marginRight: 5 }} />
                Contact Support
              </Link>
              <Link to="/forums" style={linkStyle}>Help Center</Link>
              <Link to="/privacy" style={linkStyle}>Privacy Policy</Link>
              <Link to="/terms" style={linkStyle}>Terms of Service</Link>
            </div>
          </StaggerItem>
        </StaggerContainer>

        <ScrollReveal distance={10} duration={0.5}>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: '0.8rem',
          }}>
            <span>© {new Date().getFullYear()} EduMarket. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms of Service</Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}

const linkStyle = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.85rem',
  textDecoration: 'none',
  transition: 'color 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
}
