import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

export default function SecureVideoViewer() {
  const { materialId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('Secure Video Viewer')
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/materials/${materialId}/access/`)
        if (data.type !== 'VIDEO') {
          setError('This material is not a video.')
          return
        }
        setTitle(data.title || 'Secure Video Viewer')
        setVideoUrl(data.url)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load video access.')
      } finally {
        setLoading(false)
      }
    }
    loadVideo()
  }, [materialId])

  useEffect(() => {
    const blockContext = (e) => e.preventDefault()
    const blockKeys = (e) => {
      const k = String(e.key || '').toLowerCase()
      const blocked = (e.ctrlKey && (k === 's' || k === 'u')) || k === 'printscreen'
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
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ color: '#cbd5e1' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', flex: 1 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>
          <ShieldAlert size={14} /> Protected View
        </div>
      </div>

      {loading && <div className="loading-screen"><div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#0052CC' }} /></div>}
      {!loading && error && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#fda4af' }}>{error}</div>}

      {!loading && !error && videoUrl && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 1024, aspectRatio: '16/9', background: 'black', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.45)' }}>
            <video
              src={videoUrl}
              controls
              controlsList="nodownload"
              disablePictureInPicture
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
