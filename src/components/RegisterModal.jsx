import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanding } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'

const benefitIcons = ['💸', '📊', '📅', '🧾', '🤝']

const countries = [
  { code: '+7', flag: '🇰🇿', name: 'KZ' },
  { code: '+7', flag: '🇷🇺', name: 'RU' },
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+380', flag: '🇺🇦', name: 'UA' },
  { code: '+44', flag: '🇬🇧', name: 'GB' },
]

function StepOne({ onNext, lt }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState(countries[0])
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = lt.regErrEmail
    if (!password || password.length < 6) e.password = lt.regErrPassword
    if (!phone) e.phone = lt.regErrPhone
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = async () => {
    if (!validate()) return
    setLoading(true)
    setApiError('')
    const { data, error } = await signUp({ email, password })
    if (error) { setLoading(false); setApiError(error.message); return }
    if (!data?.session) {
      setLoading(false)
      setConfirmationEmail(email)
      return
    }
    setLoading(false)
    onNext({ email, password, phone: country.code + phone })
  }

  if (confirmationEmail) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-mint/15 flex items-center justify-center text-2xl">✓</div>
        <h3 className="text-xl font-bold text-gray-800">Проверьте почту</h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
          Мы отправили письмо на <span className="font-semibold text-gray-700">{confirmationEmail}</span>.
          Перейдите по ссылке в письме, чтобы подтвердить аккаунт и войти в Finvy.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-[#24272b] font-bold text-sm">1</div>
        <div className="flex-1 h-px bg-gray-200" />
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-sm">2</div>
      </div>

      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder={lt.regEmail}
        className={`w-full border rounded-xl px-4 py-3.5 text-sm outline-none bg-gray-50 focus:border-mint transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200'}`} />
      {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}

      <div className="relative">
        <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
          placeholder={lt.regPassword}
          className={`w-full border rounded-xl px-4 py-3.5 text-sm outline-none bg-gray-50 focus:border-mint transition-colors pr-11 ${errors.password ? 'border-red-400' : 'border-gray-200'}`} />
        <button type="button" onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/><circle cx="10" cy="10" r="2.5"/>
            {showPass && <line x1="3" y1="3" x2="17" y2="17"/>}
          </svg>
        </button>
      </div>
      {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>}

      <div className={`flex border rounded-xl overflow-hidden bg-gray-50 focus-within:border-mint transition-colors ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}>
        <select value={country.code + country.name} onChange={e => {
          const c = countries.find(c => c.code + c.name === e.target.value)
          if (c) setCountry(c)
        }} className="bg-gray-100 border-r border-gray-200 px-3 py-3.5 text-sm outline-none cursor-pointer">
          {countries.map(c => <option key={c.code + c.name} value={c.code + c.name}>{c.flag} {c.code}</option>)}
        </select>
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
          placeholder={lt.regPhone} className="flex-1 px-4 py-3.5 text-sm outline-none bg-transparent" />
      </div>
      {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1">{errors.phone}</p>}

      {apiError && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{apiError}</p>}

      <button onClick={handleContinue} disabled={loading}
        className="w-full py-4 rounded-xl font-bold text-[#24272b] text-base transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: 'linear-gradient(90deg, #4F8EF7, #5BC8F5)' }}>
        {loading ? lt.regCreating : lt.regContinue}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-400 text-sm">{lt.regOr}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button onClick={signInWithGoogle} className="w-full py-3.5 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
        Google
      </button>

      <div className="flex items-center justify-center gap-4 pt-1">
        {[
          { icon: '🛡', label: 'SSL Secure' },
          { icon: '🔒', label: '256-bit Encryption' },
          { icon: '✅', label: 'ISO/IEC 27001' },
        ].map(b => (
          <div key={b.label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="text-mint">{b.icon}</span>{b.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function StepTwo({ data, onClose, lt, selectedPlan, selectedPeriod }) {
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [employees, setEmployees] = useState('')
  const [isStudent, setIsStudent] = useState(null)
  const [revenue, setRevenue] = useState('')
  const [banks, setBanks] = useState([])
  const [expenses, setExpenses] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const navigate = useNavigate()

  const industries = lt.regIndustries ?? ['IT & Software', 'E-commerce', 'Retail', 'Services', 'Construction', 'Healthcare', 'Other']
  const sizes = lt.regSizes ?? ['1 (just me)', '2–5', '6–20', '21–50', '51+']

  const revenueRanges = lt.regRevenues ?? ['до 500 000 ₸', '500 000 – 2 млн ₸', '2 – 10 млн ₸', '10 – 50 млн ₸', '50+ млн ₸']
  const bankOptions = ['Kaspi', 'Halyk', 'Freedom', 'Jusan', 'Bereke', 'Home Credit', 'RBK', 'Другой']
  const expenseTypes = lt.regExpenseTypes ?? ['Зарплата', 'Аренда', 'Реклама', 'Закуп товаров', 'Логистика', 'Связь/IT', 'Налоги', 'Другое']

  const toggleArr = (arr, setArr, val) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  const handleDashboard = () => { onClose(); navigate('/dashboard') }

  const handleCheckout = async () => {
    if (selectedPlan === 'corporate') {
      // Corporate is contact-sales, just go to dashboard
      setSubmitted(true)
      return
    }

    setCheckoutLoading(true)
    setCheckoutError('')
    try {
      const res = await supabase.functions.invoke('create-checkout-session', {
        body: { planId: selectedPlan || 'business', period: selectedPeriod || 'half' },
      })
      if (res.error) throw new Error(res.error.message)
      if (res.data?.url) {
        window.location.href = res.data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setCheckoutError(err.message)
      // Fallback: go to dashboard anyway
      setSubmitted(true)
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-mint/20 flex items-center justify-center text-3xl">🎉</div>
        <h3 className="text-xl font-bold text-gray-800">{lt.regDoneTitle}</h3>
        <p className="text-gray-500 text-sm">{lt.regDoneSub}<br />{lt.regDoneSub2}</p>
        <button onClick={handleDashboard} className="mt-2 bg-[#24272b] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#24272b]/85 transition-colors">
          {lt.regGoDashboard}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-[#24272b] font-bold text-sm">✓</div>
        <div className="flex-1 h-px bg-mint" />
        <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-[#24272b] font-bold text-sm">2</div>
      </div>

      <p className="text-sm text-gray-500">{lt.regSetupTitle} <span className="text-[#4F8EF7] font-semibold">Finvy</span> {lt.regSetupTitleEnd}</p>

      {/* Company name */}
      <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
        placeholder={lt.regCompany}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none bg-gray-50 focus:border-mint transition-colors" />

      {/* Industry */}
      <select value={industry} onChange={e => setIndustry(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none bg-gray-50 focus:border-mint transition-colors text-gray-500">
        <option value="" disabled>{lt.regIndustry}</option>
        {industries.map(i => <option key={i} value={i}>{i}</option>)}
      </select>

      {/* Team size */}
      <div>
        <p className="text-sm text-gray-500 mb-2">{lt.regTeamSize}</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map(s => (
            <button key={s} onClick={() => setEmployees(s)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                employees === s ? 'border-mint bg-mint/10 text-[#24272b]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Student status */}
      <div>
        <p className="text-sm text-gray-500 mb-2">{lt.regStudentQ ?? 'Вы студент?'}</p>
        <div className="flex gap-2">
          {[
            { val: true, label: lt.regYes ?? 'Да' },
            { val: false, label: lt.regNo ?? 'Нет' },
          ].map(opt => (
            <button key={String(opt.val)} onClick={() => setIsStudent(opt.val)}
              className={`px-5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                isStudent === opt.val ? 'border-mint bg-mint/10 text-[#24272b]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Monthly revenue */}
      <div>
        <p className="text-sm text-gray-500 mb-2">{lt.regRevenueQ ?? 'Примерный месячный оборот'}</p>
        <div className="flex flex-wrap gap-2">
          {revenueRanges.map(r => (
            <button key={r} onClick={() => setRevenue(r)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                revenue === r ? 'border-mint bg-mint/10 text-[#24272b]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>{r}</button>
          ))}
        </div>
      </div>

      {/* Which banks */}
      <div>
        <p className="text-sm text-gray-500 mb-2">{lt.regBanksQ ?? 'Какие банки используете?'}</p>
        <div className="flex flex-wrap gap-2">
          {bankOptions.map(b => (
            <button key={b} onClick={() => toggleArr(banks, setBanks, b)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                banks.includes(b) ? 'border-mint bg-mint/10 text-[#24272b]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>{b}</button>
          ))}
        </div>
      </div>

      {/* Main expense categories */}
      <div>
        <p className="text-sm text-gray-500 mb-2">{lt.regExpensesQ ?? 'Основные статьи расходов'}</p>
        <div className="flex flex-wrap gap-2">
          {expenseTypes.map(e => (
            <button key={e} onClick={() => toggleArr(expenses, setExpenses, e)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                expenses.includes(e) ? 'border-mint bg-mint/10 text-[#24272b]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>{e}</button>
          ))}
        </div>
      </div>

      {/* Submit */}
      {checkoutError && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{checkoutError}</p>}
      <button onClick={handleCheckout} disabled={checkoutLoading}
        className="w-full py-4 rounded-xl font-bold text-[#24272b] text-base transition-opacity hover:opacity-90 flex-shrink-0 disabled:opacity-60"
        style={{ background: 'linear-gradient(90deg, #4F8EF7, #5BC8F5)' }}>
        {checkoutLoading ? (lt.regRedirecting ?? 'Redirecting to payment...') : lt.regStartTrial}
      </button>
    </div>
  )
}

export default function RegisterModal({ onClose, initialMode = 'register', selectedPlan = 'business', selectedPeriod = 'half' }) {
  const lt = useLanding()
  const [step, setStep] = useState(1)
  const [stepOneData, setStepOneData] = useState(null)
  const [mode, setMode] = useState(initialMode)
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const handleNext = (data) => { setStepOneData(data); setStep(2) }

  const handleLogin = async () => {
    setLoginLoading(true); setLoginError('')
    const { error } = await signIn({ email: loginEmail, password: loginPassword })
    setLoginLoading(false)
    if (error) { setLoginError(error.message); return }
    onClose(); navigate('/dashboard')
  }

  const benefits = lt.regBenefits ?? [
    'You control expenses and avoid cash gaps',
    'You know what generates profit and what eats up the budget',
    'You plan payments in advance and sleep more peacefully',
    'You make decisions based on real numbers, not gut feeling',
    'You work comfortably on your own or with a team (accountant)',
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-[#24272b]/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex overflow-hidden max-h-[90vh]">
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between w-2/5 p-10 text-white"
          style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #2563EB 50%, #1D4ED8 100%)' }}>
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">f</div>
              <span className="font-bold text-lg text-white">Finvy</span>
            </div>
            <p className="text-white/80 text-sm mb-2">{lt.regLeftSub}</p>
            <h2 className="text-2xl font-black leading-tight mb-8">{lt.regLeftTitle}</h2>
            <div className="space-y-4">
              {benefits.map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{benefitIcons[i]}</span>
                  <p className="text-white/85 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-white/10 rounded-xl p-3">
            <div className="bg-white/10 rounded-lg p-2 flex items-center gap-1 mb-2">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <div className="w-2 h-2 rounded-full bg-white/40" />
            </div>
            <div className="flex gap-2">
              <div className="w-1/3 bg-white/10 rounded p-2 space-y-1">
                {['Kaspi', 'Halyk', 'Наличные'].map(a => (
                  <div key={a} className="flex justify-between text-xs text-white/60">
                    <span>{a}</span><span>₸0</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-white/10 rounded p-2">
                <div className="flex gap-1 mb-2">
                  {['#4F8EF7', '#ffffff30', '#ffffff30'].map((c, i) => (
                    <div key={i} className="h-1 flex-1 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <div className="flex items-end gap-0.5 h-10">
                  {[4,7,5,8,6,9,7].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-mint/60" style={{ height: `${h*10}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800">
                {mode === 'login' ? lt.regLoginTitle : lt.regTitle}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {mode === 'login' ? lt.regNoAccount + ' ' : lt.regAlready + ' '}
                <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-mint font-semibold hover:underline">
                  {mode === 'login' ? lt.regSignUp : lt.regLogIn}
                </button>
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-500 flex-shrink-0">✕</button>
          </div>

          {mode === 'login' ? (
            <div className="flex flex-col gap-5">
              {loginError && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{loginError}</p>}
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                placeholder="Email" className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none bg-gray-50 focus:border-mint transition-colors" />
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                placeholder={lt.regPassword} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none bg-gray-50 focus:border-mint transition-colors"
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <button onClick={handleLogin} disabled={loginLoading}
                className="w-full py-4 rounded-xl font-bold text-[#24272b] text-base transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(90deg, #4F8EF7, #5BC8F5)' }}>
                {loginLoading ? lt.regLoggingIn : lt.regLogIn}
              </button>
              <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gray-200"/><span className="text-gray-400 text-sm">{lt.regOr}</span><div className="flex-1 h-px bg-gray-200"/></div>
              <button onClick={signInWithGoogle} className="w-full py-3.5 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                Google
              </button>
            </div>
          ) : step === 1
            ? <StepOne onNext={handleNext} lt={lt} />
            : <StepTwo data={stepOneData} onClose={onClose} lt={lt} selectedPlan={selectedPlan} selectedPeriod={selectedPeriod} />
          }
        </div>
      </div>
    </div>
  )
}
