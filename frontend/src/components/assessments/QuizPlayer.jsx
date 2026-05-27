import { useState, useEffect, useCallback } from 'react'
import { Timer, CheckCircle, XCircle, ArrowRight, ArrowLeft, Flag } from 'lucide-react'

export default function QuizPlayer({ mcq, onSubmit }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState((mcq?.timer_limit || 30) * 60) // in seconds
  const [isFinished, setIsFinished] = useState(false)

  // Timer
  useEffect(() => {
    if (isFinished || timeLeft <= 0) {
      if (timeLeft <= 0 && !isFinished) handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, isFinished])

  const questions = mcq?.questions || []
  const current = questions[currentIndex]
  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / totalQuestions) * 100

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [String(questionId)]: optionIndex }))
  }

  const handleSubmit = useCallback(() => {
    setIsFinished(true)
    const timeTaken = (mcq?.timer_limit || 30) * 60 - timeLeft
    onSubmit({ answers, time_taken: timeTaken })
  }, [answers, timeLeft, mcq, onSubmit])

  if (!current) return null

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>
            {mcq.material_title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Question {currentIndex + 1} of {totalQuestions} • {answeredCount} answered
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 'var(--radius-sm)',
          background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-elevated)',
          border: '1px solid',
          borderColor: timeLeft < 60 ? 'var(--danger)' : 'var(--border)',
          fontWeight: 700,
          fontSize: '1.1rem',
          fontVariantNumeric: 'tabular-nums',
          color: timeLeft < 60 ? 'var(--danger)' : 'var(--text-primary)',
        }}>
          <Timer size={18} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: 4,
        background: 'var(--bg-elevated)',
        borderRadius: 2,
        marginBottom: 24,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
          borderRadius: 2,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Question */}
      <div className="card-flat animate-fade-in" key={currentIndex} style={{ marginBottom: 24 }}>
        <p style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          marginBottom: 20,
          lineHeight: 1.5,
        }}>
          {current.question}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(current.options || []).map((option, i) => {
            const isSelected = answers[String(current.id)] === i
            return (
              <button
                key={i}
                onClick={() => selectAnswer(current.id, i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  background: isSelected ? 'var(--primary)' : 'transparent',
                  color: isSelected ? 'white' : 'var(--text-muted)',
                  flexShrink: 0,
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* Question Nav */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 24,
        padding: 16,
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
      }}>
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: currentIndex === i ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: answers[String(q.id)] !== undefined
                ? 'rgba(16, 185, 129, 0.2)'
                : currentIndex === i ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={16} /> Previous
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentIndex(i => Math.min(totalQuestions - 1, i + 1))}
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={answeredCount === 0}
          >
            <Flag size={16} /> Submit Quiz
          </button>
        )}
      </div>
    </div>
  )
}
