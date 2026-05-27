import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import QuizPlayer from '../components/assessments/QuizPlayer'
import ScoreSummary from '../components/assessments/ScoreSummary'

export default function QuizPage() {
  const { materialId } = useParams()
  const [mcq, setMcq] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMCQ() }, [materialId])

  const fetchMCQ = async () => {
    try {
      // Find the MCQ by material ID — we get the material's MCQ set
      const { data } = await api.get(`/assessments/material/${materialId}/take/`)
      setMcq(data)
    } catch (err) {
      console.error('Failed to load quiz:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (submission) => {
    try {
      const { data } = await api.post(`/assessments/material/${materialId}/submit/`, submission)
      setResults(data)
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed')
    }
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!mcq) return <div className="page-container"><p>Quiz not found or access denied.</p></div>

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: 800 }}>
      {results ? (
        <ScoreSummary results={results} />
      ) : (
        <QuizPlayer mcq={mcq} onSubmit={handleSubmit} />
      )}
    </div>
  )
}
