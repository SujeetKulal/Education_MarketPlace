export default function AuthPageLayout({ title, description, children }) {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--bg-secondary) 0%, #E6F0FF 100%)',
    }}>
      {/* Background circles */}
      <div style={{
        position: 'absolute',
        top: -120,
        left: -120,
        width: 360,
        height: 360,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91, 76, 255, 0.12) 0%, rgba(91, 76, 255, 0.04) 50%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91, 76, 255, 0.1) 0%, rgba(91, 76, 255, 0.03) 50%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Single card: branding + form */}
      <div
        className="animate-fade-in"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          width: '100%',
          maxWidth: 960,
          minHeight: 520,
          background: 'white',
          borderRadius: 24,
          boxShadow: '0 8px 48px rgba(91, 76, 255, 0.12)',
          border: '1px solid rgba(91, 76, 255, 0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Left panel — narrow */}
        <div style={{
          flex: '0 0 32%',
          maxWidth: 300,
          minWidth: 240,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 28px',
          background: 'linear-gradient(160deg, rgba(91, 76, 255, 0.08) 0%, rgba(238, 237, 255, 0.9) 100%)',
          borderRight: '1px solid rgba(91, 76, 255, 0.06)',
        }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 4px 16px rgba(91, 76, 255, 0.15)',
            }}>
              <span style={{ fontSize: '1.75rem' }}>🎓</span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              marginBottom: 12,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
            }}>
              {title}
            </h2>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              marginBottom: 32,
            }}>
              {description}
            </p>
            <img
              src="/assests/book_png.png"
              alt=""
              style={{
                width: '100%',
                maxWidth: 200,
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 40px',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 64px - 80px)',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
