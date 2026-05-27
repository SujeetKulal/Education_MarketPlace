import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Plus, Eye, Trash2, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Users,
} from 'lucide-react'

const PAGE_SIZE = 10

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'AUTHOR', label: 'Author' },
  { value: 'ADMIN', label: 'Admin' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
]

function getAccountStatus(user) {
  if (user.role === 'AUTHOR') {
    return user.is_verified ? 'verified' : 'pending'
  }
  return 'active'
}

function userInitials(user) {
  const name = (user.full_name || user.email || '?').trim()
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatJoined(iso) {
  if (!iso) return { date: '—', time: '' }
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  }
}

function matchesSearch(user, query) {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  return (
    (user.full_name || '').toLowerCase().includes(q) ||
    (user.email || '').toLowerCase().includes(q) ||
    (user.role || '').toLowerCase().includes(q) ||
    (user.university || '').toLowerCase().includes(q)
  )
}

export default function AdminUsersSection({
  users,
  onVerify,
  onDelete,
}) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [viewUser, setViewUser] = useState(null)

  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter && user.role !== roleFilter) return false
      if (statusFilter && getAccountStatus(user) !== statusFilter) return false
      return matchesSearch(user, search)
    })
  }, [users, search, roleFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageUsers = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const rangeFrom = filtered.length === 0 ? 0 : pageStart + 1
  const rangeTo = Math.min(pageStart + PAGE_SIZE, filtered.length)

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }

  return (
    <section className="admin-users">
      <div className="admin-users__toolbar">
        <label className="admin-users__search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </label>
        <select
          className="admin-users__select"
          value={roleFilter}
          onChange={handleFilterChange(setRoleFilter)}
          aria-label="Filter by role"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          className="admin-users__select"
          value={statusFilter}
          onChange={handleFilterChange(setStatusFilter)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <Link to="/register" className="admin-users__add-btn">
          <Plus size={18} />
          Add New User
        </Link>
      </div>

      <div className="admin-users__table-wrap">
        {filtered.length === 0 ? (
          <div className="admin-users__empty">
            <Users size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <table className="admin-users__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.map((user) => {
                const status = getAccountStatus(user)
                const joined = formatJoined(user.created_at)
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-users__user-cell">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="admin-users__avatar admin-users__avatar--img"
                          />
                        ) : (
                          <span className="admin-users__avatar">{userInitials(user)}</span>
                        )}
                        <div>
                          <strong>{user.full_name || 'Unnamed User'}</strong>
                          <span>
                            {user.email || 'No email'}
                            {user.university ? ` · ${user.university}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-users__role-cell">
                        <span className={`admin-users__role admin-users__role--${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                        {user.role === 'AUTHOR' && (
                          <span className={`admin-users__verify-tag ${user.is_verified ? 'admin-users__verify-tag--yes' : 'admin-users__verify-tag--no'}`}>
                            {user.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`admin-users__status admin-users__status--${status}`}>
                        {status === 'active' && <span className="admin-users__status-dot" />}
                        {status === 'pending' && <span className="admin-users__status-dot" />}
                        {status === 'verified' && <CheckCircle size={14} />}
                        {status === 'active' && 'Active'}
                        {status === 'pending' && 'Pending'}
                        {status === 'verified' && 'Verified'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-users__joined">
                        <strong>{joined.date}</strong>
                        {joined.time && <span>{joined.time}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="admin-users__actions">
                        <button
                          type="button"
                          className="admin-users__icon-btn admin-users__icon-btn--view"
                          title="View user"
                          onClick={() => setViewUser(user)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-users__icon-btn admin-users__icon-btn--delete"
                          title="Delete user"
                          onClick={() => onDelete(user)}
                        >
                          <Trash2 size={16} />
                        </button>
                        {user.role === 'AUTHOR' && (
                          <button
                            type="button"
                            className={`admin-users__verify-btn ${user.is_verified ? 'admin-users__verify-btn--unverify' : 'admin-users__verify-btn--verify'}`}
                            onClick={() => onVerify(user)}
                          >
                            {user.is_verified ? (
                              <><XCircle size={14} /> Unverify</>
                            ) : (
                              <><CheckCircle size={14} /> Verify</>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="admin-users__footer">
          <p>
            Showing {rangeFrom} to {rangeTo} of {filtered.length} user{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="admin-users__pagination">
            <button
              type="button"
              className="admin-users__page-btn"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`admin-users__page-num ${n === safePage ? 'admin-users__page-num--active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="admin-users__page-btn"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {viewUser && (
        <div className="admin-users__modal-overlay" onClick={() => setViewUser(null)} role="presentation">
          <div
            className="admin-users__modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="admin-user-view-title"
          >
            <h2 id="admin-user-view-title">User Details</h2>
            <dl className="admin-users__detail-list">
              <dt>Name</dt>
              <dd>{viewUser.full_name || '—'}</dd>
              <dt>Email</dt>
              <dd>{viewUser.email || '—'}</dd>
              <dt>Role</dt>
              <dd>{viewUser.role}</dd>
              <dt>University</dt>
              <dd>{viewUser.university || '—'}</dd>
              <dt>Status</dt>
              <dd style={{ textTransform: 'capitalize' }}>{getAccountStatus(viewUser)}</dd>
              {viewUser.role === 'AUTHOR' && (
                <>
                  <dt>Author verified</dt>
                  <dd>{viewUser.is_verified ? 'Yes' : 'No'}</dd>
                </>
              )}
              <dt>Joined</dt>
              <dd>
                {formatJoined(viewUser.created_at).date}
                {formatJoined(viewUser.created_at).time && ` at ${formatJoined(viewUser.created_at).time}`}
              </dd>
            </dl>
            <button type="button" className="btn btn-primary" onClick={() => setViewUser(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
