import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AppDemo from './components/AppDemo'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Stats from './components/Stats'
import ForBusiness from './components/ForBusiness'
import Vs1C from './components/Vs1C'
import CashbackTeaser from './components/CashbackTeaser'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import { SubscriptionProvider } from './context/SubscriptionContext'

function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (user) return <Navigate to="/dashboard" replace />

  const goDemo = () => navigate('/demo')

  return (
    <div className="min-h-screen bg-dark font-sans overflow-x-hidden">
      <Navbar onOpenModal={goDemo} onOpenLogin={goDemo} />
      <Hero onOpenModal={goDemo} />
      <AppDemo />
      <CashbackTeaser onOpenModal={goDemo} />
      <Features />
      <HowItWorks onOpenModal={goDemo} />
      <Stats />
      <Vs1C onOpenModal={goDemo} />
      <ForBusiness onOpenModal={goDemo} />
      <Pricing onOpenModal={goDemo} />
      <Footer />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo/*" element={<Dashboard demo />} />
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <SubscriptionProvider>
                <Dashboard />
              </SubscriptionProvider>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
