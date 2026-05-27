import { Link } from 'react-router-dom'
import {
  Star, BookOpen, Video, ClipboardCheck, User, ArrowRight,
  ShoppingCart, Bookmark, BadgeCheck,
} from 'lucide-react'

const typeIcons = { PDF: BookOpen, VIDEO: Video, MCQ: ClipboardCheck }
const typeColors = {
  PDF: { color: '#FF6B6B', bg: '#FFE8E8' },
  VIDEO: { color: '#0052CC', bg: '#E6F0FF' },
  MCQ: { color: '#FFB84D', bg: '#FFF3DB' },
}

export default function MarketplaceListCard({ material, bookmarked, onToggleBookmark, variant = 'default' }) {
  const Icon = typeIcons[material.type] || BookOpen
  const colors = typeColors[material.type] || typeColors.PDF
  const isFree = material.price === 0 || material.price === '0.00'
  const isFeatured = variant === 'featured'
  const tags = Array.isArray(material.tags) ? material.tags : []
  const description = [
    material.university && `Curriculum-aligned resource from ${material.university}.`,
    material.course && `Covers ${material.course} topics with structured content.`,
  ].filter(Boolean).join(' ') || 'High-quality educational material from a verified author.'

  const priceLabel = isFree ? 'Free' : `₹${material.price}`

  return (
    <article className={`mp-list-card ${isFeatured ? 'mp-list-card--featured' : ''}`}>
      <Link to={`/material/${material.id}`} className="mp-list-card-thumb">
        {material.thumbnail_url ? (
          <img src={material.thumbnail_url} alt={material.title} />
        ) : (
          <div className="mp-list-card-thumb-fallback" style={{ background: colors.bg }}>
            <Icon size={isFeatured ? 48 : 40} style={{ color: colors.color }} />
          </div>
        )}
        <span className="mp-list-card-type">
          <Icon size={12} />
          {material.type}
        </span>
        <span className={`mp-list-card-price ${isFree ? 'mp-list-card-price--free' : ''}`}>
          {priceLabel}
        </span>
      </Link>

      <div className="mp-list-card-body">
        <div className="mp-list-card-top">
          <div className="mp-list-card-main">
            {isFeatured && material.category && (
              <span className="mp-list-card-category">{material.category}</span>
            )}
            <Link to={`/material/${material.id}`} className="mp-list-card-title">
              {material.title}
            </Link>
            <div className="mp-list-card-meta">
              <User size={14} />
              <span>
                {isFeatured ? 'Author: ' : 'Seller: '}
                <strong>{material.author_name || 'Unknown'}</strong>
              </span>
              {material.university && (
                <>
                  <span className="mp-list-card-meta-dot">·</span>
                  <span>{material.university}</span>
                </>
              )}
              <BadgeCheck size={14} className="mp-verified-icon" />
            </div>
            <div className="mp-list-card-stats">
              <Star size={14} fill="#FFB84D" color="#FFB84D" />
              <span className="mp-list-card-rating">{Number(material.average_rating).toFixed(1)}</span>
              <span className="mp-list-card-meta-muted">
                ({material.review_count || 0} reviews)
              </span>
              <span className="mp-list-card-meta-dot">·</span>
              <span>{material.total_sales || 0} sold</span>
            </div>
          </div>
          <div className="mp-list-card-aside">
            {isFeatured && (
              <span className={`mp-list-card-price-inline ${isFree ? 'mp-list-card-price-inline--free' : ''}`}>
                {priceLabel}
              </span>
            )}
            <button
              type="button"
              className={`mp-bookmark-btn ${bookmarked ? 'mp-bookmark-btn--active' : ''}`}
              onClick={() => onToggleBookmark(material.id)}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <Bookmark size={18} fill={bookmarked ? 'var(--primary)' : 'none'} />
            </button>
          </div>
        </div>

        <p className="mp-list-card-desc">{description}</p>

        <div className="mp-list-card-tags">
          {!isFeatured && material.category && (
            <span className="mp-tag mp-tag--course">{material.category}</span>
          )}
          {material.semester && (
            <span className="mp-tag mp-tag--sem">SEM {material.semester}</span>
          )}
          {material.course && (
            <span className="mp-tag mp-tag--lang">{material.course}</span>
          )}
          {tags.slice(0, 2).map((tag) => (
            <span key={tag} className="mp-tag mp-tag--lang">{tag}</span>
          ))}
        </div>

        <div className="mp-list-card-actions">
          <Link to={`/material/${material.id}`} className="mp-view-details">
            View Details <ArrowRight size={14} />
          </Link>
          <Link to={`/material/${material.id}`} className="btn btn-primary mp-add-cart">
            <ShoppingCart size={16} />
            Add to Cart
          </Link>
        </div>
      </div>
    </article>
  )
}
