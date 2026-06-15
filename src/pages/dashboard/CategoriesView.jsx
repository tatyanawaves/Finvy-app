import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'

const COLORS = [
  '#4F8EF7','#3B82F6','#93C5FD','#ef4444','#f97316',
  '#8b5cf6','#06b6d4','#f59e0b','#ec4899','#6b7280',
  '#3b82f6','#a855f7','#14b8a6','#e11d48','#84cc16',
]

const ICONS = ['💰','🛠','📥','📤','👤','📢','💻','🏢','✈️','🍔','📁','💳','🎯','📊','🔧','🛒','🎓','🏥','🏠','🚗']

function CategoryModal({ userId, category, onClose, onSaved, t }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    type: category?.type || 'expense',
    color: category?.color || '#4F8EF7',
    icon: category?.icon || '📁',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError(t.errNameRequired); return }
    setLoading(true)
    setError('')

    if (category?.id) {
      const { error: err } = await supabase.from('fm_categories')
        .update({ name: form.name.trim(), type: form.type, color: form.color, icon: form.icon })
        .eq('id', category.id)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.from('fm_categories')
        .insert({ user_id: userId, name: form.name.trim(), type: form.type, color: form.color, icon: form.icon })
      if (err) { setError(err.message); setLoading(false); return }
    }
    setLoading(false)
    onSaved()
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40 transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] overflow-y-auto bg-[#161616] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-white font-semibold text-sm">{category?.id ? t.editCategory : t.addCategory}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSave} className="px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">{t.categoryName} *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Marketing" className={inputClass} autoFocus />
          </div>

          {/* Type */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">{t.categoryType}</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['income','expense','both'].map(type => (
                <button key={type} type="button" onClick={() => set('type', type)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    form.type === type
                      ? type === 'income' ? 'bg-mint/20 text-mint border border-mint/30'
                        : type === 'expense' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/10 text-white border border-white/20'
                      : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'
                  }`}>
                  {type === 'income' ? t.incomeCategories : type === 'expense' ? t.expenseCategories : t.bothCategories}
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">{t.categoryIcon}</label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
              {ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => set('icon', icon)}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${
                    form.icon === icon ? 'bg-white/20 ring-1 ring-white/40' : 'bg-white/5 hover:bg-white/10'
                  }`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">{t.categoryColor}</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button key={color} type="button" onClick={() => set('color', color)}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === color ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                  style={{ background: color }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: form.color + '20' }}>
              {form.icon}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{form.name || 'Category name'}</p>
              <p className="text-xs mt-0.5" style={{ color: form.color }}>{form.type}</p>
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-xs">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-mint text-dark text-sm font-bold hover:bg-mint/90 transition-colors disabled:opacity-50">
            {loading ? '...' : category?.id ? t.editCategory : t.addCategory}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function CategoriesView({ userId }) {
  const { t } = useLanguage()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [editing, setEditing] = useState(null) // null | false | category object
  const [showModal, setShowModal] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('fm_categories').select('*').eq('user_id', userId).order('type').order('name')
    const { data } = await q
    if (data) setCategories(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const deleteCategory = async (id, name) => {
    if (!confirm(t.confirmDeleteCategory || `Удалить категорию "${name}"?`)) return
    await supabase.from('fm_categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const filtered = typeFilter === 'all' ? categories : categories.filter(c => c.type === typeFilter || c.type === 'both')

  const grouped = {
    income: filtered.filter(c => c.type === 'income' || c.type === 'both'),
    expense: filtered.filter(c => c.type === 'expense' || c.type === 'both'),
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-white font-semibold text-base">{t.categories}</h2>
            <p className="text-white/30 text-xs mt-0.5">{categories.length} {t.categories.toLowerCase()}</p>
          </div>
          <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {/* Type filter */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 overflow-x-auto scrollbar-none">
              {['all','income','expense'].map(type => (
                <button key={type} onClick={() => setTypeFilter(type)}
                  className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    typeFilter === type ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                  }`}>
                  {type === 'all' ? t.all : type === 'income' ? t.incomeCategories : t.expenseCategories}
                </button>
              ))}
            </div>
            <button onClick={() => { setEditing(null); setShowModal(true) }}
              className="w-full sm:w-auto justify-center bg-mint text-dark text-xs font-bold px-4 py-2 rounded-lg hover:bg-mint/90 transition-colors flex items-center gap-1.5">
              <span className="text-base leading-none">+</span> {t.addCategory}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/20">
            <p className="text-4xl mb-3">🏷</p>
            <p className="text-sm">{t.noCategories}</p>
            <p className="text-xs mt-1">{t.noCategoriesSub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Income categories */}
            {(typeFilter === 'all' || typeFilter === 'income') && grouped.income.length > 0 && (
              <div>
                <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint inline-block" />
                  {t.incomeCategories} · {grouped.income.length}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {grouped.income.map(cat => (
                    <CategoryCard key={cat.id} cat={cat} onEdit={() => { setEditing(cat); setShowModal(true) }} onDelete={() => deleteCategory(cat.id, cat.name)} t={t} />
                  ))}
                </div>
              </div>
            )}
            {/* Expense categories */}
            {(typeFilter === 'all' || typeFilter === 'expense') && grouped.expense.length > 0 && (
              <div>
                <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                  {t.expenseCategories} · {grouped.expense.length}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {grouped.expense.map(cat => (
                    <CategoryCard key={cat.id} cat={cat} onEdit={() => { setEditing(cat); setShowModal(true) }} onDelete={() => deleteCategory(cat.id, cat.name)} t={t} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <CategoryModal
          userId={userId}
          category={editing}
          t={t}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchCategories() }}
        />
      )}
    </div>
  )
}

function CategoryCard({ cat, onEdit, onDelete, t }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 group relative hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: cat.color + '20' }}>
          {cat.icon}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white text-xs transition-colors">
            ✎
          </button>
          <button onClick={onDelete} className="w-6 h-6 rounded-md bg-red-500/0 hover:bg-red-500/10 flex items-center justify-center text-white/20 hover:text-red-400 text-xs transition-colors">
            ✕
          </button>
        </div>
      </div>
      <p className="text-white/80 text-sm font-medium truncate">{cat.name}</p>
      <p className="text-xs mt-0.5 font-medium" style={{ color: cat.color }}>
        {cat.type === 'income' ? t.incomeCategories : cat.type === 'expense' ? t.expenseCategories : t.bothCategories}
      </p>
    </div>
  )
}
