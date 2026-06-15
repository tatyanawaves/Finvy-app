import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'

export default function RecurringView({ userId }) {
  const { t, lang } = useLanguage()
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchRecurring()
    fetchMetadata()
  }, [])

  const fetchRecurring = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setRecurring(data)
    setLoading(false)
  }

  const fetchMetadata = async () => {
    const { data: accs } = await supabase.from('accounts').select('id, name').eq('user_id', userId)
    if (accs) setAccounts(accs)
    
    const { data: cats } = await supabase.from('fm_categories').select('name').eq('user_id', userId)
    if (cats) setCategories(cats)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    await supabase.from('recurring_transactions').delete().eq('id', id)
    fetchRecurring()
  }

  const toggleStatus = async (item) => {
    const newStatus = item.status === 'active' ? 'paused' : 'active'
    await supabase.from('recurring_transactions').update({ status: newStatus }).eq('id', item.id)
    fetchRecurring()
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.recurring}</h1>
          <p className="text-white/50 text-sm mt-1">{t.recurringSubtitle}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-mint text-[#0a0a0a] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-mint/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-mint/10"
        >
          <span>+</span> {t.addRecurring}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-mint/20 border-t-mint rounded-full animate-spin" />
        </div>
      ) : recurring.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🔄</div>
          <h3 className="text-white font-semibold mb-2">No recurring payments</h3>
          <p className="text-white/40 text-sm max-w-xs mx-auto">Add your subscriptions, rent, or other regular payments to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {recurring.map(item => (
            <div key={item.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.type === 'income' ? 'bg-mint/10 text-mint' : 'bg-red-400/10 text-red-400'}`}>
                  {item.type === 'income' ? '↗' : '↘'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{item.description}</h4>
                    {item.status === 'paused' && (
                      <span className="bg-white/10 text-white/40 text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">Paused</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-white/40">
                    <span className="capitalize">{item.frequency}</span>
                    <span>•</span>
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>Next: {new Date(item.next_execution).toLocaleDateString(lang === 'kz' ? 'kk-KZ' : 'ru-RU')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={`font-bold ${item.type === 'income' ? 'text-mint' : 'text-white'}`}>
                    {item.type === 'income' ? '+' : ''}{item.amount.toLocaleString()} ₸
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleStatus(item)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                    {item.status === 'active' ? '⏸' : '▶'}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-colors">
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddRecurringModal 
          userId={userId} 
          accounts={accounts}
          categories={categories}
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false)
            fetchRecurring()
          }}
        />
      )}
    </div>
  )
}

function AddRecurringModal({ userId, accounts, categories, onClose, onSuccess }) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    account_id: accounts[0]?.id || '',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description || !form.amount) return
    setLoading(true)

    const { error } = await supabase.from('recurring_transactions').insert({
      user_id: userId,
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category || 'Other',
      account_id: form.account_id,
      frequency: form.frequency,
      start_date: form.start_date,
      next_execution: form.start_date,
      status: 'active'
    })

    if (!error) onSuccess()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-lg font-bold text-white">New Recurring Payment</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex p-1 bg-white/5 rounded-xl">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'expense' })}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${form.type === 'expense' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
            >Expense</button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'income' })}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${form.type === 'income' ? 'bg-mint/20 text-mint' : 'text-white/40 hover:text-white/60'}`}
            >Income</button>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5 ml-1">Description</label>
            <input
              autoFocus
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-mint/50 transition-colors"
              placeholder="Netflix, Rent, Salary..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5 ml-1">Amount</label>
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
              <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5 ml-1">Frequency</label>
              <select
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mint/50 transition-colors"
                value={form.frequency}
                onChange={e => setForm({ ...form, frequency: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5 ml-1">Category</label>
              <select
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mint/50 transition-colors"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5 ml-1">Start Date</label>
              <input
                type="date"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mint/50 transition-colors"
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-mint disabled:opacity-50 text-[#0a0a0a] font-bold py-4 rounded-2xl mt-4 hover:bg-mint/90 transition-all shadow-xl shadow-mint/10"
          >
            {loading ? 'Adding...' : 'Add Recurring Payment'}
          </button>
        </form>
      </div>
    </div>
  )
}
