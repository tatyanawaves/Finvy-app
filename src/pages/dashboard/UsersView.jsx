import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'

const ROLES = ['owner', 'admin', 'member']

const ROLE_COLORS = {
  owner:  'bg-mint/10 text-mint',
  admin:  'bg-blue-400/10 text-blue-400',
  member: 'bg-white/5 text-white/40',
}

function Avatar({ name, size = 8 }) {
  const initials = name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?'
  const colors = ['bg-mint/30', 'bg-blue-400/30', 'bg-purple-400/30', 'bg-orange-400/30', 'bg-pink-400/30']
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0]
  return (
    <div className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ width: `${size * 4}px`, height: `${size * 4}px`, fontSize: `${size * 1.5}px` }}>
      {initials}
    </div>
  )
}

export default function UsersView() {
  const { t } = useLanguage()
  const { user } = useAuth()

  const [members, setMembers] = useState([
    { id: user?.id, email: user?.email, name: user?.email?.split('@')[0], role: 'owner', joined: new Date().toISOString(), pending: false },
  ])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteSent, setInviteSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700)) // simulate API call
    setMembers(prev => [...prev, {
      id: Date.now().toString(),
      email: inviteEmail.trim(),
      name: inviteEmail.split('@')[0],
      role: inviteRole,
      joined: new Date().toISOString(),
      pending: true,
    }])
    setInviteSent(true)
    setInviteEmail('')
    setLoading(false)
    setTimeout(() => { setInviteSent(false); setShowInvite(false) }, 1500)
  }

  const removeInvite = (id) => {
    if (id === user?.id) return
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  const changeRole = (id, role) => {
    if (id === user?.id) return
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-white font-semibold text-base">{t.teamMembers}</h2>
            <p className="text-white/30 text-xs mt-0.5">{members.length} {t.member}</p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="w-full sm:w-auto justify-center bg-mint text-dark text-xs font-bold px-4 py-2 rounded-lg hover:bg-mint/90 transition-colors flex items-center gap-1.5"
          >
            <span className="text-base leading-none">+</span> {t.inviteUser}
          </button>
        </div>

        {/* Invite form */}
        {showInvite && (
          <form onSubmit={handleInvite} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-5">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">{t.inviteUser}</p>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-mint/40"
                autoFocus
              />
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint/40 cursor-pointer"
              >
                {['admin', 'member'].map(r => (
                  <option key={r} value={r} style={{ background: '#1a1a1a' }}>{t[r]}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-mint text-dark text-xs font-bold px-4 py-2 rounded-lg hover:bg-mint/90 transition-colors disabled:opacity-50"
              >
                {inviteSent ? `✓ ${t.inviteSent}` : loading ? '...' : t.inviteUser}
              </button>
              <button type="button" onClick={() => setShowInvite(false)} className="text-white/30 hover:text-white text-xs transition-colors px-2 py-2">
                {t.cancel}
              </button>
            </div>
          </form>
        )}

        {/* Members list */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
          {members.map((m, i) => (
            <div key={m.id || m.email || i} className={`flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3.5 ${i < members.length - 1 ? 'border-b border-white/5' : ''}`}>
              <Avatar name={m.name} size={9} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-white text-sm font-medium truncate">{m.name}</p>
                  {m.pending && (
                    <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {t.pendingInvite}
                    </span>
                  )}
                </div>
                <p className="text-white/30 text-xs truncate">{m.email}</p>
              </div>

              {/* Role selector / badge */}
              {m.role === 'owner' ? (
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS.owner}`}>{t.owner}</span>
              ) : (
                <select
                  value={m.role}
                  onChange={e => changeRole(m.id, e.target.value)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/20 ${ROLE_COLORS[m.role]} bg-transparent`}
                >
                  {['admin', 'member'].map(r => (
                    <option key={r} value={r} style={{ background: '#1a1a1a' }}>{t[r]}</option>
                  ))}
                </select>
              )}

              {/* Remove */}
              {m.role !== 'owner' && (
                <button
                  onClick={() => removeInvite(m.id)}
                  className="w-6 h-6 rounded-md bg-white/0 hover:bg-red-500/10 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors ml-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div className="mt-5 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg mt-0.5">🔒</span>
          <div>
            <p className="text-white/50 text-xs leading-relaxed">{t.teamInfo}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
