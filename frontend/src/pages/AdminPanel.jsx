import { useState, useEffect, useMemo } from 'react'
import api from '../lib/api'
import {
  Users, Package, DollarSign, TrendingUp, CheckCircle, XCircle, UserCheck,
  ShieldCheck, BarChart3, Activity, Trash2, Download, Calendar, UserPlus,
  FileText, CreditCard, Upload, Server, Database, Mail, HardDrive,
  ChevronRight, RefreshCw, AlertTriangle,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import '../styles/AdminPanel.css'
import '../styles/AdminUsers.css'
import AdminUsersSection from '../components/admin/AdminUsersSection'
import AdminAuthorsSection from '../components/admin/AdminAuthorsSection'

const CATEGORY_COLORS = [
  '#0052CC', '#FFB84D', '#22C55E', '#3B82F6', '#EC4899', '#8B5CF6',
  '#14B8A6', '#F97316',
]

const ACTIVITY_ICONS = {
  user_registered: UserPlus,
  material_published: FileText,
  enrollment: TrendingUp,
  payment: CreditCard,
}

function formatINR(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatINRCompact(value) {
  const n = Number(value || 0)
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`
  return formatINR(n)
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function changeLabel(pct) {
  const n = Number(pct ?? 0)
  const sign = n > 0 ? '+' : ''
  return `${sign}${n}% vs last 30 days`
}

const HEALTH_ICONS = {
  server: Server,
  database: Database,
  payments: CreditCard,
  storage: HardDrive,
  email: Mail,
}

function healthStatusLabel(status) {
  const labels = {
    healthy: 'Healthy',
    degraded: 'Degraded',
    down: 'Down',
    unconfigured: 'Not Set Up',
  }
  return labels[status] || status
}

function systemStatusCopy(overall) {
  switch (overall) {
    case 'healthy':
      return 'All systems are operational and performing within expected parameters.'
    case 'degraded':
      return 'Some services are degraded or not fully configured. Review Platform Health for details.'
    case 'down':
      return 'One or more critical services are down. Check Platform Health and server logs.'
    default:
      return 'Run a health check to see current platform status.'
  }
}

function MiniSparkline({ data, color }) {
  const chartData = (data || []).map((v, i) => ({ i, v: Number(v) || 0 }))
  if (!chartData.length) return null
  return (
    <div className="admin-panel__metric-spark">
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

function MetricCard({ label, value, changePct, sparkData, sparkColor }) {
  const pct = Number(changePct ?? 0)
  const changeClass =
    pct > 0 ? 'admin-panel__metric-change--up' :
    pct < 0 ? 'admin-panel__metric-change--down' :
    'admin-panel__metric-change--neutral'

  return (
    <div className="admin-panel__metric">
      <div className="admin-panel__metric-label">{label}</div>
      <div className="admin-panel__metric-value">{value}</div>
      <div className={`admin-panel__metric-change ${changeClass}`}>
        {changeLabel(pct)}
      </div>
      <MiniSparkline data={sparkData} color={sparkColor} />
    </div>
  )
}

export default function AdminPanel() {
  const [tab, setTab] = useState('overview')
  const [overview, setOverview] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [chartDays, setChartDays] = useState('30')
  const [authors, setAuthors] = useState([])
  const [pendingMaterials, setPendingMaterials] = useState([])
  const [users, setUsers] = useState([])
  const [platformHealth, setPlatformHealth] = useState(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const [rangeStart, setRangeStart] = useState(defaultStart.toISOString().slice(0, 10))
  const [rangeEnd, setRangeEnd] = useState(defaultEnd.toISOString().slice(0, 10))

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    fetchRevenue(chartDays)
  }, [chartDays])

  const fetchRevenue = async (days) => {
    try {
      const revRes = await api.get(`/analytics/admin/revenue/?granularity=day&days=${days}`)
      setRevenueData(revRes.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchHealth = async () => {
    setHealthLoading(true)
    try {
      const { data } = await api.get('/analytics/admin/health/')
      setPlatformHealth(data)
    } catch (err) {
      console.error(err)
      setPlatformHealth({
        overall: 'down',
        services: [],
        error: 'Could not load health status',
      })
    } finally {
      setHealthLoading(false)
    }
  }

  const fetchAll = async () => {
    try {
      const [ovRes, revRes, authRes, matRes, userRes, healthRes] = await Promise.all([
        api.get('/analytics/admin/overview/'),
        api.get('/analytics/admin/revenue/?granularity=day&days=30'),
        api.get('/auth/authors/'),
        api.get('/materials/admin/list/?approved=false'),
        api.get('/auth/admin/users/'),
        api.get('/analytics/admin/health/'),
      ])
      setOverview(ovRes.data)
      setRevenueData(revRes.data.data || [])
      setAuthors(authRes.data.results || authRes.data || [])
      setPendingMaterials(matRes.data.results || matRes.data || [])
      setUsers(userRes.data.results || userRes.data || [])
      setPlatformHealth(healthRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRevenue = useMemo(() => {
    if (!rangeStart || !rangeEnd) return revenueData
    const start = new Date(rangeStart)
    const end = new Date(rangeEnd)
    end.setHours(23, 59, 59, 999)
    return revenueData.filter((row) => {
      if (!row.full_date) return true
      const d = new Date(row.full_date)
      return d >= start && d <= end
    })
  }, [revenueData, rangeStart, rangeEnd])

  const categoryData = useMemo(() => {
    const cats = overview?.categories || []
    return cats.map((c, i) => ({
      name: c.name,
      value: c.revenue,
      pct: c.pct,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
  }, [overview])

  const pendingAuthorCount = useMemo(
    () => authors.filter((a) => !a.is_verified).length,
    [authors],
  )

  const verifyAuthor = async (author) => {
    const action = author.is_verified ? 'unverify' : 'approve'
    try {
      await api.post(`/auth/authors/${author.id}/verify/`, { action })
      setAuthors((prev) =>
        prev.map((a) => (a.id === author.id ? { ...a, is_verified: !a.is_verified } : a)),
      )
      setUsers((prev) =>
        prev.map((u) => (u.id === author.id ? { ...u, is_verified: !author.is_verified } : u)),
      )
    } catch {
      alert('Action failed')
    }
  }

  const deleteAuthor = async (author) => {
    if (!confirm(`Delete author profile for ${author.full_name || author.email || 'this author'}?`)) return
    try {
      await api.delete(`/auth/admin/users/${author.id}/`)
      setAuthors((prev) => prev.filter((a) => a.id !== author.id))
      setUsers((prev) => prev.filter((u) => u.id !== author.id))
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed')
    }
  }

  const moderateMaterial = async (id, action) => {
    try {
      await api.post(`/materials/admin/${id}/moderate/`, { action })
      setPendingMaterials((prev) => prev.filter((m) => m.id !== id))
    } catch {
      alert('Action failed')
    }
  }

  const toggleAuthorVerification = async (user) => {
    try {
      const action = user.is_verified ? 'unverify' : 'approve'
      await api.post(`/auth/authors/${user.id}/verify/`, { action })
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_verified: !u.is_verified } : u)),
      )
      setAuthors((prev) =>
        prev.map((a) => (a.id === user.id ? { ...a, is_verified: !user.is_verified } : a)),
      )
    } catch {
      alert('Verification action failed')
    }
  }

  const deleteUser = async (user) => {
    if (!confirm(`Delete profile for ${user.full_name || user.email || 'this user'}?`)) return
    try {
      await api.delete(`/auth/admin/users/${user.id}/`)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setAuthors((prev) => prev.filter((a) => a.id !== user.id))
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed')
    }
  }

  const exportReport = () => {
    const stats = overview || {}
    const rows = [
      ['Metric', 'Value'],
      ['Total Users', stats.users?.total ?? 0],
      ['Materials', stats.materials?.total ?? 0],
      ['Total Revenue', stats.revenue?.total ?? 0],
      ['Enrollments', stats.engagement?.total_enrollments ?? 0],
      ['New Users (30d)', stats.users?.new_last_30_days ?? 0],
      ['Revenue (30d)', stats.revenue?.last_30_days ?? 0],
      ['Date Range', `${rangeStart} to ${rangeEnd}`],
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `edumarket-admin-report-${rangeStart}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>
  }

  const stats = overview || { users: {}, materials: {}, revenue: {}, engagement: {} }
  const sparklines = overview?.sparklines || {}
  const activities = overview?.recent_activities || []

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: `Users (${users.length})`, icon: Users },
    { id: 'authors', label: `Authors (${pendingAuthorCount})`, icon: UserCheck },
    { id: 'content', label: `Content (${pendingMaterials.length})`, icon: Package },
  ]

  const healthServices = platformHealth?.services || []
  const healthOverall = platformHealth?.overall || 'healthy'

  return (
    <div className="admin-panel animate-fade-in">
      <div className="admin-panel__top">
        <div className="admin-panel__title-block">
          <h1>
            <ShieldCheck size={28} />
            Admin Panel
          </h1>
          <p>Platform management and analytics</p>
        </div>
        <div className="admin-panel__toolbar">
          <label className="admin-panel__date-range">
            <Calendar size={16} />
            <input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
            <span>–</span>
            <input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
          </label>
          <button type="button" className="admin-panel__export-btn" onClick={exportReport}>
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      <div className="admin-panel__tabs-row">
        <div className="admin-panel__tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`admin-panel__tab ${tab === t.id ? 'admin-panel__tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <>
          <div className="admin-panel__metrics">
            <MetricCard
              label="Total Users"
              value={stats.users?.total ?? 0}
              changePct={stats.users?.change_pct}
              sparkData={sparklines.users}
              sparkColor="#0052CC"
            />
            <MetricCard
              label="Materials"
              value={stats.materials?.total ?? 0}
              changePct={stats.materials?.change_pct}
              sparkData={sparklines.materials}
              sparkColor="#FF6B6B"
            />
            <MetricCard
              label="Total Revenue"
              value={formatINR(stats.revenue?.total)}
              changePct={stats.revenue?.change_pct}
              sparkData={sparklines.revenue}
              sparkColor="#22C55E"
            />
            <MetricCard
              label="Enrollments"
              value={stats.engagement?.total_enrollments ?? 0}
              changePct={stats.engagement?.change_pct}
              sparkData={sparklines.enrollments}
              sparkColor="#FFB84D"
            />
            <MetricCard
              label="New Users (30D)"
              value={stats.users?.new_last_30_days ?? 0}
              changePct={stats.users?.change_pct}
              sparkData={sparklines.users}
              sparkColor="#0052CC"
            />
          </div>

          <div className="admin-panel__metric-row2">
            <div className="admin-panel__metric admin-panel__metric--wide">
              <div className="admin-panel__metric-label">Revenue (30D)</div>
              <div className="admin-panel__metric-value">
                {formatINR(stats.revenue?.last_30_days)}
              </div>
              <div className={`admin-panel__metric-change admin-panel__metric-change--${(stats.revenue?.change_pct ?? 0) >= 0 ? 'up' : 'down'}`}>
                {changeLabel(stats.revenue?.change_pct)}
              </div>
              <MiniSparkline data={sparklines.revenue} color="#FFB84D" />
            </div>
          </div>

          <div className="admin-panel__charts">
            <div className="admin-panel__card">
              <div className="admin-panel__card-head">
                <h3>Revenue Trend</h3>
                <select
                  className="admin-panel__card-select"
                  value={chartDays}
                  onChange={(e) => setChartDays(e.target.value)}
                >
                  <option value="30">Last 30 Days</option>
                  <option value="60">Last 60 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>
              </div>
              <div className="admin-panel__chart-area">
                {filteredRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredRevenue}>
                      <defs>
                        <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
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
                        tickFormatter={(v) => formatINRCompact(v)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: 10,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                        formatter={(value) => [formatINR(value), 'Revenue']}
                        labelFormatter={(label, payload) => {
                          const row = payload?.[0]?.payload
                          return row?.full_date
                            ? new Date(row.full_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : label
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0052CC"
                        fill="url(#adminRevenueGrad)"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#0052CC', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state" style={{ padding: '40px 0' }}>
                    <BarChart3 size={40} />
                    <h3>No revenue data yet</h3>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-panel__card">
              <div className="admin-panel__card-head">
                <h3>Top Performing Categories</h3>
              </div>
              <div className="admin-panel__donut-wrap">
                {categoryData.length > 0 ? (
                  <>
                    <div className="admin-panel__donut-chart">
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
                    <div className="admin-panel__legend">
                      {categoryData.map((item) => (
                        <div key={item.name} className="admin-panel__legend-item">
                          <span className="admin-panel__legend-left">
                            <span className="admin-panel__legend-dot" style={{ background: item.fill }} />
                            {item.name}
                          </span>
                          <span className="admin-panel__legend-pct">{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <Package size={40} />
                    <h3>No category data</h3>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-panel__widgets">
            <div className="admin-panel__widget">
              <div className="admin-panel__widget-head">
                <h3>Recent Activities</h3>
                <button type="button" className="admin-panel__widget-link" onClick={() => setTab('users')}>
                  View All <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                </button>
              </div>
              <ul className="admin-panel__activity-list">
                {activities.length === 0 ? (
                  <li style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent activity</li>
                ) : (
                  activities.map((act, idx) => {
                    const Icon = ACTIVITY_ICONS[act.type] || Activity
                    const iconClass =
                      act.type === 'user_registered' ? 'user' :
                      act.type === 'material_published' ? 'material' :
                      act.type === 'enrollment' ? 'enrollment' : 'payment'
                    return (
                      <li key={`${act.type}-${idx}`} className="admin-panel__activity-item">
                        <div className={`admin-panel__activity-icon admin-panel__activity-icon--${iconClass}`}>
                          <Icon size={18} />
                        </div>
                        <div className="admin-panel__activity-text">
                          <strong>{act.title}</strong>
                          <span>{act.detail}</span>
                          <span className="admin-panel__activity-time">{timeAgo(act.timestamp)}</span>
                        </div>
                      </li>
                    )
                  })
                )}
              </ul>
            </div>

            <div className="admin-panel__widget">
              <div className="admin-panel__widget-head">
                <h3>Quick Actions</h3>
              </div>
              <div className="admin-panel__actions-grid">
                <button type="button" className="admin-panel__action-btn" onClick={() => setTab('content')}>
                  <Upload size={20} />
                  <strong>Add New Material</strong>
                  <span>Review pending content</span>
                </button>
                <button type="button" className="admin-panel__action-btn" onClick={() => setTab('users')}>
                  <Users size={20} />
                  <strong>Manage Users</strong>
                  <span>View and edit users</span>
                </button>
                <button type="button" className="admin-panel__action-btn" onClick={() => setTab('authors')}>
                  <UserCheck size={20} />
                  <strong>Manage Authors</strong>
                  <span>Review authors</span>
                </button>
                <button type="button" className="admin-panel__action-btn" onClick={exportReport}>
                  <BarChart3 size={20} />
                  <strong>View Reports</strong>
                  <span>Export analytics</span>
                </button>
              </div>
            </div>

            <div className="admin-panel__widget">
              <div className="admin-panel__widget-head">
                <h3>Platform Health</h3>
                <button
                  type="button"
                  className="admin-panel__widget-link"
                  onClick={fetchHealth}
                  disabled={healthLoading}
                >
                  {healthLoading ? (
                    <>Checking…</>
                  ) : (
                    <>
                      <RefreshCw size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      Refresh
                    </>
                  )}
                </button>
              </div>
              {platformHealth?.checked_at && (
                <p className="admin-panel__health-meta">
                  Last checked {new Date(platformHealth.checked_at).toLocaleString()}
                </p>
              )}
              <ul className="admin-panel__health-list">
                {healthServices.length === 0 ? (
                  <li className="admin-panel__health-item">
                    <span>Unable to load health checks</span>
                  </li>
                ) : (
                  healthServices.map((svc) => {
                    const Icon = HEALTH_ICONS[svc.id] || Server
                    return (
                      <li key={svc.id} className="admin-panel__health-item" title={svc.message}>
                        <span className="admin-panel__health-label">
                          <Icon size={16} />
                          <span>
                            {svc.label}
                            {svc.latency_ms != null && (
                              <small className="admin-panel__health-latency">{svc.latency_ms}ms</small>
                            )}
                          </span>
                        </span>
                        <span className={`admin-panel__health-badge admin-panel__health-badge--${svc.status}`}>
                          {healthStatusLabel(svc.status)}
                        </span>
                      </li>
                    )
                  })
                )}
              </ul>
            </div>

            <div className={`admin-panel__widget admin-panel__promo admin-panel__promo--${healthOverall}`}>
              <div className="admin-panel__widget-head">
                <h3>System Status</h3>
                <span className={`admin-panel__health-badge admin-panel__health-badge--${healthOverall}`}>
                  {healthStatusLabel(healthOverall)}
                </span>
              </div>
              <div className="admin-panel__promo-visual">
                <div className="admin-panel__promo-shield">
                  {healthOverall === 'healthy' ? (
                    <ShieldCheck size={36} />
                  ) : (
                    <AlertTriangle size={36} />
                  )}
                </div>
              </div>
              <p>{systemStatusCopy(healthOverall)}</p>
              <button
                type="button"
                className="admin-panel__promo-btn"
                onClick={fetchHealth}
                disabled={healthLoading}
              >
                {healthLoading ? 'Checking…' : 'Run Health Check'}
              </button>
            </div>
          </div>
        </>
      )}

      {tab === 'users' && (
        <AdminUsersSection
          users={users}
          onVerify={toggleAuthorVerification}
          onDelete={deleteUser}
        />
      )}

      {tab === 'authors' && (
        <AdminAuthorsSection
          authors={authors}
          onVerify={verifyAuthor}
          onDelete={deleteAuthor}
        />
      )}

      {tab === 'content' && (
        <div>
          <h2 className="admin-panel__section-title">Content Moderation</h2>
          {pendingMaterials.length === 0 ? (
            <div className="empty-state"><Package size={48} /><h3>No pending content</h3></div>
          ) : (
            <div className="admin-panel__list">
              {pendingMaterials.map((m) => (
                <div key={m.id} className="admin-panel__list-item">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span className={`badge badge-${m.type.toLowerCase()}`}>{m.type}</span>
                      <h3>{m.title}</h3>
                    </div>
                    <p>by {m.author?.full_name} · ₹{m.price} · {m.university}</p>
                  </div>
                  <div className="admin-panel__list-actions">
                    <button type="button" className="btn btn-success btn-sm" onClick={() => moderateMaterial(m.id, 'approve')}>
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => moderateMaterial(m.id, 'reject')}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
