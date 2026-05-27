import { useState, useEffect, useMemo, useRef } from 'react'
import api from '../lib/api'
import MarketplaceCompactCard from '../components/marketplace/MarketplaceCompactCard'
import MarketplaceListCard from '../components/marketplace/MarketplaceListCard'
import Footer from '../components/layout/Footer'
import heroIllustration from '../../assests/hat.png'
import { MATERIAL_CATEGORIES, MARKETPLACE_SIDEBAR_VISIBLE_COUNT } from '../constants/categories'
import {
  Search, SlidersHorizontal, LayoutGrid, ChevronDown, X, ChevronLeft, ChevronRight,
  BookOpen, Users, Star, Shield, BadgeCheck, Zap, Lock,
  Briefcase, TrendingUp, Megaphone, UserCircle, Settings, Cpu, Lightbulb,
  Package, Wrench, FlaskConical, Palette, Globe, Scale, Stethoscope, Pill, MoreHorizontal,
  BarChart3,
} from 'lucide-react'

const DIFFICULTY_LEVELS = [
  { value: '', label: 'Levels' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Beginner to Intermediate', label: 'Beginner to Intermediate' },
  { value: 'All Levels', label: 'All Levels' },
]

const CATEGORY_ICONS = {
  Management: Briefcase,
  Finance: TrendingUp,
  Marketing: Megaphone,
  'Human Resources': UserCircle,
  Operations: Settings,
  'Information Technology': Cpu,
  Entrepreneurship: Lightbulb,
  Engineering: Wrench,
  Science: FlaskConical,
  Arts: Palette,
  'Social Sciences': Globe,
  Business: Briefcase,
  Law: Scale,
  Medicine: Stethoscope,
  Pharmacy: Pill,
  Other: MoreHorizontal,
}

const CATEGORIES = [
  { id: '', label: 'All Categories', icon: LayoutGrid },
  ...MATERIAL_CATEGORIES.map((c) => ({
    id: c.value,
    label: c.label,
    icon: CATEGORY_ICONS[c.value] || LayoutGrid,
  })),
]

const PILL_FILTERS = [
  { id: 'recommended', label: 'Recommended', sort: '-total_sales' },
  { id: 'trending', label: 'Trending', sort: '-total_sales' },
  { id: 'newest', label: 'Newest', sort: '-created_at' },
  { id: 'top_rated', label: 'Top Rated', sort: '-average_rating' },
  { id: 'free', label: 'Free Resources', sort: 'price', freeOnly: true },
]

const WHY_ITEMS = [
  {
    icon: Shield,
    title: 'Verified Content',
    text: 'All materials are reviewed for quality and curriculum alignment before listing.',
  },
  {
    icon: BadgeCheck,
    title: 'Trusted Authors',
    text: 'Learn from experienced educators and verified university authors.',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    text: 'Safe and secure transactions with instant enrollment confirmation.',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    text: 'Download instantly and learn at your own pace after purchase.',
  },
]

const FEATURED_COUNT = 3

const defaultFilters = {
  search: '',
  university: '',
  category: '',
  course: '',
  semester: '',
  type: '',
  level: '',
  sort: '-total_sales',
  freeOnly: false,
}

const ScrollableRow = ({ items, bookmarks, toggleBookmark }) => {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [items])

  const scroll = (dir) => {
    if (scrollRef.current) {
      const scrollAmount = 600
      scrollRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ position: 'relative' }} className="scrollable-row-container">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="mp-scroll-btn mp-scroll-btn-left"
          type="button"
          style={{
            position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, background: 'white', border: '1px solid #eee', borderRadius: '50%',
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <ChevronLeft size={24} />
        </button>
      )}
      
      <div 
        className="mp-row-scroll" 
        ref={scrollRef} 
        onScroll={checkScroll}
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          overflowX: 'auto',
          scrollBehavior: 'smooth'
        }}
      >
        {/* Inline style for webkit scrollbar hiding */}
        <style>{`.mp-row-scroll::-webkit-scrollbar { display: none; }`}</style>
        {items.map((material) => (
          <MarketplaceCompactCard
            key={material.id}
            material={material}
            bookmarked={bookmarks.has(material.id)}
            onToggleBookmark={toggleBookmark}
          />
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="mp-scroll-btn mp-scroll-btn-right"
          type="button"
          style={{
            position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, background: 'white', border: '1px solid #eee', borderRadius: '50%',
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  )
}

export default function Marketplace() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(defaultFilters)
  const [activePill, setActivePill] = useState('recommended')
  const [activeCategory, setActiveCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showLevelMenu, setShowLevelMenu] = useState(false)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('mp_bookmarks') || '[]'))
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    fetchMaterials()
  }, [filters])

  const fetchMaterials = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.university) params.append('university', filters.university)
      if (filters.category) params.append('category', filters.category)
      if (filters.course) params.append('course', filters.course)
      if (filters.semester) params.append('semester', filters.semester)
      if (filters.type) params.append('type', filters.type)
      if (filters.level) params.append('level', filters.level)
      if (filters.freeOnly) {
        params.append('min_price', '0')
        params.append('max_price', '0')
      }
      params.append('sort', filters.sort || '-created_at')
      params.append('page_size', '100')
      const { data } = await api.get(`/materials/?${params.toString()}`)
      setMaterials(data.results || data || [])
    } catch (err) {
      console.error('Failed to fetch materials:', err)
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }

  const heroStats = useMemo(() => {
    const count = materials.length
    const authors = new Set(materials.map((m) => m.author_name).filter(Boolean)).size
    const avg = count
      ? (materials.reduce((s, m) => s + Number(m.average_rating || 0) * (m.review_count || 0), 0) / Math.max(materials.reduce((s, m) => s + (m.review_count || 0), 0), 1)).toFixed(1)
      : '4.8'
    return {
      materials: count > 0 ? `${count}+` : '500+',
      authors: authors > 0 ? `${authors}+` : '50+',
      rating: avg,
    }
  }, [materials])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyPill = (pill) => {
    setActivePill(pill.id)
    setFilters((prev) => ({
      ...prev,
      sort: pill.sort,
      freeOnly: !!pill.freeOnly,
    }))
  }

  const applyCategory = (categoryId) => {
    setActiveCategory(categoryId)
    handleFilterChange('category', categoryId)
    const hiddenIds = CATEGORIES.slice(MARKETPLACE_SIDEBAR_VISIBLE_COUNT).map((c) => c.id)
    if (categoryId && hiddenIds.includes(categoryId)) {
      setCategoriesExpanded(true)
    }
  }

  const applyLevel = (levelValue) => {
    handleFilterChange('level', levelValue)
    setShowLevelMenu(false)
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
    setActivePill('recommended')
    setActiveCategory('')
    setShowFilters(false)
  }

  const hasActiveFilters =
    filters.university || filters.category || filters.course || filters.semester || filters.type || filters.level

  const toggleBookmark = (id) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('mp_bookmarks', JSON.stringify([...next]))
      return next
    })
  }

  const sectionTitle =
    activePill === 'recommended' ? 'Recommended for You'
      : activePill === 'trending' ? 'Trending Materials'
        : activePill === 'newest' ? 'Newest Additions'
          : activePill === 'top_rated' ? 'Top Rated'
            : activePill === 'free' ? 'Free Resources'
              : 'Materials'

  const activeLevelLabel =
    DIFFICULTY_LEVELS.find((l) => l.value === filters.level)?.label || 'All Levels'

  const primarySidebarCategories = CATEGORIES.slice(0, MARKETPLACE_SIDEBAR_VISIBLE_COUNT)
  const moreSidebarCategories = CATEGORIES.slice(MARKETPLACE_SIDEBAR_VISIBLE_COUNT)
  const hasMoreSidebarCategories = moreSidebarCategories.length > 0

  const renderCategoryButton = (cat) => (
    <button
      key={cat.id || 'all'}
      type="button"
      className={`mp-category-item ${activeCategory === cat.id ? 'mp-category-item--active' : ''}`}
      onClick={() => applyCategory(cat.id)}
    >
      <cat.icon size={16} />
      {cat.label}
    </button>
  )

  const featuredMaterials = materials.slice(0, FEATURED_COUNT)

  const materialsByType = useMemo(() => ({
    PDF: materials.filter((m) => m.type?.toUpperCase() === 'PDF'),
    VIDEO: materials.filter((m) => m.type?.toUpperCase() === 'VIDEO'),
    MCQ: materials.filter((m) => m.type?.toUpperCase() === 'MCQ'),
  }), [materials])

  const renderFeaturedStack = (items) => (
    <div className="mp-featured-stack">
      {items.map((material) => (
        <MarketplaceListCard
          key={material.id}
          material={material}
          variant="featured"
          bookmarked={bookmarks.has(material.id)}
          onToggleBookmark={toggleBookmark}
        />
      ))}
    </div>
  )

  return (
    <div className="mp-page">
      {/* Hero */}
      <section className="mp-hero">
        <div className="mp-hero-waves" />
        <div className="mp-hero-stars" />
        <div className="mp-hero-inner">
          <div>
            <h1>Learn. Grow. Succeed.</h1>
            <p className="mp-hero-sub">
              Discover curriculum-aligned materials from verified authors.
            </p>
            <div className="mp-hero-stats">
              <div className="mp-hero-stat">
                <div className="mp-hero-stat-icon"><BookOpen size={18} color="white" /></div>
                <span><strong>{heroStats.materials}</strong> Materials</span>
              </div>
              <div className="mp-hero-stat">
                <div className="mp-hero-stat-icon"><Users size={18} color="white" /></div>
                <span><strong>{heroStats.authors}</strong> Verified Authors</span>
              </div>
              <div className="mp-hero-stat">
                <div className="mp-hero-stat-icon"><Star size={18} color="white" /></div>
                <span><strong>{heroStats.rating}/5</strong> Average Rating</span>
              </div>
            </div>
          </div>
          <img
            src={heroIllustration}
            alt=""
            className="mp-hero-illustration"
          />
        </div>
      </section>

      {/* Search & filters */}
      <section className="mp-search-section">
        <div className="mp-search-card">
          <div className="mp-search-row">
            <div className="mp-search-input-wrap">
              <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search materials, topics, subjects..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="mp-search-btn"
                onClick={() => setShowLevelMenu(!showLevelMenu)}
              >
                <BarChart3 size={16} />
                {activeLevelLabel}
                <ChevronDown size={16} />
              </button>
              {showLevelMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  background: 'white',
                  borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid #eee',
                  padding: 8,
                  minWidth: 220,
                  zIndex: 20,
                }}>
                  {DIFFICULTY_LEVELS.map((lvl) => (
                    <button
                      key={lvl.value || 'all'}
                      type="button"
                      className={`mp-category-item ${filters.level === lvl.value ? 'mp-category-item--active' : ''}`}
                      onClick={() => applyLevel(lvl.value)}
                    >
                      <BarChart3 size={16} />
                      {lvl.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className={`mp-search-btn ${showFilters ? 'mp-search-btn--active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            {hasActiveFilters && (
               <button type="button" className="mp-search-btn" onClick={clearFilters}>
                <X size={16} />
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mp-filters-panel">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">University</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Any university"
                  value={filters.university}
                  onChange={(e) => handleFilterChange('university', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Course</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Any course"
                  value={filters.course}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Semester</label>
                <select
                  className="form-select"
                  value={filters.semester}
                  onChange={(e) => handleFilterChange('semester', e.target.value)}
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="PDF">PDF E-books</option>
                  <option value="VIDEO">Video Lessons</option>
                  <option value="MCQ">MCQ Tests</option>
                </select>
              </div>
            </div>
          )}

          <div className="mp-pills">
            {PILL_FILTERS.map((pill) => (
              <button
                key={pill.id}
                type="button"
                className={`mp-pill ${activePill === pill.id ? 'mp-pill--active' : ''}`}
                onClick={() => applyPill(pill)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Three-column main */}
      <div className="mp-main">
        <aside className="mp-sidebar-categories">
          <h3>Categories</h3>
          <nav className="mp-category-list">
            {primarySidebarCategories.map(renderCategoryButton)}
            {hasMoreSidebarCategories && (
              <div className={`mp-category-more ${categoriesExpanded ? 'mp-category-more--open' : ''}`}>
                {moreSidebarCategories.map(renderCategoryButton)}
              </div>
            )}
          </nav>
          {hasMoreSidebarCategories && (
            <button
              type="button"
              className="mp-view-all"
              onClick={() => setCategoriesExpanded((open) => !open)}
              aria-expanded={categoriesExpanded}
            >
              {categoriesExpanded ? 'Show Less ↑' : 'View All Categories →'}
            </button>
          )}
        </aside>

        <main className="mp-content">
          <h2>{sectionTitle}</h2>

          {loading ? (
            <div className="mp-featured-stack">
              {[...Array(FEATURED_COUNT)].map((_, i) => (
                <div key={i} className="mp-featured-skeleton skeleton" />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="empty-state" style={{ background: 'white', borderRadius: 16, padding: 48 }}>
              <Package size={64} />
              <h3>No materials found</h3>
              <p>Try adjusting your filters or search query.</p>
            </div>
          ) : (
            renderFeaturedStack(featuredMaterials)
          )}
        </main>

        <aside className="mp-sidebar-why">
          <h3>Why Choose Our Marketplace?</h3>
          {WHY_ITEMS.map((item) => (
            <div key={item.title} className="mp-why-item">
              <div className="mp-why-icon">
                <item.icon size={20} />
              </div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </aside>
      </div>

      {/* Specific Material Types — below categories, before Explore */}
      {!loading && materialsByType.PDF.length > 0 && (
        <section className="mp-more-section">
          <h2>PDF E-books</h2>
          <ScrollableRow items={materialsByType.PDF} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
        </section>
      )}

      {!loading && materialsByType.VIDEO.length > 0 && (
        <section className="mp-more-section">
          <h2>Video Lessons</h2>
          <ScrollableRow items={materialsByType.VIDEO} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
        </section>
      )}

      {!loading && materialsByType.MCQ.length > 0 && (
        <section className="mp-more-section">
          <h2>MCQ Tests</h2>
          <ScrollableRow items={materialsByType.MCQ} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
        </section>
      )}

      {/* Explore by category */}
      <section className="mp-explore">
        <h2>Explore by Category</h2>
        <div className="mp-explore-grid">
          {CATEGORIES.filter((c) => c.id).map((cat) => (
            <button
              key={cat.id}
              type="button"
              className="mp-explore-card"
              onClick={() => {
                applyCategory(cat.id)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <div className="mp-explore-icon">
                <cat.icon size={24} />
              </div>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
