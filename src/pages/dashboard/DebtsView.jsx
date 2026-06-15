import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'

export default function DebtsView({ userId }) {
  const { t, lang } = useLanguage()
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchDebts()
  }, [])

  const fetchDebts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('person', { ascending: true })
    if (data) setDebts(data)
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    await supabase.from('debts').delete().eq('id', id)
    fetchDebts()
  }

  const myDebts = debts.filter(d => d.type === 'owe_them' || d.type === 'debt_out') // Я должен
  const othersDebts = debts.filter(d => d.type === 'they_owe' || d.type === 'debt_in') // Мне должны

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.debtsTitle || 'Долги'}</h1>
          <p className="text-white/50 text-sm mt-1">{t.debtsSubtitle || 'Кто должен вам и кому должны вы'}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-mint text-[#0a0a0a] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-mint/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-mint/10"
        >
          <span>+</span> {t.addDebt || 'Добавить долг'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-mint/20 border-t-mint rounded-full animate-spin" />
        </div>
      ) : debts.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🤝</div>
          <h3 className="text-white font-semibold mb-2">Нет активных долгов</h3>
          <p className="text-white/40 text-sm max-w-xs mx-auto">Добавляйте задолженности, чтобы бот мог напоминать о них.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Я должен */}
          <div className="space-y-4">
            <h3 className="text-red-400 text-xs font-bold uppercase tracking-wider ml-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Я должен
            </h3>
            <div className="space-y-3">
              {myDebts.map(debt => (
                <DebtItem key={debt.id} debt={debt} onDelete={handleDelete} />
              ))}
              {myDebts.length === 0 && <p className="text-white/20 text-xs italic ml-1">Никому не должен</p>}
            </div>
          </div>

          {/* Мне должны */}
          <div className="space-y-4">
            <h3 className="text-mint text-xs font-bold uppercase tracking-wider ml-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mint" />
              Мне должны
            </h3>
            <div className="space-y-3">
              {othersDebts.map(debt => (
                <DebtItem key={debt.id} debt={debt} onDelete={handleDelete} />
              ))}
              {othersDebts.length === 0 && <p className="text-white/20 text-xs italic ml-1">Никто не должен</p>}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddDebtModal 
          userId={userId} 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false)
            fetchDebts()
          }}
        />
      )}
    </div>
  )
}

function DebtItem({ debt, onDelete }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.05] transition-colors">
      <div>
        <h4 className="text-white font-medium">{debt.person}</h4>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-white/40 text-[11px]">{debt.description || 'Без описания'}</p>
          {debt.dueDate && (
            <span className="text-[10px] text-amber-400/60 font-medium bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/10">
              до {new Date(debt.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className={`font-bold tabular-nums ${debt.type.includes('owe_them') || debt.type.includes('out') ? 'text-white' : 'text-mint'}`}>
          {debt.amount.toLocaleString()} ₸
        </p>
        <button onClick={() => onDelete(debt.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100">
          🗑
        </button>
      </div>
    </div>
  )
}

function AddDebtModal({ userId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    person: '',
    amount: '',
    type: 'they_owe', // 'they_owe' | 'owe_them'
    description: '',
    dueDate: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.person || !form.amount) return
    setLoading(true)

    const { error } = await supabase.from('debts').insert({
      user_id: userId,
      person: form.person,
      amount: parseFloat(form.amount),
      type: form.type,
      description: form.description,
      dueDate: form.dueDate || null
    })

    if (!error) onSuccess()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-lg font-bold text-white">Новый долг</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex p-1 bg-white/5 rounded-xl">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'owe_them' })}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${form.type === 'owe_them' ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white/60'}`}
            >Я должен</button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'they_owe' })}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${form.type === 'they_owe' ? 'bg-mint/20 text-mint' : 'text-white/40 hover:text-white/60'}`}
            >Мне должны</button>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5 ml-1">Имя человека</label>
            <input
              autoFocus
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-mint/50 transition-colors"
              placeholder="Иван, Каспи и т.д."
              value={form.person}
              onChange={e => setForm({ ...form, person: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5 ml-1">Сумма</label>
            <input
              type="number"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mint/50 transition-colors"
              placeholder="0"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5 ml-1">Описание (необязательно)</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-mint/50 transition-colors"
              placeholder="За обед, в долг и т.д."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5 ml-1">Срок возврата (необязательно)</label>
            <input
              type="date"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mint/50 transition-colors"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-mint disabled:opacity-50 text-[#0a0a0a] font-bold py-4 rounded-2xl mt-4 hover:bg-mint/90 transition-all shadow-xl shadow-mint/10"
          >
            {loading ? 'Добавление...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
