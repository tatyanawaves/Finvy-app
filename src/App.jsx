import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'

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
import { useEffect, useState } from 'react'

const presentationFile = '/Finvy - AI Finance.pptx'

function LandingPage() {
  const { user } = useAuth()
  const { lang } = useLanguage()
  const [authModal, setAuthModal] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('business')
  const [selectedPeriod, setSelectedPeriod] = useState('half')

  if (user) return <Navigate to="/dashboard" replace />

  const openRegister = (plan = 'business', period = 'half') => {
    setSelectedPlan(plan || 'business')
    setSelectedPeriod(period || 'half')
    setAuthModal('register')
  }
  const openLogin = () => setAuthModal('login')
  const startProduct = () => openRegister('business', 'half')

  return (
    <div className="min-h-screen bg-[#24272b] font-sans overflow-x-hidden">
      <Navbar onOpenModal={startProduct} onOpenLogin={openLogin} />
      <Hero onOpenModal={startProduct} />
      <AppDemo />
      <Features />
      <HowItWorks onOpenModal={startProduct} />
      <ForBusiness onOpenModal={startProduct} />
      <Pricing onOpenModal={startProduct} />
      {lang !== 'en' && <CashbackTeaser onOpenModal={startProduct} />}
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

function DownloadPresentationPage() {
  useEffect(() => {
    const link = document.createElement('a')
    link.href = presentationFile
    link.download = 'Finvy - AI Finance.pptx'
    document.body.appendChild(link)

    const timer = window.setTimeout(() => {
      link.click()
      link.remove()
    }, 250)

    return () => {
      window.clearTimeout(timer)
      link.remove()
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#f8faf8] text-[#24272b] flex items-center justify-center px-6 font-sans">
      <section className="w-full max-w-xl text-center">
        <p className="text-sm uppercase tracking-[0.22em] text-[#6f756f] mb-5">
          Finvy pitch deck
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-6">
          Скачивание презентации началось
        </h1>
        <p className="text-lg sm:text-xl text-[#5f675f] leading-relaxed mb-8">
          Если файл не открылся автоматически, нажмите кнопку ниже.
        </p>
        <a
          href={presentationFile}
          download="Finvy - AI Finance.pptx"
          className="inline-flex min-h-14 items-center justify-center rounded-lg bg-[#24272b] px-8 text-base font-semibold text-white transition hover:bg-[#111315] focus:outline-none focus:ring-4 focus:ring-[#99f0c8]"
        >
          Скачать презентацию
        </a>
      </section>
    </main>
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
          <Route path="/download/*" element={<DownloadPresentationPage />} />
          <Route path="/demo/*" element={<Navigate to="/dashboard" replace />} />
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
