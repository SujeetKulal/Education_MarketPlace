import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react'

export default function SecurePdfViewer() {
  const { materialId } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [title, setTitle] = useState('Secure PDF Viewer')
  const [pageCount, setPageCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageImageSrc, setPageImageSrc] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pageLoading, setPageLoading] = useState(false)

  const viewerStamp = useMemo(() => {
    const who = profile?.email || profile?.full_name || 'Authorized User'
    return `${who} • Protected`
  }, [profile])

  useEffect(() => {
    const loadMeta = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/materials/${materialId}/pdf/meta/`)
        setTitle(data.title || 'Secure PDF Viewer')
        setPageCount(data.pages || 0)
        setPage(1)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load secure PDF metadata.')
      } finally {
        setLoading(false)
      }
    }
    loadMeta()
  }, [materialId])

  useEffect(() => {
    if (!pageCount || !page) return
    let objectUrl = ''

    const loadPage = async () => {
      setPageLoading(true)
      try {
        const res = await api.get(`/materials/${materialId}/pdf/page/${page}/`, {
          responseType: 'blob',
        })
        objectUrl = URL.createObjectURL(res.data)
        setPageImageSrc(objectUrl)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to render page image.')
      } finally {
        setPageLoading(false)
      }
    }

    loadPage()
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [materialId, page, pageCount])

  useEffect(() => {
    const blockContext = (e) => e.preventDefault()
    const blockKeys = (e) => {
      const k = String(e.key || '').toLowerCase()
      const blocked = (e.ctrlKey && (k === 's' || k === 'p' || k === 'u')) || k === 'printscreen'
      if (blocked) e.preventDefault()
    }
    window.addEventListener('contextmenu', blockContext)
    window.addEventListener('keydown', blockKeys)
    return () => {
      window.removeEventListener('contextmenu', blockContext)
      window.removeEventListener('keydown', blockKeys)
    }
  }, [])

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: '#0b1020' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(148,163,184,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>
          <ShieldAlert size={14} /> Protected View
        </div>
      </div>

      {loading && <div className="loading-screen"><div className="spinner" /></div>}
      {!loading && error && <div className="page-container" style={{ color: '#fda4af' }}>{error}</div>}

      {!loading && !error && pageCount > 0 && (
        <>
          <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft size={16} /> Prev
            </button>
            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Page {page} / {pageCount}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
              Next <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', display: 'grid', placeItems: 'center', padding: 20 }}>
            <div style={{ position: 'relative', maxWidth: 980, width: '100%' }}>
              {pageLoading && <div className="loading-screen"><div className="spinner" /></div>}
              <img
                src={pageImageSrc}
                alt={`PDF page ${page}`}
                style={{ width: '100%', borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.45)', userSelect: 'none' }}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: 10,
                  bottom: 10,
                  padding: '4px 8px',
                  borderRadius: 6,
                  color: 'rgba(255,255,255,0.8)',
                  background: 'rgba(0,0,0,0.45)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {viewerStamp}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
