import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'

export default function ContactSection() {
  const { lang } = useLanguage()
  const [contact, setContact] = useState('')
  const [status, setStatus] = useState('idle')

  const copy = {
    en: {
      title: 'Stay in touch',
      desc: 'Leave your email or phone number and we will contact you.',
      placeholder: 'Email or phone',
      button: 'Send',
      sent: 'Thanks, we saved your contact.',
      error: 'Could not save it. Please try again.',
    },
    ru: {
      title: 'Оставьте контакт',
      desc: 'Напишите email или телефон, и мы свяжемся с вами.',
      placeholder: 'Email или телефон',
      button: 'Отправить',
      sent: 'Спасибо, контакт сохранён.',
      error: 'Не получилось сохранить контакт. Попробуйте ещё раз.',
    },
    kz: {
      title: 'Байланыс қалдырыңыз',
      desc: 'Email немесе телефон нөмірін жазыңыз, біз сізбен хабарласамыз.',
      placeholder: 'Email немесе телефон',
      button: 'Жіберу',
      sent: 'Рақмет, байланыс сақталды.',
      error: 'Байланысты сақтау мүмкін болмады. Қайталап көріңіз.',
    },
  }[lang] || {}

  const handleSubmit = async (e) => {
    e.preventDefault()
    const value = contact.trim()
    if (!value) return

    setStatus('sending')
    const { error } = await supabase
      .from('landing_leads')
      .insert({
        contact: value,
        source: 'landing_contact_section',
        page: window.location.pathname,
      })

    if (error) {
      setStatus('error')
      return
    }

    setStatus('sent')
    setContact('')
  }

  return (
    <section className="bg-mint-bg grid-bg-light px-4 py-14">
      <div className="max-w-4xl mx-auto bg-white/70 border border-[#24272b]/10 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="grid md:grid-cols-[1fr_1.15fr] gap-6 md:gap-8 items-center">
          <div>
            <h2 className="text-[#24272b] font-black text-2xl md:text-3xl">{copy.title}</h2>
            <p className="text-[#24272b]/55 text-sm mt-2 leading-relaxed">{copy.desc}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value)
                  setStatus('idle')
                }}
                placeholder={copy.placeholder}
                className="flex-1 bg-white/70 border border-[#24272b]/10 rounded-xl px-4 py-3 text-sm text-[#24272b] placeholder-[#24272b]/35 outline-none focus:border-mint/50 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="bg-mint text-[#24272b] font-bold text-sm px-6 py-3 rounded-xl hover:bg-mint/90 transition-colors disabled:opacity-60"
              >
                {status === 'sending' ? '...' : copy.button}
              </button>
            </div>
            {status === 'sent' && <p className="text-mint text-xs">{copy.sent}</p>}
            {status === 'error' && <p className="text-red-500 text-xs">{copy.error}</p>}
          </form>
        </div>
      </div>
    </section>
  )
}
