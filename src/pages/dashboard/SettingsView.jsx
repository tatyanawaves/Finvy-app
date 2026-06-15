import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useSubscription } from '../../context/SubscriptionContext'

const CURRENCIES = ['USD','EUR','GBP','UAH','KZT','PLN','CZK','RUB']
const TIMEZONES = [
  'UTC','Europe/London','Europe/Paris','Europe/Berlin','Europe/Kyiv',
  'Europe/Moscow','America/New_York','America/Los_Angeles','Asia/Tokyo','Asia/Dubai',
]
const DATE_FORMATS = ['MM/DD/YYYY','DD/MM/YYYY','YYYY-MM-DD']

export default function SettingsView({ userId, profileType = 'business', onSave, demo }) {
  const { t, lang, changeLang, LANGS } = useLanguage()
  const { user } = useAuth()
  const { subscription, isActive, isTrialing, openPortal } = useSubscription()
  const [form, setForm] = useState({
    display_name: '',
    default_currency: 'USD',
    timezone: 'UTC',
    date_format: 'MM/DD/YYYY',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (demo) {
        setForm({
          display_name: 'Demo',
          default_currency: 'KZT',
          timezone: 'UTC',
          date_format: 'DD/MM/YYYY',
        })
        setLoading(false)
        return
      }
      const { data } = await supabase.from('fm_settings').select('*').eq('user_id', userId).maybeSingle()
      if (data) {
        setForm({
          display_name: data.display_name || '',
          default_currency: data.default_currency || 'USD',
          timezone: data.timezone || 'UTC',
          date_format: data.date_format || 'MM/DD/YYYY',
        })
      }
      setLoading(false)
    }
    load()
  }, [userId, demo])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (demo) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return
    }
    setSaving(true)
    await supabase.from('fm_settings').upsert({
      user_id: userId,
      display_name: form.display_name.trim() || null,
      default_currency: form.default_currency,
      timezone: form.timezone,
      date_format: form.date_format,
      language: lang,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    setSaving(false)
    setSaved(true)
    // Notify Dashboard to reload currency/settings
    if (onSave) onSave()
    setTimeout(() => setSaved(false), 2000)
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40 transition-colors'
  const selectClass = `${inputClass} cursor-pointer`

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const statusLabels = {
    trialing: t.trial,
    active: t.active,
    past_due: t.pastDue,
    canceled: t.canceled
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <h2 className="text-white font-semibold text-base mb-6">{t.settings}</h2>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile section */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">{t.profile}</p>

            {/* Avatar */}
            <div className="flex items-center gap-3 sm:gap-4 mb-5 min-w-0">
              <div className="w-14 h-14 rounded-full bg-mint/20 flex items-center justify-center text-mint font-black text-xl flex-shrink-0">
                {(form.display_name || user?.email || '?')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white/80 text-sm font-medium">{form.display_name || user?.email?.split('@')[0]}</p>
                <p className="text-white/30 text-xs mt-0.5 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">{t.displayName}</label>
                <input
                  value={form.display_name}
                  onChange={e => set('display_name', e.target.value)}
                  placeholder={user?.email?.split('@')[0]}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">{t.emailAddress}</label>
                <input
                  value={user?.email || ''}
                  disabled
                  className={`${inputClass} opacity-40 cursor-not-allowed`}
                />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">{t.profileTypeLabel}</label>
                <div className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/65">
                  {profileType === 'personal' ? (t.personal || 'Personal') : (t.business || 'Business')}
                  <span className="block text-[11px] text-white/30 mt-0.5">{t.profileTypeDesc}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences section */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">{t.preferences}</p>
            <div className="space-y-3">
              {/* Language */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">{t.language}</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {LANGS.map(l => (
                    <button key={l.code} type="button" onClick={() => changeLang(l.code)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        lang === l.code
                          ? 'bg-mint/20 text-mint border border-mint/30'
                          : 'bg-white/5 text-white/40 border border-white/5 hover:text-white/70'
                      }`}>
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">{t.defaultCurrency}</label>
                <select value={form.default_currency} onChange={e => set('default_currency', e.target.value)} className={selectClass}>
                  {CURRENCIES.map(c => <option key={c} value={c} style={{ background: '#1a1a1a' }}>{c}</option>)}
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">{t.timezone}</label>
                <select value={form.timezone} onChange={e => set('timezone', e.target.value)} className={selectClass}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz} style={{ background: '#1a1a1a' }}>{tz}</option>)}
                </select>
              </div>

              {/* Date format */}
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">{t.dateFormat}</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DATE_FORMATS.map(fmt => (
                    <button key={fmt} type="button" onClick={() => set('date_format', fmt)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                        form.date_format === fmt
                          ? 'bg-white/15 text-white border border-white/20'
                          : 'bg-white/5 text-white/40 border border-white/5 hover:text-white/70'
                      }`}>
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription section */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">
              {t.subscription}
            </p>
            {subscription ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">{t.plan}</span>
                  <span className="text-white text-sm font-semibold capitalize">{subscription.plan_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">{t.status}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-mint/20 text-mint' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {statusLabels[subscription.status] || subscription.status}
                  </span>
                </div>
                {subscription.trial_end && isTrialing && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">{t.trialEnds}</span>
                    <span className="text-white/70 text-xs">{new Date(subscription.trial_end).toLocaleDateString()}</span>
                  </div>
                )}
                {subscription.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">{t.nextBilling}</span>
                    <span className="text-white/70 text-xs">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                  </div>
                )}
                <button type="button" onClick={openPortal}
                  className="w-full mt-2 py-2.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 border border-white/10 hover:text-white hover:border-white/20 transition-colors">
                  {t.manageSubscription}
                </button>
              </div>
            ) : (
              <p className="text-white/30 text-xs">
                {t.noActiveSubscription}
              </p>
            )}
          </div>

          {/* Save button */}
          <button type="submit" disabled={saving}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              saved
                ? 'bg-mint/20 text-mint border border-mint/30'
                : 'bg-mint text-dark hover:bg-mint/90'
            } disabled:opacity-50`}>
            {saved ? `✓ ${t.settingsSaved}` : saving ? t.saving : t.saveSettings}
          </button>
        </form>

        {/* Danger zone */}
        <div className="mt-8 bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-5">
          <p className="text-red-400/70 text-xs font-semibold uppercase tracking-wider mb-3">{t.dangerZone}</p>
          <p className="text-white/30 text-xs mb-3">{t.deleteAccountDesc}</p>
          <button className="text-red-400/60 hover:text-red-400 text-xs font-medium border border-red-500/20 hover:border-red-500/40 px-4 py-2 rounded-lg transition-colors">
            {t.deleteAccount}
          </button>
        </div>
      </div>
    </div>
  )
}
lex items-center justify-between">
                    <span className="text-white/40 text-xs">{t.nextBilling}</span>
                    <span className="text-white/70 text-xs">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                  </div>
                )}
                <button type="button" onClick={openPortal}
                  className="w-full mt-2 py-2.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 border border-white/10 hover:text-white hover:border-white/20 transition-colors">
                  {t.manageSubscription}
                </button>
              </div>
            ) : (
              <p className="text-white/30 text-xs">
                {t.noActiveSubscription}
              </p>
            )}
          </div>

          {/* Integration section */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">
              {t.integrations}
            </p>
            <button type="button" onClick={async () => {
              try {
                const token = crypto.randomUUID();
                const targetUserId = userId || user?.id;
                
                if (!targetUserId) {
                  alert('Error: User ID not found. Please refresh and try again.');
                  return;
                }

                console.log('Generating Telegram token for user:', targetUserId, 'Language:', lang);
                const { error } = await supabase
                  .from('telegram_users_links')
                  .upsert({ 
                    token, 
                    user_id: targetUserId,
                    language: lang || 'ru' 
                  });

                if (error) {
                  console.error('Failed to create Telegram token:', error);
                  alert(`Error linking Telegram: ${error.message}`);
                  return;
                }

                window.open(`https://t.me/finvy_finance_bot?start=${token}`, '_blank');
              } catch (err) {
                console.error('Telegram link exception:', err);
                alert(`Exception linking Telegram: ${err.message}`);
              }
            }}
              className="w-full py-2.5 rounded-lg text-xs font-medium bg-mint/10 text-mint border border-mint/20 hover:bg-mint/20 transition-colors">
              {t.linkTelegramBot}
            </button>
          </div>

          {/* Save button */}
          <button type="submit" disabled={saving}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              saved
                ? 'bg-mint/20 text-mint border border-mint/30'
                : 'bg-mint text-dark hover:bg-mint/90'
            } disabled:opacity-50`}>
            {saved ? `✓ ${t.settingsSaved}` : saving ? t.saving : t.saveSettings}
          </button>
        </form>

        {/* Danger zone */}
        <div className="mt-8 bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-5">
          <p className="text-red-400/70 text-xs font-semibold uppercase tracking-wider mb-3">{t.dangerZone}</p>
          <p className="text-white/30 text-xs mb-3">{t.deleteAccountDesc}</p>
          <button className="text-red-400/60 hover:text-red-400 text-xs font-medium border border-red-500/20 hover:border-red-500/40 px-4 py-2 rounded-lg transition-colors">
            {t.deleteAccount}
          </button>
        </div>
      </div>
    </div>
  )
}
