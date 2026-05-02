import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AppDemo from './components/AppDemo'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import ForBusiness from './components/ForBusiness'
import CashbackTeaser from './components/CashbackTeaser'
import Pricing from './components/Pricing'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import RegisterModal from './components/RegisterModal'
import Dashboard from './pages/Dashboard'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { useState } from 'react'

function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [authModal, setAuthModal] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('business')
  const [selectedPeriod, setSelectedPeriod] = useState('half')

  if (user) return <Navigate to="/dashboard" replace />

  const goDemo = () => navigate('/demo')
  const openRegister = (plan = 'business', period = 'half') => {
    setSelectedPlan(plan || 'business')
    setSelectedPeriod(period || 'half')
    setAuthModal('register')
  }
  const openLogin = () => setAuthModal('login')

  return (
    <div className="min-h-screen bg-[#24272b] font-sans overflow-x-hidden">
      <Navbar onOpenModal={openRegister} onOpenLogin={openLogin} />
      {/* Hero CTA "Попробовать без регистрации" → goes straight to demo */}
      <Hero onOpenModal={goDemo} />
      <AppDemo />
      <CashbackTeaser onOpenModal={openRegister} />
      <Features />
      <HowItWorks onOpenModal={openRegister} />
      <ForBusiness onOpenModal={openRegister} />
      <Pricing onOpenModal={openRegister} />
      <ContactSection />
      <Footer />
      {authModal && (
        <RegisterModal
          initialMode={authModal}
          selectedPlan={selectedPlan}
          selectedPeriod={selectedPeriod}
          onClose={() => setAuthModal(null)}
        />
      )}
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
