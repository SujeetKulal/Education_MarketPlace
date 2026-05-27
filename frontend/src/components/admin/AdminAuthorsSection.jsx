import { useMemo, useState } from 'react'
import {
  Search, Eye, Trash2, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, UserCheck, ExternalLink,
} from 'lucide-react'
import '../../styles/AdminUsers.css'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
]

function authorInitials(author) {
  const name = (author.full_name || author.email || '?').trim()
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

function getAuthorStatus(author) {
  return author.is_verified ? 'verified' : 'pending'
}

function matchesSearch(author, query) {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  return (
    (author.full_name || '').toLowerCase().includes(q) ||
    (author.email || '').toLowerCase().includes(q) ||
    (author.university || '').toLowerCase().includes(q)
  )
}

export default function AdminAuthorsSection({
  authors,
  onVerify,
  onDelete,
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [viewAuthor, setViewAuthor] = useState(null)

  const filtered = useMemo(() => {
    return authors.filter((author) => {
      if (statusFilter && getAuthorStatus(author) !== statusFilter) return false
      return matchesSearch(author, search)
    })
  }, [authors, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageAuthors = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const rangeFrom = filtered.length === 0 ? 0 : pageStart + 1
  const rangeTo = Math.min(pageStart + PAGE_SIZE, filtered.length)

  return (
    <section className="admin-users">
      <div className="admin-users__toolbar">
        <label className="admin-users__search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search by name, email or university..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </label>
        <select
          className="admin-users__select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="admin-users__table-wrap">
        {filtered.length === 0 ? (
          <div className="admin-users__empty">
            <UserCheck size={48} />
            <h3>No authors found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <table className="admin-users__table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Status</th>
                <th>Joined On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageAuthors.map((author) => {
                const status = getAuthorStatus(author)
                const joined = formatJoined(author.created_at)
                return (
                  <tr key={author.id}>
                    <td>
                      <div className="admin-users__user-cell">
                        {author.avatar_url ? (
                          <img
                            src={author.avatar_url}
                            alt=""
                            className="admin-users__avatar admin-users__avatar--img"
                          />
                        ) : (
                          <span className="admin-users__avatar">{authorInitials(author)}</span>
                        )}
                        <div>
                          <div className="admin-users__author-name-row">
                            <strong>{author.full_name || 'Unnamed Author'}</strong>
                            <span className={`admin-users__verify-tag ${author.is_verified ? 'admin-users__verify-tag--yes' : 'admin-users__verify-tag--no'}`}>
                              {author.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
                            </span>
                          </div>
                          <span>
                            {author.email || 'No email'}
                            {author.university ? ` · ${author.university}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-users__status admin-users__status--${status}`}>
                        {status === 'pending' && <span className="admin-users__status-dot" />}
                        {status === 'verified' && <CheckCircle size={14} />}
                        {status === 'pending' ? 'Pending' : 'Verified'}
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
                          title="View author"
                          onClick={() => setViewAuthor(author)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-users__icon-btn admin-users__icon-btn--delete"
                          title="Delete author"
                          onClick={() => onDelete(author)}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          type="button"
                          className={`admin-users__verify-btn ${author.is_verified ? 'admin-users__verify-btn--unverify' : 'admin-users__verify-btn--verify'}`}
                          onClick={() => onVerify(author)}
                        >
                          {author.is_verified ? (
                            <><XCircle size={14} /> Unverify</>
                          ) : (
                            <><CheckCircle size={14} /> Verify</>
                          )}
                        </button>
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
            Showing {rangeFrom} to {rangeTo} of {filtered.length} author{filtered.length !== 1 ? 's' : ''}
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

      {viewAuthor && (
        <div className="admin-users__modal-overlay" onClick={() => setViewAuthor(null)} role="presentation">
          <div
            className="admin-users__modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="admin-author-view-title"
          >
            <h2 id="admin-author-view-title">Author Details</h2>
            <dl className="admin-users__detail-list">
              <dt>Name</dt>
              <dd>{viewAuthor.full_name || '—'}</dd>
              <dt>Email</dt>
              <dd>{viewAuthor.email || '—'}</dd>
              <dt>University</dt>
              <dd>{viewAuthor.university || '—'}</dd>
              <dt>Status</dt>
              <dd style={{ textTransform: 'capitalize' }}>{getAuthorStatus(viewAuthor)}</dd>
              <dt>Verification</dt>
              <dd>{viewAuthor.is_verified ? 'Verified' : 'Pending review'}</dd>
              {viewAuthor.verification_docs_url && (
                <>
                  <dt>Documents</dt>
                  <dd>
                    <a
                      href={viewAuthor.verification_docs_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-users__doc-link"
                    >
                      View verification docs <ExternalLink size={14} />
                    </a>
                  </dd>
                </>
              )}
              <dt>Joined</dt>
              <dd>
                {formatJoined(viewAuthor.created_at).date}
                {formatJoined(viewAuthor.created_at).time && ` at ${formatJoined(viewAuthor.created_at).time}`}
              </dd>
            </dl>
            <button type="button" className="btn btn-primary" onClick={() => setViewAuthor(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
