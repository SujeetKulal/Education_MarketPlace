import { CheckCircle, XCircle, Trophy, Target, Clock } from 'lucide-react'

export default function ScoreSummary({ results }) {
  if (!results) return null

  const { score, total_correct, total_questions, passed, passing_score, results: questionResults } = results

  return (
    <div className="animate-fade-in">
      {/* Score Card */}
      <div className="card" style={{
        textAlign: 'center',
        marginBottom: 32,
        background: passed
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))',
        border: `1px solid ${passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          {passed ? (
            <Trophy size={36} style={{ color: 'var(--success)' }} />
          ) : (
            <Target size={36} style={{ color: 'var(--danger)' }} />
          )}
        </div>

        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 4 }}>
          <span style={{ color: passed ? 'var(--success)' : 'var(--danger)' }}>
            {Math.round(score)}%
          </span>
        </h2>

        <p style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: passed ? 'var(--success)' : 'var(--danger)',
          marginBottom: 8,
        }}>
          {passed ? '🎉 Congratulations! You Passed!' : 'Keep Trying! You Can Do Better!'}
        </p>

        <p style={{ color: 'var(--text-muted)' }}>
          {total_correct} out of {total_questions} correct • Passing score: {passing_score}%
        </p>
      </div>

      {/* Detailed Results */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
        Detailed Review
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(questionResults || []).map((q, i) => (
          <div
            key={i}
            className="card-flat"
            style={{
              borderLeft: `3px solid ${q.is_correct ? 'var(--success)' : 'var(--danger)'}`,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'start',
              gap: 10,
              marginBottom: 12,
            }}>
              {q.is_correct ? (
                <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
              ) : (
                <XCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
              )}
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Q{i + 1}: {q.question}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              marginBottom: q.explanation ? 12 : 0,
            }}>
              {(q.options || []).map((opt, optIdx) => (
                <div
                  key={optIdx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    background:
                      optIdx === q.correct_answer ? 'rgba(16, 185, 129, 0.15)' :
                      optIdx === q.user_answer && !q.is_correct ? 'rgba(239, 68, 68, 0.15)' :
                      'var(--bg-secondary)',
                    border: `1px solid ${
                      optIdx === q.correct_answer ? 'rgba(16, 185, 129, 0.3)' :
                      optIdx === q.user_answer && !q.is_correct ? 'rgba(239, 68, 68, 0.3)' :
                      'var(--border)'
                    }`,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{String.fromCharCode(65 + optIdx)}.</span>{' '}
                  {opt}
                </div>
              ))}
            </div>

            {q.explanation && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 6,
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}>
                💡 {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
