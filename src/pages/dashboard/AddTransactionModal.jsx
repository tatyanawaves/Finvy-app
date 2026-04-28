import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'

const CATEGORIES_I18N = {
  en: {
    income: ['Sales', 'Services', 'Investments', 'Loans', 'Other Income'],
    expense: ['Salaries', 'Rent', 'Marketing', 'Software', 'Supplies', 'Taxes', 'Utilities', 'Travel', 'Other'],
  },
  ru: {
    income: ['Продажи', 'Услуги', 'Инвестиции', 'Займы', 'Прочий доход'],
    expense: ['Зарплата', 'Аренда', 'Маркетинг', 'Софт/подписки', 'Закупки', 'Налоги', 'Коммуналка', 'Транспорт/логистика', 'Другое'],
  },
  kz: {
    income: ['Сатылымдар', 'Қызметтер', 'Инвестициялар', 'Қарыздар', 'Басқа кіріс'],
    expense: ['Жалақы', 'Жалға алу', 'Маркетинг', 'Бағдарлама', 'Сатып алу', 'Салықтар', 'Коммуналдық', 'Көлік', 'Басқа'],
  },
}

export default function AddTransactionModal({ type: initialType, userId, accounts, onClose, onSuccess }) {
  const { t, lang } = useLanguage()
  const CATEGORIES = { ...(CATEGORIES_I18N[lang] || CATEGORIES_I18N.en), transfer: [] }
  const [type, setType] = useState(initialType || 'income')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [accountId, setAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const TYPE_CONFIG = {
    income:   { amountColor: 'text-mint',    icon: '+' },
    expense:  { amountColor: 'text-red-400', icon: '−' },
    transfer: { amountColor: 'text-white',   icon: '⇄' },
  }
  const cfg = TYPE_CONFIG[type]

  useEffect(() => {
    if (accounts?.length > 0 && !accountId) {
      setAccountId(accounts[0].id)
    }
  }, [accounts])

  useEffect(() => {
    setCategory('')
  }, [type])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!amount || isNaN(parseFloat(amount))) {
      setError(t.errValidAmount)
      return
    }
    if (!accountId) {
      setError(t.errSelectAccount)
      return
    }
    if (type === 'transfer' && !toAccountId) {
      setError(t.errSelectDestAccount)
      return
    }
    if (type === 'transfer' && accountId === toAccountId) {
      setError(t.errDiffAccounts)
      return
    }

    setLoading(true)
    const amt = parseFloat(amount)

    try {
      if (type === 'transfer') {
        const { error: err1 } = await supabase.from('transactions').insert({
          user_id: userId,
          type: 'expense',
          amount: amt,
          description: description || `${t.transfer} → ${accounts.find(a => a.id === toAccountId)?.name}`,
          accountId: accountId,
          date,
          comment,
          category: t.transfer,
        })
        if (err1) throw err1

        const { error: err2 } = await supabase.from('transactions').insert({
          user_id: userId,
          type: 'income',
          amount: amt,
          description: description || `${t.transfer} ← ${accounts.find(a => a.id === accountId)?.name}`,
          accountId: toAccountId,
          date,
          comment,
          category: t.transfer,
        })
        if (err2) throw err2

        const fromAcc = accounts.find(a => a.id === accountId)
        const toAcc = accounts.find(a => a.id === toAccountId)
        await supabase.from('accounts').update({ balance: (fromAcc.balance || 0) - amt }).eq('id', accountId)
        await supabase.from('accounts').update({ balance: (toAcc.balance || 0) + amt }).eq('id', toAccountId)
      } else {
        const { error: txErr } = await supabase.from('transactions').insert({
          user_id: userId,
          type,
          amount: amt,
          description: description || (type === 'income' ? t.income : t.expense),
          accountId: accountId,
          date,
          comment,
          category: category || null,
        })
        if (txErr) throw txErr

        const acc = accounts.find(a => a.id === accountId)
        const delta = type === 'income' ? amt : -amt
        await supabase.from('accounts').update({ balance: (acc.balance || 0) + delta }).eq('id', accountId)
      }

      onSuccess()
    } catch (err) {
      setError(err.message || t.errSomethingWrong)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors`

  const TYPE_LABELS = {
    income: t.income,
    expense: t.expense,
    transfer: t.transfer,
  }

  const ADD_LABELS = {
    income: t.addTitle?.income || t.income,
    expense: t.addTitle?.expense || t.expense,
    transfer: t.addTitle?.transfer || t.transfer,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          {/* Type switcher */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            {['income', 'expense', 'transfer'].map(tp => (
              <button
                key={tp}
                onClick={() => setType(tp)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  type === tp
                    ? tp === 'income' ? 'bg-mint text-dark'
                      : tp === 'expense' ? 'bg-red-500 text-white'
                      : 'bg-white/20 text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {TYPE_LABELS[tp]}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">{t.amount} *</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${cfg.amountColor}`}>
                {cfg.icon}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className={`${inputClass} pl-8 text-xl font-bold ${cfg.amountColor}`}
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">{t.description}</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={type === 'transfer' ? t.optionalNote : ''}
              className={inputClass}
            />
          </div>

          {/* Account */}
          <div className={type === 'transfer' ? 'grid grid-cols-2 gap-3' : ''}>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">
                {type === 'transfer' ? t.from : t.account} *
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">{t.selectAccount}</option>
                {accounts?.map(acc => (
                  <option key={acc.id} value={acc.id} style={{ background: '#1a1a1a' }}>
                    {acc.name} ({(acc.balance || 0).toLocaleString('en', { maximumFractionDigits: 0 })})
                  </option>
                ))}
              </select>
            </div>
            {type === 'transfer' && (
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">{t.to} *</label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">{t.selectAccount}</option>
                  {accounts?.filter(a => a.id !== accountId).map(acc => (
                    <option key={acc.id} value={acc.id} style={{ background: '#1a1a1a' }}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category (not for transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">{t.category}</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">{t.noCategory}</option>
                {CATEGORIES[type].map(cat => (
                  <option key={cat} value={cat} style={{ background: '#1a1a1a' }}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date + Comment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">{t.date}</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">{t.comment}</label>
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={t.optionalNote}
                className={inputClass}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              type === 'income'
                ? 'bg-mint text-dark hover:bg-mint/90'
                : type === 'expense'
                ? 'bg-red-500 text-white hover:bg-red-500/90'
                : 'bg-white/20 text-white hover:bg-white/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {t.saving}
              </span>
            ) : (
              ADD_LABELS[type]
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
