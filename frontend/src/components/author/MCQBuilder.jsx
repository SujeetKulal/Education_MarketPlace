import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'

export default function MCQBuilder({ questions, onChange }) {
  const [editingId, setEditingId] = useState(null)

  const addQuestion = () => {
    const newQ = {
      id: (questions?.length || 0) + 1,
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
    }
    onChange([...(questions || []), newQ])
    setEditingId(newQ.id)
  }

  const updateQuestion = (id, updates) => {
    onChange(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  const removeQuestion = (id) => {
    onChange(questions.filter(q => q.id !== id).map((q, i) => ({ ...q, id: i + 1 })))
  }

  const updateOption = (qId, optIndex, value) => {
    const q = questions.find(q => q.id === qId)
    const opts = [...q.options]
    opts[optIndex] = value
    updateQuestion(qId, { options: opts })
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
          Questions ({questions?.length || 0})
        </h3>
        <button type="button" className="btn btn-primary btn-sm" onClick={addQuestion}>
          <Plus size={16} /> Add Question
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {(questions || []).map((q, idx) => (
          <div key={q.id} className="card-flat" style={{
            border: editingId === q.id ? '1px solid var(--primary)' : '1px solid var(--border)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GripVertical size={16} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                <span className="badge badge-info">Q{idx + 1}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => removeQuestion(q.id)}
                style={{ color: 'var(--danger)' }}
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Question</label>
              <textarea
                className="form-textarea"
                value={q.question}
                onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                placeholder="Enter your question..."
                style={{ minHeight: 60 }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 12,
            }}>
              {q.options.map((opt, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correct_answer === i}
                    onChange={() => updateQuestion(q.id, { correct_answer: i })}
                    style={{ accentColor: 'var(--success)' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={opt}
                    onChange={(e) => updateOption(q.id, i, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Explanation (optional)</label>
              <input
                type="text"
                className="form-input"
                value={q.explanation || ''}
                onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                placeholder="Explain the correct answer..."
              />
            </div>
          </div>
        ))}
      </div>

      {(!questions || questions.length === 0) && (
        <div className="empty-state" style={{ padding: 40 }}>
          <p>No questions yet. Click "Add Question" to start building your test.</p>
        </div>
      )}
    </div>
  )
}
