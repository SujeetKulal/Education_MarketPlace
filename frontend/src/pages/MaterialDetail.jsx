import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import '../styles/MaterialDetail.css'
import CheckoutModal from '../components/CheckoutModal'
import {
  BookOpen, Video, ClipboardCheck, Star, User, Tag, ShoppingCart, Play,
  CheckCircle, ArrowLeft, Building2, GraduationCap, FileText, Layers,
  Globe, HardDrive, Shield, Lightbulb, Target, RefreshCw, BadgeCheck,
} from 'lucide-react'

const TABS = ['Overview', 'Reviews']

const FEATURES = [
  { icon: Lightbulb, title: 'Practical Examples', desc: 'Real-world case studies and hands-on exercises.' },
  { icon: BookOpen, title: 'Easy to Understand', desc: 'Simple language with clear explanations.' },
  { icon: Target, title: 'Exam Focused', desc: 'Important concepts aligned with university exams.' },
  { icon: RefreshCw, title: 'Updated Content', desc: 'Covers the latest syllabus and tools.' },
]

const TYPE_BADGE = {
  PDF: { className: 'pdf', icon: BookOpen },
  VIDEO: { className: 'video', icon: Video },
  MCQ: { className: 'mcq', icon: ClipboardCheck },
}

function buildDisplayTags(material) {
  const seen = new Set()
  const tags = []
  const add = (label) => {
    const key = String(label).toLowerCase()
    if (label && !seen.has(key)) {
      seen.add(key)
      tags.push(label)
    }
  }
  if (material.semester) add(`Sem ${material.semester}`)
  if (material.course) add(material.course)
  if (material.category) add(material.category)
    ; (material.tags || []).forEach(add)
  return tags
}

