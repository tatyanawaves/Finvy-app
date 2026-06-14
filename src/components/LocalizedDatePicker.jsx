import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  // Monday-based: Mon=0 ... Sun=6
  const d = new Date(year, month, 1).getDay()
  return (d + 6) % 7
}

export default function LocalizedDatePicker({ value, onChange, placeholder = 'Select date' }) {
  const { t, lang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Current view in the calendar (may differ from selected value)
  const today = new Date()
  const initialDate = value ? new Date(value) : today
  const [viewYear, setViewYear] = useState(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth())

  const monthNames = t.monthsNames || [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const weekDays = t.weekDays || ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleDayClick = (day) => {
    const selectedDate = new Date(viewYear, viewMonth, day)
    // Format as YYYY-MM-DD for consistency with native date inputs
    const formatted = selectedDate.toISOString().split('T')[0]
    onChange(formatted)
    setIsOpen(false)
  }

  const shiftMonth = (dir) => {
    let newMonth = viewMonth + dir
    let newYear = viewYear
    if (newMonth < 0) { newMonth = 11; newYear-- }
    if (newMonth > 11) { newMonth = 0; newYear++ }
    setViewMonth(newMonth)
    setViewYear(newYear)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  // Formatting for display
  const displayValue = value ? new Date(value).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white text-left focus:outline-none focus:border-mint/40 transition-colors flex items-center justify-between"
      >
        <span className={value ? 'text-white' : 'text-white/20'}>
          {displayValue || placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-[100] p-3 w-max min-w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/50 hover:text-white"
            >
              ‹
            </button>
            <span className="text-white font-medium text-xs">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/50 hover:text-white"
            >
              ›
            </button>
          </div>

          {/* Week days */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-white/20 uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              const isSelected = value && new Date(value).getDate() === day && new Date(value).getMonth() === viewMonth && new Date(value).getFullYear() === viewYear
              const isTod = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear
              
              return (
                <div key={i} className="aspect-square">
                  {day && (
                    <button
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`w-full h-full rounded-lg text-xs transition-colors flex items-center justify-center
                        ${isSelected ? 'bg-mint text-dark font-bold' : isTod ? 'bg-mint/10 text-mint' : 'text-white/70 hover:bg-white/5'}
                      `}
                    >
                      {day}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          
          <button
            type="button"
            onClick={() => { onChange(''); setIsOpen(false) }}
            className="w-full mt-2 py-1.5 text-[11px] text-white/40 hover:text-white transition-colors border-t border-white/5"
          >
            {t.clear || 'Clear'}
          </button>
        </div>
      )}
    </div>
  )
}
