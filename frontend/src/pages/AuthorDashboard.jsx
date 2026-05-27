import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import MaterialFormModal from '../components/author/MaterialFormModal'
import {
  Plus, Package, TrendingUp, DollarSign, Star, Upload, Trash2, Pencil,
  Search, SlidersHorizontal, MoreVertical, FileText, Video, ClipboardCheck,
  Wallet, Store, Image, MessageSquare, ChevronUp, BookOpen, Rocket, AlertTriangle,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import '../styles/AuthorDashboard.css'

const TYPE_TABS = [
  { id: 'all', label: 'All Materials' },
  { id: 'PDF', label: 'PDF' },
  { id: 'VIDEO', label: 'Videos' },
  { id: 'other', label: 'Others' },
]

const TYPE_ICONS = { PDF: FileText, VIDEO: Video, MCQ: ClipboardCheck }

function formatINR(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function materialRevenue(m) {
  return (m.total_sales || 0) * parseFloat(m.price || 0)
}

const CATEGORY_COLORS = [
  '#0052CC', '#FFB84D', '#22C55E', '#3B82F6', '#EC4899', '#8B5CF6',
  '#14B8A6', '#F97316',
]

function formatINRCompact(value) {
  const n = Number(value || 0)
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`
  return formatINR(n)
}

function changeLabel(pct) {
  const n = Number(pct ?? 0)
  const sign = n > 0 ? '+' : ''
  return `${sign}${n}% vs last 30 days`
}

function MiniSparkline({ data, color }) {
  const chartData = (data || []).map((v, i) => ({ i, v: Number(v) || 0 }))
  if (!chartData.length) return null
  return (
    <div className="author-dash__stat-spark">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function AuthorStatCard({ icon: Icon, iconClass, label, value, changePct, sparkData, sparkColor, sub }) {
  const pct = Number(changePct ?? 0)
  const changeClass =
    pct > 0 ? 'author-dash__stat-sub--up' :
    pct < 0 ? 'author-dash__stat-sub--down' :
    ''

  return (
    <div className="author-dash__stat">
      <div className="author-dash__stat-top">
        <div className={`author-dash__stat-icon author-dash__stat-icon--${iconClass}`}>
          <Icon size={22} />
        </div>
        <div className="author-dash__stat-body">
          <div className="author-dash__stat-label">{label}</div>
          <div className="author-dash__stat-value">{value}</div>
          {changePct != null ? (
            <div className={`author-dash__stat-sub ${changeClass}`}>
              {changeLabel(changePct)}
            </div>
          ) : sub ? (
            <div className="author-dash__stat-sub">{sub}</div>
          ) : null}
        </div>
      </div>
      <MiniSparkline data={sparkData} color={sparkColor} />
    </div>
  )
}

const EMPTY_FORM = {
  title: '', description: '', about_material: '', type: 'PDF', price: '',
  category: '', university: '', course: '', semester: '',
  topics_covered: '', level: '', language: 'English', tags: '',
  page_count: '',
}

function tagsToFormValue(tags) {
  if (Array.isArray(tags)) return tags.join(', ')
  if (typeof tags === 'string') return tags
  return ''
}

export default function AuthorDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const isVerifiedAuthor = !!profile?.is_verified
  const displayName = profile?.full_name?.split(' ')[0] || 'Author'

  const [materials, setMaterials] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [editingMaterialId, setEditingMaterialId] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [materialFile, setMaterialFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [mcqQuestions, setMcqQuestions] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [publishBanner, setPublishBanner] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [matRes, anaRes] = await Promise.all([
        api.get('/materials/my/'),
        api.get('/analytics/author/').catch(() => ({ data: null })),
      ])
      setMaterials(matRes.data.results || matRes.data || [])
      setAnalytics(anaRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const resetMaterialForm = () => {
    setForm(EMPTY_FORM)
    setMaterialFile(null)
    setThumbnailFile(null)
    setMcqQuestions([])
    setEditingMaterialId(null)
  }

  const closeMaterialModal = () => {
    setShowUpload(false)
    resetMaterialForm()
  }

  const openCreateModal = () => {
    resetMaterialForm()
    setShowUpload(true)
  }

  const openEditModal = async (material) => {
    if (!isVerifiedAuthor) return
    setOpenMenuId(null)
    setEditingMaterialId(material.id)
    setShowUpload(true)
    setFormLoading(true)
    setMaterialFile(null)
    setThumbnailFile(null)
    setMcqQuestions([])
    try {
      const { data } = await api.get(`/materials/my/${material.id}/`)
      setForm({
        title: data.title || '',
        description: data.description || '',
        about_material: data.about_material || '',
        type: data.type || material.type || 'PDF',
        price: data.price != null ? String(data.price) : '',
        category: data.category || '',
        university: data.university || '',
        course: data.course || '',
        semester: data.semester != null ? String(data.semester) : '',
        topics_covered: data.topics_covered != null ? String(data.topics_covered) : '',
        level: data.level || '',
        language: data.language || 'English',
        tags: tagsToFormValue(data.tags),
        page_count: data.page_count != null ? String(data.page_count) : '',
      })
    } catch {
      alert('Could not load material details')
      closeMaterialModal()
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isVerifiedAuthor) return
    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('title', form.title || '')
      payload.append('description', form.description || '')
      payload.append('about_material', form.about_material || '')
      payload.append('type', form.type || 'PDF')
      payload.append('price', String(parseFloat(form.price) || 0))
      payload.append('category', form.category || '')
      payload.append('university', form.university || '')
      payload.append('course', form.course || '')
      payload.append('semester', form.semester || '')
      payload.append('topics_covered', form.topics_covered || '')
      payload.append('level', form.level || '')
      payload.append('language', form.language || 'English')
      if (form.page_count) payload.append('page_count', form.page_count)
      if (form.tags.trim()) payload.append('tags', form.tags.trim())
      if (materialFile) payload.append('material_file', materialFile)
      if (thumbnailFile) payload.append('thumbnail_file', thumbnailFile)

      const requestConfig = { headers: { 'Content-Type': 'multipart/form-data' } }
      if (editingMaterialId) {
        await api.patch(`/materials/my/${editingMaterialId}/`, payload, requestConfig)
      } else {
        const { data } = await api.post('/materials/my/', payload, requestConfig)
        if (form.type === 'MCQ' && mcqQuestions.length > 0) {
          await api.post('/assessments/create/', { material: data.id, questions: mcqQuestions, timer_limit: 30, passing_score: 60 })
        }
      }
      if (!editingMaterialId) {
        setPublishBanner(form.title || 'Your material')
      }
      closeMaterialModal()
      fetchData()
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'string') alert(data)
      else if (data?.detail) alert(data.detail)
      else if (data && typeof data === 'object') {
        const first = Object.values(data)[0]
        alert(Array.isArray(first) ? first[0] : String(first))
      } else alert(editingMaterialId ? 'Save failed' : 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const requestDelete = (material) => {
    setOpenMenuId(null)
    const purchaseCount = material.total_sales || 0
    if (purchaseCount > 0) {
      setDeleteAcknowledged(false)
      setDeleteTarget(material)
      return
    }
    if (!confirm(`Delete "${material.title}"? This cannot be undone.`)) return
    performDelete(material.id)
  }

  const cancelDelete = () => {
    setDeleteTarget(null)
    setDeleteAcknowledged(false)
  }

  const performDelete = async (id) => {
    setDeleting(true)
    try {
      await api.delete(`/materials/my/${id}/`)
      cancelDelete()
      fetchData()
    } catch {
      alert('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const confirmDeleteWithPurchases = () => {
    if (!deleteTarget || !deleteAcknowledged) return
    performDelete(deleteTarget.id)
  }

  const overview = analytics?.overview || {}
  const performance = analytics?.performance || {}
  const chartData = analytics?.daily_chart || []
  const sparklines = analytics?.sparklines || {}
  const categoryData = useMemo(() => {
    const cats = analytics?.categories || []
    return cats.map((c, i) => ({
      name: c.name,
      value: c.revenue,
      pct: c.pct,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
  }, [analytics])

  const typeCounts = useMemo(() => {
    const counts = { all: materials.length, PDF: 0, VIDEO: 0, other: 0 }
    materials.forEach((m) => {
      if (m.type === 'PDF') counts.PDF++
      else if (m.type === 'VIDEO') counts.VIDEO++
      else counts.other++
    })
    return counts
  }, [materials])

  const filteredMaterials = useMemo(() => {
    let list = [...materials]
    if (typeFilter === 'PDF' || typeFilter === 'VIDEO') {
      list = list.filter((m) => m.type === typeFilter)
    } else if (typeFilter === 'other') {
      list = list.filter((m) => m.type !== 'PDF' && m.type !== 'VIDEO')
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((m) =>
        m.title?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      if (sortBy === 'sales') return (b.total_sales || 0) - (a.total_sales || 0)
      if (sortBy === 'price') return parseFloat(b.price) - parseFloat(a.price)
      return new Date(b.created_at) - new Date(a.created_at)
    })
    return list
  }, [materials, typeFilter, searchQuery, sortBy])

  const revenueChange = performance.revenue_change_pct ?? 0
  const totalRevenue = overview.total_revenue ?? materials.reduce((s, m) => s + materialRevenue(m), 0)
  const totalSales = overview.total_sales ?? materials.reduce((s, m) => s + (m.total_sales || 0), 0)
  const totalMaterials = overview.total_materials ?? materials.length
  const avgRating = overview.avg_rating ?? (
    materials.length
      ? materials.reduce((s, m) => s + Number(m.average_rating || 0) * (m.review_count || 0), 0) / Math.max(materials.reduce((s, m) => s + (m.review_count || 0), 0), 1)
      : 0
  )

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="author-dash animate-fade-in">
      {publishBanner && (
        <div className="author-dash__publish-banner">
          <span>
            Great job! Your material <strong>&apos;{publishBanner}&apos;</strong> has been
            published successfully.
          </span>
          <button type="button" onClick={() => setPublishBanner(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {/* Welcome */}
      <div className="author-dash__welcome">
        <div>
          <h1>
            Welcome back, {displayName}! 👋
            <span className={`author-dash__verified ${!isVerifiedAuthor ? 'author-dash__verified--pending' : ''}`}>
              {isVerifiedAuthor ? 'VERIFIED' : 'NOT VERIFIED'}
            </span>
          </h1>
          <p>Here&apos;s what&apos;s happening with your materials today.</p>
          {!isVerifiedAuthor && (
            <p className="author-dash__pending">
              Your author account is pending admin verification. You can prepare materials, but publishing is disabled until approved.
            </p>
          )}
        </div>
        <button
          type="button"
          className="author-dash__btn-new"
          onClick={openCreateModal}
          disabled={!isVerifiedAuthor}
          title={isVerifiedAuthor ? 'Create new material' : 'Verification pending'}
        >
          <Plus size={18} /> New Material
        </button>
      </div>

      {/* Summary stats */}
      <div className="author-dash__stats">
        <AuthorStatCard
          icon={Package}
          iconClass="purple"
          label="Total Materials"
          value={totalMaterials}
          changePct={overview.materials_change_pct}
          sparkData={sparklines.materials}
          sparkColor="#0052CC"
        />
        <AuthorStatCard
          icon={TrendingUp}
          iconClass="red"
          label="Total Sales"
          value={totalSales}
          changePct={overview.sales_change_pct ?? performance.downloads_change_pct}
          sparkData={sparklines.sales}
          sparkColor="#FF6B6B"
        />
        <AuthorStatCard
          icon={DollarSign}
          iconClass="green"
          label="Total Revenue"
          value={formatINR(totalRevenue)}
          changePct={overview.revenue_change_pct ?? revenueChange}
          sparkData={sparklines.revenue}
          sparkColor="#22C55E"
        />
        <AuthorStatCard
          icon={Star}
          iconClass="orange"
          label="Avg Rating"
          value={Number(avgRating).toFixed(1)}
          sparkData={sparklines.ratings}
          sparkColor="#FFB84D"
          sub="Based on reviews"
        />
      </div>

      {/* Revenue trend + category breakdown */}
      <section className="author-dash__charts" id="performance">
        <div className="author-dash__chart-card author-dash__chart-card--wide">
          <div className="author-dash__chart-head">
            <h3>Revenue Trend</h3>
            <select className="author-dash__period-select" defaultValue="30" aria-label="Time period">
              <option value="30">Last 30 Days</option>
            </select>
          </div>
          <div className="author-dash__chart-area">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="authorRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052CC" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0052CC" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,76,255,0.08)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={(v) => formatINRCompact(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      fontSize: '0.85rem',
                    }}
                    formatter={(value) => [formatINR(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0052CC"
                    strokeWidth={2.5}
                    fill="url(#authorRevenueGrad)"
                    dot={{ r: 4, fill: '#0052CC', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="author-dash__chart-empty">
                Sales data will appear here once you make your first sale.
              </div>
            )}
          </div>
        </div>

        <div className="author-dash__chart-card">
          <div className="author-dash__chart-head">
            <h3>Top Performing Categories</h3>
          </div>
          <div className="author-dash__donut-wrap">
            {categoryData.length > 0 ? (
              <>
                <div className="author-dash__donut-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={2}
                      >
                        {categoryData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatINR(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="author-dash__legend">
                  {categoryData.map((item) => (
                    <div key={item.name} className="author-dash__legend-item">
                      <span className="author-dash__legend-left">
                        <span className="author-dash__legend-dot" style={{ background: item.fill }} />
                        {item.name}
                      </span>
                      <span className="author-dash__legend-pct">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="author-dash__chart-empty">
                Category breakdown appears once you have sales by category.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Performance metrics */}
      <section className="author-dash__perf">
        <div className="author-dash__perf-head">
          <h2>Performance Overview</h2>
        </div>
        <div className="author-dash__perf-metrics">
          <div className="author-dash__perf-metric">
            <div className="author-dash__perf-metric-label">Revenue (30D)</div>
            <div className="author-dash__perf-metric-value">
              {formatINR(performance.revenue ?? totalRevenue)}
            </div>
            {(performance.revenue_change_pct ?? 0) !== 0 && (
              <div className="author-dash__perf-metric-change">
                <ChevronUp size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                {performance.revenue_change_pct > 0 ? '+' : ''}{performance.revenue_change_pct}%
              </div>
            )}
            <div className="author-dash__perf-metric-sub">vs previous 30 days</div>
          </div>
          <div className="author-dash__perf-metric">
            <div className="author-dash__perf-metric-label">Purchases (30D)</div>
            <div className="author-dash__perf-metric-value">{performance.downloads ?? totalSales}</div>
            {(performance.downloads_change_pct ?? 0) !== 0 && (
              <div className="author-dash__perf-metric-change">
                +{performance.downloads_change_pct}%
              </div>
            )}
            <div className="author-dash__perf-metric-sub">vs previous 30 days</div>
          </div>
          <div className="author-dash__perf-metric">
            <div className="author-dash__perf-metric-label">Top Category</div>
            <div className="author-dash__perf-metric-value" style={{ fontSize: '1rem' }}>
              {performance.top_category || categoryData[0]?.name || '—'}
            </div>
            {(performance.top_category_pct > 0 || categoryData[0]?.pct > 0) && (
              <div className="author-dash__perf-metric-sub">
                {performance.top_category_pct || categoryData[0]?.pct}% of your sales
              </div>
            )}
          </div>
          <div className="author-dash__perf-metric">
            <div className="author-dash__perf-metric-label">Conversion Rate</div>
            <div className="author-dash__perf-metric-value">
              {performance.conversion_rate ?? 0}%
            </div>
            {(performance.conversion_change_pct ?? 0) !== 0 && (
              <div className="author-dash__perf-metric-change">
                +{performance.conversion_change_pct}%
              </div>
            )}
            <div className="author-dash__perf-metric-sub">vs previous 30 days</div>
          </div>
        </div>
      </section>

      {/* Quick actions + tips */}
      <section className="author-dash__actions-panel">
        <div className="author-dash__quick">
          <h3>Quick Actions</h3>
          <button
            type="button"
            className="author-dash__quick-item"
            onClick={openCreateModal}
            disabled={!isVerifiedAuthor}
          >
            <span className="author-dash__quick-item-icon"><Plus size={20} /></span>
            <span>
              <strong>Create New Material</strong>
              <span>Upload PDFs, videos, or MCQ tests</span>
            </span>
          </button>
          <button
            type="button"
            className="author-dash__quick-item"
            onClick={() => document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="author-dash__quick-item-icon"><Wallet size={20} /></span>
            <span>
              <strong>View My Earnings</strong>
              <span>Track revenue and sales trends</span>
            </span>
          </button>
          <Link to="/marketplace" className="author-dash__quick-item" style={{ textDecoration: 'none' }}>
            <span className="author-dash__quick-item-icon"><Store size={20} /></span>
            <span>
              <strong>Marketplace Profile</strong>
              <span>See how students view your listings</span>
            </span>
          </Link>
        </div>
        <div className="author-dash__tips">
          <h3>Tips to Grow Your Sales</h3>
          <ul>
            <li><Image size={16} color="#0052CC" style={{ flexShrink: 0, marginTop: 2 }} /> Use eye-catching thumbnails to stand out in the marketplace.</li>
            <li><BookOpen size={16} color="#0052CC" style={{ flexShrink: 0, marginTop: 2 }} /> Write clear, detailed descriptions so students know what they&apos;re buying.</li>
            <li><MessageSquare size={16} color="#0052CC" style={{ flexShrink: 0, marginTop: 2 }} /> Respond to reviews and keep your materials updated for better ratings.</li>
          </ul>
          <span className="author-dash__tips-deco" aria-hidden>📦</span>
        </div>
      </section>

      {/* My materials */}
      <div className="author-dash__materials-head">
        <h2 className="author-dash__section-title" style={{ margin: 0 }}>My Materials</h2>
      </div>

      <div className="author-dash__tabs">
        {TYPE_TABS.map((tab) => {
          const count = typeCounts[tab.id] ?? typeCounts.all
          return (
            <button
              key={tab.id}
              type="button"
              className={`author-dash__tab ${typeFilter === tab.id ? 'author-dash__tab--active' : ''}`}
              onClick={() => setTypeFilter(tab.id)}
            >
              {tab.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="author-dash__toolbar">
        <label className="author-dash__search">
          <Search size={18} color="#9ca3af" />
          <input
            type="search"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <div className="author-dash__sort">
          <SlidersHorizontal size={16} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort materials">
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="sales">Most Sales</option>
            <option value="price">Highest Price</option>
          </select>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="empty-state" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 48 }}>
          <Package size={48} />
          <h3>{materials.length === 0 ? 'No materials yet' : 'No materials match your filters'}</h3>
          <p>{materials.length === 0 ? 'Create your first material to start selling.' : 'Try a different search or tab.'}</p>
        </div>
      ) : (
        <div className="author-dash__list">
          {filteredMaterials.map((m) => {
            const TypeIcon = TYPE_ICONS[m.type] || ClipboardCheck
            const typeClass = m.type === 'PDF' ? 'pdf' : m.type === 'VIDEO' ? 'video' : 'mcq'
            return (
              <div key={m.id} className="author-dash__row">
                <div className="author-dash__row-main">
                  <div className={`author-dash__type-badge author-dash__type-badge--${typeClass}`}>
                    <TypeIcon size={20} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="author-dash__row-title">{m.title}</div>
                    <div className="author-dash__row-meta">
                      {m.category && <span>{m.category}</span>}
                      {m.category && <span>·</span>}
                      <span>{formatINR(m.price)}</span>
                      <span>·</span>
                      <span>{m.total_sales || 0} sales</span>
                      <span>·</span>
                      <span><Star size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {Number(m.average_rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="author-dash__row-stat">
                  <div className="author-dash__row-stat-label">Revenue</div>
                  <div className="author-dash__row-stat-value">{formatINR(materialRevenue(m))}</div>
                </div>
                <div className="author-dash__row-stat">
                  <div className="author-dash__row-stat-label">Purchase</div>
                  <div className="author-dash__row-stat-value">{m.total_sales || 0}</div>
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="author-dash__menu-btn"
                    onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                    aria-label="Material options"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenuId === m.id && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      zIndex: 10,
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      minWidth: 140,
                      overflow: 'hidden',
                    }}>
                      <button
                        type="button"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '10px 14px',
                          border: 'none',
                          background: 'none',
                          cursor: isVerifiedAuthor ? 'pointer' : 'not-allowed',
                          fontSize: '0.85rem',
                          opacity: isVerifiedAuthor ? 1 : 0.5,
                        }}
                        disabled={!isVerifiedAuthor}
                        onClick={() => openEditModal(m)}
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '10px 14px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                        onClick={() => { setOpenMenuId(null); navigate(`/material/${m.id}`) }}
                      >
                        View listing
                      </button>
                      <button
                        type="button"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '10px 14px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          color: '#ef4444',
                        }}
                        onClick={() => requestDelete(m)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer CTA */}
      <section className="author-dash__cta">
        <div>
          <h2>Create more. Earn more.</h2>
          <p>Upload quality content and help thousands of students succeed.</p>
        </div>
        <button
          type="button"
          className="author-dash__cta-btn"
          onClick={openCreateModal}
          disabled={!isVerifiedAuthor}
        >
          Upload New Material
        </button>
        <span className="author-dash__cta-deco" aria-hidden><Rocket size={64} color="#fff" /></span>
      </section>

      {/* Delete confirmation (materials with purchases) */}
      {deleteTarget && (
        <div
          className="modal-overlay author-dash__delete-overlay"
          onClick={(e) => e.target === e.currentTarget && !deleting && cancelDelete()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-material-title"
        >
          <div className="modal-content author-dash__delete-modal">
            <div className="author-dash__delete-header">
              <div className="author-dash__delete-icon" aria-hidden>
                <AlertTriangle size={28} />
              </div>
              <div>
                <h2 id="delete-material-title">Delete purchased material?</h2>
                <p className="author-dash__delete-subtitle">
                  <strong>{deleteTarget.title}</strong> has been purchased by students.
                </p>
              </div>
            </div>

            <div className="author-dash__delete-warning">
              <p>
                This material has <strong>{deleteTarget.total_sales}</strong> purchase
                {deleteTarget.total_sales === 1 ? '' : 's'} (
                {formatINR(materialRevenue(deleteTarget))} estimated revenue).
                Deleting it is permanent and affects everyone who bought it.
              </p>
            </div>

            <div className="author-dash__delete-disclaimer">
              <h3>Disclaimer</h3>
              <ul>
                <li>Students who purchased this material will <strong>lose access</strong> in My Library immediately.</li>
                <li>PDF, video, and quiz content will no longer be available to buyers.</li>
                <li>Purchase and enrollment records tied to this listing will be <strong>removed</strong> from the platform.</li>
                <li>Deleting does <strong>not</strong> issue automatic refunds — you are responsible for any buyer disputes.</li>
                <li>This action <strong>cannot be undone</strong>.</li>
              </ul>
            </div>

            <label className="author-dash__delete-ack">
              <input
                type="checkbox"
                checked={deleteAcknowledged}
                onChange={(e) => setDeleteAcknowledged(e.target.checked)}
                disabled={deleting}
              />
              <span>
                I understand that deleting this material will revoke student access and cannot be reversed.
              </span>
            </label>

            <div className="author-dash__delete-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={cancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger author-dash__delete-confirm"
                onClick={confirmDeleteWithPurchases}
                disabled={!deleteAcknowledged || deleting}
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MaterialFormModal
        open={showUpload}
        editingMaterialId={editingMaterialId}
        formLoading={formLoading}
        saving={saving}
        form={form}
        setForm={setForm}
        materialFile={materialFile}
        setMaterialFile={setMaterialFile}
        thumbnailFile={thumbnailFile}
        setThumbnailFile={setThumbnailFile}
        mcqQuestions={mcqQuestions}
        setMcqQuestions={setMcqQuestions}
        onClose={closeMaterialModal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
