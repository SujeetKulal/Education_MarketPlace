import { Link } from 'react-router-dom'
import { Star, BookOpen, Video, ClipboardCheck, User, ArrowRight } from 'lucide-react'

const typeIcons = {
  PDF: BookOpen,
  VIDEO: Video,
  MCQ: ClipboardCheck,
}

const typeColors = {
  PDF: { color: '#FF6B6B', bg: '#FFE8E8' },
  VIDEO: { color: '#0052CC', bg: '#E6F0FF' },
  MCQ: { color: '#FFB84D', bg: '#FFF3DB' },
}

export default function MaterialCard({ material }) {
  const Icon = typeIcons[material.type] || BookOpen
  const colors = typeColors[material.type] || typeColors.PDF

  return (
    <Link to={`/material/${material.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(91,76,255,0.12)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)'
        }}
      >
        {/* Thumbnail */}
        <div style={{
          height: 200,
          background: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {material.thumbnail_url ? (
            <img
              src={material.thumbnail_url}
              alt={material.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `${colors.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon size={40} style={{ color: colors.color }} />
            </div>
          )}

          {/* Type Badge */}
          <span style={{
            position: 'absolute', top: 12, right: 12,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 999,
            fontSize: '0.75rem', fontWeight: 600,
            background: 'white',
            color: colors.color,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <Icon size={12} />
            {material.type}
          </span>

          {/* Price */}
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            padding: '4px 14px', borderRadius: 999,
            fontWeight: 700, fontSize: '0.9rem',
            background: material.price === 0 || material.price === '0.00'
              ? '#E8FFE8' : 'var(--primary)',
            color: material.price === 0 || material.price === '0.00'
              ? '#22C55E' : 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            {material.price === 0 || material.price === '0.00' ? 'Free' : `₹${material.price}`}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 20px' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'var(--text-primary)',
            lineHeight: 1.4,
          }}>
            {material.title}
          </h3>

          {/* Author & University */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 10,
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}>
            <User size={13} />
            <span>{material.author_name || 'Unknown'}</span>
            {material.university && (
              <>
                <span>·</span>
                <span>{material.university}</span>
              </>
            )}
          </div>

          {/* Rating & Sales */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={14} fill="#FFB84D" color="#FFB84D" />
              <span style={{ fontWeight: 600 }}>
                {Number(material.average_rating).toFixed(1)}
              </span>
              {material.review_count > 0 && (
                <span>({material.review_count})</span>
              )}
            </div>
            <span>{material.total_sales || 0} sold</span>
          </div>

          {/* Tags */}
          {material.semester && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                Sem {material.semester}
              </span>
              {material.course && (
                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                  {material.course}
                </span>
              )}
            </div>
          )}

          {/* View Details link */}
          <div style={{
            color: 'var(--primary)',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}>
            View Details <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  )
}
