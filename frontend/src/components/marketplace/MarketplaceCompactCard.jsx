import { Link } from 'react-router-dom'
import { Star, BookOpen, Video, ClipboardCheck, ShoppingCart, Bookmark } from 'lucide-react'

const typeIcons = { PDF: BookOpen, VIDEO: Video, MCQ: ClipboardCheck }
const typeColors = {
  PDF: { color: '#FF6B6B', bg: '#FFE8E8' },
  VIDEO: { color: '#0052CC', bg: '#E6F0FF' },
  MCQ: { color: '#FFB84D', bg: '#FFF3DB' },
}

export default function MarketplaceCompactCard({ material, bookmarked, onToggleBookmark }) {
  const Icon = typeIcons[material.type] || BookOpen
  const colors = typeColors[material.type] || typeColors.PDF
  const isFree = material.price === 0 || material.price === '0.00'

  return (
    <article className="mp-compact-card">
      <Link to={`/material/${material.id}`} className="mp-compact-thumb">
        {material.thumbnail_url ? (
          <img src={material.thumbnail_url} alt="" />
        ) : (
          <div className="mp-compact-thumb-fallback" style={{ background: colors.bg }}>
            <Icon size={28} style={{ color: colors.color }} />
          </div>
        )}
        <span className="mp-compact-type">{material.type}</span>
        <span className={`mp-compact-price ${isFree ? 'mp-compact-price--free' : ''}`}>
          {isFree ? 'Free' : `₹${material.price}`}
        </span>
      </Link>

      <div className="mp-compact-body">
        <div className="mp-compact-head">
          <Link to={`/material/${material.id}`} className="mp-compact-title">
            {material.title}
          </Link>
          <button
            type="button"
            className={`mp-compact-bookmark ${bookmarked ? 'mp-compact-bookmark--active' : ''}`}
            onClick={() => onToggleBookmark(material.id)}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark size={14} fill={bookmarked ? 'var(--primary)' : 'none'} />
          </button>
        </div>

        <div className="mp-compact-meta">
          <Star size={12} fill="#FFB84D" color="#FFB84D" />
          <span>{Number(material.average_rating).toFixed(1)}</span>
          <span>· {material.total_sales || 0} sold</span>
        </div>

        {(material.category || material.course) && (
          <div className="mp-compact-tags">
            {material.category && <span className="mp-compact-tag">{material.category}</span>}
            {material.course && <span className="mp-compact-tag mp-compact-tag--muted">{material.course}</span>}
          </div>
        )}

        <Link to={`/material/${material.id}`} className="mp-compact-cart">
          <ShoppingCart size={14} />
          Add to Cart
        </Link>
      </div>
    </article>
  )
}
