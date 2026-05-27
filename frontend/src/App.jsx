import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Marketplace from './pages/Marketplace'
import MaterialDetail from './pages/MaterialDetail'
import MyLibrary from './pages/MyLibrary'
import AuthorDashboard from './pages/AuthorDashboard'
import QuizPage from './pages/QuizPage'
import ForumPage from './pages/ForumPage'
import AdminPanel from './pages/AdminPanel'
import SecurePdfViewer from './pages/SecurePdfViewer'
import SecureVideoViewer from './pages/SecureVideoViewer'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/material/:id" element={<MaterialDetail />} />
          <Route path="/forums" element={<ForumPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Protected: Students */}
          <Route path="/library" element={
            <ProtectedRoute roles={['STUDENT', 'AUTHOR', 'ADMIN']}>
              <MyLibrary />
            </ProtectedRoute>
          } />

          <Route path="/quiz/:materialId" element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          } />

          <Route path="/viewer/pdf/:materialId" element={
            <ProtectedRoute roles={['STUDENT', 'AUTHOR', 'ADMIN']}>
              <SecurePdfViewer />
            </ProtectedRoute>
          } />

          <Route path="/viewer/video/:materialId" element={
            <ProtectedRoute roles={['STUDENT', 'AUTHOR', 'ADMIN']}>
              <SecureVideoViewer />
            </ProtectedRoute>
          } />

          {/* Protected: Authors */}
          <Route path="/author" element={
            <ProtectedRoute roles={['AUTHOR']}>
              <AuthorDashboard />
            </ProtectedRoute>
          } />

          {/* Protected: Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
