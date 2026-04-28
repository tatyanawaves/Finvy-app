import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'

const ACCOUNT_TYPES = [
  { key: 'bank',    label: 'Bank',    icon: '🏦', color: '#4F8EF7' },
  { key: 'cash',    label: 'Cash',    icon: '💵', color: '#F59E0B' },
  { key: 'card',    label: 'Card',    icon: '💳', color: '#8B5CF6' },
  { key: 'crypto',  label: 'Crypto',  icon: '₿',  color: '#F97316' },
  { key: 'savings', label: 'Savings', icon: '🏺', color: '#4F8EF7' },
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'UAH', 'KZT', 'PLN', 'CZK', 'RUB']

const LABELS = {
  en: { title: 'Add Account', name: 'Account name *', namePlaceholder: 'e.g. Main bank, Cash', type: 'Account type', currency: 'Currency', balance: 'Initial balance', create: 'Create Account', creating: 'Creating...' },
  ru: { title: 'Добавить счёт', name: 'Название *', namePlaceholder: 'Например: Основной банк, Наличные', type: 'Тип счёта', currency: 'Валюта', balance: 'Начальный баланс', create: 'Создать счёт', creating: 'Создание...' },
  kz: { title: 'Шот қосу', name: 'Атауы *', namePlaceholder: 'Мыс.: Негізгі банк, Қолма-қол', type: 'Шот түрі', currency: 'Валюта', balance: 'Бастапқы баланс', create: 'Шот жасау', creating: 'Жасалуда...' },
}

export default function AddAccountModal({ userId, onClose, onSuccess }) {
  const { lang } = useLanguage()
  const L = LABELS[lang] || LABELS.en

  const [name, setName] = useState('')
  const [type, setType] = useState('bank')
  const [currency, setCurrency] = useState('USD')
  const [balance, setBalance] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Account name is required'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('accounts').insert({
      user_id: userId,
      name: name.trim(),
      type,
      currency,
      balance: parseFloat(balance) || 0,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    onSuccess()
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#4F8EF7]/40 transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#161616] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-white font-semibold text-sm">{L.title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">{L.name}</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={L.namePlaceholder}
              className={inputClass}
              autoFocus
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">{L.type}</label>
            <div className="grid grid-cols-5 gap-1.5">
              {ACCOUNT_TYPES.map(at => (
                <button
                  key={at.key}
                  type="button"
                  onClick={() => setType(at.key)}
                  className={`py-2.5 rounded-xl text-center text-xs transition-all ${
                    type === at.key
                      ? 'bg-white/10 text-white border border-white/20 scale-[1.02]'
                      : 'bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <div className="text-base mb-0.5">{at.icon}</div>
                  <div className="text-[10px]">{at.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Currency + Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">{L.currency}</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c} style={{ background: '#1a1a1a' }}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">{L.balance}</label>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={e => setBalance(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>

          {/* Account preview */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
              type === 'bank' ? 'bg-[#4F8EF7]/20' :
              type === 'cash' ? 'bg-yellow-400/20' :
              type === 'card' ? 'bg-purple-500/20' :
              type === 'crypto' ? 'bg-orange-500/20' : 'bg-[#4F8EF7]/20'
            }`}>
              {ACCOUNT_TYPES.find(a => a.key === type)?.icon}
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">{name || L.namePlaceholder.split(',')[0]}</p>
              <p className="text-white/30 text-xs">{currency} · {parseFloat(balance || 0).toLocaleString('en', { maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold bg-[#4F8EF7] text-white hover:bg-[#4F8EF7]/90 disabled:opacity-50 transition-all"
          >
            {loading ? L.creating : L.create}
          </button>
        </form>
      </div>
    </div>
  )
}
