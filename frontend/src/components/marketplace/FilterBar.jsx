import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

export default function FilterBar({ filters, onFilterChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '', university: '', course: '',
      semester: '', type: '', sort: '-created_at',
    })
  }

  const hasActiveFilters = filters.university || filters.course ||
    filters.semester || filters.type

  return (
    <div style={{
      background: 'white',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    }}>
      {/* Search Bar */}
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        marginBottom: showAdvanced ? 16 : 0,
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--border)',
          borderRadius: 10,
          padding: '0 14px',
          transition: 'border-color 0.2s',
        }}>
          <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search materials..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              padding: '10px 0',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: showAdvanced ? 'none' : '1.5px solid var(--border)',
            background: showAdvanced ? 'var(--primary)' : 'white',
            color: showAdvanced ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s',
            position: 'relative',
            fontFamily: 'inherit',
          }}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasActiveFilters && (
            <div style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--secondary)',
            }} />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid transparent',
              background: 'transparent',
              color: 'var(--text-muted)',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
          animation: 'fadeIn 0.2s ease',
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">University</label>
            <input
              type="text"
              className="form-input"
              placeholder="Any university"
              value={filters.university || ''}
              onChange={(e) => handleChange('university', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course</label>
            <input
              type="text"
              className="form-input"
              placeholder="Any course"
              value={filters.course || ''}
              onChange={(e) => handleChange('course', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Semester</label>
            <select
              className="form-select"
              value={filters.semester || ''}
              onChange={(e) => handleChange('semester', e.target.value)}
            >
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={filters.type || ''}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="PDF">📕 PDF E-books</option>
              <option value="VIDEO">🎬 Video Lessons</option>
              <option value="MCQ">📝 MCQ Tests</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={filters.sort || '-created_at'}
              onChange={(e) => handleChange('sort', e.target.value)}
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-average_rating">Highest Rated</option>
              <option value="-total_sales">Most Popular</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
