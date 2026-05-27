import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import {
  BookOpen, Video, ClipboardCheck, Play, Library,
  User, MessageSquare, Bookmark, ChevronRight,
  Mail, GraduationCap, Shield, Calendar, Star,
  ThumbsUp, Reply, ExternalLink, CheckCircle,
} from 'lucide-react'

const typeIcons = { PDF: BookOpen, VIDEO: Video, MCQ: ClipboardCheck }
const typeColors = {
  PDF: { color: '#FF6B6B', bg: '#FFE8E8' },
  VIDEO: { color: '#0052CC', bg: '#E6F0FF' },
  MCQ: { color: '#FFB84D', bg: '#FFF3DB' },
}

const SIDEBAR_TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'pdf', label: 'PDF E-books', icon: BookOpen },
  { id: 'video', label: 'Video Lessons', icon: Video },
  { id: 'mcq', label: 'MCQ Tests', icon: ClipboardCheck },
  { id: 'forums', label: 'My Forum Posts', icon: MessageSquare },
  { id: 'bookmarks', label: 'Bookmarked', icon: Bookmark },
]

export default function MyLibrary() {
  const [activeTab, setActiveTab] = useState('profile')
  const [enrollments, setEnrollments] = useState([])
  const [forumPosts, setForumPosts] = useState([])
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [forumsLoading, setForumsLoading] = useState(false)
  const [bookmarksLoading, setBookmarksLoading] = useState(false)
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewMaterial, setReviewMaterial] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const navigate = useNavigate()
  const { profile } = useAuth()

  useEffect(() => { fetchLibrary() }, [])

  useEffect(() => {
    if (activeTab === 'forums' && forumPosts.length === 0) fetchForumPosts()
    if (activeTab === 'bookmarks' && bookmarkedMaterials.length === 0) fetchBookmarks()
  }, [activeTab])

  const fetchLibrary = async () => {
    try {
      const { data } = await api.get('/commerce/library/')
      setEnrollments(data.results || data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchForumPosts = async () => {
    setForumsLoading(true)
    try {
      const { data } = await api.get('/forums/')
      const allPosts = data.results || data || []
      // Filter to only the current user's posts
      const myPosts = profile
        ? allPosts.filter(p => p.user?.id === profile.id)
        : allPosts
      setForumPosts(myPosts)
    } catch (err) { console.error(err) }
    finally { setForumsLoading(false) }
  }

  const fetchBookmarks = async () => {
    setBookmarksLoading(true)
    try {
      const bookmarkIds = JSON.parse(localStorage.getItem('mp_bookmarks') || '[]')
      if (bookmarkIds.length === 0) {
        setBookmarkedMaterials([])
        setBookmarksLoading(false)
        return
      }
      // Fetch all marketplace materials and filter to bookmarked ones
      const { data } = await api.get('/materials/')
      const all = data.results || data || []
      const bookmarkSet = new Set(bookmarkIds)
      setBookmarkedMaterials(all.filter(m => bookmarkSet.has(m.id)))
    } catch (err) { console.error(err) }
    finally { setBookmarksLoading(false) }
  }

  const handleAccess = async (enrollment) => {
    try {
      const { data } = await api.get(`/materials/${enrollment.material.id}/access/`)
      if (data.type === 'MCQ') navigate(`/quiz/${enrollment.material.id}`)
      else if (data.type === 'PDF') navigate(`/viewer/pdf/${enrollment.material.id}`)
      else if (data.type === 'VIDEO') navigate(`/viewer/video/${enrollment.material.id}`)
      else window.open(data.url, '_blank')
    } catch (err) { alert(err.response?.data?.error || 'Access failed') }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setReviewSubmitting(true)
    try {
      await api.post(`/materials/${reviewMaterial.id}/reviews/`, {
        rating: reviewRating,
        comment: reviewComment
      })
      setReviewSuccess(true)
      fetchLibrary() // Refresh to update average ratings if needed
      
      // Auto close after showing success animation
      setTimeout(() => {
        setReviewModalOpen(false)
        setReviewSuccess(false)
        setReviewComment('')
        setReviewRating(5)
      }, 2500)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review')
    } finally {
      setReviewSubmitting(false)
    }
  }

  // Filter enrollments by material type
  const filteredEnrollments = useMemo(() => {
    const typeMap = { pdf: 'PDF', video: 'VIDEO', mcq: 'MCQ' }
    const filterType = typeMap[activeTab]
    if (!filterType) return []
    return enrollments.filter(e => e.material?.type === filterType)
  }, [enrollments, activeTab])

  // Stats for sidebar badges
  const stats = useMemo(() => {
    const counts = { pdf: 0, video: 0, mcq: 0 }
    enrollments.forEach(e => {
      const t = e.material?.type?.toLowerCase()
      if (counts[t] !== undefined) counts[t]++
    })
    return counts
  }, [enrollments])

  const isContentTab = ['pdf', 'video', 'mcq'].includes(activeTab)

  const tabTitles = {
    profile: 'My Profile',
    pdf: 'PDF E-books',
    video: 'Video Lessons',
    mcq: 'MCQ Tests',
    forums: 'My Forum Posts',
    bookmarks: 'Bookmarked Materials',
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="lib-page animate-fade-in">
      {/* Sidebar */}
      <aside className="lib-sidebar">
        {/* User avatar & name */}
        <div className="lib-sidebar-profile">
          <div className="lib-sidebar-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} />
            ) : (
              <User size={28} />
            )}
          </div>
          <div className="lib-sidebar-info">
            <h3>{profile?.full_name || 'User'}</h3>
            <span className="lib-sidebar-role">
              {profile?.role === 'AUTHOR' ? '✍️ Author' : profile?.role === 'ADMIN' ? '🛡️ Admin' : '🎓 Student'}
            </span>
          </div>
        </div>

        <div className="lib-sidebar-divider" />

        {/* Navigation tabs */}
        <nav className="lib-sidebar-nav">
          {SIDEBAR_TABS.map(tab => {
            const Icon = tab.icon
            const count = stats[tab.id]
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                className={`lib-sidebar-tab ${isActive ? 'lib-sidebar-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="lib-sidebar-tab-left">
                  <div className={`lib-sidebar-tab-icon ${isActive ? 'lib-sidebar-tab-icon--active' : ''}`}>
                    <Icon size={18} />
                  </div>
                  <span>{tab.label}</span>
                </div>
                {count > 0 && (
                  <span className="lib-sidebar-badge">{count}</span>
                )}
                <ChevronRight size={14} className="lib-sidebar-chevron" />
              </button>
            )
          })}
        </nav>

        <div className="lib-sidebar-divider" />

        <button
          className="lib-sidebar-browse"
          onClick={() => navigate('/marketplace')}
        >
          <Library size={18} />
          Browse Marketplace
        </button>
      </aside>

      {/* Main Content */}
      <main className="lib-content">
        <div className="lib-content-header">
          <h1>{tabTitles[activeTab]}</h1>
          {isContentTab && (
            <span className="lib-content-count">
              {filteredEnrollments.length} item{filteredEnrollments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className="lib-profile-section">
            <div className="lib-profile-card">
              <div className="lib-profile-card-header">
                <div className="lib-profile-avatar-lg">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} />
                  ) : (
                    <User size={48} />
                  )}
                </div>
                <div>
                  <h2>{profile?.full_name || 'User'}</h2>
                  <div className="lib-profile-badges">
                    <span className={`lib-role-badge lib-role-badge--${(profile?.role || 'student').toLowerCase()}`}>
                      {profile?.role || 'STUDENT'}
                    </span>
                    {profile?.is_verified && (
                      <span className="lib-verified-badge">
                        <Shield size={12} /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="lib-profile-details">
                {profile?.email && (
                  <div className="lib-profile-detail">
                    <Mail size={16} />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile?.university && (
                  <div className="lib-profile-detail">
                    <GraduationCap size={16} />
                    <span>{profile.university}</span>
                  </div>
                )}
                {profile?.created_at && (
                  <div className="lib-profile-detail">
                    <Calendar size={16} />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              {profile?.bio && (
                <div className="lib-profile-bio">
                  <h4>About</h4>
                  <p>{profile.bio}</p>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="lib-profile-stats">
              <div className="lib-stat-card lib-stat-card--pdf">
                <BookOpen size={24} />
                <div>
                  <span className="lib-stat-value">{stats.pdf}</span>
                  <span className="lib-stat-label">PDF E-books</span>
                </div>
              </div>
              <div className="lib-stat-card lib-stat-card--video">
                <Video size={24} />
                <div>
                  <span className="lib-stat-value">{stats.video}</span>
                  <span className="lib-stat-label">Video Lessons</span>
                </div>
              </div>
              <div className="lib-stat-card lib-stat-card--mcq">
                <ClipboardCheck size={24} />
                <div>
                  <span className="lib-stat-value">{stats.mcq}</span>
                  <span className="lib-stat-label">MCQ Tests</span>
                </div>
              </div>
              <div className="lib-stat-card lib-stat-card--total">
                <Library size={24} />
                <div>
                  <span className="lib-stat-value">{enrollments.length}</span>
                  <span className="lib-stat-label">Total Items</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Material Tabs (PDF / Video / MCQ) ── */}
        {isContentTab && (
          <>
            {filteredEnrollments.length === 0 ? (
              <div className="lib-empty">
                <div className="lib-empty-icon">
                  {activeTab === 'pdf' && <BookOpen size={48} />}
                  {activeTab === 'video' && <Video size={48} />}
                  {activeTab === 'mcq' && <ClipboardCheck size={48} />}
                </div>
                <h3>No {tabTitles[activeTab]} yet</h3>
                <p>Purchase materials from the marketplace to see them here.</p>
                <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div className="lib-grid">
                {filteredEnrollments.map(enrollment => {
                  const m = enrollment.material
                  const Icon = typeIcons[m.type] || BookOpen
                  const colors = typeColors[m.type] || typeColors.PDF
                  return (
                    <div
                      key={enrollment.id}
                      className="lib-material-card"
                      onClick={() => handleAccess(enrollment)}
                    >
                      <div className="lib-material-thumb" style={{ background: colors.bg }}>
                        {m.thumbnail_url ? (
                          <img src={m.thumbnail_url} alt={m.title} />
                        ) : (
                          <Icon size={40} style={{ color: colors.color, opacity: 0.5 }} />
                        )}
                        <span className="lib-material-type-badge" style={{ background: colors.color }}>
                          <Icon size={10} color="white" /> {m.type}
                        </span>
                      </div>
                      <div className="lib-material-body">
                        <h3>{m.title}</h3>
                        <div className="lib-material-meta">
                          {m.author_name && (
                            <span className="lib-material-author">
                              <User size={12} /> {m.author_name}
                            </span>
                          )}
                          {m.average_rating > 0 && (
                            <span className="lib-material-rating">
                              <Star size={12} fill="#FFB84D" color="#FFB84D" /> {Number(m.average_rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="lib-material-footer">
                          <span className="lib-material-date">
                            Purchased {new Date(enrollment.purchase_date).toLocaleDateString()}
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setReviewMaterial(m)
                                setReviewModalOpen(true)
                              }}
                            >
                              <Star size={14} style={{ marginRight: 4, verticalAlign: -2 }} /> Review
                            </button>
                            <span className="lib-material-open">
                              <Play size={14} /> Open
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── Forum Posts Tab ── */}
        {activeTab === 'forums' && (
          <>
            {forumsLoading ? (
              <div className="lib-loading-inline"><div className="spinner" /></div>
            ) : forumPosts.length === 0 ? (
              <div className="lib-empty">
                <div className="lib-empty-icon"><MessageSquare size={48} /></div>
                <h3>No forum posts yet</h3>
                <p>Start a discussion in the community forum!</p>
                <button className="btn btn-primary" onClick={() => navigate('/forums')}>
                  Visit Forum
                </button>
              </div>
            ) : (
              <div className="lib-forum-list">
                {forumPosts.map(post => (
                  <div key={post.id} className="lib-forum-card">
                    <div className="lib-forum-card-header">
                      <div className="lib-forum-avatar">
                        <User size={16} />
                      </div>
                      <div className="lib-forum-card-info">
                        <span className="lib-forum-author">{post.user?.full_name || 'You'}</span>
                        <span className="lib-forum-date">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {post.title && <h3 className="lib-forum-title">{post.title}</h3>}
                    <p className="lib-forum-content">{post.content}</p>
                    <div className="lib-forum-stats">
                      <span><ThumbsUp size={14} /> {post.likes_count || 0} likes</span>
                      <span><Reply size={14} /> {post.reply_count || 0} replies</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Bookmarks Tab ── */}
        {activeTab === 'bookmarks' && (
          <>
            {bookmarksLoading ? (
              <div className="lib-loading-inline"><div className="spinner" /></div>
            ) : bookmarkedMaterials.length === 0 ? (
              <div className="lib-empty">
                <div className="lib-empty-icon"><Bookmark size={48} /></div>
                <h3>No bookmarks yet</h3>
                <p>Bookmark materials in the marketplace to save them here.</p>
                <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div className="lib-grid">
                {bookmarkedMaterials.map(m => {
                  const Icon = typeIcons[m.type] || BookOpen
                  const colors = typeColors[m.type] || typeColors.PDF
                  const isFree = m.price === 0 || m.price === '0.00'
                  return (
                    <Link
                      key={m.id}
                      to={`/material/${m.id}`}
                      className="lib-material-card lib-material-card--bookmark"
                    >
                      <div className="lib-material-thumb" style={{ background: colors.bg }}>
                        {m.thumbnail_url ? (
                          <img src={m.thumbnail_url} alt={m.title} />
                        ) : (
                          <Icon size={40} style={{ color: colors.color, opacity: 0.5 }} />
                        )}
                        <span className="lib-material-type-badge" style={{ background: colors.color }}>
                          <Icon size={10} color="white" /> {m.type}
                        </span>
                        <span className={`lib-bookmark-price ${isFree ? 'lib-bookmark-price--free' : ''}`}>
                          {isFree ? 'Free' : `₹${m.price}`}
                        </span>
                      </div>
                      <div className="lib-material-body">
                        <h3>{m.title}</h3>
                        <div className="lib-material-meta">
                          {m.author_name && (
                            <span className="lib-material-author">
                              <User size={12} /> {m.author_name}
                            </span>
                          )}
                          {m.average_rating > 0 && (
                            <span className="lib-material-rating">
                              <Star size={12} fill="#FFB84D" color="#FFB84D" /> {Number(m.average_rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="lib-material-footer">
                          <span className="lib-material-date">
                            {m.university || m.category || ''}
                          </span>
                          <span className="lib-material-open">
                            View <ExternalLink size={12} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Review Modal */}
      {reviewModalOpen && reviewMaterial && (
        <div className="modal-overlay" onClick={() => !reviewSuccess && setReviewModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, position: 'relative', overflow: 'hidden' }}>
            {reviewSuccess ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ 
                  width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', color: '#16a34a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                  boxShadow: '0 0 0 10px rgba(22, 163, 74, 0.1)', animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                  <CheckCircle size={40} />
                </div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: 8 }}>Thank You!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Your review for <strong>{reviewMaterial.title}</strong> has been published.
                </p>
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 4 }}>
                  {[...Array(reviewRating)].map((_, i) => (
                    <Star key={i} size={18} fill="#FFB84D" color="#FFB84D" style={{ animation: `scaleIn 0.3s ease ${i * 0.1}s both` }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>Write a Review</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  For <strong>{reviewMaterial.title}</strong>
                </p>
                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label>Rating</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={28}
                          onClick={() => setReviewRating(star)}
                          fill={star <= reviewRating ? '#FFB84D' : 'none'}
                          color={star <= reviewRating ? '#FFB84D' : '#cbd5e1'}
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="comment">Comment</label>
                    <textarea
                      id="comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="What did you like about this material?"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setReviewModalOpen(false)}
                      disabled={reviewSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={reviewSubmitting}
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