export default function MaterialDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, profile } = useAuth()
  const [material, setMaterial] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')

  // Checkout & payment state
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    fetchMaterial()
    if (isAuthenticated) checkEnrollment()
  }, [id, isAuthenticated])

  const fetchMaterial = async () => {
    try {
      const { data } = await api.get(`/materials/${id}/`)
      setMaterial(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollment = async () => {
    try {
      const { data } = await api.get(`/commerce/check/${id}/`)
      setEnrolled(data.enrolled)
    } catch { /* not enrolled */ }
  }

  // Open checkout modal (or redirect to login if not authenticated)
  const openCheckout = () => {
    if (!isAuthenticated) return navigate('/login')
    setCheckoutOpen(true)
  }

  // Called when user clicks Pay in CheckoutModal
  const handleCheckoutConfirm = async () => {
    const isFree = parseFloat(material.price) === 0
    if (isFree) {
      // Free materials: direct enroll
      setPurchasing(true)
      try {
        await api.post('/commerce/purchase/', { material_id: id })
        setCheckoutOpen(false)
        setPaymentSuccess(true)
        setTimeout(() => {
          setPaymentSuccess(false)
          setEnrolled(true)
        }, 2200)
      } catch (err) {
        alert(err.response?.data?.error || 'Enroll failed')
      } finally {
        setPurchasing(false)
      }
    } else {
      // Paid materials: Razorpay flow
      setPurchasing(true)
      try {
        const { data: order } = await api.post('/commerce/create-order/', { material_id: id })

        // Dynamically load Razorpay JS
        await loadRazorpayScript()

        const options = {
          key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'EduMarket',
          description: order.material_title,
          order_id: order.order_id,
          prefill: {
            name: profile?.full_name || '',
            email: profile?.email || '',
          },
          theme: { color: '#0052CC' },
          handler: async (response) => {
            // Payment captured — verify on backend
            try {
              await api.post('/commerce/verify-payment/', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                material_id: id,
              })
              setCheckoutOpen(false)
              setPaymentSuccess(true)
              setTimeout(() => {
                setPaymentSuccess(false)
                setEnrolled(true)
              }, 2200)
            } catch (err) {
              alert(err.response?.data?.error || 'Payment verification failed')
            }
          },
          modal: {
            ondismiss: () => setPurchasing(false),
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (resp) => {
          alert(`Payment failed: ${resp.error.description}`)
          setPurchasing(false)
        })
        rzp.open()
        setCheckoutOpen(false)
      } catch (err) {
        alert(err.response?.data?.error || 'Could not initiate payment')
        setPurchasing(false)
      }
    }
  }

  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve()
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = resolve
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
      document.body.appendChild(script)
    })

  const handleAccess = async () => {
    try {
      const { data } = await api.get(`/materials/${id}/access/`)
      if (data.type === 'MCQ') navigate(`/quiz/${id}`)
      else if (data.type === 'PDF') navigate(`/viewer/pdf/${id}`)
      else if (data.type === 'VIDEO') navigate(`/viewer/video/${id}`)
      else window.open(data.url, '_blank')
    } catch (err) {
      alert(err.response?.data?.error || 'Access failed')
    }
  }

  if (loading) {
    return (
      <div className="loading-screen" style={{ background: 'var(--bg-secondary)' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    )
  }

  if (!material) {
    return <div className="page-container"><p>Material not found.</p></div>
  }

  const typeInfo = TYPE_BADGE[material.type] || TYPE_BADGE.PDF
  const TypeIcon = typeInfo.icon
  const displayTags = buildDisplayTags(material)
  const authorStats = material.author_stats || {}
  const author = material.author || {}
  const authorInitial = (author.full_name || 'A').charAt(0).toUpperCase()
  const levelLabel = material.level
    ? (material.level.includes('Level') ? material.level : `${material.level} Level`)
    : null

  const publishedDate = new Date(material.created_at).toLocaleDateString('en-GB')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <>
            <h3>About this Material</h3>
            <p>
              {material.about_material ||
                material.description ||
                'No detailed description provided.'}
            </p>
            <div className="material-detail-features">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="material-detail-feature">
                  <div className="material-detail-feature-icon">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )

      case 'Reviews':
        return (
          <>
            <h3>Reviews ({material.review_count || 0})</h3>
            {material.reviews?.length > 0 ? (
              material.reviews.map((review) => (
                <div key={review.id} className="material-detail-review">
                  <div className="material-detail-review-header">
                    <span style={{ fontWeight: 600 }}>{review.user?.full_name}</span>
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < review.rating ? '#FFB84D' : 'none'}
                          color="#FFB84D"
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {review.comment || 'No comment.'}
                  </p>
                </div>
              ))
            ) : (
              <p className="material-detail-empty">No reviews yet. Be the first to review after enrolling.</p>
            )}
          </>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="material-detail-page">
        <div className="material-detail-back">
          <button type="button" onClick={() => navigate('/marketplace')}>
            <ArrowLeft size={16} /> Back to Marketplace
          </button>
        </div>

        <div className="material-detail-layout">
          <div className="material-detail-main">
            <div className="material-detail-hero">
              <div className="material-detail-cover">
                {material.thumbnail_url ? (
                  <img src={material.thumbnail_url} alt={material.title} />
                ) : (
                  <div className="material-detail-cover-placeholder">
                    <TypeIcon size={64} />
                  </div>
                )}
              </div>

              <div>
                <div className="material-detail-badges">
                  <span className={`material-detail-badge ${typeInfo.className}`}>
                    <TypeIcon size={12} /> {material.type}
                  </span>
                  {material.is_approved && (
                    <span className="material-detail-badge approved">
                      <CheckCircle size={10} /> Approved
                    </span>
                  )}
                </div>

                <h1 className="material-detail-title">{material.title}</h1>

                <div className="material-detail-meta">
                  <span>
                    <User size={15} />
                    {author.full_name || 'Unknown'}
                  </span>
                  {material.university && (
                    <span>
                      <Building2 size={15} />
                      {material.university}
                    </span>
                  )}
                  {material.semester && (
                    <span>
                      <GraduationCap size={15} />
                      Sem {material.semester}
                    </span>
                  )}
                  <span>
                    <Star size={14} fill="#FFB84D" color="#FFB84D" />
                    {Number(material.average_rating).toFixed(1)} ({material.review_count} reviews)
                  </span>
                  <span>
                    <Tag size={14} />
                    {material.total_sales} sold
                  </span>
                </div>

                {material.description && (
                  <p className="material-detail-summary">{material.description}</p>
                )}

                <div className="material-detail-stats">
                  {material.page_count != null && (
                    <div className="material-detail-stat-box">
                      <strong>{material.page_count}</strong>
                      <span>Pages</span>
                    </div>
                  )}
                  {material.topics_covered != null && (
                    <div className="material-detail-stat-box">
                      <strong>{material.topics_covered}</strong>
                      <span>Topics Covered</span>
                    </div>
                  )}
                  {levelLabel && (
                    <div className="material-detail-stat-box">
                      <strong style={{ fontSize: '0.9rem' }}>{levelLabel}</strong>
                      <span>Difficulty</span>
                    </div>
                  )}
                </div>

                {displayTags.length > 0 && (
                  <div className="material-detail-tags">
                    {displayTags.slice(0, 6).map((tag) => (
                      <span key={tag} className="material-detail-tag">{tag}</span>
                    ))}
                    {displayTags.length > 6 && (
                      <span className="material-detail-tag">+{displayTags.length - 6}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="material-detail-tabs-card">
              <div className="material-detail-tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`material-detail-tab${activeTab === tab ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="material-detail-tab-panel">{renderTabContent()}</div>
            </div>
          </div>

          <aside className="material-detail-sidebar">
            <div className="material-detail-purchase-card">
              <div className={`material-detail-price${material.price == 0 ? ' free' : ''}`}>
                {material.price == 0 ? 'Free' : `₹${Number(material.price).toFixed(2)}`}
              </div>
              <p className="material-detail-enrolled">
                {material.total_sales} students enrolled
              </p>

              {enrolled ? (
                <button
                  type="button"
                  className="btn btn-success material-detail-cta"
                  onClick={handleAccess}
                >
                  <Play size={18} /> Access Content
                </button>
              ) : profile?.role === 'AUTHOR' ? (
                <div style={{ textAlign: 'center', padding: '12px', background: '#fef3c7', color: '#b45309', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #fde68a' }}>
                  <Shield size={16} style={{ display: 'block', margin: '0 auto 6px' }} />
                  Seller accounts cannot purchase materials.
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary material-detail-cta"
                  onClick={openCheckout}
                  disabled={purchasing}
                >
                  <ShoppingCart size={18} />
                  {material.price == 0 ? 'Enroll Free' : 'Purchase Now'}
                </button>
              )}

              <div className="material-detail-specs">
                <div className="material-detail-spec-row">
                  <span><FileText size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Type</span>
                  <strong>{material.type}</strong>
                </div>
                {material.course && (
                  <div className="material-detail-spec-row">
                    <span><GraduationCap size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Course</span>
                    <strong>{material.course}</strong>
                  </div>
                )}
                {material.semester && (
                  <div className="material-detail-spec-row">
                    <span><Layers size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Semester</span>
                    <strong>{material.semester}</strong>
                  </div>
                )}
                <div className="material-detail-spec-row">
                  <span>Published</span>
                  <strong>{publishedDate}</strong>
                </div>
                {material.language && (
                  <div className="material-detail-spec-row">
                    <span><Globe size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Language</span>
                    <strong>{material.language}</strong>
                  </div>
                )}
                {material.file_size_display && (
                  <div className="material-detail-spec-row">
                    <span><HardDrive size={14} style={{ marginRight: 6, verticalAlign: -2 }} />File Size</span>
                    <strong>{material.file_size_display}</strong>
                  </div>
                )}
                {material.page_count != null && (
                  <div className="material-detail-spec-row">
                    <span>Pages</span>
                    <strong>{material.page_count}</strong>
                  </div>
                )}
              </div>

              <div className="material-detail-trust">
                <Shield size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                Safe &amp; Secure — Trusted by students
              </div>
            </div>

            <div className="material-detail-author-card">
              <h3>About the Author / Seller</h3>
              <div className="material-detail-author-profile">
                <div className="material-detail-author-avatar">
                  {author.avatar_url ? (
                    <img src={author.avatar_url} alt={author.full_name} />
                  ) : (
                    authorInitial
                  )}
                </div>
                <div>
                  <div className="material-detail-author-name">
                    {author.full_name || 'Unknown'}
                    {author.is_verified && <BadgeCheck size={16} color="#3b82f6" />}
                  </div>
                  {author.is_verified && (
                    <span className="material-detail-verified">Verified Seller</span>
                  )}
                </div>
              </div>

              <div className="material-detail-author-stats">
                <div>
                  <strong>{authorStats.material_count ?? 0}</strong>
                  <span>Materials</span>
                </div>
                <div>
                  <strong>
                    {authorStats.total_students >= 1000
                      ? `${(authorStats.total_students / 1000).toFixed(1)}k+`
                      : authorStats.total_students ?? 0}
                  </strong>
                  <span>Students</span>
                </div>
                <div>
                  <strong>{Number(authorStats.avg_rating || 0).toFixed(1)}</strong>
                  <span>Rating</span>
                </div>
              </div>

              {author.bio && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                  {author.bio}
                </p>
              )}

              <Link to="/marketplace" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                Browse more from this seller
              </Link>
            </div>
          </aside>
        </div>

        <div className="material-detail-footer-info" style={{ maxWidth: 1200, margin: '24px auto', padding: '0 24px' }}>
          <div className="card-flat" style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 32, border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-primary)' }}>Purchase Information & Refund Policy</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6, fontSize: '0.9rem' }}>
              <strong>No Refunds:</strong> Due to the digital nature of our educational materials (PDFs, Videos, and MCQ Tests), all sales are final. Once a purchase is completed and access is granted, we cannot offer refunds, exchanges, or cancellations. Please review the material details and author information carefully before purchasing.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6, fontSize: '0.9rem' }}>
              <strong>Secure Access:</strong> Your purchased materials are securely stored in your personal Library and can be accessed at any time. For security and copyright protection, downloading certain content (like video lessons) is restricted.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
              <strong>Support:</strong> If you encounter any technical issues accessing your purchased content, please reach out to our support team or ask for help in the community forums.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && material && (
        <CheckoutModal
          material={material}
          loading={purchasing}
          onConfirm={handleCheckoutConfirm}
          onCancel={() => setCheckoutOpen(false)}
        />
      )}

      {/* Payment Success Overlay */}
      {paymentSuccess && (
        <div className="payment-success-overlay">
          <div className="payment-success-card">
            <div className="payment-success-icon">
              <CheckCircle size={44} />
            </div>
            <h2>Payment Successful!</h2>
            <p>
              You now have access to <strong>{material.title}</strong>.<br />
              Redirecting to your content…
            </p>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        </div>
      )}
    </>
  )
}
