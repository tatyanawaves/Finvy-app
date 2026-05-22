import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'

const STATUS_STYLES = {
  paid:    'bg-mint/10 text-mint',
  pending: 'bg-yellow-400/10 text-yellow-400',
  overdue: 'bg-red-500/10 text-red-400',
  draft:   'bg-white/5 text-white/30',
}

function formatDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function NewInvoiceModal({ userId, onClose, onSaved, t }) {
  const [form, setForm] = useState({
    client_name: '', client_email: '', amount: '', currency: 'KZT',
    status: 'pending', issue_date: new Date().toISOString().slice(0, 10),
    due_date: '', description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.client_name.trim()) { setError(t.clientRequired); return }
    if (!form.amount || isNaN(parseFloat(form.amount))) { setError(t.validAmount); return }
    setLoading(true)
    setError('')

    // Generate invoice number
    const { count } = await supabase.from('fm_invoices').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    const number = `INV-${String((count || 0) + 1).padStart(4, '0')}`

    const { error: err } = await supabase.from('fm_invoices').insert({
      user_id: userId,
      number,
      client_name: form.client_name.trim(),
      client_email: form.client_email.trim() || null,
      amount: parseFloat(form.amount),
      currency: form.currency,
      status: form.status,
      issue_date: form.issue_date,
      due_date: form.due_date || null,
      description: form.description.trim() || null,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    onSaved()
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40 transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-white font-semibold text-sm">{t.createInvoice}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSave} className="px-5 py-4 space-y-3">
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">{t.client} *</label>
            <input value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="ТОО «Компания»" className={inputClass} autoFocus />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Email</label>
            <input type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)} placeholder="billing@client.com" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">{t.amount} *</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">{t.currency}</label>
              <select value={form.currency} onChange={e => set('currency', e.target.value)} className={`${inputClass} cursor-pointer`}>
                {['KZT','USD','EUR','GBP','UAH','RUB'].map(c => <option key={c} value={c} style={{ background: '#1a1a1a' }}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">{t.issueDate}</label>
              <input type="date" value={form.issue_date} onChange={e => set('issue_date', e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">{t.dueDate}</label>
              <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">{t.status}</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={`${inputClass} cursor-pointer`}>
              {['pending','paid','overdue','draft'].map(s => <option key={s} value={s} style={{ background: '#1a1a1a' }}>{t[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">{t.invoiceDesc}</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} placeholder={t.servicesRendered} className={inputClass} />
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-xs">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-mint text-dark text-sm font-bold hover:bg-mint/90 transition-colors disabled:opacity-50">
            {loading ? '...' : t.createInvoice}
          </button>
        </form>
      </div>
    </div>
  )
}

function InvoiceDetailModal({ inv, onClose, t }) {
  const handlePrint = () => {
    const statusClass = { paid: 'status-paid', pending: 'status-pending', overdue: 'status-overdue', draft: 'status-draft' }
    const content = `
      <div class="header">
        <div><div class="logo">finvy</div><div class="inv-number">${inv.number}</div></div>
        <div style="text-align:right"><div class="status ${statusClass[inv.status] || ''}">${inv.status}</div></div>
      </div>
      <div class="parties">
        <div><div class="section-title">${t.invoiceFrom}</div><div class="party-name">${t.yourCompany}</div></div>
        <div><div class="section-title">${t.invoiceTo}</div><div class="party-name">${inv.client_name}</div>${inv.client_email ? `<div class="party-email">${inv.client_email}</div>` : ''}</div>
      </div>
      <div class="dates">
        <div class="date-item"><div class="date-label">${t.issueDate}</div><div class="date-value">${inv.issue_date || '—'}</div></div>
        <div class="date-item"><div class="date-label">${t.dueDate}</div><div class="date-value">${inv.due_date || '—'}</div></div>
      </div>
      <table>
        <thead><tr><th>${t.invoiceDesc}</th><th style="text-align:right">${t.amount}</th></tr></thead>
        <tbody><tr>
          <td>${inv.description || t.servicesRendered}</td>
          <td style="text-align:right;font-weight:700">${inv.amount?.toLocaleString('en', { maximumFractionDigits: 2 })} ${inv.currency}</td>
        </tr></tbody>
      </table>
      <div class="totals">
        <div class="total-row"><span>${t.invoiceSubtotal}</span><span>${inv.amount?.toLocaleString('en', { maximumFractionDigits: 2 })} ${inv.currency}</span></div>
        <div class="total-row total-final"><span>${t.invoiceTotal}</span><span>${inv.amount?.toLocaleString('en', { maximumFractionDigits: 2 })} ${inv.currency}</span></div>
      </div>
    `
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>${inv.number}</title><style>
      body{font-family:system-ui,sans-serif;color:#111;padding:40px;max-width:680px;margin:0 auto}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px}
      .logo{font-size:22px;font-weight:900}.inv-number{font-size:13px;color:#888;margin-top:4px}
      .status{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase}
      .status-paid{background:#d1fae5;color:#065f46}.status-pending{background:#fef3c7;color:#92400e}
      .status-overdue{background:#fee2e2;color:#991b1b}.status-draft{background:#f3f4f6;color:#6b7280}
      .parties{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:32px}
      .party-name{font-size:15px;font-weight:700;margin-bottom:4px}.party-email{font-size:12px;color:#888}
      .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:8px}
      .dates{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px}
      .date-item{font-size:12px}.date-label{color:#999;margin-bottom:2px}.date-value{font-weight:600}
      table{width:100%;border-collapse:collapse;margin-bottom:24px}
      th{text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#999;padding:8px 0;border-bottom:1px solid #e5e7eb}
      td{padding:12px 0;border-bottom:1px solid #f3f4f6;font-size:13px}
      .totals{text-align:right}.total-row{display:flex;justify-content:flex-end;gap:60px;padding:6px 0;font-size:13px;color:#666}
      .total-final{font-size:18px;font-weight:900;color:#000}
    </style></head><body>${content}</body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161616] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h3 className="text-white font-semibold text-sm">{inv.number}</h3>
            <p className="text-white/30 text-xs mt-0.5">{inv.client_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="bg-mint text-dark text-xs font-bold px-4 py-2 rounded-lg hover:bg-mint/90 transition-colors flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5V1h6v4M3 9H1V5h10v4h-2M3 7h6v4H3z"/>
              </svg>
              {t.printInvoice}
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white">✕</button>
          </div>
        </div>
        <div className="px-6 py-5 text-white/80 text-sm space-y-5">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">{t.invoiceFrom}</p>
              <p className="text-white font-semibold">{t.yourCompany}</p>
            </div>
            <div>
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">{t.invoiceTo}</p>
              <p className="text-white font-semibold">{inv.client_name}</p>
              {inv.client_email && <p className="text-white/40 text-xs mt-0.5">{inv.client_email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-white/30 text-xs mb-1">{t.issueDate}</p>
              <p className="text-white/70 text-xs font-medium">{formatDate(inv.issue_date)}</p>
            </div>
            <div>
              <p className="text-white/30 text-xs mb-1">{t.dueDate}</p>
              <p className={`text-xs font-medium ${inv.status === 'overdue' ? 'text-red-400' : 'text-white/70'}`}>{formatDate(inv.due_date)}</p>
            </div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider">{t.invoiceDesc}</p>
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider">{t.amount}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white/70 text-sm">{inv.description || t.servicesRendered}</p>
              <p className="text-white font-bold text-sm">{inv.amount?.toLocaleString('en', { maximumFractionDigits: 2 })} {inv.currency}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <p className="text-white/50 text-sm">{t.invoiceTotal}</p>
            <p className="text-white font-black text-xl">{inv.amount?.toLocaleString('en', { maximumFractionDigits: 2 })} {inv.currency}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvoicesView({ userId }) {
  const { t } = useLanguage()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [viewInvoice, setViewInvoice] = useState(null)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('fm_invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    const { data } = await q
    if (data) setInvoices(data)
    setLoading(false)
  }, [userId, statusFilter])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const updateStatus = async (id, status) => {
    await supabase.from('fm_invoices').update({ status }).eq('id', id)
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv))
  }

  const deleteInvoice = async (id) => {
    await supabase.from('fm_invoices').delete().eq('id', id)
    setInvoices(prev => prev.filter(inv => inv.id !== id))
  }

  const totals = {
    paid:    invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0),
    pending: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.amount || 0), 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount || 0), 0),
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Summary + actions bar */}
      <div className="flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-white/5 flex-shrink-0 overflow-x-auto scrollbar-none">
        {[
          { key: 'paid',    label: t.paid,    color: 'text-mint' },
          { key: 'pending', label: t.pending, color: 'text-yellow-400' },
          { key: 'overdue', label: t.overdue, color: 'text-red-400' },
        ].map(item => (
          <div key={item.key}>
            <p className="text-white/30 text-xs mb-0.5">{item.label}</p>
            <p className={`font-bold text-sm ${item.color}`}>
              {totals[item.key].toLocaleString('en', { maximumFractionDigits: 0 })}
            </p>
          </div>
        ))}
        <div className="w-px h-8 bg-white/5 flex-shrink-0" />

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 flex-shrink-0">
          <button onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${statusFilter === 'all' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
            {t.allStatuses}
          </button>
          {['paid','pending','overdue','draft'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? s === 'paid' ? 'bg-mint/20 text-mint'
                    : s === 'pending' ? 'bg-yellow-400/20 text-yellow-400'
                    : s === 'overdue' ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}>
              {t[s]}
            </button>
          ))}
        </div>

        <div className="hidden xl:block flex-1" />
        <button onClick={() => setShowNew(true)}
          className="flex-shrink-0 bg-mint text-dark text-xs font-bold px-4 py-2 rounded-lg hover:bg-mint/90 transition-colors flex items-center gap-1.5">
          <span className="text-base leading-none">+</span> {t.createInvoice}
        </button>
      </div>

      {/* Table header */}
      <div className="hidden sm:grid min-w-[760px] grid-cols-[1fr_100px_90px_100px_100px_80px] gap-4 px-6 py-2 border-b border-white/5 flex-shrink-0">
        {[t.client, t.issueDate, t.dueDate, t.total, t.status, ''].map((h, i) => (
          <p key={i} className="text-white/30 text-xs font-semibold uppercase tracking-wider">{h}</p>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/20">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-sm">{t.noInvoices}</p>
            <p className="text-xs mt-1">{t.noInvoicesSub}</p>
          </div>
        ) : (
          invoices.map(inv => (
            <div key={inv.id}
              onClick={() => setViewInvoice(inv)}
              className="sm:grid sm:min-w-[760px] sm:grid-cols-[1fr_100px_90px_100px_100px_80px] sm:gap-4 px-4 sm:px-6 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group items-center cursor-pointer">
              {/* Client */}
              <div>
                <p className="text-white/80 text-xs font-medium">{inv.client_name}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{inv.number} {inv.client_email ? `· ${inv.client_email}` : ''}</p>
              </div>
              {/* Issue date */}
              <p className="hidden sm:block text-white/40 text-xs">{formatDate(inv.issue_date)}</p>
              {/* Due date */}
              <p className={`mt-1 sm:mt-0 text-xs ${inv.status === 'overdue' ? 'text-red-400' : 'text-white/40'}`}>{formatDate(inv.due_date)}</p>
              {/* Amount */}
              <p className="mt-2 sm:mt-0 text-white/80 text-xs font-bold">
                {inv.amount?.toLocaleString('en', { maximumFractionDigits: 0 })} {inv.currency}
              </p>
              {/* Status dropdown */}
              <select
                value={inv.status}
                onChange={e => { e.stopPropagation(); updateStatus(inv.id, e.target.value) }}
                onClick={e => e.stopPropagation()}
                className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none bg-transparent ${STATUS_STYLES[inv.status]}`}
              >
                {['pending','paid','overdue','draft'].map(s => (
                  <option key={s} value={s} style={{ background: '#1a1a1a' }}>{t[s]}</option>
                ))}
              </select>
              {/* Delete */}
              <button onClick={e => { e.stopPropagation(); deleteInvoice(inv.id) }}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all text-xs ml-auto">
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {showNew && (
        <NewInvoiceModal userId={userId} t={t} onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); fetchInvoices() }} />
      )}
      {viewInvoice && (
        <InvoiceDetailModal inv={viewInvoice} t={t} onClose={() => setViewInvoice(null)} />
      )}
    </div>
  )
}
