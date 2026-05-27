import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import {
  MessageSquare, Users, Trophy, Image, Link2, MoreHorizontal,
  Pencil, Send, ThumbsUp, MessageCircle, Eye, ChevronLeft, ChevronRight,
  SlidersHorizontal, Reply,
} from 'lucide-react'
import Footer from '../components/layout/Footer'
import '../styles/ForumPage.css'

const PAGE_SIZE = 5

const TOPICS = [
  'General Discussion',
  'Books & Resources',
  'Study Materials',
  'Exam Preparation',
]

const AVATAR_COLORS = ['#0052CC', '#22C55E', '#F97316', '#3B82F6', '#EC4899', '#14B8A6']

function topicClass(topic) {
  if (topic === 'Books & Resources') return 'books'
  if (topic === 'Study Materials') return 'study'
  if (topic === 'Exam Preparation') return 'exam'
  return 'general'
}

function userInitials(user) {
  const name = (user?.full_name || user?.email || 'U').trim()
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function avatarColor(name) {
  let hash = 0
  const s = name || 'user'
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatPostTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  }
}

function estimateViews(post) {
  return (post.likes_count || 0) * 5 + (post.reply_count || 0) * 8 + 12
}

function snippet(text, max = 160) {
  if (!text) return ''
  const t = text.trim()
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

export default function ForumPage() {
  const { isAuthenticated, profile } = useAuth()
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ total_posts: 0, active_members: 0, top_contributors: 0 })
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState('DISCUSSION')
  const [newTopic, setNewTopic] = useState('General Discussion')

  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [page, setPage] = useState(1)

  const [expandedPost, setExpandedPost] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [likedIds, setLikedIds] = useState(new Set())

  useEffect(() => {
    fetchPosts()
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/forums/stats/')
      setStats(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/forums/')
      setPosts(data.results || data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const tabCounts = useMemo(() => {
    const mine = posts.filter((p) => p.user?.id === profile?.id).length
    const unanswered = posts.filter((p) => (p.reply_count || 0) === 0).length
    const following = isAuthenticated
      ? posts.filter(
          (p) =>
            p.user?.id === profile?.id ||
            likedIds.has(p.id),
        ).length
      : 0
    return {
      all: posts.length,
      mine,
      following,
      unanswered,
    }
  }, [posts, profile, likedIds, isAuthenticated])

  const filteredPosts = useMemo(() => {
    let list = [...posts]
    if (activeTab === 'mine' && profile?.id) {
      list = list.filter((p) => p.user?.id === profile.id)
    } else if (activeTab === 'unanswered') {
      list = list.filter((p) => (p.reply_count || 0) === 0)
    } else if (activeTab === 'following' && profile?.id) {
      list = list.filter(
        (p) => p.user?.id === profile.id || likedIds.has(p.id),
      )
    }
    if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else if (sortBy === 'liked') {
      list.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    } else {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return list
  }, [posts, activeTab, sortBy, profile, likedIds])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pagePosts = filteredPosts.slice(pageStart, pageStart + PAGE_SIZE)

  const createPost = async (e) => {
    e.preventDefault()
    if (!newContent.trim() || !newTitle.trim()) return
    setPosting(true)
    try {
      await api.post('/forums/', {
        title: newTitle,
        content: newContent,
        post_type: newType,
        topic: newTopic,
      })
      setNewTitle('')
      setNewContent('')
      setNewType('DISCUSSION')
      setNewTopic('General Discussion')
      await fetchPosts()
      await fetchStats()
    } catch {
      alert('Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  const loadPostDetail = async (postId) => {
    try {
      const { data } = await api.get(`/forums/${postId}/`)
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...data } : p)))
      return data
    } catch {
      return null
    }
  }

  const toggleExpand = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null)
      setReplyTo(null)
      return
    }
    setExpandedPost(postId)
    setReplyTo(postId)
    const existing = posts.find((p) => p.id === postId)
    if (!existing?.replies?.length) {
      await loadPostDetail(postId)
    }
  }

  const createReply = async (postId) => {
    if (!replyContent.trim()) return
    try {
      await api.post('/forums/', { content: replyContent, parent: postId })
      setReplyContent('')
      await loadPostDetail(postId)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, reply_count: (p.reply_count || 0) + 1 } : p,
        ),
      )
      await fetchStats()
    } catch {
      alert('Failed to reply')
    }
  }

  const toggleLike = async (postId) => {
    if (!isAuthenticated) return
    try {
      const { data } = await api.post(`/forums/${postId}/like/`)
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes_count: data.likes_count } : p)),
      )
      setLikedIds((prev) => {
        const next = new Set(prev)
        if (data.liked) next.add(postId)
        else next.delete(postId)
        return next
      })
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>
  }

  return (
    <>
      <div className="forum-page animate-fade-in">
        <header className="forum-page__header">
          <div className="forum-page__header-text">
            <h1>Community Forum</h1>
            <p>Discuss materials, ask questions, and connect with peers</p>
          </div>
          <div className="forum-page__stats">
            <div className="forum-page__stat">
              <div className="forum-page__stat-icon forum-page__stat-icon--posts">
                <MessageSquare size={20} />
              </div>
              <div>
                <strong>{stats.total_posts ?? posts.length}</strong>
                <span>Total Posts</span>
              </div>
            </div>
            <div className="forum-page__stat">
              <div className="forum-page__stat-icon forum-page__stat-icon--members">
                <Users size={20} />
              </div>
              <div>
                <strong>{stats.active_members ?? 0}</strong>
                <span>Active Members</span>
              </div>
            </div>
            <div className="forum-page__stat">
              <div className="forum-page__stat-icon forum-page__stat-icon--contributors">
                <Trophy size={20} />
              </div>
              <div>
                <strong>{stats.top_contributors ?? 0}</strong>
                <span>Top Contributors</span>
              </div>
            </div>
          </div>
        </header>

        {isAuthenticated ? (
          <section className="forum-page__compose">
            <h2>Start a New Discussion</h2>
            <p>Share your thoughts, ask questions, or start a discussion.</p>
            <form onSubmit={createPost}>
              <div className="forum-page__compose-row">
                <div className="forum-page__field">
                  <select
                    className="forum-page__select"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="QUESTION">Question</option>
                    <option value="DISCUSSION">Discussion</option>
                  </select>
                </div>
                <div className="forum-page__field">
                  <select
                    className="forum-page__select"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="forum-page__field">
                <Image size={18} className="forum-page__field-icon" />
                <input
                  className="forum-page__input"
                  placeholder="Enter a catchy title for your post..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="forum-page__field forum-page__field--textarea">
                <Pencil size={18} className="forum-page__field-icon" />
                <textarea
                  className="forum-page__textarea"
                  placeholder="What's on your mind?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                />
              </div>
              <div className="forum-page__compose-footer" style={{ justifyContent: 'flex-end' }}>
                <button type="submit" className="forum-page__post-btn" disabled={posting}>
                  <Send size={16} />
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="forum-page__compose" style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              <Link to="/login">Sign in</Link> to start a new discussion.
            </p>
          </section>
        )}

        <div className="forum-page__filters">
          <div className="forum-page__tabs">
            {[
              { id: 'all', label: 'All Discussions', count: tabCounts.all },
              { id: 'mine', label: 'My Posts', count: tabCounts.mine },
              { id: 'following', label: 'Following', count: tabCounts.following },
              { id: 'unanswered', label: 'Unanswered', count: tabCounts.unanswered },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`forum-page__tab ${activeTab === tab.id ? 'forum-page__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id)
                  setPage(1)
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <div className="forum-page__filter-right">
            <select
              className="forum-page__sort"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(1)
              }}
              aria-label="Sort discussions"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="liked">Most Liked</option>
            </select>
            <button type="button" className="forum-page__filter-btn" aria-label="Filters">
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="forum-page__empty">
            <MessageSquare size={48} />
            <h3>No discussions found</h3>
            <p>Be the first to start a conversation in this category.</p>
          </div>
        ) : (
          <div className="forum-page__list">
            {pagePosts.map((post) => {
              const name = post.user?.full_name || 'User'
              const { date, time } = formatPostTime(post.created_at)
              const postType = (post.post_type || 'DISCUSSION').toLowerCase()
              const topic = post.topic || 'General Discussion'
              return (
                <article key={post.id} className="forum-page__card">
                  <div className="forum-page__card-top">
                    <div
                      className="forum-page__avatar"
                      style={{ background: avatarColor(name) }}
                    >
                      {userInitials(post.user)}
                    </div>
                    <div className="forum-page__card-body">
                      <div className="forum-page__card-meta">
                        <div className="forum-page__card-meta-left">
                          <span className={`forum-page__type-badge forum-page__type-badge--${postType}`}>
                            {post.post_type || 'DISCUSSION'}
                          </span>
                          <span className="forum-page__author">{name}</span>
                        </div>
                        <div className="forum-page__time">
                          {date}<br />{time}
                        </div>
                      </div>
                      {post.title && (
                        <h3 className="forum-page__card-title">{post.title}</h3>
                      )}
                      <p className="forum-page__card-snippet">{snippet(post.content)}</p>
                      <div className="forum-page__card-bottom">
                        <div className="forum-page__card-stats">
                          <button type="button" onClick={() => toggleLike(post.id)}>
                            <ThumbsUp size={14} /> {post.likes_count || 0}
                          </button>
                          <button type="button" onClick={() => toggleExpand(post.id)}>
                            <MessageCircle size={14} /> {post.reply_count || 0}
                          </button>
                          <span>
                            <Eye size={14} /> {estimateViews(post)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`forum-page__topic-tag forum-page__topic-tag--${topicClass(topic)}`}>
                            {topic}
                          </span>
                        </div>
                      </div>

                      {expandedPost === post.id && (
                        <div className="forum-page__replies">
                          {(post.replies || []).map((reply) => (
                            <div key={reply.id} className="forum-page__reply">
                              <div className="forum-page__reply-meta">
                                <strong>{reply.user?.full_name || 'User'}</strong>
                                <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                              </div>
                              <p>{reply.content}</p>
                            </div>
                          ))}
                          {isAuthenticated && replyTo === post.id && (
                            <div className="forum-page__reply-form">
                              <input
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') createReply(post.id)
                                }}
                              />
                              <button
                                type="button"
                                className="forum-page__post-btn"
                                onClick={() => createReply(post.id)}
                              >
                                <Reply size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {filteredPosts.length > 0 && (
          <div className="forum-page__pagination">
            <button
              type="button"
              className="forum-page__page-btn"
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
                className={`forum-page__page-num ${n === safePage ? 'forum-page__page-num--active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="forum-page__page-btn"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
